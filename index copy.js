// index.js
import { BOT_TOKEN } from "./config.js";
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { sequelize, Institution, Group, User } from "./models/index.js";
import LocalSession from "telegraf-session-local";

// middleware
import { userMiddleware } from "./middleware/user.js";

// services
import { syncInstitutions } from "./services/institutionSync.js";
import { syncClassifiers } from "./services/classifierSync.js";
import { syncGroups } from "./services/groupSync.js";

// helpers
import { paginateItems } from "./helpers/pagination.js";

const bot = new Telegraf(BOT_TOKEN);

bot.use(new LocalSession({ database: "./data/sessions.json" }).middleware());

// 🚦 Sync lock flag
let syncing = false;

// Middleware to block bot logic during sync
bot.use(async (ctx, next) => {
    if (syncing) {
        return ctx.reply("⚡ Please wait, data sync is in progress...");
    }
    return next();
});

// Apply user middleware
bot.use(userMiddleware);

// --- Handlers ---

bot.start(async (ctx) => {
    const message = await ctx.reply(
        `Welcome back, ${ctx.state.user.username || "friend"}! 👋\n\nPlease set your institution to continue.`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "🏫 Select Institution", callback_data: "select_institution" }],
                ],
            },
        }
    );

    ctx.session.menuMessageId = message.message_id;
});

bot.help((ctx) => ctx.reply("Send me a sticker"));
bot.on(message("sticker"), (ctx) => ctx.reply("👍"));
bot.hears("hi", (ctx) =>
    ctx.reply(`Hey there, ${ctx.state.user.username || "friend"}!`)
);

// Callback handler for pagination + selections
bot.on("callback_query", async (ctx) => {
    const data = ctx.callbackQuery.data;
    const telegramId = String(ctx.from.id);
    const username = ctx.from.username || null;

    // Institution list
    if (data.startsWith("select_institution")) {
        const institutions = await Institution.findAll({ order: [["nameEt", "ASC"]] });
        if (!institutions.length) {
            return ctx.answerCbQuery("⚠️ No institutions available. Please wait for sync.");
        }

        ctx.session.institutions = institutions.map((i) => i.toJSON());
        ctx.session.page = 0;

        const buttons = paginateItems(ctx.session.institutions, ctx.session.page, 10, "institution");

        return ctx.editMessageText("🏫 Choose your institution:", {
            reply_markup: { inline_keyboard: buttons },
        });
    }

    // Institution pagination
    if (data.startsWith("institution_page_")) {
        ctx.session.page = parseInt(data.split("_").pop(), 10);
        const buttons = paginateItems(ctx.session.institutions, ctx.session.page, 10, "institution");
        return ctx.editMessageReplyMarkup({ inline_keyboard: buttons });
    }

    // Institution select
    if (data.startsWith("institution_") && !data.includes("page")) {
        const id = parseInt(data.split("_").pop(), 10);
        const institution = ctx.session.institutions.find((i) => i.id === id);

        if (!institution) return ctx.answerCbQuery("❌ Institution not found");

        ctx.session.institutionId = id;
        await ctx.answerCbQuery();

        // Save institution in DB (reset groupId)
        await User.upsert({
            telegramId,
            username,
            institutionId: id,
            groupId: null,
        });

        // Load groups for this institution
        const groups = await Group.findAll({
            where: { InstitutionId: id },
            order: [["nameEt", "ASC"]],
        });

        if (!groups.length) {
            return ctx.editMessageText("⚠️ No groups found for this institution.");
        }

        ctx.session.groups = groups.map((g) => g.toJSON());
        ctx.session.groupPage = 0;

        const buttons = paginateItems(ctx.session.groups, ctx.session.groupPage, 10, "group");
        return ctx.editMessageText(
            `✅ Institution: *${institution.nameEt}*\n\n👥 Now choose your group:`,
            {
                parse_mode: "Markdown",
                reply_markup: { inline_keyboard: buttons },
            }
        );
    }

    // Group pagination
    if (data.startsWith("group_page_")) {
        ctx.session.groupPage = parseInt(data.split("_").pop(), 10);
        const buttons = paginateItems(ctx.session.groups, ctx.session.groupPage, 10, "group");
        return ctx.editMessageReplyMarkup({ inline_keyboard: buttons });
    }

    // Group select
    if (data.startsWith("group_") && !data.includes("page")) {
        const id = parseInt(data.split("_").pop(), 10);
        const group = ctx.session.groups.find((g) => g.id === id);

        if (!group) return ctx.answerCbQuery("❌ Group not found");

        ctx.session.groupId = group.studentGroupUuid; // use UUID for DB
        await ctx.answerCbQuery();

        // Update user with group in DB
        await User.upsert({
            telegramId,
            username,
            institutionId: ctx.session.institutionId,
            groupId: group.studentGroupUuid, // 👈 store UUID not numeric id
        });

        // Clean up session
        ctx.session.institutions = null;
        ctx.session.groups = null;
        ctx.session.page = null;
        ctx.session.groupPage = null;
        ctx.session.institutionId = null;
        ctx.session.groupId = null;

        return ctx.editMessageText(
            `🎉 You selected group: *${group.nameEt}*`,
            { parse_mode: "Markdown" }
        );
    }
});

// --- Syncer ---
async function syncAll() {
    try {
        syncing = true;
        console.log("🔄 Starting full sync...");

        await syncInstitutions();
        await syncClassifiers();
        await syncGroups();

        console.log("✅ Full sync completed");
    } catch (err) {
        console.error("❌ Sync error:", err.message);
    } finally {
        syncing = false;
    }
}

// --- Launch ---
bot.launch();
console.log("🤖 Bot is running...");

// Run sync at launch
await syncAll();

// Repeat every 24h
setInterval(syncAll, 24 * 60 * 60 * 1000);

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

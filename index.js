// index.js
import { BOT_TOKEN } from "./config.js";
import { Telegraf } from "telegraf";
import { sequelize, Institution, Group, User } from "./models/index.js";
import LocalSession from "telegraf-session-local";

// middleware
import { userMiddleware, rateLimitMiddleware, syncGuardMiddleware } from "./middleware/index.js";

// services
import { syncAll } from "./services/syncAll.js";
import { fetchTimetableForWeek, handleTimetableForDate } from "./services/timetable.js";

// helpers
import { paginateItems } from "./helpers/pagination.js";
import { buildTimetableDaysKeyboard } from "./helpers/timetableKeyboard.js";
import { handleCallbackQuery } from "./controllers/callbacks.js";
import { showTimetableDays } from "./controllers/timetable.js";

const bot = new Telegraf(BOT_TOKEN);
bot.use(new LocalSession({ database: "./data/sessions.json" }).middleware());

// Limit requests rate
bot.use(rateLimitMiddleware);
// Block logic during sync
bot.use(syncGuardMiddleware);
// User middleware
bot.use(userMiddleware);

// --- Handlers ---

bot.start(async (ctx) => {
    const message = await ctx.reply(
        `👋 Hi ${ctx.from.first_name}!\n\n` +
        `I'm your *Tahvel Timetable Bot* 📚\n` +
        `I can show you your school timetable right here in Telegram.\n\n` +
        `👉 To begin, please select your institution:`,
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

bot.hears(/🏫 (.+) \| 👥 (.+)/, async (ctx) => {
    const telegramId = String(ctx.from.id);
    const user = await User.findOne({ where: { telegramId } });

    if (!user) {
        return ctx.reply("⚠️ No user data found. Please select your institution and group again.");
    }

    const inst = await Institution.findByPk(user.institutionId);
    const group = await Group.findOne({ where: { studentGroupUuid: user.groupId } });

    if (!inst || !group) {
        return ctx.reply("⚠️ Could not load institution or group info. Please reselect.");
    }

    let text = `ℹ️ *Your current setup:*\n\n`;

    // Institution info
    text += `🏫 Institution: *${inst.nameEt}*`;
    if (inst.nameEn) text += `\n🌍 English: ${inst.nameEn}`;
    if (inst.email) text += `\n✉️ Email: ${inst.email}`;

    // Group info
    text += `\n\n👥 Group: *${group.nameEt}*`;

    return ctx.reply(text, { parse_mode: "Markdown" });
});


// Listener for 📅 Today
bot.hears("📅 Today", async (ctx) => {
    const telegramId = String(ctx.from.id);
    const user = await User.findOne({ where: { telegramId } });
    if (!user || !user.institutionId || !user.groupId) {
        return ctx.reply("⚠️ Please set your institution and group first.");
    }

    const today = new Date();
    const ds = today.toISOString().split("T")[0];
    return handleTimetableForDate(ctx, user, ds);
});

// Listener for 📅 Tomorrow
bot.hears("📅 Tomorrow", async (ctx) => {
    const telegramId = String(ctx.from.id);
    const user = await User.findOne({ where: { telegramId } });
    if (!user || !user.institutionId || !user.groupId) {
        return ctx.reply("⚠️ Please set your institution and group first.");
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const ds = tomorrow.toISOString().split("T")[0];
    return handleTimetableForDate(ctx, user, ds);
});

// --- Callback handler ---
bot.on("callback_query", handleCallbackQuery);

// --- Reply Keyboard Handlers ---

bot.hears("🔄 Select Other Group", async (ctx) => {
    const institutions = await Institution.findAll({ order: [["nameEt", "ASC"]] });
    if (!institutions.length) {
        return ctx.reply("⚠️ No institutions available. Please wait for sync.");
    }
    ctx.session.institutions = institutions.map((i) => i.toJSON());
    ctx.session.page = 0;
    const buttons = paginateItems(ctx.session.institutions, ctx.session.page, 10, "institution");
    return ctx.reply("🏫 Choose your institution:", {
        reply_markup: { inline_keyboard: buttons },
    });
});

bot.hears("📖 Timetable", async (ctx) => {
    return showTimetableDays(ctx);
});


bot.launch();
console.log("🤖 Bot is running...");

await syncAll();
setInterval(syncAll, 24 * 60 * 60 * 1000);

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
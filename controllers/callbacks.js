// controllers/callbacks.js
import { Institution, Group, User } from "../models/index.js";
import { paginateItems } from "../helpers/pagination.js";
import { fetchTimetableForDate } from "../services/timetable.js";
import { formatTimetableForDate } from "../helpers/formatTimetable.js";
import { showTimetableDays } from "./timetable.js";

/**
 * Handle all callback_query events
 */
export async function handleCallbackQuery(ctx) {
    const data = ctx.callbackQuery.data;
    const telegramId = String(ctx.from.id);
    const username = ctx.from.username || ctx.from.first_name;

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
        await User.upsert({ telegramId, username, institutionId: id, groupId: null });

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
            { parse_mode: "Markdown", reply_markup: { inline_keyboard: buttons } }
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

        ctx.session.groupId = group.studentGroupUuid;
        await ctx.answerCbQuery();

        // Save or update user institution + group in DB
        await User.upsert({
            telegramId,
            username,
            institutionId: ctx.session.institutionId,
            groupId: group.studentGroupUuid,
        });

        // Clean session
        ctx.session.institutions = null;
        ctx.session.groups = null;
        ctx.session.page = null;
        ctx.session.groupPage = null;
        ctx.session.institutionId = null;
        ctx.session.groupId = null;

        // Update message with confirmation
        await ctx.editMessageText(
            `🎉 You selected group: *${group.nameEt}*`,
            { parse_mode: "Markdown" }
        );

        // Fetch institution name for top button
        const institution = await Institution.findByPk(group.InstitutionId);

        // Send a new message with the custom keyboard
        return ctx.reply("✅ Setup complete! What would you like to do?", {
            reply_markup: {
                keyboard: [
                    [
                        {
                            text: `🏫 ${institution ? institution.nameEt : "Institution"} | 👥 ${group.nameEt}`
                        }
                    ],
                    [
                        { text: "📅 Today" },
                        { text: "📅 Tomorrow" }
                    ],
                    [
                        { text: "📖 Timetable" },
                        { text: "🔄 Select Other Group" }
                    ]
                ],
                resize_keyboard: true,
                one_time_keyboard: false,
            },
        });
    }

    // Timetable days selection
    if (data.startsWith("timetable_day_")) {
        const date = data.replace("timetable_day_", "");
        const user = await User.findOne({ where: { telegramId } });
        if (!user) return ctx.answerCbQuery("⚠️ User not found");

        const events = await fetchTimetableForDate(user, date);
        const text = formatTimetableForDate(date, events);

        return ctx.editMessageText(text, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [[{ text: "⬅️ Back", callback_data: "timetable_back" }]],
            },
        });
    }

    // Back to timetable days
    if (data === "timetable_back") {
        return showTimetableDays(ctx);
    }
}

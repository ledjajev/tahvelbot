import { User } from "../models/index.js";
import { fetchTimetableForWeek } from "../services/timetable.js";
import { buildTimetableDaysKeyboard } from "../helpers/timetableKeyboard.js";

/**
 * Show inline keyboard for selecting timetable days of the current week
 */
export async function showTimetableDays(ctx) {
    const telegramId = String(ctx.from.id);
    const user = await User.findOne({ where: { telegramId } });
    if (!user || !user.institutionId || !user.groupId) {
        return ctx.reply("⚠️ Please set your institution and group first.");
    }

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1); // Monday
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6); // Sunday

    // ✅ Fetch events for week
    const events = await fetchTimetableForWeek(user, monday, sunday);

    // group events by date
    const grouped = {};
    for (const ev of events) {
        const d = ev.date.split("T")[0];
        if (!grouped[d]) grouped[d] = [];
        grouped[d].push(ev);
    }

    // ✅ build inline keyboard
    const days = buildTimetableDaysKeyboard(monday, sunday, grouped, todayStr);

    return ctx.reply("📅 Select a day:", {
        reply_markup: { inline_keyboard: days },
    });
}
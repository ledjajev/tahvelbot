import fetch from "node-fetch";
import { TAHVELTP_BACKEND } from "../config.js";
import { formatTimetableForDate } from "../helpers/formatTimetable.js";
import { startOfWeek, endOfWeek } from "date-fns";
import { format, toZonedTime } from "date-fns-tz";

const ESTONIA_TZ = "Europe/Tallinn";

/**
 * Convert a JS Date into Estonian midnight → UTC ISO string
 */
function estonianMidnightISO(date) {
    // Get the "zoned" date in Tallinn
    const estDate = toZonedTime(date, ESTONIA_TZ);

    // Reset to midnight in Tallinn
    estDate.setHours(0, 0, 0, 0);

    // Convert back to UTC by using the raw Date object
    return estDate.toISOString();
}

export async function fetchTimetableForWeek(user, monday, sunday) {
    const from = estonianMidnightISO(monday);
    const thru = estonianMidnightISO(sunday);

    const url = `${TAHVELTP_BACKEND}timetableevents/timetableSearch?from=${from}&thru=${thru}&lang=ET&page=0&schoolId=${user.institutionId}&size=50&studentGroups=${user.groupId}`;
    console.log(url);

    const res = await fetch(url);
    const dataJson = await res.json();
    return dataJson.content || [];
}
export async function fetchTimetableForDate(user, dateStr) {
    const start = new Date(dateStr);
    const end = new Date(dateStr);
    end.setDate(start.getDate() + 1);

    const url = `${TAHVELTP_BACKEND}timetableevents/timetableSearch?from=${start.toISOString()}&thru=${end.toISOString()}&lang=ET&page=0&schoolId=${user.institutionId}&size=50&studentGroups=${user.groupId}`;
    const res = await fetch(url);
    const dataJson = await res.json();

    return (dataJson.content || []).sort((a, b) => a.timeStart.localeCompare(b.timeStart));
}



export async function showTimetableDays(ctx) {
    const telegramId = String(ctx.from.id);
    const user = await User.findOne({ where: { telegramId } });
    if (!user || !user.institutionId || !user.groupId) {
        return ctx.reply("⚠️ Please set your institution and group first.");
    }

    const today = new Date();

    // ✅ Monday 00:00 in Estonia
    const monday = startOfWeek(today, { weekStartsOn: 1 });
    // ✅ Sunday 23:59 in Estonia (but API only cares about date boundary)
    const sunday = endOfWeek(today, { weekStartsOn: 1 });

    // Fetch events for week with corrected boundaries
    const events = await fetchTimetableForWeek(user, monday, sunday);

    // group events by date
    const grouped = {};
    for (const ev of events) {
        const d = ev.date.split("T")[0];
        if (!grouped[d]) grouped[d] = [];
        grouped[d].push(ev);
    }

    // Build inline keyboard
    const days = buildTimetableDaysKeyboard(grouped);

    return ctx.reply("📅 Select a day:", {
        reply_markup: { inline_keyboard: days },
    });
}


export async function handleTimetableForDate(ctx, user, dateStr) {
    const events = await fetchTimetableForDate(user, dateStr);
    const text = formatTimetableForDate(dateStr, events);
    return ctx.reply(text, { parse_mode: "Markdown" });
}
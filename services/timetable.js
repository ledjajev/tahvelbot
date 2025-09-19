import fetch from "node-fetch";
import { TAHVELTP_BACKEND } from "../config.js";
import { formatTimetableForDate } from "../helpers/formatTimetable.js";
import { startOfWeek, endOfWeek } from "date-fns";
import { TimetableCache } from "../models/index.js";
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

    // Try to fetch from cache
    const cache = await TimetableCache.findOne({
        where: {
            schoolId: user.institutionId,
            studentGroupId: user.groupId,
            from,
            thru,
        },
        attributes: ["cacheData", "updatedAt"],
    });

    if (cache) {
        // Check if the cache is not older than 24 hours
        const cacheAge = new Date() - new Date(cache.updatedAt);
        const oneDayMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        if (cacheAge < oneDayMs) {
            console.log("Returning cached data for the week timetable.");
            return cache.cacheData.content || [];
        }
    }

    // If cache is not found or is outdated, fetch new data
    const url = `${TAHVELTP_BACKEND}timetableevents/timetableSearch?from=${from}&thru=${thru}&lang=ET&page=0&schoolId=${user.institutionId}&size=50&studentGroups=${user.groupId}`;
    console.log("Fetching timetable from API:", url);

    const res = await fetch(url);
    const dataJson = await res.json();
    const events = dataJson.content || [];

    // Cache the response
    await TimetableCache.upsert({
        schoolId: user.institutionId,
        studentGroupId: user.groupId,
        from,
        thru,
        cacheData: dataJson,
    });

    return events;
}

export async function fetchTimetableForDate(user, dateStr) {
    const start = new Date(dateStr);
    const end = new Date(dateStr);
    end.setDate(start.getDate() + 1);

    // Try to fetch from cache
    const cache = await TimetableCache.findOne({
        where: {
            schoolId: user.institutionId,
            studentGroupId: user.groupId,
            from: start.toISOString(),
            thru: end.toISOString(),
        },
        attributes: ["cacheData", "updatedAt"],
    });

    if (cache) {
        const cacheAge = new Date() - new Date(cache.updatedAt);
        const oneDayMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        if (cacheAge < oneDayMs) {
            console.log("Returning cached data for the date timetable.");
            return cache.cacheData.content || [];
        }
    }

    // If cache is not found or is outdated, fetch new data
    const url = `${TAHVELTP_BACKEND}timetableevents/timetableSearch?from=${start.toISOString()}&thru=${end.toISOString()}&lang=ET&page=0&schoolId=${user.institutionId}&size=50&studentGroups=${user.groupId}`;
    const res = await fetch(url);
    const dataJson = await res.json();
    const events = dataJson.content || [];

    // Cache the response
    await TimetableCache.upsert({
        schoolId: user.institutionId,
        studentGroupId: user.groupId,
        from: start.toISOString(),
        thru: end.toISOString(),
        cacheData: dataJson,
    });

    return events.sort((a, b) => a.timeStart.localeCompare(b.timeStart));
}




export async function showTimetableDays(ctx) {
    const telegramId = String(ctx.from.id);
    const user = await User.findOne({ where: { telegramId } });
    if (!user || !user.institutionId || !user.groupId) {
        return ctx.reply("⚠️ Please set your institution and group first.");
    }

    const today = new Date();
    const monday = startOfWeek(today, { weekStartsOn: 1 });
    const sunday = endOfWeek(today, { weekStartsOn: 1 });

    // Fetch events for the week with cache handling
    const events = await fetchTimetableForWeek(user, monday, sunday);

    const grouped = {};
    for (const ev of events) {
        const d = ev.date.split("T")[0];
        if (!grouped[d]) grouped[d] = [];
        grouped[d].push(ev);
    }

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
import fetch from "node-fetch";
import { TAHVELTP_BACKEND } from "../config.js";
import { formatTimetableForDate } from "../helpers/formatTimetable.js";

export async function fetchTimetableForDate(user, dateStr) {
    const start = new Date(dateStr);
    const end = new Date(dateStr);
    end.setDate(start.getDate() + 1);

    const url = `${TAHVELTP_BACKEND}timetableevents/timetableSearch?from=${start.toISOString()}&thru=${end.toISOString()}&lang=ET&page=0&schoolId=${user.institutionId}&size=50&studentGroups=${user.groupId}`;
    const res = await fetch(url);
    const dataJson = await res.json();

    return (dataJson.content || []).sort((a, b) => a.timeStart.localeCompare(b.timeStart));
}

export async function fetchTimetableForWeek(user, monday, sunday) {
    const url = `${TAHVELTP_BACKEND}timetableevents/timetableSearch?from=${monday.toISOString()}&thru=${sunday.toISOString()}&lang=ET&page=0&schoolId=${user.institutionId}&size=200&studentGroups=${user.groupId}`;
    const res = await fetch(url);
    const dataJson = await res.json();
    return dataJson.content || [];
}

export async function handleTimetableForDate(ctx, user, dateStr) {
    const events = await fetchTimetableForDate(user, dateStr);
    const text = formatTimetableForDate(dateStr, events);
    return ctx.reply(text, { parse_mode: "Markdown" });
}
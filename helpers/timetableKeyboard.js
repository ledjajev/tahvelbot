import { format } from "date-fns-tz";

/**
 * Format a date as YYYY-MM-DD in Estonian time
 */
function formatEstonianDate(date) {
    return format(date, "yyyy-MM-dd", { timeZone: "Europe/Tallinn" });
}

/**
 * Build inline keyboard for timetable days in a week
 *
 * @param {Date} monday - Monday of the week
 * @param {Date} sunday - Sunday of the week
 * @param {Object} grouped - Events grouped by date { "YYYY-MM-DD": [events] }
 * @param {string} todayStr - Today's date in YYYY-MM-DD
 * @returns {Array} Inline keyboard structure
 */
export function buildTimetableDaysKeyboard(monday, sunday, grouped, todayStr) {
    const days = [];
    const dayFormatter = new Intl.DateTimeFormat("en-GB", {
        weekday: "short", // Mon, Tue
        day: "numeric",   // 17
        month: "short",   // Sep
        timeZone: "Europe/Tallinn", // 👈 important
    });

    for (let d = new Date(monday); d <= sunday; d.setDate(d.getDate() + 1)) {
        const ds = formatEstonianDate(d); // ✅ proper Estonian date string
        const count = grouped[ds] ? grouped[ds].length : 0;

        let label = `${dayFormatter.format(d)} (${count})`;
        if (ds === todayStr) {
            label = `👉 ${label} 👈`; // highlight today
        }

        days.push([{ text: label, callback_data: `timetable_day_${ds}` }]);
    }

    return days;
}

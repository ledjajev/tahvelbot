import { format } from "date-fns-tz";

const ESTONIA_TZ = "Europe/Tallinn";


/**
 * Build inline keyboard for timetable days in a week
 *
 * @param {Date} monday - Monday of the week (UTC date)
 * @param {Date} sunday - Sunday of the week (UTC date)
 * @param {Object} grouped - Events grouped by date { "YYYY-MM-DD": [events] }
 * @param {string} todayStr - Today's date in YYYY-MM-DD (Estonian time)
 * @returns {Array} Inline keyboard structure
 */
export function buildTimetableDaysKeyboard(monday, sunday, grouped, todayStr) {
    const days = [];
    const dayFormatter = new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        timeZone: ESTONIA_TZ, // ✅ ensure labels use Estonian time
    });

    // clone the monday date so we don’t mutate input
    let current = new Date(monday);

    while (current <= sunday) {
        const zoned = toZonedTime(current, ESTONIA_TZ);
        const ds = format(zoned, "yyyy-MM-dd", { timeZone: ESTONIA_TZ });
        const count = grouped[ds] ? grouped[ds].length : 0;

        let label = `${dayFormatter.format(zoned)} (${count})`;
        if (ds === todayStr) {
            label = `👉 ${label} 👈`;
        }

        days.push([{ text: label, callback_data: `timetable_day_${ds}` }]);

        // move to next day
        current.setDate(current.getDate() + 1);
    }

    return days;
}

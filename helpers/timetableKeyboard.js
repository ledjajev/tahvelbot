import { format, toZonedTime } from "date-fns-tz";
import { addDays, startOfWeek, endOfWeek } from "date-fns";

const ESTONIA_TZ = "Europe/Tallinn";

/**
 * Build inline keyboard for timetable days in the *current week*
 *
 * @param {Object} grouped - Events grouped by date { "YYYY-MM-DD": [events] }
 * @param {string} todayStr - Today's date in YYYY-MM-DD (Estonian time)
 * @returns {Array} Inline keyboard structure
 */
export function buildTimetableDaysKeyboard(grouped, todayStr) {
    const days = [];
    const now = toZonedTime(new Date(), ESTONIA_TZ);

    // ✅ Calculate Monday and Sunday in Estonian time
    const monday = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const sunday = endOfWeek(now, { weekStartsOn: 1 });   // Sunday

    const dayFormatter = new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        timeZone: ESTONIA_TZ,
    });

    let current = monday;
    while (current <= sunday) {
        const ds = format(current, "yyyy-MM-dd", { timeZone: ESTONIA_TZ });
        const count = grouped[ds] ? grouped[ds].length : 0;

        let label = `${dayFormatter.format(current)} (${count})`;
        if (ds === todayStr) {
            label = `👉 ${label} 👈`;
        }

        days.push([{ text: label, callback_data: `timetable_day_${ds}` }]);

        current = addDays(current, 1);
    }

    return days;
}

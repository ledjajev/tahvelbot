import { format, toZonedTime } from "date-fns-tz";
import { addDays, startOfWeek, endOfWeek } from "date-fns";

const ESTONIA_TZ = "Europe/Tallinn";

/**
 * Build inline keyboard for timetable days in the *current week*
 *
 * @param {Object} grouped - Events grouped by date { "YYYY-MM-DD": [events] }
 * @returns {Array} Inline keyboard structure
 */
export function buildTimetableDaysKeyboard(grouped) {
    const days = [];

    // ✅ Always compute "now" in Estonia time
    const now = toZonedTime(new Date(), ESTONIA_TZ);
    const todayStr = format(now, "yyyy-MM-dd", { timeZone: ESTONIA_TZ });

    // ✅ Calculate Monday and Sunday in Estonian time
    const monday = startOfWeek(now, { weekStartsOn: 1 });
    const sunday = endOfWeek(now, { weekStartsOn: 1 });

    const dayFormatter = new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        timeZone: ESTONIA_TZ,
    });

    let current = monday;
    while (current <= sunday) {
        const ds = format(toZonedTime(current, ESTONIA_TZ), "yyyy-MM-dd", { timeZone: ESTONIA_TZ });
        const count = grouped[ds] ? grouped[ds].length : 0;

        let label = `${dayFormatter.format(toZonedTime(current, ESTONIA_TZ))} (${count})`;
        if (ds === todayStr) {
            label = `👉 ${label} 👈`; // highlight today
        }

        days.push([{ text: label, callback_data: `timetable_day_${ds}` }]);

        current = addDays(current, 1);
    }

    return days;
}

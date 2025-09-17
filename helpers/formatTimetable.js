export function formatTimetableForDate(dateStr, events) {
    let text = `📅 Timetable for *${dateStr}*:\n\n`;

    if (!events || !events.length) {
        return text + "No events.";
    }

    // Group events by timeslot
    const grouped = {};
    for (const ev of events) {
        const key = `${ev.timeStart} - ${ev.timeEnd}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(ev);
    }

    // Render grouped events
    for (const [time, evs] of Object.entries(grouped)) {
        text += `🕒 ${time}\n`;
        for (const ev of evs) {
            const roomPart =
                ev.rooms && ev.rooms.length > 0
                    ? ` (${ev.rooms.map(r => r.roomCode).join(", ")})`
                    : "";
            text += `📘 *${ev.nameEt}*${roomPart}\n`;
            if (ev.teachers?.length) {
                text += `👨‍🏫 ${ev.teachers.map(t => t.name).join(", ")}\n`;
            }
            text += "\n";
        }
        text += "───────────────\n";
    }

    return text;
}
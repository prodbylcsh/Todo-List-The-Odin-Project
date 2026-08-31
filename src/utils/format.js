import { parseISO, isToday, isTomorrow } from "date-fns";

function formatDueDate(value) {
    if (!value) {
        return "";
    }

    const date = parseISO(value);

    if (isToday(date)) {
        return "Today";
    }

    if (isTomorrow(date)) {
        return "Tomorrow";
    }

    return date.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function capitalize(value) {
    return value ? value[0].toUpperCase() + value.slice(1) : "";
}

function sequenceNumber(value) {
    return String(value ?? 1).padStart(2, "0");
}

// Three-letter "route code" stamped on a project tab, e.g. "Home work" -> "HOM".
function projectCode(name) {
    const letters = (name ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    return letters.slice(0, 3).padEnd(3, "·");
}

export {
    formatDueDate,
    capitalize,
    sequenceNumber,
    projectCode,
}

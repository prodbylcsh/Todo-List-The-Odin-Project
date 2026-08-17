const PRIORITIES = {
    low: {
        color: "#4caf50",
    },
    medium: {
        color: "#ff9800",
    },
    high: {
        color: "#f44336",
    }
}

class Item {
    constructor(title, description, dueDate, priority) {
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
        this.id = crypto.randomUUID();
    }

    checked = false;

    check() {
        this.checked = true;
    }

    uncheck() {
        this.checked = false;
    }

    updateTitle(title) {
        this.title = title;
    }

    updateDescription(description) {
        this.description = description;
    }

    updateDueDate(dueDate) {
        this.dueDate = dueDate;
    }

    updatePriority(priority) {
        this.priority = priority;
    }
}

export {
    Item,
    PRIORITIES,
}
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
    constructor(title, description, dueDate, priority, id = crypto.randomUUID()) {
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
        this.id = id;
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

    static fromJSON(data) {
        const priority = data.priority in PRIORITIES ? data.priority : "medium";
        return new Item(data.title, data.description, data.dueDate, priority, data.id);
    }
}

export {
    Item,
    PRIORITIES,
}
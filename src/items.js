const PRIORITIES = {
    low: {
        color: "#4a5d78",
        code: "LOW",
    },
    medium: {
        color: "#4b2e83",
        code: "MED",
    },
    high: {
        color: "#d7262d",
        code: "PRI",
    }
}

class Item {
    constructor(title, description, dueDate, priority, id = crypto.randomUUID(), completed = false) {
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
        this.id = id;
        this.completed = completed;
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

    check() {
        this.completed = true;
    }

    uncheck() {
        this.completed = false;
    }

    toggle() {
        this.completed = !this.completed;
    }

    static fromJSON(data) {
        const priority = data.priority in PRIORITIES ? data.priority : "medium";
        return new Item(
            data.title,
            data.description,
            data.dueDate,
            priority,
            data.id,
            data.completed === true,
        );
    }
}

export {
    Item,
    PRIORITIES,
}

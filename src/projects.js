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

class Project {
    constructor(name) {
        this.name = name;
    }

    items = [];

    addItem(item) {
        this.items.push(item);
    }

    removeItem(id) {
        const index = this.items.findIndex(i => i.id === id);
        this.items.splice(index, 1);
    }

    updateName(name) {
        this.name = name;
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

const project = new Project("test");
const item = new Item("Task", "My task", "28.10.1999", "low");

project.addItem(item);
console.log(project);
console.log(item);
console.log(project.items[0].priority);

export {
    project,
}
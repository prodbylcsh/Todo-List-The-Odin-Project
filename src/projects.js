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

    getPriority() {
        return this.priority.getPriority();
    }
}

class Priority {
    getPriority() { };
}

class LowPriority extends Priority {
    getPriority() {
        return "low";
    }
}

class MediumPriority extends Priority {
    getPriority() {
        return "medium";
    }
}

class HighPriority extends Priority {
    getPriority() {
        return "high";
    }
}

const project = new Project("test");
const item = new Item("Task", "My task", "28.10.1999", new LowPriority());

project.addItem(item);
console.log(project);
console.log(item);
console.log(project.items[0].getPriority());

export {
    project,
}
class Project {
    constructor(name) {
        this.name = name;
        this.id = crypto.randomUUID();
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

    moveItem(id) {

    }
}

export {
    Project,
}
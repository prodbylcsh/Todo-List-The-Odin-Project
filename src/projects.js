import { Item } from "./items.js";

class Project {
    constructor(name, id = crypto.randomUUID()) {
        this.name = name;
        this.id = id;
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

    static fromJSON(data) {
        const project = new Project(data.name, data.id);
        const rawItems = Array.isArray(data.items) ? data.items : [];
        project.items = rawItems.map((raw) => Item.fromJSON(raw));
        return project;
    }
}

const projectList = new Map();

function registerProject(project) {
    projectList.set(project.id, project);
}

function clearProjects() {
    projectList.clear();
}

export {
    Project,
    projectList,
    registerProject,
    clearProjects,
}
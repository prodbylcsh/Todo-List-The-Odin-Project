import { parseISO, isToday, isTomorrow } from "date-fns";
import "./styles.css";
import { Project, projectList, registerProject, removeProject } from "./projects.js";
import { Item, PRIORITIES } from "./items.js";
import { saveProjects, loadProjects } from "./storage.js";

const body = document.body;
const sidebar = document.querySelector("aside");
const resizer = document.getElementById("resizer");
const sidebarButton = document.getElementById("sidebar-button");
const projects = document.getElementById("projects");
const content = document.getElementById("project");
const addProjectButton = document.getElementById("add-project");

const EDIT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="20" height="20"><!--!Font Awesome Free v7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M505 122.9L517.1 135C526.5 144.4 526.5 159.6 517.1 168.9L488 198.1L441.9 152L471 122.9C480.4 113.5 495.6 113.5 504.9 122.9zM273.8 320.2L408 185.9L454.1 232L319.8 366.2C316.9 369.1 313.3 371.2 309.4 372.3L250.9 389L267.6 330.5C268.7 326.6 270.8 323 273.7 320.1zM437.1 89L239.8 286.2C231.1 294.9 224.8 305.6 221.5 317.3L192.9 417.3C190.5 425.7 192.8 434.7 199 440.9C205.2 447.1 214.2 449.4 222.6 447L322.6 418.4C334.4 415 345.1 408.7 353.7 400.1L551 202.9C579.1 174.8 579.1 129.2 551 101.1L538.9 89C510.8 60.9 465.2 60.9 437.1 89zM152 128C103.4 128 64 167.4 64 216L64 488C64 536.6 103.4 576 152 576L424 576C472.6 576 512 536.6 512 488L512 376C512 362.7 501.3 352 488 352C474.7 352 464 362.7 464 376L464 488C464 510.1 446.1 528 424 528L152 528C129.9 528 112 510.1 112 488L112 216C112 193.9 129.9 176 152 176L264 176C277.3 176 288 165.3 288 152C288 138.7 277.3 128 264 128L152 128z"/></svg>`;
const TRASH_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z"/></svg>`;
const DESKTOP_QUERY = window.matchMedia("(min-width: 48rem)");

let isCollapsed = false;
let activePointerId = null;
let sidebarLeft = 0;
let grabOffset = 0;
let activeProjectId = null;

function canResize() {
    return DESKTOP_QUERY.matches && !isCollapsed;
}

function startResize(e) {
    if (!canResize() || !e.isPrimary || e.button !== 0) return;

    const rect = sidebar.getBoundingClientRect();
    sidebarLeft = rect.left;
    grabOffset = e.clientX - rect.right;

    activePointerId = e.pointerId;
    resizer.setPointerCapture(e.pointerId);
    body.classList.add("is-resizing");
    e.preventDefault();
}

function resize(e) {
    if (e.pointerId !== activePointerId) return;
    sidebar.style.width = `${e.clientX - grabOffset - sidebarLeft}px`;
}

function stopResize(e) {
    if (e.pointerId !== activePointerId) return;
    activePointerId = null;
    body.classList.remove("is-resizing");
    sidebar.style.width = `${sidebar.getBoundingClientRect().width}px`;
}

resizer.addEventListener("pointerdown", startResize);
resizer.addEventListener("pointermove", resize);
resizer.addEventListener("pointerup", stopResize);
resizer.addEventListener("pointercancel", stopResize);

DESKTOP_QUERY.addEventListener("change", (e) => {
    if (e.matches) return;
    activePointerId = null;
    body.classList.remove("is-resizing");
    sidebar.style.width = "";
});

sidebarButton.addEventListener("click", () => {
    isCollapsed = !isCollapsed;
    sidebar.classList.toggle("is-collapsed", isCollapsed);
    sidebarButton.setAttribute("aria-expanded", String(!isCollapsed));

    if (isCollapsed) {
        sidebar.style.width = "";
    }
});

content.addEventListener("click", (event) => {
    const itemElement = event.target.closest(".item");
    if (!itemElement) {
        return;
    }

    const project = projectList.get(itemElement.closest("[data-id]:not(.item)").dataset.id);
    const item = project.items.find((i) => i.id === itemElement.dataset.id);

    if (event.target.matches(".item-remove")) {
        project.removeItem(item.id);
        saveProjects();
        itemElement.remove();
    }
});

addProjectButton.addEventListener("click", () => {
    createProject("New project");
});

projects.addEventListener("click", (event) => {
    const tab = event.target.closest(".project-tab");
    if (!tab) {
        return;
    }

    if (event.target.closest(".project-remove")) {
        handleDeleteProject(tab.dataset.id);
        return;
    }

    const project = projectList.get(tab.dataset.id);
    if (project) {
        selectProject(project);
    }
});

function handleDeleteProject(id) {
    const project = projectList.get(id);
    if (!project) {
        return;
    }

    removeProject(id);
    saveProjects();

    if (id !== activeProjectId) {
        renderSidebar();
        return;
    }

    const next = projectList.values().next().value;
    if (next) {
        selectProject(next);
    } else {
        createProject("New project");
    }
}

function projectNameChange(event) {
    const projectId = event.target.dataset.id;
    const project = projectList.get(projectId);
    project.updateName(event.target.textContent);

    const sidebarTab = document.querySelector(`#projects [data-id="${projectId}"] .project-name`);
    sidebarTab.textContent = project.name;

    saveProjectsSoon();
}

function createProjectTab(project) {
    const tab = document.createElement("div");
    tab.classList.add("project-tab");
    tab.dataset.id = project.id;

    const name = document.createElement("div");
    name.classList.add("project-name");
    name.textContent = project.name;

    const edit = document.createElement("div");
    edit.classList.add("project-edit");
    edit.innerHTML = EDIT_ICON;

    const remove = document.createElement("button");
    remove.classList.add("project-remove");
    remove.type = "button";
    remove.setAttribute("aria-label", `Delete ${project.name}`);
    remove.innerHTML = TRASH_ICON;

    tab.append(name, edit, remove);
    tab.classList.toggle("is-active", project.id === activeProjectId);
    return tab;
}

function createItemForm() {
    const form = document.createElement("form");
    form.classList.add("new-item");

    const name = document.createElement("input");
    name.id = "new-item-name";
    name.type = "text";
    name.placeholder = "Grocery shopping";

    const description = document.createElement("input");
    description.id = "new-item-description";
    description.type = "text";
    description.placeholder = "Buy lemon in Tesco";

    const dueDate = document.createElement("input");
    dueDate.id = "new-item-due-date";
    dueDate.type = "date";

    const priority = document.createElement("select");
    priority.id = "new-item-priority";

    for (const key of Object.keys(PRIORITIES)) {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = key[0].toUpperCase() + key.slice(1);
        priority.appendChild(option);
    }

    const addButton = document.createElement("button");
    addButton.id = "new-item-add";
    addButton.textContent = "Add";

    form.append(name, description, dueDate, priority, addButton);
    form.addEventListener("submit", handleAddItem);

    return form;
}

function handleAddItem(event) {
    event.preventDefault();

    const form = event.currentTarget.closest(".new-item");
    const projectId = event.currentTarget.closest("[data-id]").dataset.id;
    const project = projectList.get(projectId);

    const nameInput = form.querySelector("#new-item-name");
    const descriptionInput = form.querySelector("#new-item-description");
    const dueDateInput = form.querySelector("#new-item-due-date");
    const priorityInput = form.querySelector("#new-item-priority");

    const title = nameInput.value.trim();
    if (!title) {
        return;
    }

    const item = new Item(
        title,
        descriptionInput.value.trim(),
        dueDateInput.value,
        priorityInput.value,
    );
    project.addItem(item);
    saveProjects();

    form.parentElement.appendChild(createItemElement(item));

    form.reset();
    nameInput.focus();
}

function createProjectView(project) {
    const view = document.createElement("div");
    view.dataset.id = project.id;

    const header = document.createElement("h1");
    header.id = "project-name";
    header.dataset.id = project.id;
    header.textContent = project.name;
    header.contentEditable = "true";
    header.addEventListener("input", projectNameChange);
    header.focus();

    const itemsContainer = document.createElement("div");
    itemsContainer.id = "project-items";
    itemsContainer.appendChild(createItemForm());

    view.append(header, document.createElement("hr"), itemsContainer);
    return view;
}

function createItemElement(item) {
    const element = document.createElement("div");
    element.classList.add("item");
    element.dataset.id = item.id;

    const title = document.createElement("div");
    title.classList.add("item-title");
    title.textContent = item.title;

    const description = document.createElement("div");
    description.classList.add("item-description");
    description.textContent = item.description;

    const dueDate = document.createElement("time");
    dueDate.classList.add("item-due-date");
    dueDate.dateTime = item.dueDate;
    dueDate.textContent = formatDueDate(item.dueDate);

    const priority = document.createElement("span");
    priority.classList.add("item-priority");
    priority.style.backgroundColor = PRIORITIES[item.priority].color;

    const remove = document.createElement("button");
    remove.classList.add("item-remove");
    remove.textContent = "×";

    element.append(title, description, dueDate, priority, remove);

    return element;
}

function renderProject(project) {
    content.replaceChildren(createProjectView(project));

    const itemsContainer = content.querySelector("#project-items");

    for (const item of project.items) {
        itemsContainer.appendChild(createItemElement(item));
    }
}

function selectProject(project) {
    activeProjectId = project.id;
    renderProject(project);
    renderSidebar();
}

function renderSidebar() {
    projects.replaceChildren();
    for (const project of projectList.values()) {
        projects.appendChild(createProjectTab(project));
    }
}

function createProject(name) {
    const project = new Project(name);
    registerProject(project);
    saveProjects();

    selectProject(project);

    return project;
}

function init() {
    loadProjects();

    const first = projectList.values().next().value;

    if (first) {
        selectProject(first);
    } else {
        createProject("New project");
    }
}

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

function debounce(fn, delay) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}

const saveProjectsSoon = debounce(saveProjects, 1000);
init();

import { parseISO, isToday, isTomorrow } from "date-fns";
import "./styles.css";
import { Project, projectList, registerProject, removeProject } from "./projects.js";
import { Item, PRIORITIES } from "./items.js";
import { Note, noteList, registerNote, removeNote, findNote } from "./notes.js";
import { saveProjects, loadProjects, saveNotes, loadNotes, saveView, loadView } from "./storage.js";

const projects = document.getElementById("projects");
const content = document.getElementById("project");
const addProjectButton = document.getElementById("add-project");
const notesHeader = document.getElementById("notes-header");

const EDIT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M505 122.9L517.1 135C526.5 144.4 526.5 159.6 517.1 168.9L488 198.1L441.9 152L471 122.9C480.4 113.5 495.6 113.5 504.9 122.9zM273.8 320.2L408 185.9L454.1 232L319.8 366.2C316.9 369.1 313.3 371.2 309.4 372.3L250.9 389L267.6 330.5C268.7 326.6 270.8 323 273.7 320.1zM437.1 89L239.8 286.2C231.1 294.9 224.8 305.6 221.5 317.3L192.9 417.3C190.5 425.7 192.8 434.7 199 440.9C205.2 447.1 214.2 449.4 222.6 447L322.6 418.4C334.4 415 345.1 408.7 353.7 400.1L551 202.9C579.1 174.8 579.1 129.2 551 101.1L538.9 89C510.8 60.9 465.2 60.9 437.1 89zM152 128C103.4 128 64 167.4 64 216L64 488C64 536.6 103.4 576 152 576L424 576C472.6 576 512 536.6 512 488L512 376C512 362.7 501.3 352 488 352C474.7 352 464 362.7 464 376L464 488C464 510.1 446.1 528 424 528L152 528C129.9 528 112 510.1 112 488L112 216C112 193.9 129.9 176 152 176L264 176C277.3 176 288 165.3 288 152C288 138.7 277.3 128 264 128L152 128z"/></svg>`;
const TRASH_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z"/></svg>`;
const INFO_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 1.8a8.2 8.2 0 1 1 0 16.4 8.2 8.2 0 0 1 0-16.4zM11 10.4h2v7h-2v-7zm0-3.6h2v2.1h-2V6.8z"/></svg>`;
const XMARK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free v6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>`;

const CHECK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9.6 17.2 4 11.6l1.6-1.6 4 4L18.4 5.2 20 6.8z"/></svg>`;
const PLUS_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5z"/></svg>`;

const infoDialog = document.getElementById("item-info");
const editDialog = document.getElementById("item-edit");
const editForm = document.getElementById("item-edit-form");
const editCancelButton = document.getElementById("edit-item-cancel");

const DEFAULT_PROJECT_NAME = "Untitled";

const SUPPORTS_PLAINTEXT_ONLY = (() => {
    try {
        const probe = document.createElement("div");
        probe.contentEditable = "plaintext-only";
        return probe.contentEditable === "plaintext-only";
    } catch {
        return false;
    }
})();

function makeEditable(element, { multiline }) {
    element.contentEditable = SUPPORTS_PLAINTEXT_ONLY ? "plaintext-only" : "true";
    element.spellcheck = false;

    element.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") {
            return;
        }

        // A single-line heading never takes a line break.
        if (!multiline) {
            event.preventDefault();
            element.blur();
            return;
        }

        // Without plaintext-only the browser answers Enter with a <div> or <br>,
        // which textContent then flattens — silently merging the two lines.
        // Insert a real newline instead; .note-text is white-space: pre-wrap.
        if (!SUPPORTS_PLAINTEXT_ONLY) {
            event.preventDefault();
            insertPlainText(element, "\n");
        }
    });

    element.addEventListener("paste", (event) => {
        if (SUPPORTS_PLAINTEXT_ONLY) {
            return;
        }

        event.preventDefault();
        const text = event.clipboardData?.getData("text/plain") ?? "";
        insertPlainText(element, multiline ? text : text.replace(/\s+/g, " "));
    });
}

function insertPlainText(element, value) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
        return;
    }

    const range = selection.getRangeAt(0);
    if (!element.contains(range.commonAncestorContainer)) {
        return;
    }

    const start = textOffset(element, range.startContainer, range.startOffset);
    const end = textOffset(element, range.endContainer, range.endOffset);

    const text = readEditableText(element);

    // A trailing newline is treated as block filler and the caret cannot sit
    // past it, so the next keystroke would land on the previous line. Native
    // plaintext-only keeps a spare newline for exactly this reason; match it.
    const atEnd = end >= text.length && value.endsWith("\n");
    const inserted = atEnd ? `${value}\n` : value;

    // Rewriting the whole value leaves exactly one flat text node, so the caret
    // can be restored by offset instead of by a node the browser may re-nest.
    element.textContent = text.slice(0, start) + inserted + text.slice(end);

    const caret = start + value.length;
    const node = element.firstChild ?? element.appendChild(document.createTextNode(""));
    const position = document.createRange();
    position.setStart(node, Math.min(caret, node.nodeValue?.length ?? 0));
    position.collapse(true);
    selection.removeAllRanges();
    selection.addRange(position);

    element.dispatchEvent(new Event("input", { bubbles: true }));
}

function textOffset(element, container, offset) {
    const range = document.createRange();
    range.selectNodeContents(element);
    range.setEnd(container, offset);
    return range.toString().length;
}

// textContent drops the <br> and block boundaries a browser may still introduce
// (drag-and-drop, IME, autocorrect), which would merge two lines into one.
function readEditableText(element) {
    let text = "";

    const walk = (parent) => {
        for (const node of parent.childNodes) {
            if (node.nodeType === Node.TEXT_NODE) {
                text += node.nodeValue;
            } else if (node.nodeName === "BR") {
                text += "\n";
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                if (BLOCK_TAGS.has(node.nodeName) && text && !text.endsWith("\n")) {
                    text += "\n";
                }
                walk(node);
            }
        }
    };

    walk(element);
    return text;
}

const BLOCK_TAGS = new Set(["DIV", "P", "LI", "UL", "OL", "PRE", "BLOCKQUOTE", "H1", "H2", "H3"]);

let activeProjectId = null;
let editingItemId = null;
let activeView = "project";

content.addEventListener("click", (event) => {
    const itemElement = event.target.closest(".item");
    if (!itemElement) {
        return;
    }

    const found = findItemLocation(itemElement.dataset.id);
    if (!found) {
        return;
    }

    const { project, item } = found;

    if (event.target.closest(".item-remove")) {
        project.removeItem(item.id);
        saveProjects();
        itemElement.remove();
        renumberItems();
        refreshSheetCount();
        renderSidebar();
        return;
    }

    if (event.target.closest(".item-info")) {
        openInfoDialog(project, item);
        return;
    }

    if (event.target.closest(".item-edit")) {
        openEditDialog(item);
    }
});

content.addEventListener("change", (event) => {
    if (!event.target.matches(".item-check")) {
        return;
    }

    const itemElement = event.target.closest(".item");
    const found = findItemLocation(itemElement.dataset.id);
    if (!found) {
        return;
    }

    const { item } = found;

    if (event.target.checked) {
        item.check();
    } else {
        item.uncheck();
    }

    itemElement.classList.toggle("is-completed", item.completed);
    itemElement.classList.toggle("is-stamping", item.completed);
    saveProjects();
    refreshSheetCount();
    renderSidebar();
});

editForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const found = findItemLocation(editingItemId);
    if (!found) {
        closeEditDialog();
        return;
    }

    const title = editForm.querySelector("#edit-item-name").value.trim();
    if (!title) {
        return;
    }

    const { item } = found;
    item.updateTitle(title);
    item.updateDescription(editForm.querySelector("#edit-item-description").value.trim());
    item.updateDueDate(editForm.querySelector("#edit-item-due-date").value);
    item.updatePriority(editForm.querySelector("#edit-item-priority").value);

    saveProjects();
    refreshItemElement(item);
    closeEditDialog();
});

editCancelButton.addEventListener("click", closeEditDialog);
editDialog.addEventListener("close", () => {
    editingItemId = null;
});

notesHeader.addEventListener("click", showNotes);

content.addEventListener("click", (event) => {
    if (event.target.closest("#add-note")) {
        handleAddNote();
        return;
    }

    const noteElement = event.target.closest(".note");
    if (noteElement && event.target.closest(".note-remove")) {
        removeNote(noteElement.dataset.id);
        saveNotes();
        noteElement.remove();
    }
});

content.addEventListener("input", (event) => {
    if (!event.target.matches(".note-text")) {
        return;
    }

    const noteElement = event.target.closest(".note");
    const note = noteElement && findNote(noteElement.dataset.id);
    if (!note) {
        return;
    }

    note.updateText(readEditableText(event.target));
    saveNotesSoon();
});

addProjectButton.addEventListener("click", () => {
    createProject(DEFAULT_PROJECT_NAME);
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

    if (activeView === "notes") {
        activeProjectId = next?.id ?? null;
        renderSidebar();
        saveView({ activeView, activeProjectId });
        return;
    }

    if (next) {
        selectProject(next);
    } else {
        createProject(DEFAULT_PROJECT_NAME);
    }
}

function projectNameChange(event) {
    const project = projectList.get(event.target.dataset.id);
    if (!project) {
        return;
    }

    project.updateName(readEditableText(event.target).replace(/\s+/g, " ").trim());

    renderSidebar();

    saveProjectsSoon();
}

function createProjectTab(project) {
    const isActive = activeView === "project" && project.id === activeProjectId;

    const tab = document.createElement("div");
    tab.classList.add("project-tab");
    tab.dataset.id = project.id;
    tab.classList.toggle("is-active", isActive);

    const code = document.createElement("span");
    code.classList.add("project-code");
    code.textContent = routeCode(project.name);

    const name = document.createElement("span");
    name.classList.add("project-name");
    name.textContent = project.name;

    const openCount = countOpenItems(project);
    const count = document.createElement("span");
    count.classList.add("project-count");
    count.textContent = openCount > 0 ? String(openCount) : "";
    count.title = `${openCount} open item${openCount === 1 ? "" : "s"}`;

    const open = document.createElement("button");
    open.type = "button";
    open.classList.add("project-open");
    open.setAttribute("aria-current", isActive ? "true" : "false");
    open.append(code, name, count);

    const remove = document.createElement("button");
    remove.classList.add("project-remove");
    remove.type = "button";
    remove.setAttribute("aria-label", `Delete ${project.name}`);
    remove.innerHTML = TRASH_ICON;

    tab.append(open, remove);
    return tab;
}

function routeCode(name) {
    const letters = (name ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    return letters.slice(0, 3).padEnd(3, "\u00b7");
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

    fillPriorityOptions(priority);

    const nameField = document.createElement("label");
    nameField.classList.add("new-item-field", "new-item-field-wide");
    nameField.append(fieldLabel("Task"), name);

    const descriptionField = document.createElement("label");
    descriptionField.classList.add("new-item-field", "new-item-field-wide");
    descriptionField.append(fieldLabel("Detail"), description);

    const dueDateField = document.createElement("label");
    dueDateField.classList.add("new-item-field");
    dueDateField.append(fieldLabel("Date"), dueDate);

    const priorityField = document.createElement("label");
    priorityField.classList.add("new-item-field");
    priorityField.append(fieldLabel("Priority"), priority);

    const meta = document.createElement("div");
    meta.classList.add("new-item-meta");
    meta.append(dueDateField, priorityField);

    const cancelButton = document.createElement("button");
    cancelButton.id = "new-item-cancel";
    cancelButton.type = "button";
    cancelButton.textContent = "Discard";
    cancelButton.addEventListener("click", closeItemForm);

    const addButton = document.createElement("button");
    addButton.id = "new-item-add";
    addButton.type = "submit";
    addButton.textContent = "Issue";

    const actions = document.createElement("div");
    actions.classList.add("new-item-actions");
    actions.append(cancelButton, addButton);

    const heading = document.createElement("div");
    heading.classList.add("new-item-head");
    heading.innerHTML = `<span>New coupon</span><span class="new-item-head-code">Not issued</span>`;

    form.append(heading, nameField, descriptionField, meta, actions);
    form.addEventListener("submit", handleAddItem);
    form.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            event.preventDefault();
            closeItemForm();
        }
    });

    return form;
}

function createItemAdder() {
    const button = document.createElement("button");
    button.type = "button";
    button.id = "add-item";
    button.setAttribute("aria-label", "Issue a new coupon");
    button.innerHTML = `${PLUS_ICON}<span>Issue coupon</span>`;
    button.addEventListener("click", openItemForm);
    return button;
}

function openItemForm() {
    const container = content.querySelector("#project-items");
    if (!container) {
        return;
    }

    container.classList.add("is-adding");
    container.querySelector("#new-item-name")?.focus();
}

function closeItemForm() {
    const container = content.querySelector("#project-items");
    if (!container) {
        return;
    }

    container.classList.remove("is-adding");
    container.querySelector(".new-item")?.reset();
    container.querySelector("#add-item")?.focus();
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
    renderSidebar();

    const container = form.closest("#project-items");
    container.appendChild(createItemElement(item, project.items.length));
    container.classList.remove("is-empty");
    refreshSheetCount();

    form.reset();
    nameInput.focus();
}

function createProjectView(project) {
    const view = document.createElement("div");
    view.classList.add("sheet");
    view.dataset.id = project.id;

    const title = document.createElement("h1");
    title.id = "project-name";
    title.dataset.id = project.id;
    title.textContent = project.name;
    makeEditable(title, { multiline: false });
    title.setAttribute("aria-label", "Project name");
    title.addEventListener("input", projectNameChange);

    const openCount = countOpenItems(project);

    const count = document.createElement("div");
    count.classList.add("sheet-count");
    count.innerHTML =
        `<span class="sheet-count-value">${String(openCount).padStart(2, "0")}</span>` +
        `<span class="sheet-count-label">Open</span>`;

    const header = document.createElement("header");
    header.classList.add("sheet-head");
    header.append(title, count);

    const itemsContainer = document.createElement("div");
    itemsContainer.id = "project-items";
    itemsContainer.append(createBlankCoupon(), createItemAdder(), createItemForm());

    view.append(header, document.createElement("hr"), createItemsRuling(), itemsContainer);
    return view;
}

function createBlankCoupon() {
    const element = document.createElement("div");
    element.classList.add("item", "item-blank");
    element.setAttribute("aria-hidden", "true");

    const seq = document.createElement("div");
    seq.classList.add("item-seq");
    seq.textContent = "--";

    const check = document.createElement("div");
    check.classList.add("item-check-box");
    check.append(buildCheckGlyph());

    const title = document.createElement("span");
    title.classList.add("item-title");
    title.textContent = "Not issued";

    const description = document.createElement("span");
    description.classList.add("item-description");
    description.textContent = "Issue a coupon to start this book";

    const body = document.createElement("div");
    body.classList.add("item-body");
    body.append(title, description);

    const dateField = document.createElement("div");
    dateField.classList.add("item-field", "item-field-date");
    dateField.append(fieldLabel("Date"), blankValue("item-due-date"));

    const priorityField = document.createElement("div");
    priorityField.classList.add("item-field", "item-field-prty");
    priorityField.append(fieldLabel("Priority"), blankValue("item-priority"));

    const actions = document.createElement("div");
    actions.classList.add("item-actions");

    const stub = document.createElement("div");
    stub.classList.add("item-stub");

    element.append(seq, check, body, dateField, priorityField, actions, stub);
    return element;
}

function blankValue(className) {
    const value = document.createElement("span");
    value.classList.add(className);
    value.textContent = "\u2014\u2014";
    return value;
}

function createItemsRuling() {
    const ruling = document.createElement("div");
    ruling.classList.add("items-ruling");
    ruling.setAttribute("aria-hidden", "true");

    for (const [label, slot] of [["No.", "seq"], ["Task", "task"], ["Date", "date"], ["Priority", "prty"]]) {
        const cell = document.createElement("span");
        cell.classList.add("ruling-cell");
        cell.dataset.slot = slot;
        cell.textContent = label;
        ruling.appendChild(cell);
    }

    return ruling;
}

function createItemElement(item, sequence) {
    const priority = PRIORITIES[item.priority] ?? PRIORITIES.medium;

    const element = document.createElement("div");
    element.classList.add("item");
    element.dataset.id = item.id;
    element.dataset.priority = item.priority in PRIORITIES ? item.priority : "medium";
    element.style.setProperty("--prty", priority.color);
    element.classList.toggle("is-completed", item.completed);

    const seq = document.createElement("div");
    seq.classList.add("item-seq");
    seq.setAttribute("aria-hidden", "true");
    seq.textContent = String(sequence ?? 1).padStart(2, "0");

    const check = document.createElement("label");
    check.classList.add("item-check-box");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("item-check");
    checkbox.checked = item.completed;
    checkbox.setAttribute("aria-label", `Mark ${item.title} as done`);
    check.append(checkbox, buildCheckGlyph());

    const title = document.createElement("span");
    title.classList.add("item-title");
    title.textContent = item.title;

    const description = document.createElement("span");
    description.classList.add("item-description");
    description.textContent = item.description ?? "";

    const body = document.createElement("div");
    body.classList.add("item-body");
    body.append(title, description);

    const dueDate = document.createElement("time");
    dueDate.classList.add("item-due-date");
    dueDate.dateTime = item.dueDate ?? "";
    dueDate.textContent = formatDueDate(item.dueDate) || "\u2014\u2014";

    const dateField = document.createElement("div");
    dateField.classList.add("item-field", "item-field-date");
    dateField.append(fieldLabel("Date"), dueDate);

    const priorityMark = document.createElement("span");
    priorityMark.classList.add("item-priority");
    priorityMark.textContent = priority.code;

    const priorityField = document.createElement("div");
    priorityField.classList.add("item-field", "item-field-prty");
    priorityField.append(fieldLabel("Priority"), priorityMark);

    const info = document.createElement("button");
    info.type = "button";
    info.classList.add("item-info");
    info.setAttribute("aria-label", `Details for ${item.title}`);
    info.innerHTML = INFO_ICON;

    const edit = document.createElement("button");
    edit.type = "button";
    edit.classList.add("item-edit");
    edit.setAttribute("aria-label", `Edit ${item.title}`);
    edit.innerHTML = EDIT_ICON;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.classList.add("item-remove");
    remove.setAttribute("aria-label", `Delete ${item.title}`);
    remove.innerHTML = TRASH_ICON;

    const actions = document.createElement("div");
    actions.classList.add("item-actions");
    actions.append(info, edit, remove);

    const stub = document.createElement("div");
    stub.classList.add("item-stub");
    stub.setAttribute("aria-hidden", "true");

    element.append(seq, check, body, dateField, priorityField, actions, stub);

    return element;
}

function fieldLabel(text) {
    const label = document.createElement("span");
    label.classList.add("field-label");
    label.textContent = text;
    return label;
}

function buildCheckGlyph() {
    const glyph = document.createElement("span");
    glyph.classList.add("item-check-glyph");
    glyph.setAttribute("aria-hidden", "true");
    glyph.innerHTML = CHECK_ICON;
    return glyph;
}

function refreshItemElement(item) {
    const existing = content.querySelector(`.item[data-id="${item.id}"]`);
    if (!existing) {
        return;
    }

    const sequence = [...content.querySelectorAll(".item:not(.item-blank)")].indexOf(existing) + 1;
    existing.replaceWith(createItemElement(item, sequence));
}

function renumberItems() {
    const container = content.querySelector("#project-items");
    if (!container) {
        return;
    }

    const items = container.querySelectorAll(".item:not(.item-blank)");
    items.forEach((element, index) => {
        element.querySelector(".item-seq").textContent = String(index + 1).padStart(2, "0");
    });

    container.classList.toggle("is-empty", items.length === 0);
}

function refreshSheetCount() {
    const value = content.querySelector(".sheet-count-value");
    const project = projectList.get(activeProjectId);
    if (value && project) {
        value.textContent = String(countOpenItems(project)).padStart(2, "0");
    }
}

function countOpenItems(project) {
    return project.items.filter((item) => !item.completed).length;
}

function findItemLocation(itemId) {
    for (const project of projectList.values()) {
        const item = project.items.find((i) => i.id === itemId);
        if (item) {
            return { project, item };
        }
    }

    return null;
}

function openInfoDialog(project, item) {
    infoDialog.querySelector("#item-info-title").textContent = item.title;
    infoDialog.querySelector("#item-info-description").textContent = item.description || "\u2014";
    infoDialog.querySelector("#item-info-priority").textContent = capitalize(item.priority);
    infoDialog.querySelector("#item-info-due-date").textContent =
        item.dueDate ? formatDueDate(item.dueDate) : "No due date";
    infoDialog.querySelector("#item-info-project").textContent = project.name;

    infoDialog.showModal();
}

function openEditDialog(item) {
    editingItemId = item.id;

    editForm.querySelector("#edit-item-name").value = item.title;
    editForm.querySelector("#edit-item-description").value = item.description ?? "";
    editForm.querySelector("#edit-item-due-date").value = item.dueDate ?? "";
    editForm.querySelector("#edit-item-priority").value = item.priority;

    editDialog.showModal();
}

function closeEditDialog() {
    editingItemId = null;
    editDialog.close();
}

function capitalize(value) {
    return value ? value[0].toUpperCase() + value.slice(1) : "";
}

function fillPriorityOptions(select) {
    for (const key of Object.keys(PRIORITIES)) {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = capitalize(key);
        select.appendChild(option);
    }
}

function renderProject(project) {
    content.replaceChildren(createProjectView(project));

    const itemsContainer = content.querySelector("#project-items");

    project.items.forEach((item, index) => {
        itemsContainer.appendChild(createItemElement(item, index + 1));
    });

    itemsContainer.classList.toggle("is-empty", project.items.length === 0);
}

function createNoteElement(note, sequence) {
    const element = document.createElement("div");
    element.classList.add("note");
    element.dataset.id = note.id;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.classList.add("note-remove");
    remove.setAttribute("aria-label", "Delete note");
    remove.innerHTML = XMARK_ICON;

    const head = document.createElement("div");
    head.classList.add("note-head");
    head.innerHTML = `<span class="note-seq">${String(sequence ?? 1).padStart(2, "0")}</span>`;

    const text = document.createElement("div");
    text.classList.add("note-text");
    makeEditable(text, { multiline: true });
    text.setAttribute("role", "textbox");
    text.setAttribute("aria-label", `Note ${sequence ?? 1}`);
    text.textContent = note.text;
    text.dataset.placeholder = "Type here...";

    element.append(head, remove, text);

    return element;
}

function renderNotes() {
    const view = document.createElement("div");
    view.id = "notes-view";
    view.classList.add("sheet");

    const title = document.createElement("h1");
    title.textContent = "Notes";

    const count = document.createElement("div");
    count.classList.add("sheet-count");
    count.innerHTML =
        `<span class="sheet-count-value">${String(noteList.length).padStart(2, "0")}</span>` +
        `<span class="sheet-count-label">Notes</span>`;

    const header = document.createElement("header");
    header.classList.add("sheet-head");
    header.append(title, count);

    const grid = document.createElement("div");
    grid.id = "notes-grid";

    noteList.forEach((note, index) => {
        grid.appendChild(createNoteElement(note, index + 1));
    });

    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.id = "add-note";
    addButton.innerHTML = `${PLUS_ICON}<span>New note</span>`;
    grid.appendChild(addButton);

    view.append(header, document.createElement("hr"), grid);
    content.replaceChildren(view);
}

function showNotes() {
    activeView = "notes";
    renderNotes();
    renderSidebar();
    saveView({ activeView, activeProjectId });
}

function handleAddNote() {
    const note = new Note("");
    registerNote(note);
    saveNotes();
    renderNotes();

    const text = content.querySelector(`.note[data-id="${note.id}"] .note-text`);
    if (text) {
        text.focus();
    }
}

function selectProject(project) {
    activeView = "project";
    activeProjectId = project.id;
    renderProject(project);
    renderSidebar();
    saveView({ activeView, activeProjectId });
}

function renderSidebar() {
    notesHeader.classList.toggle("is-active", activeView === "notes");

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
    selectProjectTitle();

    return project;
}

function selectProjectTitle() {
    const title = content.querySelector("#project-name");
    if (!title) {
        return;
    }

    title.focus();

    const range = document.createRange();
    range.selectNodeContents(title);

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

function init() {
    fillPriorityOptions(editForm.querySelector("#edit-item-priority"));

    loadProjects();
    loadNotes();

    const saved = loadView();

    if (projectList.size === 0) {
        registerProject(new Project(DEFAULT_PROJECT_NAME));
        saveProjects();
    }

    const restored = saved?.activeProjectId ? projectList.get(saved.activeProjectId) : null;
    const project = restored ?? projectList.values().next().value;

    if (saved?.activeView === "notes") {
        activeProjectId = project?.id ?? null;
        showNotes();
        return;
    }

    selectProject(project);
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
const saveNotesSoon = debounce(saveNotes, 1000);
init();

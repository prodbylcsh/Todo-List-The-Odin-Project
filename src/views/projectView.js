import { Item } from "../models/items.js";
import { countOpenItems } from "../models/projects.js";
import { saveProjects } from "../storage.js";
import { readEditableText, selectAllText } from "../dom/editable.js";
import { debounce } from "../utils/debounce.js";
import { sequenceNumber } from "../utils/format.js";
import { createProjectSheet } from "./templates/projectSheet.js";
import { createItemElement } from "./templates/itemCard.js";
import { readItemForm } from "./templates/itemForm.js";
import { createItemDialogs } from "./itemDialogs.js";

// Owns the main pane while a project is open: renders the sheet and turns
// clicks on it into changes on the model. `onProjectChanged` lets the outside
// world (the sidebar) know that names or open counts moved.
function createProjectView({ content, dialogElements, onProjectChanged }) {
    let project = null;

    const dialogs = createItemDialogs({ ...dialogElements, onSubmit: applyEdit });
    const saveProjectsSoon = debounce(saveProjects, 1000);

    content.addEventListener("click", (event) => {
        if (event.target.closest("#add-item")) {
            openItemForm();
            return;
        }

        if (event.target.closest("#new-item-cancel")) {
            closeItemForm();
            return;
        }

        const itemElement = event.target.closest(".item");
        const item = itemElement && findItem(itemElement.dataset.id);
        if (!item) {
            return;
        }

        if (event.target.closest(".item-remove")) {
            removeItem(item, itemElement);
            return;
        }

        if (event.target.closest(".item-info")) {
            dialogs.openInfo(project, item);
            return;
        }

        if (event.target.closest(".item-edit")) {
            dialogs.openEdit(item);
        }
    });

    content.addEventListener("change", (event) => {
        if (!event.target.matches(".item-check")) {
            return;
        }

        const itemElement = event.target.closest(".item");
        const item = findItem(itemElement.dataset.id);
        if (!item) {
            return;
        }

        if (event.target.checked) {
            item.check();
        } else {
            item.uncheck();
        }

        itemElement.classList.toggle("is-completed", item.completed);
        itemElement.classList.toggle("is-stamping", item.completed);

        saveProjects();
        refreshOpenCount();
        onProjectChanged();
    });

    content.addEventListener("input", (event) => {
        if (!event.target.matches("#project-name") || !project) {
            return;
        }

        project.updateName(readEditableText(event.target).replace(/\s+/g, " ").trim());
        onProjectChanged();
        saveProjectsSoon();
    });

    content.addEventListener("submit", (event) => {
        if (!event.target.matches(".new-item")) {
            return;
        }

        event.preventDefault();
        addItem(event.target);
    });

    content.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && event.target.closest(".new-item")) {
            event.preventDefault();
            closeItemForm();
        }
    });

    function show(nextProject) {
        project = nextProject;
        content.replaceChildren(createProjectSheet(project, countOpenItems(project)));
    }

    // Puts the caret in the (freshly created) project title.
    function focusName() {
        const title = content.querySelector("#project-name");
        if (!title) {
            return;
        }

        title.focus();
        selectAllText(title);
    }

    function addItem(form) {
        const values = readItemForm(form);
        if (!values || !project) {
            return;
        }

        const item = new Item(values.title, values.description, values.dueDate, values.priority);
        project.addItem(item);
        saveProjects();

        const container = form.closest("#project-items");
        container.appendChild(createItemElement(item, project.items.length));
        container.classList.remove("is-empty");

        refreshOpenCount();
        onProjectChanged();

        form.reset();
        form.querySelector("#new-item-name").focus();
    }

    function removeItem(item, itemElement) {
        project.removeItem(item.id);
        saveProjects();

        itemElement.remove();
        renumberItems();
        refreshOpenCount();
        onProjectChanged();
    }

    function applyEdit(item, values) {
        if (!findItem(item.id)) {
            return;
        }

        item.updateTitle(values.title);
        item.updateDescription(values.description);
        item.updateDueDate(values.dueDate);
        item.updatePriority(values.priority);

        saveProjects();
        replaceItemElement(item);
    }

    function replaceItemElement(item) {
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
            element.querySelector(".item-seq").textContent = sequenceNumber(index + 1);
        });

        container.classList.toggle("is-empty", items.length === 0);
    }

    function refreshOpenCount() {
        const value = content.querySelector(".sheet-count-value");
        if (value && project) {
            value.textContent = sequenceNumber(countOpenItems(project));
        }
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

    function findItem(id) {
        return project?.items.find((item) => item.id === id) ?? null;
    }

    return {
        show,
        focusName,
    };
}

export { createProjectView }

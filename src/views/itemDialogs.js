import { fillPriorityOptions } from "./templates/itemForm.js";
import { capitalize, formatDueDate } from "../utils/format.js";

// Wraps the two static <dialog> elements from index.html.
// `onSubmit(item, values)` fires once the edit form is saved.
function createItemDialogs({ infoDialog, editDialog, editForm, onSubmit }) {
    let editingItem = null;

    fillPriorityOptions(editForm.querySelector("#edit-item-priority"));

    editForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const values = readEditForm();
        if (!values) {
            return; // Keep the dialog open until the coupon has a name.
        }

        const item = editingItem;
        closeEdit();

        if (item) {
            onSubmit(item, values);
        }
    });

    editForm.querySelector("#edit-item-cancel").addEventListener("click", closeEdit);

    editDialog.addEventListener("close", () => {
        editingItem = null;
    });

    function openInfo(project, item) {
        infoDialog.querySelector("#item-info-title").textContent = item.title;
        infoDialog.querySelector("#item-info-description").textContent = item.description || "—";
        infoDialog.querySelector("#item-info-priority").textContent = capitalize(item.priority);
        infoDialog.querySelector("#item-info-due-date").textContent =
            item.dueDate ? formatDueDate(item.dueDate) : "No due date";
        infoDialog.querySelector("#item-info-project").textContent = project.name;

        infoDialog.showModal();
    }

    function openEdit(item) {
        editingItem = item;

        editForm.querySelector("#edit-item-name").value = item.title;
        editForm.querySelector("#edit-item-description").value = item.description ?? "";
        editForm.querySelector("#edit-item-due-date").value = item.dueDate ?? "";
        editForm.querySelector("#edit-item-priority").value = item.priority;

        editDialog.showModal();
    }

    function closeEdit() {
        editingItem = null;
        editDialog.close();
    }

    function readEditForm() {
        const title = editForm.querySelector("#edit-item-name").value.trim();
        if (!title) {
            return null;
        }

        return {
            title,
            description: editForm.querySelector("#edit-item-description").value.trim(),
            dueDate: editForm.querySelector("#edit-item-due-date").value,
            priority: editForm.querySelector("#edit-item-priority").value,
        };
    }

    return {
        openInfo,
        openEdit,
        closeEdit,
    };
}

export { createItemDialogs }

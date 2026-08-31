import { PRIORITIES } from "../../models/items.js";
import { element, fieldLabel } from "../../dom/elements.js";
import { PLUS_ICON } from "../../dom/icons.js";
import { capitalize } from "../../utils/format.js";

function createItemForm() {
    const form = element("form", "new-item");

    const heading = element("div", "new-item-head", {
        html: `<span>New coupon</span><span class="new-item-head-code">Not issued</span>`,
    });

    const nameField = textField("new-item-name", "text", "Task", "Grocery shopping", "new-item-field-wide");
    const descriptionField = textField("new-item-description", "text", "Detail", "Buy lemon in Tesco", "new-item-field-wide");
    const dueDateField = textField("new-item-due-date", "date", "Date");

    const priority = element("select");
    priority.id = "new-item-priority";
    fillPriorityOptions(priority);

    const priorityField = element("label", "new-item-field");
    priorityField.append(fieldLabel("Priority"), priority);

    const meta = element("div", "new-item-meta");
    meta.append(dueDateField, priorityField);

    const cancelButton = element("button", null, { text: "Discard" });
    cancelButton.id = "new-item-cancel";
    cancelButton.type = "button";

    const addButton = element("button", null, { text: "Issue" });
    addButton.id = "new-item-add";
    addButton.type = "submit";

    const actions = element("div", "new-item-actions");
    actions.append(cancelButton, addButton);

    form.append(heading, nameField, descriptionField, meta, actions);
    return form;
}

function createItemAdder() {
    const button = element("button", null, { html: `${PLUS_ICON}<span>Issue coupon</span>` });
    button.id = "add-item";
    button.type = "button";
    button.setAttribute("aria-label", "Issue a new coupon");
    return button;
}

// Reads the form as a plain object; returns null when the task has no name.
function readItemForm(form) {
    const title = form.querySelector("#new-item-name").value.trim();
    if (!title) {
        return null;
    }

    return {
        title,
        description: form.querySelector("#new-item-description").value.trim(),
        dueDate: form.querySelector("#new-item-due-date").value,
        priority: form.querySelector("#new-item-priority").value,
    };
}

function fillPriorityOptions(select) {
    for (const key of Object.keys(PRIORITIES)) {
        const option = element("option", null, { text: capitalize(key) });
        option.value = key;
        select.appendChild(option);
    }
}

function textField(id, type, label, placeholder = "", modifier = null) {
    const input = element("input");
    input.id = id;
    input.type = type;
    input.placeholder = placeholder;

    const field = element("label", modifier ? ["new-item-field", modifier] : "new-item-field");
    field.append(fieldLabel(label), input);
    return field;
}

export {
    createItemForm,
    createItemAdder,
    readItemForm,
    fillPriorityOptions,
}

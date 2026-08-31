import { PRIORITIES } from "../../models/items.js";
import { element, fieldLabel, iconButton } from "../../dom/elements.js";
import { CHECK_ICON, EDIT_ICON, INFO_ICON, TRASH_ICON } from "../../dom/icons.js";
import { formatDueDate, sequenceNumber } from "../../utils/format.js";

const EM_DASHES = "——";

function createItemElement(item, sequence) {
    const priority = PRIORITIES[item.priority] ?? PRIORITIES.medium;

    const root = element("div", "item");
    root.dataset.id = item.id;
    root.dataset.priority = item.priority in PRIORITIES ? item.priority : "medium";
    root.style.setProperty("--prty", priority.color);
    root.classList.toggle("is-completed", item.completed);

    const seq = element("div", "item-seq", { text: sequenceNumber(sequence) });
    seq.setAttribute("aria-hidden", "true");

    const check = element("label", "item-check-box");
    const checkbox = element("input", "item-check");
    checkbox.type = "checkbox";
    checkbox.checked = item.completed;
    checkbox.setAttribute("aria-label", `Mark ${item.title} as done`);
    check.append(checkbox, checkGlyph());

    const body = element("div", "item-body");
    body.append(
        element("span", "item-title", { text: item.title }),
        element("span", "item-description", { text: item.description ?? "" }),
    );

    const dueDate = element("time", "item-due-date", {
        text: formatDueDate(item.dueDate) || EM_DASHES,
    });
    dueDate.dateTime = item.dueDate ?? "";

    const dateField = element("div", ["item-field", "item-field-date"]);
    dateField.append(fieldLabel("Date"), dueDate);

    const priorityField = element("div", ["item-field", "item-field-prty"]);
    priorityField.append(fieldLabel("Priority"), element("span", "item-priority", { text: priority.code }));

    const actions = element("div", "item-actions");
    actions.append(
        iconButton("item-info", `Details for ${item.title}`, INFO_ICON),
        iconButton("item-edit", `Edit ${item.title}`, EDIT_ICON),
        iconButton("item-remove", `Delete ${item.title}`, TRASH_ICON),
    );

    const stub = element("div", "item-stub");
    stub.setAttribute("aria-hidden", "true");

    root.append(seq, check, body, dateField, priorityField, actions, stub);
    return root;
}

// Ghost coupon shown behind an empty book, purely decorative.
function createBlankCoupon() {
    const root = element("div", ["item", "item-blank"]);
    root.setAttribute("aria-hidden", "true");

    const seq = element("div", "item-seq", { text: "--" });

    const check = element("div", "item-check-box");
    check.append(checkGlyph());

    const body = element("div", "item-body");
    body.append(
        element("span", "item-title", { text: "Not issued" }),
        element("span", "item-description", { text: "Issue a coupon to start this book" }),
    );

    const dateField = element("div", ["item-field", "item-field-date"]);
    dateField.append(fieldLabel("Date"), element("span", "item-due-date", { text: EM_DASHES }));

    const priorityField = element("div", ["item-field", "item-field-prty"]);
    priorityField.append(fieldLabel("Priority"), element("span", "item-priority", { text: EM_DASHES }));

    root.append(seq, check, body, dateField, priorityField, element("div", "item-actions"), element("div", "item-stub"));
    return root;
}

// Column headings printed above the coupons.
function createItemsRuling() {
    const ruling = element("div", "items-ruling");
    ruling.setAttribute("aria-hidden", "true");

    for (const [label, slot] of [["No.", "seq"], ["Task", "task"], ["Date", "date"], ["Priority", "prty"]]) {
        const cell = element("span", "ruling-cell", { text: label });
        cell.dataset.slot = slot;
        ruling.appendChild(cell);
    }

    return ruling;
}

function checkGlyph() {
    const glyph = element("span", "item-check-glyph", { html: CHECK_ICON });
    glyph.setAttribute("aria-hidden", "true");
    return glyph;
}

export {
    createItemElement,
    createBlankCoupon,
    createItemsRuling,
}

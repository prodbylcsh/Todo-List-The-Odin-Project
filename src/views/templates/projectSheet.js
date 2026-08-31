import { element, sheetCount, sheetHeader } from "../../dom/elements.js";
import { makeEditable } from "../../dom/editable.js";
import { createBlankCoupon, createItemElement, createItemsRuling } from "./itemCard.js";
import { createItemAdder, createItemForm } from "./itemForm.js";

// Builds a whole project sheet: header, ruling, coupons and the new-item form.
function createProjectSheet(project, openCount) {
    const sheet = element("div", "sheet");
    sheet.dataset.id = project.id;

    const title = element("h1", null, { text: project.name });
    title.id = "project-name";
    title.dataset.id = project.id;
    title.setAttribute("aria-label", "Project name");
    makeEditable(title, { multiline: false });

    const items = element("div");
    items.id = "project-items";
    items.append(createBlankCoupon(), createItemAdder(), createItemForm());

    project.items.forEach((item, index) => {
        items.appendChild(createItemElement(item, index + 1));
    });

    items.classList.toggle("is-empty", project.items.length === 0);

    sheet.append(
        sheetHeader(title, sheetCount(openCount, "Open")),
        element("hr"),
        createItemsRuling(),
        items,
    );

    return sheet;
}

export { createProjectSheet }

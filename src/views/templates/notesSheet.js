import { element, iconButton, sheetCount, sheetHeader } from "../../dom/elements.js";
import { makeEditable } from "../../dom/editable.js";
import { PLUS_ICON, XMARK_ICON } from "../../dom/icons.js";
import { sequenceNumber } from "../../utils/format.js";

function createNotesSheet(notes) {
    const sheet = element("div", "sheet");
    sheet.id = "notes-view";

    const grid = element("div");
    grid.id = "notes-grid";

    notes.forEach((note, index) => {
        grid.appendChild(createNoteElement(note, index + 1));
    });

    const addButton = element("button", null, { html: `${PLUS_ICON}<span>New note</span>` });
    addButton.id = "add-note";
    addButton.type = "button";
    grid.appendChild(addButton);

    sheet.append(
        sheetHeader(element("h1", null, { text: "Notes" }), sheetCount(notes.length, "Notes")),
        element("hr"),
        grid,
    );

    return sheet;
}

function createNoteElement(note, sequence) {
    const root = element("div", "note");
    root.dataset.id = note.id;

    const head = element("div", "note-head", {
        html: `<span class="note-seq">${sequenceNumber(sequence)}</span>`,
    });

    const text = element("div", "note-text", { text: note.text });
    makeEditable(text, { multiline: true });
    text.setAttribute("role", "textbox");
    text.setAttribute("aria-multiline", "true");
    text.setAttribute("aria-label", `Note ${sequence ?? 1}`);
    text.dataset.placeholder = "Type here...";

    root.append(head, iconButton("note-remove", "Delete note", XMARK_ICON), text);
    return root;
}

export {
    createNotesSheet,
    createNoteElement,
}

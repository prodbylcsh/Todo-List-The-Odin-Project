import { Note, noteList, registerNote, removeNote, findNote } from "../models/notes.js";
import { saveNotes } from "../storage.js";
import { readEditableText } from "../dom/editable.js";
import { debounce } from "../utils/debounce.js";
import { createNotesSheet } from "./templates/notesSheet.js";

// Owns the main pane while the notes board is open.
function createNotesView({ content }) {
    const saveNotesSoon = debounce(saveNotes, 1000);

    content.addEventListener("click", (event) => {
        if (event.target.closest("#add-note")) {
            addNote();
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

    function show() {
        content.replaceChildren(createNotesSheet(noteList));
    }

    function addNote() {
        const note = new Note("");
        registerNote(note);
        saveNotes();
        show();

        content.querySelector(`.note[data-id="${note.id}"] .note-text`)?.focus();
    }

    return { show };
}

export { createNotesView }

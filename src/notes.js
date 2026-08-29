class Note {
    constructor(text = "", id = crypto.randomUUID()) {
        this.text = text;
        this.id = id;
    }

    updateText(text) {
        this.text = text;
    }

    static fromJSON(data) {
        return new Note(typeof data.text === "string" ? data.text : "", data.id);
    }
}

const noteList = [];

function registerNote(note) {
    noteList.push(note);
}

function removeNote(id) {
    const index = noteList.findIndex((note) => note.id === id);
    if (index !== -1) {
        noteList.splice(index, 1);
    }
}

function findNote(id) {
    return noteList.find((note) => note.id === id);
}

function clearNotes() {
    noteList.length = 0;
}

export {
    Note,
    noteList,
    registerNote,
    removeNote,
    findNote,
    clearNotes,
}

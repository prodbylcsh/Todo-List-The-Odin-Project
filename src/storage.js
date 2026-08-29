import { Project, projectList, registerProject, clearProjects } from "./projects.js";
import { Note, noteList, registerNote, clearNotes } from "./notes.js";

const STORAGE_KEY = "projects";
const NOTES_KEY = "notes";
const SCHEMA_VERSION = 1;

function saveProjects() {
    try {
        const payload = {
            version: SCHEMA_VERSION,
            projects: Array.from(projectList.values()),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
        console.error("Could not save projects", error);
    }
}

function loadProjects() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw === null) {
            return false;
        }

        const parsed = JSON.parse(raw);

        if (parsed === null || typeof parsed !== "object") {
            return false;
        }

        if (parsed.version !== SCHEMA_VERSION) {
            return false;
        }

        if (!Array.isArray(parsed.projects)) {
            return false;
        }

        clearProjects();
        for (const rawProject of parsed.projects) {
            registerProject(Project.fromJSON(rawProject));
        }

        return parsed.projects.length > 0;
    } catch (error) {
        console.error("Could not load projects", error);
        return false;
    }
}

function saveNotes() {
    try {
        const payload = {
            version: SCHEMA_VERSION,
            notes: noteList,
        };
        localStorage.setItem(NOTES_KEY, JSON.stringify(payload));
    } catch (error) {
        console.error("Could not save notes", error);
    }
}

function loadNotes() {
    try {
        const raw = localStorage.getItem(NOTES_KEY);
        if (raw === null) {
            return false;
        }

        const parsed = JSON.parse(raw);

        if (parsed === null || typeof parsed !== "object") {
            return false;
        }

        if (parsed.version !== SCHEMA_VERSION) {
            return false;
        }

        if (!Array.isArray(parsed.notes)) {
            return false;
        }

        clearNotes();
        for (const rawNote of parsed.notes) {
            registerNote(Note.fromJSON(rawNote));
        }

        return parsed.notes.length > 0;
    } catch (error) {
        console.error("Could not load notes", error);
        return false;
    }
}

export {
    saveProjects,
    loadProjects,
    saveNotes,
    loadNotes,
}
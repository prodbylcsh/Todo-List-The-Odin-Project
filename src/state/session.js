import { saveView, loadView } from "../storage.js";

// Which pane is on screen and which project it belongs to.
// Kept apart from the models so reloading the page can restore the same view.
const session = {
    view: "project",
    projectId: null,
};

function current() {
    return { view: session.view, projectId: session.projectId };
}

function openProject(projectId) {
    session.view = "project";
    session.projectId = projectId;
    persist();
}

function openNotes(projectId = session.projectId) {
    session.view = "notes";
    session.projectId = projectId;
    persist();
}

// Remembers a project without leaving the notes board.
function trackProject(projectId) {
    session.projectId = projectId;
    persist();
}

// Reads the stored view; the caller decides whether the project still exists.
function restore() {
    return loadView();
}

function persist() {
    saveView({ activeView: session.view, activeProjectId: session.projectId });
}

export {
    current,
    openProject,
    openNotes,
    trackProject,
    restore,
}

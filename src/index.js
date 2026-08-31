import "./styles.css";
import { Project, projectList, registerProject, removeProject } from "./models/projects.js";
import { loadNotes, loadProjects, saveProjects } from "./storage.js";
import * as session from "./state/session.js";
import { createSidebar } from "./views/sidebar.js";
import { createProjectView } from "./views/projectView.js";
import { createNotesView } from "./views/notesView.js";

const DEFAULT_PROJECT_NAME = "Untitled";

const content = document.getElementById("project");

const sidebar = createSidebar({
    container: document.getElementById("projects"),
    notesHeader: document.getElementById("notes-header"),
    onSelectProject: (id) => {
        const project = projectList.get(id);
        if (project) {
            openProject(project);
        }
    },
    onDeleteProject: deleteProject,
    onShowNotes: () => openNotes(),
});

const projectView = createProjectView({
    content,
    dialogElements: {
        infoDialog: document.getElementById("item-info"),
        editDialog: document.getElementById("item-edit"),
        editForm: document.getElementById("item-edit-form"),
    },
    onProjectChanged: refreshSidebar,
});

const notesView = createNotesView({ content });

document.getElementById("add-project").addEventListener("click", () => createProject());

function refreshSidebar() {
    sidebar.render(session.current());
}

function openProject(project) {
    session.openProject(project.id);
    projectView.show(project);
    refreshSidebar();
}

function openNotes(projectId) {
    session.openNotes(projectId);
    notesView.show();
    refreshSidebar();
}

function createProject(name = DEFAULT_PROJECT_NAME) {
    const project = new Project(name);
    registerProject(project);
    saveProjects();

    openProject(project);
    projectView.focusName();

    return project;
}

function deleteProject(id) {
    if (!projectList.has(id)) {
        return;
    }

    const { view, projectId } = session.current();

    removeProject(id);
    saveProjects();

    if (id !== projectId) {
        refreshSidebar();
        return;
    }

    const next = projectList.values().next().value;

    // The notes board stays open; it just adopts whatever project is left.
    if (view === "notes") {
        session.trackProject(next?.id ?? null);
        refreshSidebar();
        return;
    }

    if (next) {
        openProject(next);
    } else {
        createProject();
    }
}

function start() {
    loadProjects();
    loadNotes();

    const saved = session.restore();

    if (projectList.size === 0) {
        registerProject(new Project(DEFAULT_PROJECT_NAME));
        saveProjects();
    }

    const restored = saved?.activeProjectId ? projectList.get(saved.activeProjectId) : null;
    const project = restored ?? projectList.values().next().value;

    if (saved?.activeView === "notes") {
        openNotes(project?.id ?? null);
        return;
    }

    openProject(project);
}

start();

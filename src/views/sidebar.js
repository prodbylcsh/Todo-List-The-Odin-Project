import { projectList, countOpenItems } from "../models/projects.js";
import { createProjectTab } from "./templates/projectTab.js";

// The left rail: the notes shortcut plus one tab per project.
function createSidebar({ container, notesHeader, onSelectProject, onDeleteProject, onShowNotes }) {
    container.addEventListener("click", (event) => {
        const tab = event.target.closest(".project-tab");
        if (!tab) {
            return;
        }

        if (event.target.closest(".project-remove")) {
            onDeleteProject(tab.dataset.id);
            return;
        }

        onSelectProject(tab.dataset.id);
    });

    notesHeader.addEventListener("click", onShowNotes);

    function render({ view, projectId }) {
        notesHeader.classList.toggle("is-active", view === "notes");

        container.replaceChildren();
        for (const project of projectList.values()) {
            container.appendChild(createProjectTab(project, {
                isActive: view === "project" && project.id === projectId,
                openCount: countOpenItems(project),
            }));
        }
    }

    return { render };
}

export { createSidebar }

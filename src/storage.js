import { Project, projectList, registerProject, clearProjects } from "./projects.js";

const STORAGE_KEY = "projects";
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

export {
    saveProjects,
    loadProjects,
}
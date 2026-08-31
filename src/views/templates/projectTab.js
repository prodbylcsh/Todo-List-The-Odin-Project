import { element, iconButton } from "../../dom/elements.js";
import { TRASH_ICON } from "../../dom/icons.js";
import { projectCode } from "../../utils/format.js";

function createProjectTab(project, { isActive, openCount }) {
    const tab = element("div", "project-tab");
    tab.dataset.id = project.id;
    tab.classList.toggle("is-active", isActive);

    const count = element("span", "project-count", { text: openCount > 0 ? String(openCount) : "" });
    count.title = `${openCount} open item${openCount === 1 ? "" : "s"}`;

    const open = element("button", "project-open");
    open.type = "button";
    open.setAttribute("aria-current", isActive ? "true" : "false");
    open.append(
        element("span", "project-code", { text: projectCode(project.name) }),
        element("span", "project-name", { text: project.name }),
        count,
    );

    tab.append(open, iconButton("project-remove", `Delete ${project.name}`, TRASH_ICON));
    return tab;
}

export { createProjectTab }

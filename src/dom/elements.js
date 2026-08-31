// Small builders shared by the view templates.

function element(tag, className, options = {}) {
    const node = document.createElement(tag);

    if (className) {
        node.classList.add(...[].concat(className));
    }

    if (options.text !== undefined) {
        node.textContent = options.text;
    }

    if (options.html !== undefined) {
        node.innerHTML = options.html;
    }

    return node;
}

function fieldLabel(text) {
    return element("span", "field-label", { text });
}

function iconButton(className, label, icon) {
    const button = element("button", className, { html: icon });
    button.type = "button";
    button.setAttribute("aria-label", label);
    return button;
}

function sheetCount(value, label) {
    return element("div", "sheet-count", {
        html:
            `<span class="sheet-count-value">${String(value).padStart(2, "0")}</span>` +
            `<span class="sheet-count-label">${label}</span>`,
    });
}

function sheetHeader(title, count) {
    const header = element("header", "sheet-head");
    header.append(title, count);
    return header;
}

export {
    element,
    fieldLabel,
    iconButton,
    sheetCount,
    sheetHeader,
}

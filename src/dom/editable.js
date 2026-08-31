// Plain-text `contenteditable` handling: browsers that lack `plaintext-only`
// paste and break lines as HTML, so everything below normalises that back to text.

const BLOCK_TAGS = new Set(["DIV", "P", "LI", "UL", "OL", "PRE", "BLOCKQUOTE", "H1", "H2", "H3"]);

const SUPPORTS_PLAINTEXT_ONLY = (() => {
    try {
        const probe = document.createElement("div");
        probe.contentEditable = "plaintext-only";
        return probe.contentEditable === "plaintext-only";
    } catch {
        return false;
    }
})();

function makeEditable(element, { multiline }) {
    element.contentEditable = SUPPORTS_PLAINTEXT_ONLY ? "plaintext-only" : "true";
    element.spellcheck = false;

    element.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") {
            return;
        }

        if (!multiline) {
            event.preventDefault();
            element.blur();
            return;
        }

        event.preventDefault();
        insertNewline(element);
    });

    element.addEventListener("paste", (event) => {
        if (SUPPORTS_PLAINTEXT_ONLY) {
            return;
        }

        event.preventDefault();
        const text = event.clipboardData?.getData("text/plain") ?? "";
        insertPlainText(element, multiline ? text : text.replace(/\s+/g, " "));
    });
}

function insertNewline(element) {
    const before = readEditableText(element);

    try {
        if (document.execCommand("insertText", false, "\n") && readEditableText(element) !== before) {
            return;
        }
    } catch {
        // Fall through to the manual insertion below.
    }

    insertPlainText(element, "\n");
}

function insertPlainText(element, value) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
        return;
    }

    const range = selection.getRangeAt(0);
    if (!element.contains(range.commonAncestorContainer)) {
        return;
    }

    const start = textOffset(element, range.startContainer, range.startOffset);
    const end = textOffset(element, range.endContainer, range.endOffset);

    const text = readEditableText(element);

    const atEnd = end >= text.length && value.endsWith("\n");
    const inserted = atEnd ? `${value}\n` : value;

    element.textContent = text.slice(0, start) + inserted + text.slice(end);

    const caret = start + value.length;
    const node = element.firstChild ?? element.appendChild(document.createTextNode(""));
    const position = document.createRange();
    position.setStart(node, Math.min(caret, node.nodeValue?.length ?? 0));
    position.collapse(true);
    selection.removeAllRanges();
    selection.addRange(position);

    element.dispatchEvent(new Event("input", { bubbles: true }));
}

function textOffset(element, container, offset) {
    const range = document.createRange();
    range.selectNodeContents(element);
    range.setEnd(container, offset);
    return range.toString().length;
}

function readEditableText(element) {
    let text = "";

    const walk = (parent) => {
        for (const node of parent.childNodes) {
            if (node.nodeType === Node.TEXT_NODE) {
                text += node.nodeValue;
            } else if (node.nodeName === "BR") {
                text += "\n";
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                if (BLOCK_TAGS.has(node.nodeName) && text && !text.endsWith("\n")) {
                    text += "\n";
                }
                walk(node);
            }
        }
    };

    walk(element);
    return text;
}

function selectAllText(element) {
    const range = document.createRange();
    range.selectNodeContents(element);

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

export {
    makeEditable,
    readEditableText,
    selectAllText,
}

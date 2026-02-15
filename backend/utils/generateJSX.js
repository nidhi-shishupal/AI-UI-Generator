function escape(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

export function generateJSX(component) {
    if (!component || !component.type) return "";

    const { type, props = {}, children = [] } = component;

    const propsEntries = Object.entries(props)
        .filter(([_, v]) => v !== undefined && v !== null && v !== "");

    const propsString = propsEntries.length
        ? " " + propsEntries.map(([k, v]) => `${k}="${v}"`).join(" ")
        : "";

    if (!Array.isArray(children) || children.length === 0) {
        return `<${type}${propsString} />`;
    }

    const childrenJSX = children.map(generateJSX).join("\n");

    return `<${type}${propsString}>
${childrenJSX}
</${type}>`;
}

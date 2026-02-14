export function generateJSX(component) {
    const { type, props = {}, children = [] } = component;

    const propsString = Object.entries(props)
        .map(([key, value]) => `${key}="${value}"`)
        .join(" ");

    if (!children.length) {
        return `<${type} ${propsString} />`;
    }

    return `
<${type} ${propsString}>
${children.map(generateJSX).join("\n")}
</${type}>
`;
}

const ALLOWED_COMPONENTS = ["Button", "Card", "Input", "Modal"];

const ALLOWED_PROPS = {
    Button: ["label"],
    Card: ["title"],   
    Input: ["label"],
    Modal: ["title"]   
};

export function sanitizeComponent(component) {
    if (!ALLOWED_COMPONENTS.includes(component.type)) return null;

    const cleanProps = {};
    const allowedKeys = ALLOWED_PROPS[component.type] || [];

    for (let key of allowedKeys) {
        if (component.props?.[key]) {
            cleanProps[key] = component.props[key];
        }
    }

    return {
        type: component.type,
        props: cleanProps,
        children: (component.children || [])
            .map(sanitizeComponent)
            .filter(Boolean)
    };
}

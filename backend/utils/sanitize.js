const ALLOWED_COMPONENTS = ["Button", "Card", "Input", "Modal"];

const ALLOWED_PROPS = {
    Button: ["label"],
    Card: ["title"],
    Input: ["label"],
    Modal: ["title"]
};

export function sanitizeComponent(component, depth = 0) {
    if (!component || depth > 5) return null;

    if (!ALLOWED_COMPONENTS.includes(component.type)) return null;

    const cleanProps = {};
    const allowedKeys = ALLOWED_PROPS[component.type] || [];

    for (const key of allowedKeys) {
        if (typeof component.props?.[key] === "string") {
            cleanProps[key] = component.props[key].slice(0, 100);
        }
    }

    // prevent empty containers
    if (
        (component.type === "Card" || component.type === "Modal") &&
        (!component.children || component.children.length === 0)
    ) {
        component.children = [
            { type: "Button", props: { label: "Action" }, children: [] }
        ];
    }

    return {
        type: component.type,
        props: cleanProps,
        children: Array.isArray(component.children)
            ? component.children
                .map(child => sanitizeComponent(child, depth + 1))
                .filter(Boolean)
            : []
    };
}

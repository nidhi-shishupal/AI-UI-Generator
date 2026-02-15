function renderComponent(component) {
    const children = (component.children || [])
        .map(child => renderComponent(child))
        .join("\n");

    switch (component.type) {

        case "Card":
            return `
<Card title="${component.props?.title || ""}">
${children}
</Card>`;

        case "Input":
            return `<Input label="${component.props?.label || ""}" />`;

        case "Button":
            return `<Button label="${component.props?.label || ""}" />`;

        case "Modal":
            return `
<Modal title="${component.props?.title || ""}">
${children}
</Modal>`;

        default:
            return "";
    }
}

export function buildReactCode(plan) {
    return `
import Card from "./components/Card";
import Input from "./components/Input";
import Button from "./components/Button";
import Modal from "./components/Modal";

export default function GeneratedUI() {
  return (
    <div className="generated-ui">
      ${plan.components.map(renderComponent).join("\n")}
    </div>
  );
}
`;
}

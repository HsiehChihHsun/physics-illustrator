import { PhysicsObject, BasePhysicsObject } from '../../../../src/types/PhysicsObjects';
import { UNIT_PX } from '../../../../src/App'; // Adjust path as needed

// 1. Interface Definition
// MUST include standard properties: fontSize, bold, italic, flipLabel (if text), dashed (if line)
export interface TemplateObject extends BasePhysicsObject {
    type: 'template';
    x: number;
    y: number;
    rotation: number;
    // Standard Visual Props
    dashed?: boolean;
    // Standard Text Props (if applicable)
    label?: string;
    fontSize?: number; // Default 20
    bold?: boolean;
    italic?: boolean;
    flipLabel?: boolean;
}

// 2. Default Values
export const createTemplateObject = (x: number, y: number): TemplateObject => ({
    id: crypto.randomUUID(),
    type: 'template',
    x,
    y,
    rotation: 0,
    // Design Guide 1.4: Default Size ~16 units (here implemented as size property if needed)
    fontSize: 20, // Design Guide 2.1
    bold: false,
    italic: false,
    flipLabel: false,
    dashed: false, // Design Guide 1.2
});

// 3. Renderer
export const TemplateRenderer = ({
    object,
    ctx,
    isSelected
}: {
    object: TemplateObject;
    ctx: CanvasRenderingContext2D;
    isSelected: boolean;
}) => {
    const { x, y, rotation, dashed, label, fontSize, bold, italic, flipLabel } = object;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotation * Math.PI) / 180);

    // Design Guide 1.2: Dash Support
    if (dashed) {
        ctx.setLineDash([5, 5]);
    } else {
        ctx.setLineDash([]);
    }

    // Draw Component
    ctx.beginPath();
    ctx.rect(-10, -10, 20, 20); // Example shape
    ctx.stroke();

    // Design Guide 2.2: LaTeX/Rich Text Support
    if (label) {
        // text rendering logic here using TextRenderer or MathLabel
        // MUST support fontSize, bold, italic
        ctx.font = `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}${fontSize}px sans-serif`;
        ctx.fillText(label, 0, -20);
    }

    ctx.restore();
};

// 4. Interaction Helper (Angle Display)
// Design Guide 1.1: Angle Display
export const drawTemplateHandle = (
    ctx: CanvasRenderingContext2D,
    object: TemplateObject,
    isDragging: boolean
) => {
    // Draw the handle
    // ...

    if (isDragging) {
        const angleText = `${Math.round(object.rotation)}°`;
        ctx.fillText(angleText, object.x + 20, object.y - 20);
    }
};

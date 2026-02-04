---
name: create_new_component
description: Use this skill when the user asks to create a new physics component or modify an existing one. This skill enforces manditory design standards for all components in the Physics Illustrator project.
---

# Create New Physics Component Skill

This skill outlines the mandatory design standards and feature requirements for creating or modifying components in the Physics Illustrator project. **You MUST follow these guidelines for every new component.**

## 1. Essential Visual Features

### 1.1 Angle Display

* **Requirement:** When dragging an attach point (e.g., start/end/anchor/tip), the current angle of the component must be displayed explicitly.
* **Implementation:**
  * In your `drawHandle` or interaction logic, calculate the angle.
  * Use `ctx.fillText` or a helper to draw the angle string (e.g., `30°`) near the cursor/handle.
  * Reference `WallObject` (`hatchAngle`) or `BlockObject` (`rotation`) for examples.

### 1.2 Dash Support (Linear Components)

* **Requirement:** Any component that consists primarily of lines or vectors must support a "dashed" style.
* **Property:** Add `dashed?: boolean` to the component interface.
* **Rendering:** Use `ctx.setLineDash([5, 5])` (or similar) when `dashed` is true, and `ctx.setLineDash([])` when false.
* **Default:** `false` (Solid).

### 1.3 Arrowhead Customization (Arrowed Components)

* **Requirement:** If the component includes an arrow (like `Vector` or `LinearMarker`), it must expose properties to control the arrowhead dimensions.
* **Properties:**
  * `arrowSize` (number): Controls the length of the arrowhead. Default: `16`.
  * `arrowWidth` (number): Controls the width of the arrowhead base. Default: `12`.
* **Sharpness (Crucial):**
  * **Rule:** The main line/shaft MUST stop at the base of the arrowhead, NOT extend to the tip.
  * **Reason:** If the shaft extends to the tip, thick lines will project beyond the sharp point of the arrowhead, causing a blunt/ugly appearance.
  * **Implementation:** Calculate a `shaftEnd` point by subtracting `arrowSize` (or calculated head length) from the target point. Draw the line only to `shaftEnd`.
* **Implementation:** Ensure `getArrows()` or the drawing logic uses these variables instead of hardcoded constants.

### 1.4 Unit System & Default Sizes

* **Unit Definition:** `1 unit = 6.25 pixels`. This corresponds to the fundamental grid width of the canvas.
* **Implementation:** Always use the global constant `UNIT_PX` (set to 6.25) for conversions.
* **Requirement:** New components should typically have a default aspect ratio or size based on **16 units** (100px).
* **Formula:** `size_in_pixels = size_in_units * UNIT_PX`.
* **Goal:** Ensure consistency with the global coordinate system and standard grid.

## 2. Label & Text Attributes

### 2.1 Standard Text Properties

All components with text MUST extend component interface to support:

* `fontSize` (number): Default `20`.
* `bold` (boolean): Default `false`.
* `italic` (boolean): Default `false`.
* `flipLabel` (boolean): Default `false`. Allows flipping the label position (e.g. above/below line).

### 2.2 Rich Text Support (LaTeX)

* **Requirement:** Labels must support LaTeX rendering.
* **Implementation:** Use the project's standard `TextRenderer` or `MathLabel` helpers which process `$$...$$` delimiters. Do NOT implement basic `ctx.fillText` for the main label content without LaTeX support.

## 3. Interaction & Controls

### 3.1 Rotation Controls

* **Requirement:** Properties controlling rotation (e.g., `angle`, `rotation`) must use a "stateful" slider logic in `PropertiesPanel`.
* **Standard Step:** `15` degrees by default.
* **Fine-tuning:** if `Ctrl` key is held, step becomes `1` degree.
* **UI Code:** When adding the slider to `PropertiesPanel.tsx`, ensure the `step` prop is dynamic based on modifier keys (if supported by the UI library) or strictly enforce the 15-degree snap in the `onChange` handler unless a modifier is detected.

### 3.2 Copy/Paste Support

* **Requirement:** All components must support keyboard copy/paste operations (Ctrl+C, Ctrl+V).
* **Implementation:**
  * Ensure the component is registered in the copy/paste logic (usually in `App.tsx` or a `useClipboard` hook).
  * Ensure the component structure allows for deep cloning (no circular references that break `JSON.stringify` or structured cloning).
  * When pasting, the new component should be offset slightly (e.g., +10px, +10px) to distinguish it from the original.

## 4. Implementation Steps (SOP)

1. **Define Interface**: Create/Update interface in `src/types/PhysicsObjects.ts` including all properties above.
2. **Implement Renderer**: Create component file in `src/components/`.
    * Implement `draw()` with `save()`, `restore()`, and `setLineDash()`.
    * Implement `drawHandle()` with angle display.
    * Implement `getArrows()` if applicable.
3. **Register Component**:
    * Add to `ComponentPalette.tsx` (or `Sidebar.tsx`).
    * Add to `PropertiesPanel` controls.
    * Initialize with correct default values (Size: 16 units, Font: 20px).

## 5. Reference Template

See `examples/TemplateComponent.tsx` for a code skeleton.

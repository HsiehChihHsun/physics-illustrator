# Component Design Guidelines for AI Agents

This document outlines the mandatory design standards and feature requirements for creating or modifying components in the Physics Illustrator project. Start all new component tasks by reviewing this guide.

## 1. Essential Visual Features

### 1.1 Angle Display
*   **Requirement:** When dragging an attach point (e.g., start/end/anchor/tip), the current angle of the component must be displayed explicitly.
*   **Implementation Reference:** See `hatchAngle` in `WallObject` or `rotation` in `BlockObject`. The angle should typically be shown near the cursor or the handle during interaction.

### 1.2 Dash Support
*   **Requirement:** Any component that consists primarily of lines or vectors must support a "dashed" style.
*   **Property Name:** `dashed` (boolean) or `lineStyle` ('solid' | 'dashed').
*   **Default:** Solid.

### 1.3 Arrowhead Customization
*   **Requirement:** If the component includes an arrow (like `Vector` or `LinearMarker`), it must expose properties to control the arrowhead dimensions.
*   **Properties:**
    *   `arrowSize` or `headLength`: Controls the length of the arrowhead.
    *   `arrowWidth`: Controls the width of the arrowhead base.
*   **Standard Default:** `arrowSize: 16`, `arrowWidth: 12`.

### 1.4 Default Sizes
*   **Requirement:** New components should have a default size of **16 units** (approx. 100px).
*   **Formula:** `16 * UNIT_PX`.
*   **Context:** Ensure the component doesn't appear too small or large relative to the standard grid.

## 2. Label & Text Attributes

### 2.1 Standard Text Properties
All components with text must support the following properties:
*   `fontSize` (number): Default `20`.
*   `bold` (boolean).
*   `italic` (boolean).
*   `flipLabel` (boolean): Allows the user to flip the label to the other side of the component (e.g., above/below line).

### 2.2 Rich Text Support (LaTeX)
*   **Requirement:** Labels must support LaTeX rendering.
*   **Implementation:** Use `MathLabel` or the standard `TextRenderer` which processes `$$...$$` delimiters.
*   **UI:** In the properties panel, consider adding a standard set of math symbol quick-actions (e.g., θ, π, Δ).

## 3. Interaction & Controls

### 3.1 Rotation Controls
*   **Requirement:** Properties controlling rotation (e.g., `angle`, `rotation`) must use a "stepped" slider.
*   **Standard Step:** `15` degrees.
*   **Modifier Key:** If the `Ctrl` key is held while dragging the slider, the step must switch to `1` (continuous mode).
*   **Implementation Note:** Ensure the `onChange` handler or the slider component checks for the modifier key state.

## Checklist for New Components
- [ ] **Angle Display**: Is angle shown during drag?
- [ ] **Labels**: Are LaTeX, flip, bold, italic, fontSize supported?
- [ ] **Dash**: Is dashed line style supported (if linear)?
- [ ] **Arrows**: Are head length/width controls available (if arrowed)?
- [ ] **Rotation**: Does the slider snap to 15°, and smooth with Ctrl?
- [ ] **Default Size**: Is it initialized to 16 units?

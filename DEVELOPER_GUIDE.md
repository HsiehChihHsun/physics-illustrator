# VEKTON | Physics Illustrator (v0.97 Beta)
**Developer Guide & Migration Manual**

> **Project Spirit**: This project ("VEKTON") is built to bridge the gap between accurate physics diagrams and high-end design tools.

## 1. Design Philosophy "The WOW Factor"
**CRITICAL**: The UI must never look "basic" or "default".
-   **Aesthetics**: Glassmorphism, blurred backgrounds, smooth gradients, and deep shadows.
-   **Typography**: Use modern sans-serif fonts (Inter, Roboto, Outfit). Avoid browser defaults (Times New Roman).
-   **Colors**: Use curated palettes (HSL). Avoid pure RGB red/green/blue.
-   **Interactivity**: Every element should feel plausible. Hover effects, active states, and micro-animations are mandatory.

## 2. Architecture Overview
The application is refactored to separate logic from presentation.

### Core Systems
-   **`src/systems/PhysicsEngine.ts`**:
    -   Contains the "Truth" of the simulation.
    -   Handles object creation, manipulation, and property updates.
    -   *Do not put heavy logic in React components.*
-   **`src/systems/SnappingSystem.ts`**:
    -   Handles physics-aware snapping (grid, endpoint, center).
    -   Should be consulted during drag operations.
-   **`src/hooks/useCanvasInteraction.ts`**:
    -   The bridge between React events (mouse/touch) and the PhysicsEngine.
    -   Injects the `Scene` and `SnappingSystem` context.

### Layout Structure
-   **Sidebar (`Sidebar.tsx`)**: Left side. strictly for *adding* new objects (Vectors, Springs, etc.).
-   **Toolbar (`Toolbar.tsx`)**: Top bar. System actions only (Undo, Redo, Export, Zoom).
-   **Properties Panel (`PropertiesPanel.tsx`)**: Right side. Context-aware properties for the selected object.
-   **Canvas**: Central area. Supports multiple coordinate scales (Small/Large) with SVG viewport management.

## 3. Text & Math Rendering (`MathLabel`)
We use a unified system for text.
-   **Component**: `<MathLabel />`
-   **Feature**: Detects LaTeX automatically (delimiters `$$`).
    -   **Text Mode**: Renders standard SVG `<text>`. Fast, exports to PNG perfectly.
    -   **Math Mode**: Uses `KaTeX` inside `<foreignObject>`.
-   **Export Warning**:
    -   **SVG Export**: Works perfectly (includes Math).
    -   **PNG Export**: Browsers consider `<foreignObject>` as "tainted canvas". **PNG export usually fails or is blocked if complex LaTeX is present.**
    -   *Fallback strategy*: Direct users to SVG export for high-fidelity output.

## 4. How to Extend (Adding New Components)
1.  **Define Type**: Update `src/types/PhysicsObjects.ts` (`ObjectType` & Interface).
2.  **Create Renderer**: New component in `src/components/` (e.g., `ResistorRenderer.tsx`).
    -   *Must* use `<MathLabel />` for any text.
3.  **Register Logic**:
    -   Add creation logic to `App.tsx` (`handleAddObject`).
    -   Add rendering case in the main map loop.
    -   Add property controls in `getProperties`.
4.  **Add Icon**: Update `Sidebar.tsx`.

## 5. Migration Notes
-   **State location**: `C:\Users\{User}\.gemini\antigravity` contains the "Brain" (memory/history).
-   **Project location**: `c:\py\drawphy`.
-   **To Resume**: Copy the project folder. Read this guide to understand the *State of the Union*.

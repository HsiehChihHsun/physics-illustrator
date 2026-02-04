---
description: Workflow for creating new physics components
---

# Create New Component

This workflow guides the AI agent through the process of creating a new component, ensuring all design guidelines are met.

## 1. Review Design Guidelines

First, you **MUST** read the Component Design Guidelines to ensure you understand the required features.

```bash
# Read the guidelines
call view_file "c:/pythonall/drawphy/V11/docs/COMPONENT_DESIGN_GUIDELINES.md"
```

## 2. Define Type Definitions

Update `src/types/PhysicsObjects.ts` to include the new interface.

* **Checklist:**
  * [ ] Does it extend `BaseObject`?
  * [ ] Does it include standard text props? (`label`, `flipLabel`, `fontSize`, `bold`, `italic`)
  * [ ] Does it include visual props? (`color`, arrow props if needed, dash props if needed)

## 3. Implement Renderer

Create `src/components/[ComponentName]Renderer.tsx`.

* **Checklist:**
  * [ ] Use `MathLabel` for text rendering (supports LaTeX).
  * [ ] Implement dashed line support.
  * [ ] Implement arrow geometry with `arrowSize` and `arrowWidth` if applicable.

## 4. Register in App.tsx

Update `src/App.tsx`.

* **Step 1: Default Object Creation**
  * [ ] In `handleAddObject`, initialize with size `16 * UNIT_PX`.
  * [ ] Set default `fontSize: 20`.
* **Step 2: Properties Panel**
  * [ ] Add a `case` in `getProperties`.
  * [ ] Include **Standard Text Controls** (Label, Flip, Size, Bold, Italic, Action Group for Symbols).
  * [ ] Include **Rotation Control** (if applicable): Range slider with `step: 15`. *Note: Ensure Ctrl-key logic is considered.*
  * [ ] Include **Arrow Controls** (if applicable): `arrowSize`, `arrowWidth`.

## 5. Verification

* **Check**: Does the new component satisfy all points in the `COMPONENT_DESIGN_GUIDELINES.md`?

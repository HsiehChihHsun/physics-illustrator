# Project Specifications and Rules

## Object Implementation Rules

### Text Input Capabilities
Any new object implemented that includes a text label or text input MUST include the following configuration options in its property panel:
1.  **Font Size**: Allow user to adjust text size.
2.  **Bold Toggle**: Boolean toggle to enable/disable bold font weight.
3.  **Italic Toggle**: Boolean toggle to enable/disable italic font style.

These properties should be handled in the object's renderer to apply the appropriate SVG styles (`fontSize`, `fontWeight`, `fontStyle`).

### Font Selection
- The application supports a global font selection via the Toolbar.
- Supported fonts: **Inter** (Sans-serif) and **STIX Two Text** (Serif).
- Renderers must accept a `fontFamily` prop and apply it to text elements.

### LaTeX Support
- Text objects support LaTeX rendering if the content is wrapped in double dollar signs (e.g., `$$x^2$$`).
- LaTeX is rendered using KaTeX inside a `<foreignObject>`.

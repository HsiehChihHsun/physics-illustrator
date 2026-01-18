import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { SpringRenderer } from './components/SpringRenderer';
import { PulleyRenderer } from './components/PulleyComponents';
import { WallRenderer, BlockRenderer } from './components/StaticBodyComponents';
import { SimpleLine, CatenaryRenderer, TriangleRenderer, CircleRenderer, TextRenderer } from './components/DrawingPrimitives';
import { VectorRenderer } from './components/VectorComponents';
import { PropertiesPanel } from './components/PropertiesPanel';
import type { PropertyConfig } from './components/PropertiesPanel';
import { Toolbar } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';
import type { ToolType } from './components/Sidebar';
import { Vector2, Point } from './geometry/Vector2';
import { useCanvasInteraction } from './hooks/useCanvasInteraction';
import { useHistory } from './hooks/useHistory';
import type {
  PhysicsObject, SpringObject, WallObject, BlockObject,
  LineObject, CatenaryObject, PulleyObject, VectorObject,
  TriangleObject, CircleObject, TextObject, ObjectType
} from './types/PhysicsObjects';

const UNIT_PX = 6.25; // 1 Unit = 6.25px (1/8th of 50px Grid)

// Initial Demo Scene
const INITIAL_SCENE: PhysicsObject[] = [
  { id: 'spring1', type: 'spring', start: new Vector2(50, 150), end: new Vector2(300, 150), coils: 10, width: 25, style: 'zigzag' },
  { id: 'block1', type: 'block', center: new Vector2(500, 300), size: new Vector2(60, 60), massLabel: "M", rotation: 0 },
];

// Utility to generate IDs
const generateId = (prefix: string) => `${prefix}_${Date.now()}`;

// Definition of a Drag Handle
interface HandleDef {
  objectId: string;
  handleType: 'start' | 'end' | 'center' | 'tip' | 'ropeStart' | 'ropeEnd' | 'radius' | 'p1' | 'p2' | 'p3' | 'mid_top' | 'mid_bottom' | 'mid_left' | 'mid_right';
  position: Point;
}

function App() {
  // Use History Hook instead of simple state
  const {
    state: objects,
    pushState,
    updateState,
    undo,
    redo,
    canUndo,
    canRedo
  } = useHistory<PhysicsObject[]>(INITIAL_SCENE);

  // Ref for the central canvas element (coordinate origin)
  const canvasRef = useRef<HTMLDivElement>(null);

  // Phase 11 States (Must be at top)
  const [showSnap, setShowSnap] = useState(true);
  const [gridDensity, setGridDensity] = useState(1);
  const gridSize = 50 / gridDensity;

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Phase 12: Layout & Canvas State
  const [canvasMode, setCanvasMode] = useState<'small' | 'large'>('small');
  const [zoom, setZoom] = useState(0.5); // Default 50%
  const [panelWidth, setPanelWidth] = useState(250); // Default 250px (Increased by 25%)
  const [isResizing, setIsResizing] = useState(false);

  const canvasPx = canvasMode === 'small' ? 1200 : 2400;
  const canvasCoords = canvasMode === 'small' ? 600 : 1200;

  // Physical scale (screen px to units) is 2 (1200px / 600 units)
  // Display scale is Physical Scale * Zoom
  const interactionScale = 2 * zoom;

  // Resizing Logic
  const startResizing = useCallback(() => setIsResizing(true), []);
  const stopResizing = useCallback(() => setIsResizing(false), []);
  const resize = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 150 && newWidth < 800) setPanelWidth(newWidth);
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  // --- 1. Actions: Add & Delete ---
  const handleAddObject = (type: ToolType) => {
    const center = new Vector2(400, 300); // Default spawn center
    let newObj: PhysicsObject | null = null;

    switch (type) {
      case 'spring':
        newObj = { id: generateId('spring'), type: 'spring', start: new Vector2(center.x - 50, center.y), end: new Vector2(center.x + 50, center.y), coils: 10, width: 20, style: 'zigzag', label: "", flipLabel: false, fontSize: 20, spiralStart: 75, spiralEnd: -90 };
        break;
      case 'wall':
        newObj = { id: generateId('wall'), type: 'wall', start: new Vector2(center.x - 100, center.y + 100), end: new Vector2(center.x + 100, center.y + 100), hatchAngle: 45 };
        break;
      case 'block':
        // Default 10 units = 62.5px
        newObj = { id: generateId('block'), type: 'block', center: new Vector2(center.x, center.y), size: new Vector2(10 * UNIT_PX, 10 * UNIT_PX), massLabel: "M", rotation: 0, fontSize: 20 };
        break;
      case 'line':
        newObj = { id: generateId('line'), type: 'line', start: new Vector2(center.x - 50, center.y - 50), end: new Vector2(center.x + 50, center.y + 50), color: 'black', width: 2, dashed: false };
        break;
      case 'catenary':
        newObj = { id: generateId('cat'), type: 'catenary', start: new Vector2(center.x - 60, center.y), end: new Vector2(center.x + 60, center.y), slack: 40, color: '#555' };
        break;
      case 'pulley':
        // Radius 8 units = 50px
        newObj = { id: generateId('pulley'), type: 'pulley', center: new Vector2(center.x, center.y - 50), radius: 8 * UNIT_PX, hasHanger: true, hangerLength: 10 * UNIT_PX, hangerAngle: 0 };
        break;
      case 'vector':
        // Tip relative to anchor
        newObj = { id: generateId('vec'), type: 'vector', anchor: new Vector2(center.x, center.y), tip: new Vector2(center.x + 50, center.y - 50), label: "", showComponents: false, flipLabel: false, fontSize: 20, color: 'black' };
        break;
      case 'triangle':
        // ... (lines 85-97)
        // Base 30 units (187.5px), Height 20 units (125px)
        const halfBase = (30 * UNIT_PX) / 2;
        const height = (20 * UNIT_PX);
        newObj = {
          id: generateId('tri'), type: 'triangle',
          p1: new Vector2(center.x, center.y - height / 2),
          p2: new Vector2(center.x - halfBase, center.y + height / 2),
          p3: new Vector2(center.x + halfBase, center.y + height / 2)
        };
        break;

      case 'circle':
        // Radius 5 units (31.25px)
        newObj = { id: generateId('circ'), type: 'circle', center: new Vector2(center.x, center.y), radius: 5 * UNIT_PX };
        break;
      case 'text':
        newObj = { id: generateId('txt'), type: 'text', center: new Vector2(center.x, center.y), content: "Text", fontSize: 24 };
        break;
    }

    if (newObj) {
      // Push new state with added object
      pushState([...objects, newObj]);
      setSelectedId(newObj.id);
    }
  };

  const handleDelete = useCallback(() => {
    if (selectedId) {
      pushState(objects.filter(o => o.id !== selectedId));
      setSelectedId(null);
    }
  }, [objects, selectedId, pushState]);

  // Keyboard shortcut for Undo/Redo/Delete
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Prevent deletion/undo/redo if typing in an input
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDelete();
      }
      // Undo: Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleDelete, undo, redo]);


  // --- 2. Generate Interactive Handles from Objects ---
  const handles = useMemo(() => {
    const list: HandleDef[] = [];
    objects.forEach(obj => {
      if (obj.type === 'spring') {
        list.push({ objectId: obj.id, handleType: 'start', position: obj.start });
        list.push({ objectId: obj.id, handleType: 'end', position: obj.end });
        list.push({ objectId: obj.id, handleType: 'center', position: obj.start.add(obj.end).div(2) });
      } else if (obj.type === 'line') {
        list.push({ objectId: obj.id, handleType: 'start', position: obj.start });
        list.push({ objectId: obj.id, handleType: 'end', position: obj.end });
        list.push({ objectId: obj.id, handleType: 'center', position: obj.start.add(obj.end).div(2) });
      } else if (obj.type === 'catenary') {
        list.push({ objectId: obj.id, handleType: 'start', position: obj.start });
        list.push({ objectId: obj.id, handleType: 'end', position: obj.end });
      } else if (obj.type === 'wall') {
        list.push({ objectId: obj.id, handleType: 'start', position: obj.start });
        list.push({ objectId: obj.id, handleType: 'end', position: obj.end });
        list.push({ objectId: obj.id, handleType: 'center', position: obj.start.add(obj.end).div(2) });
      } else if (obj.type === 'block') {
        const o = obj as BlockObject;
        list.push({ objectId: obj.id, handleType: 'center', position: obj.center });

        // Add midpoint handles (rotated)
        const halfW = o.size.x / 2;
        const halfH = o.size.y / 2;
        const rot = o.rotation;

        // Helper to rotate point around center
        const rotate = (p: { x: number, y: number }, c: { x: number, y: number }, a: number) => {
          const dx = p.x - c.x;
          const dy = p.y - c.y;
          return new Vector2(
            c.x + dx * Math.cos(a) - dy * Math.sin(a),
            c.y + dx * Math.sin(a) + dy * Math.cos(a)
          );
        };

        // Midpoints relative to center (unrotated)
        const top = { x: o.center.x, y: o.center.y - halfH };
        const bottom = { x: o.center.x, y: o.center.y + halfH };
        const left = { x: o.center.x - halfW, y: o.center.y };
        const right = { x: o.center.x + halfW, y: o.center.y };

        list.push({ objectId: obj.id, handleType: 'mid_top', position: rotate(top, o.center, rot) });
        list.push({ objectId: obj.id, handleType: 'mid_bottom', position: rotate(bottom, o.center, rot) });
        list.push({ objectId: obj.id, handleType: 'mid_left', position: rotate(left, o.center, rot) });
        list.push({ objectId: obj.id, handleType: 'mid_right', position: rotate(right, o.center, rot) });

      } else if (obj.type === 'pulley') {
        list.push({ objectId: obj.id, handleType: 'center', position: obj.center });
      } else if (obj.type === 'vector') {
        list.push({ objectId: obj.id, handleType: 'start', position: obj.anchor });
        list.push({ objectId: obj.id, handleType: 'tip', position: obj.tip });
      } else if (obj.type === 'triangle') {
        list.push({ objectId: obj.id, handleType: 'p1', position: obj.p1 });
        list.push({ objectId: obj.id, handleType: 'p2', position: obj.p2 });
        list.push({ objectId: obj.id, handleType: 'p3', position: obj.p3 });
      } else if (obj.type === 'circle') {
        list.push({ objectId: obj.id, handleType: 'center', position: obj.center });
        // Radius handle: center.x + radius
        list.push({ objectId: obj.id, handleType: 'radius', position: new Vector2(obj.center.x + obj.radius, obj.center.y) });
      } else if (obj.type === 'text') {
        list.push({ objectId: obj.id, handleType: 'center', position: obj.center });
      }
    });
    return list;
  }, [objects]);

  // Pass just the points to the hook
  const interestingPoints = useMemo(() => handles.map(h => h.position), [handles]);

  // --- 3. Handle Dragging ---
  const handlePointMove = useCallback((index: number, newPos: Point) => {
    const handle = handles[index];
    if (!handle) return;

    const p = new Vector2(newPos.x, newPos.y);

    // Use updateState for live dragging (does not push to history yet)
    const newObjects = objects.map(obj => {
      if (obj.id !== handle.objectId) return obj;

      // Updating the specific property based on handleType
      // We must cast/assert types carefully or use a switch
      switch (obj.type) {
        case 'spring':
        case 'line':
        case 'catenary':
        case 'wall':
          // These all have start/end
          if (handle.handleType === 'start') return { ...obj, start: p };
          if (handle.handleType === 'end') return { ...obj, end: p };
          if (handle.handleType === 'center') {
            // Move both start and end by delta
            const currentCenter = (obj as any).start.add((obj as any).end).div(2) as Vector2; // Casting to avoid complex type check, we know these have start/end
            const delta = p.subtract(currentCenter);
            return { ...obj, start: (obj as any).start.add(delta), end: (obj as any).end.add(delta) };
          }
          break;
        case 'block':
          if (handle.handleType === 'center') return { ...obj, center: p };
          // Symmetric Resizing logic for rotated blocks
          if (handle.handleType.startsWith('mid_')) {
            const o = obj as BlockObject;
            // We need distance from center projected onto the local axis
            // But handle is snapped to grid, so p is absolute.
            const dVec = p.subtract(o.center);

            // Rotate dVec by -rotation to get local coords
            const cos = Math.cos(-o.rotation);
            const sin = Math.sin(-o.rotation);
            const localDx = dVec.x * cos - dVec.y * sin;
            const localDy = dVec.x * sin + dVec.y * cos;

            const newSize = { ...o.size };

            // Depending on handle, we adjust width or height
            // We assume handles keep their relative identity (top, bottom etc)
            // Actually, since we only push handles, we don't know which one this is unless we check handleType

            if (handle.handleType === 'mid_left' || handle.handleType === 'mid_right') {
              // Width
              newSize.x = Math.abs(localDx) * 2;
              // Clamp min size
              if (newSize.x < 2 * UNIT_PX) newSize.x = 2 * UNIT_PX;
            } else {
              // Height
              newSize.y = Math.abs(localDy) * 2;
              if (newSize.y < 2 * UNIT_PX) newSize.y = 2 * UNIT_PX;
            }
            return { ...obj, size: new Vector2(newSize.x, newSize.y) };
          }
          break;
        case 'pulley':
          if (handle.handleType === 'center') return { ...obj, center: p };
          if (handle.handleType === 'ropeStart') return { ...obj, ropeStart: p };
          if (handle.handleType === 'ropeEnd') return { ...obj, ropeEnd: p };
          break;
        case 'vector':
          if (handle.handleType === 'start') return { ...obj, anchor: p };
          if (handle.handleType === 'tip') return { ...obj, tip: p };
          break;
        case 'triangle':
          if (handle.handleType === 'p1') return { ...obj, p1: p };
          if (handle.handleType === 'p2') return { ...obj, p2: p };
          if (handle.handleType === 'p3') return { ...obj, p3: p };
          break;
        case 'circle':
          if (handle.handleType === 'center') return { ...obj, center: p };
          if (handle.handleType === 'radius') {
            // Calculate new radius
            let r = p.distanceTo(obj.center);
            if (r < 1) r = 1;
            return { ...obj, radius: r };
          }
          break;
        case 'text':
          if (handle.handleType === 'center') return { ...obj, center: p };
          break;
      }
      return obj;
    });

    updateState(newObjects);
  }, [handles, objects, updateState]);

  // Checkpoint for drag start
  const handleDragStart = useCallback(() => {
    // Save current state as checkpoint before modifying
    pushState(objects);
  }, [objects, pushState]);

  // --- Phase 13: Font Selection ---
  const [fontFamily, setFontFamily] = useState<'Inter' | 'STIX Two Text'>('Inter');

  // --- 1. Interaction Hook ---
  const {
    cursor,
    snapInfo,
    dragIndex,
    handleMouseMove,
    handleMouseDown,
    handleMouseUp
  } = useCanvasInteraction(
    canvasRef,
    interestingPoints,
    handlePointMove,
    handleDragStart,
    gridSize, // Pass dynamic grid size, correctly defined now
    interactionScale // Pass total scale (Physical * Zoom)
  );

  // --- 4. Auto-Select Logic ---
  useEffect(() => {
    if (dragIndex !== null) {
      const handle = handles[dragIndex];
      if (handle) setSelectedId(handle.objectId);
    }
  }, [dragIndex, handles]);

  // --- 5. Properties Logic ---
  // --- 5. Properties Logic ---
  const selectedObject = objects.find(o => o.id === selectedId);

  const handlePropertyChange = (prop: string, val: any) => {
    if (!selectedId) return;

    // Property change is discrete, so we push state
    const newObjects = objects.map(obj =>
      obj.id === selectedId ? { ...obj, [prop]: val } : obj
    );
    pushState(newObjects);
  };

  const getProperties = (): { title: string, props: PropertyConfig[] } => {
    if (!selectedObject) return { title: '', props: [] };

    // Helper helpers
    const toUnit = (px: number) => Number((px / UNIT_PX).toFixed(2));
    const fromUnit = (u: number) => u * UNIT_PX;

    switch (selectedObject.type) {

      case 'block': {
        const o = selectedObject as BlockObject;
        return {
          title: 'Block',
          props: [
            { label: 'Mass Label', type: 'text', value: o.massLabel, onChange: (v) => handlePropertyChange('massLabel', v) },
            { label: 'Font Size', type: 'number', value: o.fontSize || 20, min: 8, max: 100, step: 1, onChange: (v) => handlePropertyChange('fontSize', v) },
            { label: 'Bold', type: 'boolean', value: o.bold || false, onChange: (v) => handlePropertyChange('bold', v) },
            { label: 'Italic', type: 'boolean', value: o.italic || false, onChange: (v) => handlePropertyChange('italic', v) },
            { label: 'Width (Units)', type: 'number', value: toUnit(o.size.x), min: 2, max: 50, step: 1, onChange: (v) => handlePropertyChange('size', new Vector2(fromUnit(v), o.size.y)) },
            { label: 'Height (Units)', type: 'number', value: toUnit(o.size.y), min: 2, max: 50, step: 1, onChange: (v) => handlePropertyChange('size', new Vector2(o.size.x, fromUnit(v))) },
            { label: 'Rotation (°)', type: 'range', value: Math.round(o.rotation * 180 / Math.PI), min: 0, max: 360, step: 1, onChange: (v) => handlePropertyChange('rotation', v * Math.PI / 180) }
          ]
        };
      }
      case 'line': {
        const o = selectedObject as LineObject;
        return {
          title: 'Line',
          props: [
            { label: 'Color', type: 'color', value: o.color, onChange: (v) => handlePropertyChange('color', v) },
            { label: 'Width', type: 'number', value: o.width, min: 1, max: 20, onChange: (v) => handlePropertyChange('width', v) },
            { label: 'Dashed', type: 'boolean', value: o.dashed, onChange: (v) => handlePropertyChange('dashed', v) }
          ]
        };
      }
      case 'catenary': {
        const o = selectedObject as CatenaryObject;
        return {
          title: 'Catenary',
          props: [
            { label: 'Color', type: 'color', value: o.color, onChange: (v) => handlePropertyChange('color', v) },
            { label: 'Slack', type: 'range', value: o.slack, min: 0, max: 200, step: 5, onChange: (v) => handlePropertyChange('slack', v) }
          ]
        };
      }
      case 'wall': {
        const o = selectedObject as WallObject;
        return {
          title: 'Wall',
          props: [
            { label: 'Hatch Angle', type: 'range', value: o.hatchAngle, min: 0, max: 360, step: 15, onChange: (v) => handlePropertyChange('hatchAngle', v) }
          ]
        };
      }
      case 'pulley': {
        const o = selectedObject as PulleyObject;
        return {
          title: 'Pulley',
          props: [
            { label: 'Radius (Units)', type: 'number', value: toUnit(o.radius), min: 1, max: 20, step: 0.5, onChange: (v) => handlePropertyChange('radius', fromUnit(v)) },
            { label: 'Show Hanger', type: 'boolean', value: o.hasHanger, onChange: (v) => handlePropertyChange('hasHanger', v) },
            ...(o.hasHanger ? [
              { label: 'Hanger Len', type: 'number', value: toUnit(o.hangerLength), min: 1, max: 20, step: 0.5, onChange: (v) => handlePropertyChange('hangerLength', fromUnit(v)) } as PropertyConfig,
              { label: 'Angle (Deg)', type: 'range', value: (o.hangerAngle * 180 / Math.PI), min: 0, max: 360, step: 15, onChange: (v) => handlePropertyChange('hangerAngle', v * Math.PI / 180) } as PropertyConfig
            ] : [])
          ]
        };
      }
      case 'vector': {
        const o = selectedObject as VectorObject;
        return {
          title: 'Vector',
          props: [
            { label: 'Label', type: 'text', value: o.label, onChange: (v) => handlePropertyChange('label', v) },
            { label: 'Color', type: 'color', value: o.color || 'black', onChange: (v) => handlePropertyChange('color', v) },
            { label: 'Flip Label', type: 'boolean', value: o.flipLabel || false, onChange: (v) => handlePropertyChange('flipLabel', v) },
            { label: 'Font Size', type: 'number', value: o.fontSize || 20, min: 8, max: 100, step: 1, onChange: (v) => handlePropertyChange('fontSize', v) },
            { label: 'Bold', type: 'boolean', value: o.bold || false, onChange: (v) => handlePropertyChange('bold', v) },
            { label: 'Italic', type: 'boolean', value: o.italic || false, onChange: (v) => handlePropertyChange('italic', v) },
            { label: 'Components', type: 'boolean', value: o.showComponents, onChange: (v) => handlePropertyChange('showComponents', v) }
          ]
        };
      }
      case 'text': {
        const o = selectedObject as TextObject;
        return {
          title: 'Text',
          props: [
            { label: 'Content', type: 'text', value: o.content, onChange: (v) => handlePropertyChange('content', v) },
            { label: 'Font Size', type: 'number', value: o.fontSize || 20, min: 8, max: 100, step: 1, onChange: (v) => handlePropertyChange('fontSize', v) },
            { label: 'Bold', type: 'boolean', value: o.bold || false, onChange: (v) => handlePropertyChange('bold', v) },
            { label: 'Italic', type: 'boolean', value: o.italic || false, onChange: (v) => handlePropertyChange('italic', v) },

            // KaTeX Section
            { label: '', type: 'separator', value: null, onChange: () => { } },
            { label: 'Katex Function', type: 'note', value: 'Use these buttons to insert math symbols (SVG Only Export)', onChange: () => { } },
            {
              label: '',
              type: 'action-group',
              value: null,
              actions: [
                { label: 'θ', value: '$$\\theta$$' },
                { label: 'φ', value: '$$\\phi$$' },
                { label: 'λ', value: '$$\\lambda$$' },
                { label: 'α', value: '$$\\alpha$$' },
                { label: 'β', value: '$$\\beta$$' },
                { label: 'μ', value: '$$\\mu$$' },
                { label: 'ρ', value: '$$\\rho$$' },
                { label: 'Δ', value: '$$\\Delta$$' },
                { label: 'Ω', value: '$$\\Omega$$' },
                { label: 'π', value: '$$\\pi$$' },
                { label: '√x', value: '$$\\sqrt{x}$$' },
                { label: 'F→', value: '$$\\vec{F}$$' },
                { label: 'v→', value: '$$\\vec{v}$$' },
                { label: 'c/d', value: '$$\\frac{c}{d}$$' },
                { label: 'Ek', value: '$$\\frac{1}{2}mv^2$$' },
                { label: 'm₁', value: '$$m_1$$' }
              ],
              onChange: (v) => handlePropertyChange('content', v)
            },
            { label: '', type: 'separator', value: null, onChange: () => { } },
            { label: 'KaTeX Docs', type: 'link', value: 'https://katex.org/docs/supported.html', onChange: () => { } }
          ]
        };
      }
      case 'spring': {
        const o = selectedObject as SpringObject;
        return {
          title: 'Spring',
          props: [
            { label: 'Visual Style', type: 'select', value: o.style || 'zigzag', options: ['zigzag', 'coil', 'spiral'], onChange: (v) => handlePropertyChange('style', v) },
            { label: 'Label', type: 'text', value: o.label || '', onChange: (v) => handlePropertyChange('label', v) },
            { label: 'Flip Label', type: 'boolean', value: o.flipLabel || false, onChange: (v) => handlePropertyChange('flipLabel', v) },
            { label: 'Font Size', type: 'number', value: o.fontSize || 20, min: 8, max: 100, step: 1, onChange: (v) => handlePropertyChange('fontSize', v) },
            { label: 'Bold', type: 'boolean', value: o.bold || false, onChange: (v) => handlePropertyChange('bold', v) },
            { label: 'Italic', type: 'boolean', value: o.italic || false, onChange: (v) => handlePropertyChange('italic', v) },
            { label: 'Coil Count', type: 'range', value: o.coils, min: 5, max: 50, step: 1, onChange: (v) => handlePropertyChange('coils', v) },
            { label: 'Width (Units)', type: 'number', value: toUnit(o.width), min: 0.5, max: 20, step: 0.1, onChange: (v) => handlePropertyChange('width', fromUnit(v)) }
          ]
        };
      }

      default:
        return { title: '', props: [] };
    }
  };

  const activeProps = getProperties();

  // --- Actions: Export Image ---
  const handleExport = (format: 'png' | 'svg') => {
    const originalSvg = document.getElementById('main-canvas') as unknown as SVGSVGElement;
    if (!originalSvg) return;

    // 1. Calculate Bounding Box of all objects
    // Initialize with inverted infinity to shrink-wrap
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    if (objects.length === 0) {
      // Fallback if empty scene
      minX = 0; minY = 0; maxX = canvasCoords; maxY = canvasCoords;
    } else {
      objects.forEach(obj => {
        // Simple bounding box approximation based on object types
        // Ideally we would use precise geometry, but this "loose" box is safer
        const checkPoint = (p: { x: number, y: number }) => {
          if (p.x < minX) minX = p.x;
          if (p.x > maxX) maxX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.y > maxY) maxY = p.y;
        };

        const checkCircle = (c: { x: number, y: number }, r: number) => {
          checkPoint({ x: c.x - r, y: c.y - r });
          checkPoint({ x: c.x + r, y: c.y + r });
        };

        const checkRect = (c: { x: number, y: number }, w: number, h: number) => {
          // Unrotated bounds for simplicity (safe overestimate)
          const diagonal = Math.sqrt(w * w + h * h) / 2;
          checkPoint({ x: c.x - diagonal, y: c.y - diagonal });
          checkPoint({ x: c.x + diagonal, y: c.y + diagonal });
        };

        switch (obj.type) {
          case 'spring':
          case 'line':
          case 'wall':
            checkPoint((obj as any).start);
            checkPoint((obj as any).end);
            // Add width margin
            const width = (obj as any).width || 20;
            minX -= width / 2; maxX += width / 2; minY -= width / 2; maxY += width / 2;
            break;
          case 'block':
            const b = obj as BlockObject;
            checkRect(b.center, b.size.x, b.size.y);
            break;
          case 'circle':
          case 'pulley':
            const c = obj as any;
            checkCircle(c.center, c.radius);
            break;
          case 'vector':
            const v = obj as VectorObject;
            checkPoint(v.anchor);
            checkPoint(v.tip);
            // Label approximate margin
            minX -= 20; maxX += 20; minY -= 20; maxY += 20;
            break;
          case 'text':
            const t = obj as TextObject;
            // Text size approximation
            checkRect(t.center, (t.content.length * (t.fontSize || 20) * 0.6), (t.fontSize || 20));
            break;
          case 'triangle':
            const tri = obj as TriangleObject;
            checkPoint(tri.p1); checkPoint(tri.p2); checkPoint(tri.p3);
            break;
          case 'catenary':
            const cat = obj as CatenaryObject;
            checkPoint(cat.start); checkPoint(cat.end);
            // Slack approximation - assume lowest point can drop by slack amount
            if (cat.start.y > maxY) maxY = cat.start.y;
            if (cat.end.y > maxY) maxY = cat.end.y;
            maxY += cat.slack;
            break;
        }
      });
    }

    // Add Padding
    const padding = 50;
    minX -= padding; minY -= padding; maxX += padding; maxY += padding;

    const width = maxX - minX;
    const height = maxY - minY;

    // Clone the SVG
    const clonedSvg = originalSvg.cloneNode(true) as SVGSVGElement;

    // 2. Remove Grid and unwanted elements
    // The grid is usually a <rect fill="url(#grid)">. We can target it by finding the rect that fills 100%.
    // Or simpler: remove the defs pattern and the transparent rect. 
    // In our render code: <pattern id="grid"> ... <rect fill="url(#grid)">
    const patterns = clonedSvg.getElementsByTagName('pattern');
    for (let i = 0; i < patterns.length; i++) {
      if (patterns[i].id === 'grid') patterns[i].remove();
    }
    const rects = clonedSvg.getElementsByTagName('rect');
    for (let i = 0; i < rects.length; i++) {
      const fill = rects[i].getAttribute('fill');
      if (fill && fill.includes('grid')) rects[i].remove();
    }

    // Remove UI elements
    const noExportElements = clonedSvg.querySelectorAll('.no-export');
    noExportElements.forEach(el => el.remove());

    // 3. Set ViewBox to calculated bounds
    clonedSvg.setAttribute('viewBox', `${minX} ${minY} ${width} ${height}`);
    clonedSvg.setAttribute('width', `${width * 2}px`); // High Res export
    clonedSvg.setAttribute('height', `${height * 2}px`);

    // 4. Inject Styles for KaTeX and Fonts
    // We use @import to ensure the standalone SVG has access to the necessary resources.
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=STIX+Two+Text:ital,wght@0,400;0,600;0,700;1,400&display=swap');
      @import url('https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css');
      
      /* Hide the accessible MathML, show the visual HTML */
      .katex-mathml { display: none; }
      
      /* Ensure foreignObject doesn't clip */
      foreignObject { overflow: visible; }
    `;
    clonedSvg.insertBefore(style, clonedSvg.firstChild);

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clonedSvg);
    const filename = `drawphy_export_${Date.now()}.${format}`;

    if (format === 'svg') {
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      // PNG Export
      const img = new Image();
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Export at 2x resolution (Scale Factor)
        canvas.width = width * 2;
        canvas.height = height * 2;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        try {
          const pngUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = pngUrl;
          link.download = filename;
          link.click();
          URL.revokeObjectURL(url);
        } catch (e) {
          console.warn("PNG export blocked by browser security (tainted canvas). Falling back to SVG.", e);
          alert("PNG export failed because the browser blocked the conversion of external fonts/math (SecurityError). Downloading as SVG instead.");

          // Fallback to SVG
          const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
          const svgUrl = URL.createObjectURL(svgBlob);
          const link = document.createElement('a');
          link.href = svgUrl;
          link.download = filename.replace('.png', '.svg');
          link.click();
          URL.revokeObjectURL(svgUrl);
        }
      };
      img.onerror = (e) => {
        console.error("PNG export failed. Likely due to taint issues with foreignObject or external imports.", e);
        alert("PNG export failed. This browser might block 'foreignObject' rendering in Canvas. Please try SVG export.");
      };
      img.src = url;
    }
  };

  // --- Actions: Save & Load ---
  const handleSave = () => {
    const data = JSON.stringify(objects, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `drawphy_scene_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLoad = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) return;
        const rawData = JSON.parse(text);

        if (Array.isArray(rawData)) {
          const rehydrated = rawData.map((obj: any) => {
            const restoreVec = (v: any) => new Vector2(v.x, v.y);
            const newObj = { ...obj };
            if (newObj.start) newObj.start = restoreVec(newObj.start);
            if (newObj.end) newObj.end = restoreVec(newObj.end);
            if (newObj.center) newObj.center = restoreVec(newObj.center);
            if (newObj.size) newObj.size = restoreVec(newObj.size);
            if (newObj.ropeStart) newObj.ropeStart = restoreVec(newObj.ropeStart);
            if (newObj.ropeEnd) newObj.ropeEnd = restoreVec(newObj.ropeEnd);
            if (newObj.anchor) newObj.anchor = restoreVec(newObj.anchor);
            if (newObj.tip) newObj.tip = restoreVec(newObj.tip);
            return newObj;
          });
          pushState(rehydrated as PhysicsObject[]);
        }
      } catch (err) {
        console.error("Failed to load file", err);
        alert("Error loading file: Invalid format");
      }
    };
    reader.readAsText(file);
  };



  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans bg-white" onMouseUp={handleMouseUp}>

      {/* HEADER */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center z-10 shadow-sm h-12">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">DrawPhy</h1>
          <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">v0.9 Beta</span>
        </div>
        <div className="flex gap-2">
          <button onClick={undo} disabled={!canUndo} className={`px-2 py-1 text-xs rounded font-medium transition-colors ${canUndo ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-gray-100 text-gray-400'}`}>Undo (Ctrl+Z)</button>
          <button onClick={redo} disabled={!canRedo} className={`px-2 py-1 text-xs rounded font-medium transition-colors ${canRedo ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-gray-100 text-gray-400'}`}>Redo (Ctrl+Y)</button>
        </div>
      </div>

      <div className="flex-shrink-0 z-20 hover:z-30 relative">
        <Toolbar
          onDelete={handleDelete}
          canDelete={!!selectedId}
          onSave={handleSave}
          onLoad={handleLoad}
          onExport={handleExport}
          showSnap={showSnap}
          onToggleSnap={() => setShowSnap(!showSnap)}
          gridDensity={gridDensity}
          onGridDensityChange={setGridDensity}
          canvasMode={canvasMode}
          onCanvasModeChange={setCanvasMode}
          zoom={zoom}
          onZoomChange={setZoom}
          fontFamily={fontFamily}
          onFontChange={setFontFamily}
        />
      </div>

      <div className="flex-1 flex flex-row overflow-hidden">
        {/* LEFT TOOLBAR */}
        <Sidebar onAdd={handleAddObject} />

        {/* CENTER: Canvas Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-gray-100/50">

          {/* SCROLLABLE CANVAS CONTAINER */}
          {/* SCROLLABLE CANVAS CONTAINER */}
          {/* Fix: Use flex + m-auto for centering to avoid clipping when zoomed in */}
          <div className="flex-1 overflow-auto relative flex cursor-crosshair bg-[#f9f9f9]"
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
          >
            <div
              ref={canvasRef}
              className="relative shrink-0 transition-all duration-200 border border-dashed border-gray-300 box-content m-auto"
              style={{ width: canvasPx * zoom, height: canvasPx * zoom }}
            >
              <div className="absolute top-0 left-0 bg-blue-50/80 text-blue-800 text-[10px] px-2 py-1 z-10 font-medium backdrop-blur-sm pointer-events-none whitespace-nowrap overflow-hidden max-w-full text-ellipsis">
                {canvasMode === 'small' ? 'Small' : 'Large'} ({canvasPx}px @ {Math.round(zoom * 100)}%) | {canvasCoords} Units
              </div>

              <svg id="main-canvas" width={canvasPx} height={canvasPx} viewBox={`0 0 ${canvasCoords} ${canvasCoords}`} className="absolute inset-0 block" style={{ pointerEvents: 'none', width: '100%', height: '100%' }}>
                <pattern id="grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
                  <path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* --- RENDER OBJECTS (Sorted by Z-Index) --- */}
                {objects
                  .slice()
                  .sort((a, b) => {
                    const getOrder = (t: ObjectType) => {
                      switch (t) {
                        case 'spring': case 'line': case 'catenary': return 1;
                        case 'wall': case 'block': case 'triangle': case 'circle': case 'pulley': return 2;
                        case 'vector': return 3;
                        case 'text': return 4;
                        default: return 0;
                      }
                    };
                    return getOrder(a.type) - getOrder(b.type);
                  })
                  .map(obj => {
                    switch (obj.type) {
                      case 'spring':
                        return <SpringRenderer key={obj.id} start={(obj as SpringObject).start} end={(obj as SpringObject).end} coils={(obj as SpringObject).coils} width={(obj as SpringObject).width} style={(obj as SpringObject).style} label={(obj as SpringObject).label} flipLabel={(obj as SpringObject).flipLabel} fontSize={(obj as SpringObject).fontSize} spiralStart={(obj as SpringObject).spiralStart} spiralEnd={(obj as SpringObject).spiralEnd} fontFamily={fontFamily} bold={(obj as SpringObject).bold} italic={(obj as SpringObject).italic} />;
                      case 'wall':
                        return <WallRenderer key={obj.id} start={(obj as WallObject).start} end={(obj as WallObject).end} hatchAngle={(obj as WallObject).hatchAngle} />;
                      case 'block':
                        return <BlockRenderer key={obj.id} center={(obj as BlockObject).center} size={(obj as BlockObject).size} mass={(obj as BlockObject).massLabel} rotation={(obj as BlockObject).rotation} fontSize={(obj as BlockObject).fontSize} fontFamily={fontFamily} bold={(obj as BlockObject).bold} italic={(obj as BlockObject).italic} />;
                      case 'line':
                      case 'line':
                        return <SimpleLine key={obj.id} start={(obj as LineObject).start} end={(obj as LineObject).end} color={(obj as LineObject).color} width={(obj as LineObject).width} dashed={(obj as LineObject).dashed} />;
                      case 'catenary':
                        return <CatenaryRenderer key={obj.id} start={(obj as CatenaryObject).start} end={(obj as CatenaryObject).end} slack={(obj as CatenaryObject).slack} color={(obj as CatenaryObject).color} />;
                      case 'pulley':
                        return <PulleyRenderer key={obj.id} center={(obj as PulleyObject).center} radius={(obj as PulleyObject).radius} hasHanger={(obj as PulleyObject).hasHanger} hangerLength={(obj as PulleyObject).hangerLength} hangerAngle={(obj as PulleyObject).hangerAngle} />;
                      case 'vector':
                        return <VectorRenderer key={obj.id} anchor={(obj as VectorObject).anchor} vector={new Vector2((obj as VectorObject).tip.x - (obj as VectorObject).anchor.x, (obj as VectorObject).tip.y - (obj as VectorObject).anchor.y)} label={(obj as VectorObject).label} showComponents={(obj as VectorObject).showComponents} flipLabel={(obj as VectorObject).flipLabel} fontSize={(obj as VectorObject).fontSize} color={(obj as VectorObject).color} fontFamily={fontFamily} bold={(obj as VectorObject).bold} italic={(obj as VectorObject).italic} />;
                      case 'triangle':
                        return <TriangleRenderer key={obj.id} p1={(obj as TriangleObject).p1} p2={(obj as TriangleObject).p2} p3={(obj as TriangleObject).p3} />;
                      case 'circle':
                        return <CircleRenderer key={obj.id} center={(obj as CircleObject).center} radius={(obj as CircleObject).radius} />;
                      case 'text':
                        return <TextRenderer key={obj.id} center={(obj as TextObject).center} content={(obj as TextObject).content} fontSize={(obj as TextObject).fontSize} fontFamily={fontFamily} bold={(obj as TextObject).bold} italic={(obj as TextObject).italic} />;
                      default: return null;
                    }
                  })}

                {/* --- HANDLES --- */}
                {handles.map((h, i) => {
                  const isDragging = dragIndex === i;
                  const isSelectedObj = h.objectId === selectedId;

                  // Phase 11 Refinement: Handles controlled by showSnap toggle
                  if (!showSnap) return null;

                  return (
                    <circle
                      key={i}
                      cx={h.position.x} cy={h.position.y}
                      r={isDragging ? 6 : (isSelectedObj ? 4 : 3.5)}
                      // Dragging: Slightly more opaque red, but not solid. Idle: Very transparent
                      fill={isDragging ? 'rgba(255, 0, 0, 0.4)' : (isSelectedObj ? 'rgba(59, 130, 246, 0.6)' : 'rgba(255, 0, 0, 0.05)')}
                      stroke={isDragging || isSelectedObj ? 'white' : 'none'}
                      strokeWidth={1.5}
                      className="no-export"
                    />
                  );
                })}

                {/* Snap Indicator */}
                {showSnap && snapInfo && snapInfo.snappedTo !== 'none' && (
                  <circle
                    cx={snapInfo.position.x}
                    cy={snapInfo.position.y}
                    r={4}
                    fill="rgba(59, 130, 246, 0.2)" // Blue tint for snap
                    stroke="rgba(59, 130, 246, 0.6)"
                    strokeWidth={1}
                    className="no-export"
                  />
                )}
              </svg>
            </div>
          </div>

          {/* Info Overlay (Moved to bottom of Canvas Area) */}
          <div className="absolute bottom-2 left-6 pointer-events-none">
            <div className="bg-white/90 p-1.5 text-xs font-mono rounded border shadow-sm flex gap-3 text-gray-500">
              <span>Pos: <b className="text-gray-800">{cursor.x.toFixed(0)}, {cursor.y.toFixed(0)}</b></span>
              <span>{snapInfo?.snappedTo !== 'none' ? <span className="text-blue-600 font-bold">SNAP</span> : 'FREE'}</span>
            </div>
          </div>

        </div>

        {/* RESIZER */}
        <div
          className="w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-colors flex flex-col justify-center items-center group z-20"
          onMouseDown={startResizing}
        >
          <div className="h-8 w-0.5 bg-gray-400 group-hover:bg-white rounded"></div>
        </div>

        {/* RIGHT: Properties Panel */}
        <div style={{ width: panelWidth }} className="flex-shrink-0 h-full overflow-hidden bg-white shadow-xl z-20">
          <PropertiesPanel title={activeProps.title} properties={activeProps.props} />
        </div>
      </div>
    </div >
  );
}

export default App;

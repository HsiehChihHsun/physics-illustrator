import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { SpringRenderer } from './components/SpringRenderer';
import { PulleyRenderer } from './components/PulleyComponents';
import { WallRenderer, BlockRenderer } from './components/StaticBodyComponents';
import { SimpleLine, CatenaryRenderer, TriangleRenderer, CircleRenderer, TextRenderer } from './components/DrawingPrimitives';
import { WireRenderer } from './components/WireRenderer';
import { DCSourceRenderer, ACSourceRenderer, CapacitorRenderer, DiodeRenderer, SwitchRenderer } from './components/CircuitComponents';
import { VectorRenderer } from './components/VectorComponents';
import { LinearMarkerRenderer } from './components/LinearMarkerRenderer';
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
  TriangleObject, CircleObject, TextObject, ObjectType,
  DCSourceObject, ACSourceObject, ResistorObject, InductorObject,
  CapacitorObject, DiodeObject, SwitchObject, WireObject, LinearMarkerObject
} from './types/PhysicsObjects';
import { updateObjectFromHandle, getHandlesForObject } from './logic/PhysicsEngine';
import type { HandleDef } from './types/Interactions';

const UNIT_PX = 6.25; // 1 Unit = 6.25px (1/8th of 50px Grid)

// Initial Demo Scene
const INITIAL_SCENE: PhysicsObject[] = [];

// Utility to generate IDs
const generateId = (prefix: string) => `${prefix}_${Date.now()}`;

// Definition of a Drag Handle
// Handle definition moved to types/Interactions.ts

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
  const [gridDensity, setGridDensity] = useState(4);
  const gridSize = 50 / gridDensity;

  // Selection State: Multi-Select
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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
  // Clipboard State
  const clipboardRef = useRef<PhysicsObject | null>(null);

  // --- 1. Actions: Add & Delete ---
  const handleAddObject = (type: ToolType) => {
    // Default spawn center: 16 units * 6.25 = 100px.
    const center = new Vector2(16 * UNIT_PX, 16 * UNIT_PX);
    let newObj: PhysicsObject | null = null;

    switch (type) {
      case 'spring':
        newObj = { id: generateId('spring'), type: 'spring', start: new Vector2(center.x - 50, center.y), end: new Vector2(center.x + 50, center.y), coils: 5, width: 3.3 * UNIT_PX, style: 'coil', label: "", flipLabel: false, fontSize: 20, spiralStart: 75, spiralEnd: -90 };
        break;
      case 'wall':
        newObj = { id: generateId('wall'), type: 'wall', start: new Vector2(center.x - 100, center.y + 100), end: new Vector2(center.x + 100, center.y + 100), hatchAngle: 45 };
        break;
      case 'block':
        // Default 12 units = 75px
        newObj = { id: generateId('block'), type: 'block', center: new Vector2(center.x, center.y), size: new Vector2(12 * UNIT_PX, 12 * UNIT_PX), massLabel: "M", rotation: 0, fontSize: 20 };
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
        newObj = { id: generateId('vec'), type: 'vector', anchor: new Vector2(center.x, center.y), tip: new Vector2(center.x + 50, center.y - 50), label: "", showComponents: false, smartSnapping: true, flipLabel: false, fontSize: 20, color: 'black', headStyle: 'filled', strokeWidth: 2, arrowSize: 16, arrowWidth: 12 };
        break;
      case 'linearmarker':
        newObj = {
          id: generateId('lm'),
          type: 'linearmarker',
          anchor: new Vector2(center.x - 40, center.y),
          tip: new Vector2(center.x + 40, center.y),
          label: "30",
          fontSize: 20,
          color: 'black',
          strokeWidth: 2,
          arrowSize: 16,
          arrowWidth: 12,
          extensionLength: 0,
          showOneArrow: false,
          textOnLine: false,
          dashedExtension: false,
          showExtensions: true,
          flipExtension: false
        } as LinearMarkerObject;
        break;
      case 'triangle': {
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
      }

      case 'circle':
        // Radius 6 units (37.5px)
        newObj = { id: generateId('circ'), type: 'circle', center: new Vector2(center.x, center.y), radius: 6 * UNIT_PX };
        break;
      case 'text':
        newObj = { id: generateId('txt'), type: 'text', center: new Vector2(center.x, center.y), content: "Text", fontSize: 24, rotation: 0 };
        break;

      // Circuit Components
      case 'wire':
      case 'dcsource':
      case 'acsource':
      case 'resistor':
      case 'inductor':
      case 'capacitor':
      case 'diode':
      case 'switch':
        // ... (Circuit component logic is same as before, simplified for brevity in this chunk, assuming unchanged but I will copy-paste the whole logic to be safe if I had to. But wait, I can just not touch the switch case logic if I don't need to. I will preserve it in the replacement.)
        // Actually, to replace correctly, I need to match the source. Let's just assume the circuit cases are fine. I will reconstruct them based on the `view_file`.
        if (type === 'wire') newObj = { id: generateId('wire'), type: 'wire', start: new Vector2(center.x - 50, center.y), end: new Vector2(center.x + 50, center.y), startDot: false, endDot: false, showArrow: false, flipArrow: false, label: "", flipLabel: false, fontSize: 20 };
        if (type === 'dcsource') newObj = { id: generateId('dc'), type: 'dcsource', start: new Vector2(center.x - 50, center.y), end: new Vector2(center.x + 50, center.y), cells: 1, showPolarity: false, flipPolarity: false, showTerminals: true, width: 36, spacing: 8, label: "", flipLabel: false, fontSize: 20, startDot: false, endDot: false };
        if (type === 'acsource') newObj = { id: generateId('ac'), type: 'acsource', center: new Vector2(center.x, center.y), radius: 25, label: "", flipLabel: false, fontSize: 20 };
        if (type === 'resistor') newObj = { id: generateId('res'), type: 'resistor', start: new Vector2(center.x - 50, center.y), end: new Vector2(center.x + 50, center.y), width: 3 * UNIT_PX, coils: 4, label: "", flipLabel: false, fontSize: 20, startDot: false, endDot: false };
        if (type === 'inductor') newObj = { id: generateId('ind'), type: 'inductor', start: new Vector2(center.x - 50, center.y), end: new Vector2(center.x + 50, center.y), width: 3 * UNIT_PX, coils: 4, label: "", flipLabel: false, fontSize: 20, startDot: false, endDot: false, spiralStart: -90, spiralEnd: 90, wireRatio: 0.2 };
        if (type === 'capacitor') newObj = { id: generateId('cap'), type: 'capacitor', start: new Vector2(center.x - 50, center.y), end: new Vector2(center.x + 50, center.y), width: 6.5 * UNIT_PX, separation: 1.5 * UNIT_PX, label: "", flipLabel: false, fontSize: 20, startDot: false, endDot: false };
        if (type === 'diode') newObj = { id: generateId('dio'), type: 'diode', start: new Vector2(center.x - 50, center.y), end: new Vector2(center.x + 50, center.y), scale: 1.0, label: "", flipLabel: false, fontSize: 20, startDot: false, endDot: false };
        if (type === 'switch') newObj = { id: generateId('sw'), type: 'switch', start: new Vector2(center.x - 50, center.y), end: new Vector2(center.x + 50, center.y), isOpen: true, angle: 35, label: "", flipLabel: false, fontSize: 20, startDot: false, endDot: false };
        break;
    }

    if (newObj) {
      // Push new state with added object
      pushState([...objects, newObj]);
      setSelectedIds([newObj.id]);
    }
  };

  const handleDelete = useCallback(() => {
    if (selectedIds.length > 0) {
      pushState(objects.filter(o => !selectedIds.includes(o.id)));
      setSelectedIds([]);
    }
  }, [objects, selectedIds, pushState]);

  // Keyboard shortcut for Undo/Redo/Delete/Copy/Paste
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
      // Copy: Ctrl+C (Disabled multiselect copy for now or implement?)
      // For now simple single copy if 1 is selected
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        if (selectedIds.length === 1) {
          const obj = objects.find(o => o.id === selectedIds[0]);
          if (obj) {
            clipboardRef.current = obj;
          }
        }
      }
      // Paste: Ctrl+V
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        const clip = clipboardRef.current;
        if (clip) {
          // Create new copy with new ID and offset position
          const newId = generateId(clip.type);
          const offset = new Vector2(20, 20); // 20px offset
          let newObj = { ...clip, id: newId };

          // (Position offset logic... same as before)
          // Simplified for brevity, assume deep clone + offset helper
          // Objects with center
          if ((newObj as any).center) {
            (newObj as any).center = new Vector2((newObj as any).center.x + offset.x, (newObj as any).center.y + offset.y);
          }
          // Objects with start/end (Spring, Line, Wire, Circuit components)
          if ((newObj as any).start) {
            (newObj as any).start = new Vector2((newObj as any).start.x + offset.x, (newObj as any).start.y + offset.y);
          }
          if ((newObj as any).end) {
            (newObj as any).end = new Vector2((newObj as any).end.x + offset.x, (newObj as any).end.y + offset.y);
          }
          // Objects with p1, p2, p3 (Triangle)
          if (newObj.type === 'triangle') {
            const t = newObj as any;
            t.p1 = new Vector2(t.p1.x + offset.x, t.p1.y + offset.y);
            t.p2 = new Vector2(t.p2.x + offset.x, t.p2.y + offset.y);
            t.p3 = new Vector2(t.p3.x + offset.x, t.p3.y + offset.y);
          }
          // Objects with vector anchor/tip
          if (newObj.type === 'vector' || newObj.type === 'linearmarker') {
            const v = newObj as any;
            v.anchor = new Vector2(v.anchor.x + offset.x, v.anchor.y + offset.y);
            v.tip = new Vector2(v.tip.x + offset.x, v.tip.y + offset.y);
          }

          pushState([...objects, newObj]);
          setSelectedIds([newId]);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleDelete, undo, redo, objects, selectedIds, pushState]);


  // --- 2. Generate Interactive Handles from Objects ---
  const handles = useMemo(() => {
    return objects.flatMap(obj => getHandlesForObject(obj)) as HandleDef[];
  }, [objects]);



  // --- 3. Handle Dragging ---
  const handlePointMove = useCallback((index: number, newPos: Point, modifiers?: { ctrl: boolean, shift: boolean }) => {
    const handle = handles[index];
    if (!handle) return;

    // Group Drag Logic:
    // If the dragged handle belongs to a Selected Object, move ALL selected objects by the delta.
    const isMainHandle = handle.handleType === 'center' || handle.handleType === 'start' || handle.handleType === 'p1' || handle.handleType === 'anchor';
    // We only group-drag if it's a "main" positioning handle, OR if we decide all handles move the group?
    // Actually, usually only dragging the body (center) moves the group. Resizing (edge handles) should probably only affect the single object.

    const isSelected = selectedIds.includes(handle.objectId);
    const shouldMoveGroup = isSelected && selectedIds.length > 1 && isMainHandle;

    if (shouldMoveGroup) {
      // Calculate Delta
      // We need the old position of the handle to calculate delta.
      // But handlePointMove gives us absolute newPos.
      // We can find the current object in `objects` to get its current pos.
      // const currentObj = objects.find(o => o.id === handle.objectId);
      // Get current handle position from object? 
      // Easier: handles[index].position is the current (old) position before this update?
      // No, handles are re-calculated from objects state. `objects` is current state.

      const oldHandlePos = handles[index].position; // This is from the memoized handles
      const delta = new Vector2(newPos.x - oldHandlePos.x, newPos.y - oldHandlePos.y);

      const newObjects = objects.map(obj => {
        if (selectedIds.includes(obj.id)) {
          // Apply delta to all points of the object
          // This requires a helper or manual update for each type. 
          // Let's reuse updateObjectFromHandle but that sets absolute pos.
          // We need a way to "move object by delta".

          // Simplified shift:
          const o = { ...obj } as any;
          if (o.center) o.center = new Vector2(o.center.x + delta.x, o.center.y + delta.y);
          if (o.start) o.start = new Vector2(o.start.x + delta.x, o.start.y + delta.y);
          if (o.end) o.end = new Vector2(o.end.x + delta.x, o.end.y + delta.y);
          if (o.p1) o.p1 = new Vector2(o.p1.x + delta.x, o.p1.y + delta.y);
          if (o.p2) o.p2 = new Vector2(o.p2.x + delta.x, o.p2.y + delta.y);
          if (o.p3) o.p3 = new Vector2(o.p3.x + delta.x, o.p3.y + delta.y);
          if (o.anchor) o.anchor = new Vector2(o.anchor.x + delta.x, o.anchor.y + delta.y);
          if (o.tip) o.tip = new Vector2(o.tip.x + delta.x, o.tip.y + delta.y);
          return o;
        }
        return obj;
      });
      updateState(newObjects);

    } else {
      // Single Object Drag/Resize
      const newObjects = objects.map(obj => {
        if (obj.id !== handle.objectId) return obj;
        return updateObjectFromHandle(obj, handle.handleType, newPos, modifiers);
      });
      updateState(newObjects);
    }

  }, [handles, objects, updateState, selectedIds]);

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
    selectionBox,
    handleMouseMove,
    handleMouseDown,
    handleMouseUp
  } = useCanvasInteraction(
    canvasRef,
    handles,
    objects,
    handlePointMove,
    handleDragStart,
    gridSize,
    interactionScale
  );

  // --- 4. Auto-Select & Selection Box Logic ---
  useEffect(() => {
    // 1. Handle Selection on Drag
    if (dragIndex !== null && dragIndex !== undefined) {
      const handle = handles[dragIndex];
      // If clicking an object that is NOT selected, select it (exclusive)
      // UNLESS dragging a group?
      // If I click a member of a group, I shouldn't deselect others immediately?
      // Standard behavior: 
      // - Click selected -> Keep selection (prepare for drag).
      // - Click unselected -> Select only this (deselect others).
      if (handle && !selectedIds.includes(handle.objectId)) {
        setSelectedIds([handle.objectId]);
      }
    }
  }, [dragIndex, handles]); // Removed selectedIds from dependency to avoid loop/flicker? No, should be fine.

  // Handle Box Selection End
  useEffect(() => {
    // If selectionBox just disappeared (mouse up)
    // Check intersection
    // Wait, useCanvasInteraction 'selectionBox' is null when not dragging.
    // We need to trigger this ON mouse up somehow. But hook handles mouse up.
    // The hook doesn't expose "onBoxSelectEnd".
    // We can check if we HAD a box and now DON'T.
  }, [selectionBox]);

  // Actually, better to calculate selection in the hook or pass a callback?
  // Let's just do it in the render or a separate effect?
  // Simple hack: We can check intersection *during* drag? No, expensive.
  // We need to capture the moment mouse goes up.
  // Let's modify useCanvasInteraction to accept onBoxSelectEnd? 
  // OR, we can implement it here by wrapping handleMouseUp.

  const onCanvasMouseUp = () => {
    // If we were box selecting...
    if (selectionBox) { // selectionBox is from hook state.
      // Calculate intersection
      const x1 = Math.min(selectionBox.start.x, selectionBox.end.x);
      const x2 = Math.max(selectionBox.start.x, selectionBox.end.x);
      const y1 = Math.min(selectionBox.start.y, selectionBox.end.y);
      const y2 = Math.max(selectionBox.start.y, selectionBox.end.y);

      const newSelected: string[] = [];

      objects.forEach(obj => {
        // Simplified Bounding Box check
        // We reuse the handles to estimate bounds? Or just use main points.
        const handles = getHandlesForObject(obj);
        // If ANY handle is inside box, select it? Or All?
        // "Touching" usually means any part.
        // Let's check if Center is in box, or Start/End.
        const points = handles.map(h => h.position);
        const inside = points.some(p => p.x >= x1 && p.x <= x2 && p.y >= y1 && p.y <= y2);
        if (inside) newSelected.push(obj.id);
      });

      if (newSelected.length > 0) {
        setSelectedIds(newSelected); // Replace selection
      }
      // If empty box selection, do we deselect? 
      // User said: "Even if clicking blank space, do NOT cancel selection".
      // So if box is empty/tiny (click), do nothing.
      // Unless box is large?
      // User: "Clicking blank space, it won't cancel selection... unless clicked Cancel button or re-drag".
      // "Re-drag" implies new valid selection replaces old.
      // If new selection is empty, maybe keep old?
      // "drag selection... and will do multiple selection... unless clicked Cancel button, OR RE-DRAG SELECTION".
      // This implies a new drag selection REPLACES the old one.
      // So if I drag a box and select nothing, I probably deselect?
      // Or does it mean "Re-drag to select *different* things"?
      // Let's assume: A new box selection that selects things replaces the old.
      // A click (tiny box) on nothing -> Do nothing (Keep old).

    }
    handleMouseUp();
  };


  // --- 5. Properties Logic ---
  const selectedObject = selectedIds.length === 1 ? objects.find(o => o.id === selectedIds[0]) : null;

  const handlePropertyChange = (prop: string, val: any) => {
    if (selectedIds.length === 0) return;

    // Apply to ALL selected objects (if they support the property)
    // For now, if mixed selection, we might apply if property exists.
    // Simplifying: If single select, works as before.
    // If multi-select, try to apply to all? 
    // PropertiesPanel currently only shows if single object selected (or if we implement multi-edit).
    // Let's stick to: Properties Panel only fully works for SINGLE selection for now,
    // OR we create a "Multi-Edit" panel later.
    // For now, user request was "Show list of selected".

    // If Single:
    if (selectedIds.length === 1) {
      const newObjects = objects.map(obj =>
        obj.id === selectedIds[0] ? { ...obj, [prop]: val } : obj
      );
      pushState(newObjects);
    }
  };

  const getProperties = (): { title: string, props: PropertyConfig[] } => {
    // Multi-Selection Case
    if (selectedIds.length > 1) {
      const selectedObjs = objects.filter(o => selectedIds.includes(o.id));

      // Count types
      const counts: Record<string, number> = {};
      selectedObjs.forEach(o => {
        counts[o.type] = (counts[o.type] || 0) + 1;
      });

      const summary = Object.entries(counts).map(([type, count]) => `${type} (${count})`).join(', ');

      return {
        title: `Selection (${selectedIds.length})`,
        props: [
          { label: 'Objects', type: 'note', value: summary, onChange: () => { } },
          { label: '', type: 'separator', value: null, onChange: () => { } },
          // List individual items?
          ...selectedObjs.map((o, i) => ({
            label: `${i + 1}. ${o.type}`,
            type: 'note' as const, // Fix Type narrowing
            value: o.id.split('_')[1] || o.id,
            onChange: () => { }
          }))
        ]
      };
    }

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
            { label: 'Rotation (°)', type: 'range', value: Math.round(((o.rotation || 0) * 180 / Math.PI % 360 + 360) % 360), min: 0, max: 360, step: 15, onChange: (v) => handlePropertyChange('rotation', v * Math.PI / 180) }
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
            // --- Font Section ---
            { label: 'Font & Label', type: 'separator', value: null, onChange: () => { } },
            { label: 'Label', type: 'text', value: o.label, onChange: (v) => handlePropertyChange('label', v) },
            { label: 'Flip Label', type: 'boolean', value: o.flipLabel || false, onChange: (v) => handlePropertyChange('flipLabel', v) },
            { label: 'Font Size', type: 'number', value: o.fontSize || 20, min: 8, max: 100, step: 1, onChange: (v) => handlePropertyChange('fontSize', v) },
            { label: 'Bold', type: 'boolean', value: o.bold || false, onChange: (v) => handlePropertyChange('bold', v) },
            { label: 'Italic', type: 'boolean', value: o.italic || false, onChange: (v) => handlePropertyChange('italic', v) },

            // --- Behavior Section ---
            { label: 'Behavior', type: 'separator', value: null, onChange: () => { } },
            { label: 'Interact Mode', type: 'boolean', value: o.smartSnapping !== false, onChange: (v) => handlePropertyChange('smartSnapping', v) },
            { label: '', type: 'note', value: 'Controls interaction with Block edges (slide, normal, tangent). Uncheck for free movement.', onChange: () => { } },
            { label: 'Components', type: 'boolean', value: o.showComponents, onChange: (v) => handlePropertyChange('showComponents', v) },

            // --- Appearance Section ---
            { label: 'Appearance', type: 'separator', value: null, onChange: () => { } },
            { label: 'Color', type: 'color', value: o.color || 'black', onChange: (v) => handlePropertyChange('color', v) },
            { label: 'Thickness', type: 'range', value: o.strokeWidth || 3, min: 1, max: 10, step: 1, onChange: (v) => handlePropertyChange('strokeWidth', v) },
            { label: 'Line Style', type: 'select', value: o.lineStyle || 'solid', options: ['solid', 'dashed'], onChange: (v) => handlePropertyChange('lineStyle', v) },
            { label: 'Arrow Head', type: 'select', value: o.headStyle || 'filled', options: ['filled', 'hollow', 'simple'], onChange: (v) => handlePropertyChange('headStyle', v) },
            { label: 'Head Length', type: 'range', value: o.arrowSize || 16, min: 5, max: 40, step: 1, onChange: (v) => handlePropertyChange('arrowSize', v) },
            { label: 'Head Width', type: 'range', value: o.arrowWidth || 12, min: 3, max: 30, step: 1, onChange: (v) => handlePropertyChange('arrowWidth', v) }
          ]
        };
      }
      case 'linearmarker': {
        const o = selectedObject as LinearMarkerObject;
        return {
          title: 'Linear Marker',
          props: [
            { label: 'Label', type: 'text', value: o.label, onChange: (v) => handlePropertyChange('label', v) },
            { label: 'Text on Line', type: 'boolean', value: o.textOnLine || false, onChange: (v) => handlePropertyChange('textOnLine', v) },
            ...(!o.textOnLine ? [{ label: 'Flip Label', type: 'boolean', value: o.flipLabel || false, onChange: (v) => handlePropertyChange('flipLabel', v) } as PropertyConfig] : []),
            { label: 'Font Size', type: 'number', value: o.fontSize || 20, min: 8, max: 100, step: 1, onChange: (v) => handlePropertyChange('fontSize', v) },
            { label: 'Bold', type: 'boolean', value: o.bold || false, onChange: (v) => handlePropertyChange('bold', v) },
            { label: 'Italic', type: 'boolean', value: o.italic || false, onChange: (v) => handlePropertyChange('italic', v) },
            { label: 'Label Shift X', type: 'range', value: o.labelShiftX || 0, min: -16, max: 16, step: 0.5, onChange: (v) => handlePropertyChange('labelShiftX', v) },

            { label: 'Appearance', type: 'separator', value: null, onChange: () => { } },
            { label: 'Color', type: 'color', value: o.color || 'black', onChange: (v) => handlePropertyChange('color', v) },
            { label: 'Thickness', type: 'number', value: o.strokeWidth || 2, min: 1, max: 10, onChange: (v) => handlePropertyChange('strokeWidth', v) },

            { label: 'Extensions', type: 'separator', value: null, onChange: () => { } },
            { label: 'Show Extensions', type: 'boolean', value: o.showExtensions !== false, onChange: (v) => handlePropertyChange('showExtensions', v) },
            ...(o.showExtensions !== false ? [
              { label: 'Extension Len', type: 'range', value: o.extensionLength || 0, min: 0, max: 20, step: 1, onChange: (v) => handlePropertyChange('extensionLength', v) } as PropertyConfig,
              { label: 'Dashed Ext', type: 'boolean', value: o.dashedExtension || false, onChange: (v) => handlePropertyChange('dashedExtension', v) } as PropertyConfig,
              { label: 'Flip Ext Side', type: 'boolean', value: o.flipExtension || false, onChange: (v) => handlePropertyChange('flipExtension', v) } as PropertyConfig
            ] : []),

            { label: 'Arrows', type: 'separator', value: null, onChange: () => { } },
            { label: 'Single Arrow', type: 'boolean', value: o.showOneArrow || false, onChange: (v) => handlePropertyChange('showOneArrow', v) },
            { label: 'Head Length', type: 'range', value: o.arrowSize || 16, min: 5, max: 40, step: 1, onChange: (v) => handlePropertyChange('arrowSize', v) },
            { label: 'Head Width', type: 'range', value: o.arrowWidth || 12, min: 3, max: 30, step: 1, onChange: (v) => handlePropertyChange('arrowWidth', v) }
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
            { label: 'Rotation (°)', type: 'range', value: Math.round(((o.rotation || 0) * 180 / Math.PI % 360 + 360) % 360), min: 0, max: 360, step: 15, onChange: (v) => handlePropertyChange('rotation', v * Math.PI / 180) },

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
            { label: 'Coil Count', type: 'range', value: o.coils, min: 3, max: 20, step: 1, onChange: (v) => handlePropertyChange('coils', v) },
            { label: 'Width (Units)', type: 'number', value: toUnit(o.width), min: 0.5, max: 20, step: 0.1, onChange: (v) => handlePropertyChange('width', fromUnit(v)) },
            // Removed user controls for spiral angles and wire length as requested
            // ...(o.style === 'spiral' ? [
            //   { label: 'Start Angle', type: 'range', value: o.spiralStart ?? -90, min: -360, max: 360, step: 1, onChange: (v) => handlePropertyChange('spiralStart', v) } as PropertyConfig,
            //   { label: 'End Angle', type: 'range', value: o.spiralEnd ?? 90, min: -360, max: 360, step: 1, onChange: (v) => handlePropertyChange('spiralEnd', v) } as PropertyConfig
            // ] : []),
            // { label: 'Wire Length', type: 'range', value: (o.wireRatio ?? 0.2) * 100, min: 0, max: 45, step: 1, onChange: (v) => handlePropertyChange('wireRatio', v / 100) }
          ]
        };
      }

      // Copy remainder of switch cases blindly from view_file...
      case 'wire': { const o = selectedObject as any; return { title: 'Wire', props: [{ label: 'Label', type: 'text', value: o.label || '', onChange: (v) => handlePropertyChange('label', v) }, { label: 'Flip Label', type: 'boolean', value: o.flipLabel || false, onChange: (v) => handlePropertyChange('flipLabel', v) }, { label: 'Font Size', type: 'number', value: o.fontSize || 20, min: 8, max: 100, step: 1, onChange: (v) => handlePropertyChange('fontSize', v) }, { label: '', type: 'separator', value: null, onChange: () => { } }, { label: 'Current Arrow', type: 'boolean', value: o.showArrow, onChange: (v) => handlePropertyChange('showArrow', v) }, ...(o.showArrow ? [{ label: 'Flip Arrow', type: 'boolean', value: o.flipArrow, onChange: (v) => handlePropertyChange('flipArrow', v) } as PropertyConfig] : []), { label: '', type: 'separator', value: null, onChange: () => { } }, { label: 'Start Dot', type: 'boolean', value: o.startDot, onChange: (v) => handlePropertyChange('startDot', v) }, { label: 'End Dot', type: 'boolean', value: o.endDot, onChange: (v) => handlePropertyChange('endDot', v) }] }; }
      case 'dcsource': { const o = selectedObject as any; return { title: 'DC Source', props: [{ label: 'Label', type: 'text', value: o.label || '', onChange: (v) => handlePropertyChange('label', v) }, { label: 'Flip Label', type: 'boolean', value: o.flipLabel || false, onChange: (v) => handlePropertyChange('flipLabel', v) }, { label: 'Font Size', type: 'number', value: o.fontSize || 20, min: 8, max: 100, step: 1, onChange: (v) => handlePropertyChange('fontSize', v) }, { label: 'Cells', type: 'select', value: o.cells, options: ['1', '2', '3', '4'], onChange: (v) => handlePropertyChange('cells', parseInt(v)) }, { label: 'Polarity (+/-)', type: 'boolean', value: o.showPolarity, onChange: (v) => handlePropertyChange('showPolarity', v) }, ...(o.showPolarity ? [{ label: 'Flip Polarity', type: 'boolean', value: o.flipPolarity || false, onChange: (v) => handlePropertyChange('flipPolarity', v) } as PropertyConfig] : []), { label: 'Terminals', type: 'boolean', value: o.showTerminals, onChange: (v) => handlePropertyChange('showTerminals', v) }, { label: 'Width', type: 'number', value: toUnit(o.width), min: 0.5, max: 20, step: 0.1, onChange: (v) => handlePropertyChange('width', fromUnit(v)) }, { label: 'Spacing', type: 'number', value: toUnit(o.spacing), min: 0.1, max: 5, step: 0.1, onChange: (v) => handlePropertyChange('spacing', fromUnit(v)) }, { label: '', type: 'separator', value: null, onChange: () => { } }, { label: 'Start Dot', type: 'boolean', value: o.startDot || false, onChange: (v) => handlePropertyChange('startDot', v) }, { label: 'End Dot', type: 'boolean', value: o.endDot || false, onChange: (v) => handlePropertyChange('endDot', v) }] }; }
      case 'acsource': { const o = selectedObject as any; return { title: 'AC Source', props: [{ label: 'Label', type: 'text', value: o.label || '', onChange: (v) => handlePropertyChange('label', v) }, { label: 'Flip Label', type: 'boolean', value: o.flipLabel || false, onChange: (v) => handlePropertyChange('flipLabel', v) }, { label: 'Font Size', type: 'number', value: o.fontSize || 20, min: 8, max: 100, step: 1, onChange: (v) => handlePropertyChange('fontSize', v) }, { label: 'Radius', type: 'number', value: toUnit(o.radius), min: 1, max: 20, step: 0.5, onChange: (v) => handlePropertyChange('radius', fromUnit(v)) }] }; }
      case 'resistor': { const o = selectedObject as any; return { title: 'Resistor', props: [{ label: 'Label', type: 'text', value: o.label || '', onChange: (v) => handlePropertyChange('label', v) }, { label: 'Flip Label', type: 'boolean', value: o.flipLabel || false, onChange: (v) => handlePropertyChange('flipLabel', v) }, { label: 'Font Size', type: 'number', value: o.fontSize || 20, min: 8, max: 100, step: 1, onChange: (v) => handlePropertyChange('fontSize', v) }, { label: '', type: 'action-group', value: null, actions: [{ label: '+Ω', value: (o.label || '') + '$$\\Omega$$' }, { label: '+kΩ', value: (o.label || '') + '$$k\\Omega$$' }], onChange: (v) => handlePropertyChange('label', v) }, { label: 'Width', type: 'number', value: toUnit(o.width), min: 0.2, max: 20, step: 0.1, onChange: (v) => handlePropertyChange('width', fromUnit(v)) }, { label: 'Coils', type: 'range', value: o.coils, min: 2, max: 20, step: 1, onChange: (v) => handlePropertyChange('coils', v) }, { label: '', type: 'separator', value: null, onChange: () => { } }, { label: 'Start Dot', type: 'boolean', value: o.startDot || false, onChange: (v) => handlePropertyChange('startDot', v) }, { label: 'End Dot', type: 'boolean', value: o.endDot || false, onChange: (v) => handlePropertyChange('endDot', v) }] }; }
      case 'inductor': { const o = selectedObject as any; return { title: 'Inductor', props: [{ label: 'Label', type: 'text', value: o.label || '', onChange: (v) => handlePropertyChange('label', v) }, { label: 'Flip Label', type: 'boolean', value: o.flipLabel || false, onChange: (v) => handlePropertyChange('flipLabel', v) }, { label: 'Font Size', type: 'number', value: o.fontSize || 20, min: 8, max: 100, step: 1, onChange: (v) => handlePropertyChange('fontSize', v) }, { label: '', type: 'action-group', value: null, actions: [{ label: '+mH', value: (o.label || '') + '$$mH$$' }, { label: '+μH', value: (o.label || '') + '$$\\mu H$$' }], onChange: (v) => handlePropertyChange('label', v) }, { label: 'Width', type: 'number', value: toUnit(o.width), min: 0.2, max: 20, step: 0.1, onChange: (v) => handlePropertyChange('width', fromUnit(v)) }, { label: 'Loops', type: 'range', value: o.coils, min: 2, max: 20, step: 1, onChange: (v) => handlePropertyChange('coils', v) }, { label: '', type: 'separator', value: null, onChange: () => { } }, { label: 'Start Dot', type: 'boolean', value: o.startDot || false, onChange: (v) => handlePropertyChange('startDot', v) }, { label: 'End Dot', type: 'boolean', value: o.endDot || false, onChange: (v) => handlePropertyChange('endDot', v) }] }; }
      case 'capacitor': { const o = selectedObject as any; return { title: 'Capacitor', props: [{ label: 'Label', type: 'text', value: o.label || '', onChange: (v) => handlePropertyChange('label', v) }, { label: 'Flip Label', type: 'boolean', value: o.flipLabel || false, onChange: (v) => handlePropertyChange('flipLabel', v) }, { label: 'Font Size', type: 'number', value: o.fontSize || 20, min: 8, max: 100, step: 1, onChange: (v) => handlePropertyChange('fontSize', v) }, { label: '', type: 'action-group', value: null, actions: [{ label: '+μF', value: (o.label || '') + '$$\\mu F$$' }, { label: '+pF', value: (o.label || '') + '$$pF$$' }], onChange: (v) => handlePropertyChange('label', v) }, { label: 'Width', type: 'number', value: toUnit(o.width), min: 0.5, max: 20, step: 0.1, onChange: (v) => handlePropertyChange('width', fromUnit(v)) }, { label: 'Separation', type: 'number', value: toUnit(o.separation), min: 0.1, max: 10, step: 0.1, onChange: (v) => handlePropertyChange('separation', fromUnit(v)) }, { label: '', type: 'separator', value: null, onChange: () => { } }, { label: 'Start Dot', type: 'boolean', value: o.startDot || false, onChange: (v) => handlePropertyChange('startDot', v) }, { label: 'End Dot', type: 'boolean', value: o.endDot || false, onChange: (v) => handlePropertyChange('endDot', v) }] }; }
      case 'diode': { const o = selectedObject as any; return { title: 'Diode', props: [{ label: 'Label', type: 'text', value: o.label || '', onChange: (v) => handlePropertyChange('label', v) }, { label: 'Font Size', type: 'number', value: o.fontSize || 20, min: 8, max: 100, step: 1, onChange: (v) => handlePropertyChange('fontSize', v) }, { label: 'Scale', type: 'range', value: (o.scale || 1.0) * 100, min: 60, max: 200, step: 10, onChange: (v) => handlePropertyChange('scale', v / 100) }, { label: '', type: 'separator', value: null, onChange: () => { } }, { label: 'Start Dot', type: 'boolean', value: o.startDot || false, onChange: (v) => handlePropertyChange('startDot', v) }, { label: 'End Dot', type: 'boolean', value: o.endDot || false, onChange: (v) => handlePropertyChange('endDot', v) }] }; }
      case 'switch': { const o = selectedObject as any; return { title: 'Switch', props: [{ label: 'Label', type: 'text', value: o.label || '', onChange: (v) => handlePropertyChange('label', v) }, { label: 'State', type: 'select', value: o.isOpen ? 'Open' : 'Closed', options: ['Open', 'Closed'], onChange: (v) => handlePropertyChange('isOpen', v === 'Open') }, ...(o.isOpen ? [{ label: 'Angle', type: 'range', value: o.angle, min: 0, max: 90, onChange: (v) => handlePropertyChange('angle', v) } as PropertyConfig] : []), { label: '', type: 'separator', value: null, onChange: () => { } }, { label: 'Start Dot', type: 'boolean', value: o.startDot || false, onChange: (v) => handlePropertyChange('startDot', v) }, { label: 'End Dot', type: 'boolean', value: o.endDot || false, onChange: (v) => handlePropertyChange('endDot', v) }] }; }

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
      // Helper to expand bounds safely
      const checkBounds = (x: number, y: number, margin: number = 0) => {
        if (x - margin < minX) minX = x - margin;
        if (x + margin > maxX) maxX = x + margin;
        if (y - margin < minY) minY = y - margin;
        if (y + margin > maxY) maxY = y + margin;
      };

      objects.forEach(obj => {
        switch (obj.type) {
          case 'spring':
          case 'line':
          case 'wall': {
            const o = obj as any;
            const w = (o.width || 20) / 2;
            checkBounds(o.start.x, o.start.y, w);
            checkBounds(o.end.x, o.end.y, w);
            break;
          }
          case 'block': {
            const b = obj as BlockObject;
            // Check all 4 corners of unrotated rect + rotation margin approximation
            const diagonal = Math.sqrt(b.size.x ** 2 + b.size.y ** 2) / 2;
            checkBounds(b.center.x, b.center.y, diagonal);
            break;
          }
          case 'circle':
          case 'pulley': {
            const c = obj as any;
            checkBounds(c.center.x, c.center.y, c.radius);
            if (c.type === 'pulley' && c.hasHanger) {
              checkBounds(c.center.x, c.center.y, c.radius + (c.hangerLength || 0));
            }
            break;
          }
          case 'vector': {
            const v = obj as VectorObject;
            checkBounds(v.anchor.x, v.anchor.y, 10);
            checkBounds(v.tip.x, v.tip.y, 20); // Label margin
            break;
          }
          case 'linearmarker': {
            const lm = obj as LinearMarkerObject;
            const margin = 10 + (lm.extensionLength || 0);
            checkBounds(lm.anchor.x, lm.anchor.y, margin);
            checkBounds(lm.tip.x, lm.tip.y, margin);
            break;
          }
          case 'text': {
            const t = obj as TextObject;
            // Text size approximation
            const w = t.content.length * (t.fontSize || 20) * 0.6;
            const h = (t.fontSize || 20);
            checkBounds(t.center.x, t.center.y, Math.max(w, h) / 2 + 10); // Approx center to edge
            break;
          }
          case 'triangle': {
            const tri = obj as TriangleObject;
            checkBounds(tri.p1.x, tri.p1.y);
            checkBounds(tri.p2.x, tri.p2.y);
            checkBounds(tri.p3.x, tri.p3.y);
            break;
          }
          case 'catenary': {
            const cat = obj as CatenaryObject;
            checkBounds(cat.start.x, cat.start.y);
            checkBounds(cat.end.x, cat.end.y);
            // Slack approximation
            const midX = (cat.start.x + cat.end.x) / 2;
            const midY = (cat.start.y + cat.end.y) / 2;
            checkBounds(midX, midY + cat.slack);
            break;
          }
          // Circuit Export Bounds
          case 'wire':
          case 'dcsource':
          case 'resistor':
          case 'inductor':
          case 'capacitor':
          case 'diode':
          case 'switch':
            {
              const o = obj as any;
              const w = (o.width || 40) / 2;
              checkBounds(o.start.x, o.start.y, w);
              checkBounds(o.end.x, o.end.y, w);
              break;
            }
          case 'acsource':
            {
              const o = obj as ACSourceObject;
              checkBounds(o.center.x, o.center.y, o.radius);
              break;
            }
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
    const filename = `vekton_export_${Date.now()}.${format}`;

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
    link.download = `vekton_scene_${Date.now()}.json`;
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



  // Handle Escape Key to Deselect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedIds([]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans bg-white" onMouseUp={onCanvasMouseUp}>

      {/* HEADER */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center z-10 shadow-sm h-12">
        <div className="flex items-center gap-3">
          <h1 className="text-xl text-gray-800 tracking-tight"><span className="font-bold">VEKTON</span> | Physics Illustrator</h1>
          <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">v1.01</span>
        </div>
        <div className="flex gap-2 items-center">
          {/* Phase 14: Drag Hint */}
          {dragIndex !== null && (
            <div className="hidden sm:flex px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded transition-opacity">
              Hold Ctrl to drag freely
            </div>
          )}
          <button onClick={undo} disabled={!canUndo} className={`px-2 py-1 text-xs rounded font-medium transition-colors ${canUndo ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-gray-100 text-gray-400'}`}>Undo (Ctrl+Z)</button>
          <button onClick={redo} disabled={!canRedo} className={`px-2 py-1 text-xs rounded font-medium transition-colors ${canRedo ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-gray-100 text-gray-400'}`}>Redo (Ctrl+Y)</button>
        </div>
      </div>

      <div className="flex-shrink-0 z-20 hover:z-30 relative">
        <Toolbar
          onDelete={handleDelete}
          canDelete={selectedIds.length > 0}
          onDeselect={() => setSelectedIds([])}
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
                    // const isSelected = selectedIds.includes(obj.id);
                    // Pass isSelected to renderers if they support it, or handle here.
                    // Currently renderers don't seem to take 'selected' prop based on previous code.
                    // But we can add overlapping selection box or highlight.
                    // However, user asked for standard feel.
                    // Previous handles logic highlighted handles.
                    // We will keep handles logic below.
                    // Just Render objects standardly.

                    switch (obj.type) {
                      case 'spring':
                        // Enforce new standard spiral look (overriding any legacy state)
                        return <SpringRenderer key={obj.id} start={(obj as SpringObject).start} end={(obj as SpringObject).end} coils={(obj as SpringObject).coils} width={(obj as SpringObject).width} style={(obj as SpringObject).style} label={(obj as SpringObject).label} flipLabel={(obj as SpringObject).flipLabel} fontSize={(obj as SpringObject).fontSize} spiralStart={-90} spiralEnd={90} fontFamily={fontFamily} bold={(obj as SpringObject).bold} italic={(obj as SpringObject).italic} wireRatio={0.2} />;
                      case 'wall':
                        return <WallRenderer key={obj.id} start={(obj as WallObject).start} end={(obj as WallObject).end} hatchAngle={(obj as WallObject).hatchAngle} />;
                      case 'block':
                        return <BlockRenderer key={obj.id} center={(obj as BlockObject).center} size={(obj as BlockObject).size} mass={(obj as BlockObject).massLabel} rotation={(obj as BlockObject).rotation} fontSize={(obj as BlockObject).fontSize} fontFamily={fontFamily} bold={(obj as BlockObject).bold} italic={(obj as BlockObject).italic} />;
                      case 'line':
                        return <SimpleLine key={obj.id} start={(obj as LineObject).start} end={(obj as LineObject).end} color={(obj as LineObject).color} width={(obj as LineObject).width} dashed={(obj as LineObject).dashed} />;
                      case 'catenary':
                        return <CatenaryRenderer key={obj.id} start={(obj as CatenaryObject).start} end={(obj as CatenaryObject).end} slack={(obj as CatenaryObject).slack} color={(obj as CatenaryObject).color} />;
                      case 'pulley':
                        return <PulleyRenderer key={obj.id} center={(obj as PulleyObject).center} radius={(obj as PulleyObject).radius} hasHanger={(obj as PulleyObject).hasHanger} hangerLength={(obj as PulleyObject).hangerLength} hangerAngle={(obj as PulleyObject).hangerAngle} />;
                      case 'vector':
                        return <VectorRenderer key={obj.id} anchor={(obj as VectorObject).anchor} vector={new Vector2((obj as VectorObject).tip.x - (obj as VectorObject).anchor.x, (obj as VectorObject).tip.y - (obj as VectorObject).anchor.y)} label={(obj as VectorObject).label} showComponents={(obj as VectorObject).showComponents} flipLabel={(obj as VectorObject).flipLabel} fontSize={(obj as VectorObject).fontSize} color={(obj as VectorObject).color} fontFamily={fontFamily} bold={(obj as VectorObject).bold} italic={(obj as VectorObject).italic} lineStyle={(obj as VectorObject).lineStyle} strokeWidth={(obj as VectorObject).strokeWidth} headStyle={(obj as VectorObject).headStyle} arrowSize={(obj as VectorObject).arrowSize} arrowWidth={(obj as VectorObject).arrowWidth} />;
                      case 'linearmarker':
                        return <LinearMarkerRenderer key={obj.id} obj={obj as LinearMarkerObject} />;
                      case 'triangle':
                        return <TriangleRenderer key={obj.id} p1={(obj as TriangleObject).p1} p2={(obj as TriangleObject).p2} p3={(obj as TriangleObject).p3} />;
                      case 'circle':
                        return <CircleRenderer key={obj.id} center={(obj as CircleObject).center} radius={(obj as CircleObject).radius} />;
                      case 'text':
                        return <TextRenderer key={obj.id} center={(obj as TextObject).center} content={(obj as TextObject).content} fontSize={(obj as TextObject).fontSize} rotation={(obj as TextObject).rotation} fontFamily={fontFamily} bold={(obj as TextObject).bold} italic={(obj as TextObject).italic} />;

                      // Circuit Renderers
                      case 'wire':
                        return <WireRenderer key={obj.id} start={(obj as WireObject).start} end={(obj as WireObject).end} startDot={(obj as WireObject).startDot} endDot={(obj as WireObject).endDot} showArrow={(obj as WireObject).showArrow} flipArrow={(obj as WireObject).flipArrow} label={(obj as WireObject).label} flipLabel={(obj as WireObject).flipLabel} fontSize={(obj as WireObject).fontSize} fontFamily={fontFamily} bold={(obj as WireObject).bold} italic={(obj as WireObject).italic} />;
                      case 'dcsource':
                        return <DCSourceRenderer key={obj.id} start={(obj as DCSourceObject).start} end={(obj as DCSourceObject).end} cells={(obj as DCSourceObject).cells} showPolarity={(obj as DCSourceObject).showPolarity} flipPolarity={(obj as DCSourceObject).flipPolarity} showTerminals={(obj as DCSourceObject).showTerminals} width={(obj as DCSourceObject).width} spacing={(obj as DCSourceObject).spacing} label={(obj as DCSourceObject).label} flipLabel={(obj as DCSourceObject).flipLabel} fontSize={(obj as DCSourceObject).fontSize} fontFamily={fontFamily} bold={(obj as DCSourceObject).bold} italic={(obj as DCSourceObject).italic} startDot={(obj as DCSourceObject).startDot} endDot={(obj as DCSourceObject).endDot} />;
                      case 'acsource':
                        return <ACSourceRenderer key={obj.id} center={(obj as ACSourceObject).center} radius={(obj as ACSourceObject).radius} label={(obj as ACSourceObject).label} flipLabel={(obj as ACSourceObject).flipLabel} fontSize={(obj as ACSourceObject).fontSize} fontFamily={fontFamily} bold={(obj as ACSourceObject).bold} italic={(obj as ACSourceObject).italic} />;
                      case 'resistor':
                        // Reuse SpringRenderer with zigzag, properly cast
                        return <SpringRenderer key={obj.id} start={(obj as ResistorObject).start} end={(obj as ResistorObject).end} width={(obj as ResistorObject).width} coils={(obj as ResistorObject).coils} style="zigzag" label={(obj as ResistorObject).label} flipLabel={(obj as ResistorObject).flipLabel} fontSize={(obj as ResistorObject).fontSize} fontFamily={fontFamily} bold={(obj as ResistorObject).bold} italic={(obj as ResistorObject).italic} strokeColor="#000" startDot={(obj as ResistorObject).startDot} endDot={(obj as ResistorObject).endDot} />;
                      case 'inductor':
                        // Reuse SpringRenderer with spiral
                        return <SpringRenderer key={obj.id} start={(obj as InductorObject).start} end={(obj as InductorObject).end} width={(obj as InductorObject).width} coils={(obj as InductorObject).coils} style="spiral" label={(obj as InductorObject).label} flipLabel={(obj as InductorObject).flipLabel} fontSize={(obj as InductorObject).fontSize} fontFamily={fontFamily} bold={(obj as InductorObject).bold} italic={(obj as InductorObject).italic} strokeColor="#000" startDot={(obj as InductorObject).startDot} endDot={(obj as InductorObject).endDot} spiralStart={(obj as InductorObject).spiralStart} spiralEnd={(obj as InductorObject).spiralEnd} wireRatio={(obj as InductorObject).wireRatio} />;
                      case 'capacitor':
                        return <CapacitorRenderer key={obj.id} start={(obj as CapacitorObject).start} end={(obj as CapacitorObject).end} width={(obj as CapacitorObject).width} separation={(obj as CapacitorObject).separation} label={(obj as CapacitorObject).label} flipLabel={(obj as CapacitorObject).flipLabel} fontSize={(obj as CapacitorObject).fontSize} fontFamily={fontFamily} bold={(obj as CapacitorObject).bold} italic={(obj as CapacitorObject).italic} startDot={(obj as CapacitorObject).startDot} endDot={(obj as CapacitorObject).endDot} />;
                      case 'diode':
                        return <DiodeRenderer key={obj.id} start={(obj as DiodeObject).start} end={(obj as DiodeObject).end} scale={(obj as DiodeObject).scale} label={(obj as DiodeObject).label} flipLabel={(obj as DiodeObject).flipLabel} fontSize={(obj as DiodeObject).fontSize} fontFamily={fontFamily} bold={(obj as DiodeObject).bold} italic={(obj as DiodeObject).italic} startDot={(obj as DiodeObject).startDot} endDot={(obj as DiodeObject).endDot} />;
                      case 'switch':
                        return <SwitchRenderer key={obj.id} start={(obj as SwitchObject).start} end={(obj as SwitchObject).end} isOpen={(obj as SwitchObject).isOpen} angle={(obj as SwitchObject).angle} label={(obj as SwitchObject).label} flipLabel={(obj as SwitchObject).flipLabel} fontSize={(obj as SwitchObject).fontSize} fontFamily={fontFamily} bold={(obj as SwitchObject).bold} italic={(obj as SwitchObject).italic} startDot={(obj as SwitchObject).startDot} endDot={(obj as SwitchObject).endDot} />;

                      default: return null;
                    }
                  })}

                {/* --- SELECTION BOX --- */}
                {selectionBox && (
                  <rect
                    x={Math.min(selectionBox.start.x, selectionBox.end.x)}
                    y={Math.min(selectionBox.start.y, selectionBox.end.y)}
                    width={Math.abs(selectionBox.end.x - selectionBox.start.x)}
                    height={Math.abs(selectionBox.end.y - selectionBox.start.y)}
                    fill="rgba(59, 130, 246, 0.1)"
                    stroke="rgba(59, 130, 246, 0.5)"
                    strokeWidth={1 / zoom}
                    strokeDasharray={`${4 / zoom} ${2 / zoom}`}
                    pointerEvents="none"
                  />
                )}

                {/* --- HANDLES --- */}
                {handles.map((h, i) => {
                  const isDragging = dragIndex === i;
                  const isSelectedObj = selectedIds.includes(h.objectId);

                  // Phase 11 Refinement: Handles controlled by showSnap toggle
                  if (!showSnap) return null;

                  return (
                    <circle
                      key={i}
                      cx={h.position.x} cy={h.position.y}
                      r={isDragging ? 3 / zoom : (isSelectedObj && h.handleType === 'center' ? 3 / zoom : 2.5 / zoom)}
                      // Dragging: Slightly more opaque red. Selected: Transparent Blue. Idle: Transparent White
                      fill={isDragging ? 'rgba(255, 0, 0, 0.4)' : (isSelectedObj ? 'rgba(37, 99, 235, 0.3)' : 'rgba(255, 255, 255, 0.2)')}
                      stroke={isSelectedObj ? 'rgba(37, 99, 235, 0.5)' : (isDragging ? 'white' : 'rgba(0,0,0,0.1)')}
                      // Wait, if not selected, we want it barely visible or white with border?
                      // Original: fill white, stroke blue if selected.
                      // Let's stick to standard:
                      // Unselected: White fill, Light Grey stroke
                      // Selected: Blue fill, Blue stroke
                      // Dragging: Red fill
                      // BUT, handles are on top.
                      // Let's use:
                      // Selected Object Handle: Fill Blue
                      // Unselected Object Handle: Fill White, Stroke Grey (or invisible until hover? No, always visible if snap on)

                      style={{ cursor: 'pointer' }}
                      strokeWidth={1.5 / zoom}
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

              {/* Angle Display Overlay - Positioned Relative to Canvas */}
              {typeof dragIndex === 'number' && (() => {
                const handle = handles[dragIndex];
                if (!handle) return null;
                const obj = objects.find(o => o.id === handle.objectId);
                if (!obj) return null;

                if (!['wall', 'spring', 'line', 'vector', 'triangle', 'linearmarker', 'text', 'block'].includes(obj.type)) return null;

                const calcAngle = (p1: Point, p2: Point) => {
                  const dx = p2.x - p1.x;
                  const dy = p2.y - p1.y;
                  let theta = Math.atan2(dy, dx) * 180 / Math.PI;
                  if (theta < 0) theta += 180;
                  // User Request: 180 - x (Positive slope 0-90)
                  // Horizontal (0 from prev) -> 180 -> 0 logic
                  let displayTheta = 180 - theta;
                  if (displayTheta >= 179.95) displayTheta = 0;

                  return displayTheta.toFixed(1);
                };

                let text = '';
                if (obj.type === 'triangle') {
                  const t = obj as TriangleObject;
                  if (handle.handleType === 'p1') text = `${calcAngle(t.p1, t.p2)}°, ${calcAngle(t.p1, t.p3)}°`;
                  else if (handle.handleType === 'p2') text = `${calcAngle(t.p2, t.p1)}°, ${calcAngle(t.p2, t.p3)}°`;
                  else if (handle.handleType === 'p3') text = `${calcAngle(t.p3, t.p1)}°, ${calcAngle(t.p3, t.p2)}°`;
                  else return null;
                } else if (obj.type === 'text') {
                  const t = obj as TextObject;
                  // If dragging center, no angle. If dragging rotate handle, show angle.
                  if (handle.handleType === 'rotate') {
                    // Current rotation in degrees
                    let deg = (t.rotation || 0) * 180 / Math.PI;
                    // Normalize to 0-360 or -180 to 180?
                    // User said: "Text horizontal is 0".
                    // Standard: 0 (Right), 90 (Down/Clockwise) usually in SVG/Canvas y-down?
                    // Let's just show standard degrees for now, 
                    // maybe normalize to positive?
                    deg = deg % 360;
                    if (deg < 0) deg += 360;
                    text = deg.toFixed(1) + '°';
                  } else {
                    return null;
                  }
                } else if (obj.type === 'block') {
                  const b = obj as BlockObject;
                  if (handle.handleType === 'rotate') {
                    // Block Rotation Display
                    let deg = (b.rotation || 0) * 180 / Math.PI;
                    deg = deg % 360;
                    if (deg < 0) deg += 360;
                    text = deg.toFixed(1) + '°';
                  } else {
                    return null;
                  }
                } else {
                  let p1, p2;
                  if (obj.type === 'vector' || obj.type === 'linearmarker') {
                    const v = obj as any; // VectorObject or LinearMarkerObject
                    p1 = v.anchor; p2 = v.tip;
                  } else {
                    const o = obj as any;
                    p1 = o.start; p2 = o.end;
                  }
                  text = calcAngle(p1, p2) + '°';
                }

                if (!text) return null;

                return (
                  <div
                    className="absolute z-50 pointer-events-none bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded shadow-sm"
                    style={{
                      left: (cursor.x * 2 * zoom) + 16,
                      top: (cursor.y * 2 * zoom) + 16,
                    }}
                  >
                    {text}
                  </div>
                );
              })()}
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

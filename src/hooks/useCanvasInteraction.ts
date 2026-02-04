/**
 * useCanvasInteraction.ts
 * Hook for handling mouse events on the SVG canvas.
 * Integrates SnappingSystem and Drag & Drop.
 */

import { useState, useCallback } from 'react';
import type { RefObject } from 'react';
import { Vector2, Point } from '../geometry/Vector2';
import { getSnapCandidate } from '../logic/SnappingSystem';
import type { SnapResult } from '../logic/SnappingSystem';
import type { PhysicsObject } from '../types/PhysicsObjects';
import type { HandleDef } from '../types/Interactions';

export function useCanvasInteraction(
    canvasRef: RefObject<HTMLDivElement | null>,
    handles: HandleDef[] = [],
    scene: PhysicsObject[] = [],
    onPointMove?: (index: number, newPos: Point, modifiers?: { ctrl: boolean, shift: boolean }) => void,
    onDragStart?: () => void,
    gridSize: number = 50,
    scale: number = 1
) {
    const [cursor, setCursor] = useState<Point>(new Vector2(0, 0));
    const [snapInfo, setSnapInfo] = useState<SnapResult | null>(null);

    // Dragging State
    const [dragState, setDragState] = useState<{
        type: 'handle' | 'box',
        index?: number, // for handle
        start?: Point,  // for box
        end?: Point     // for box
    } | null>(null);

    // Helper to get relative coordinates from the canvas element (via ref)
    const getMousePos = useCallback((e: React.MouseEvent) => {
        if (!canvasRef.current) return new Vector2(0, 0);
        const rect = canvasRef.current.getBoundingClientRect();
        return new Vector2(
            (e.clientX - rect.left) / scale,
            (e.clientY - rect.top) / scale
        );
    }, [canvasRef, scale]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const rawPoint = getMousePos(e); // Vector2

        // 1. If Dragging Handle
        if (dragState?.type === 'handle' && dragState.index !== undefined && onPointMove) {
            const dragIndex = dragState.index;
            const currentHandle = handles[dragIndex];
            const isSnappingDisabled = e.ctrlKey || e.metaKey;

            if (!currentHandle || isSnappingDisabled) {
                // No snapping
                onPointMove(dragIndex, rawPoint, { ctrl: e.ctrlKey || e.metaKey, shift: e.shiftKey });
                setCursor(rawPoint);
                setSnapInfo(null);
                return;
            }

            // Prepare Context
            let context: { anchor?: Vector2 } | undefined;
            if (currentHandle.handleType === 'tip') {
                const anchorHandle = handles.find(h => h.objectId === currentHandle.objectId && h.handleType === 'start');
                if (anchorHandle) {
                    context = { anchor: new Vector2(anchorHandle.position.x, anchorHandle.position.y) };
                }
            }

            let useSmartSnapping = true;
            const obj = scene.find(o => o.id === currentHandle.objectId);
            if (obj && obj.type === 'vector' && (obj as import('../types/PhysicsObjects').VectorObject).smartSnapping === false) {
                useSmartSnapping = false;
            }

            // Call Logic
            const snap = getSnapCandidate(
                scene,
                rawPoint,
                currentHandle.objectId,
                20, // Threshold
                context,
                useSmartSnapping
            );

            let finalPos = snap.position;
            let finalSnapInfo = snap;

            if (snap.snappedTo === 'none') {
                // Grid Snap
                const gx = Math.round(rawPoint.x / gridSize) * gridSize;
                const gy = Math.round(rawPoint.y / gridSize) * gridSize;
                const gridPos = new Vector2(gx, gy);
                if (rawPoint.distanceTo(gridPos) < 20) {
                    finalPos = gridPos;
                    finalSnapInfo = { position: gridPos, snappedTo: 'grid' };
                }
            }

            // Notify Parent
            // Calculate modifiers
            const modifiers = {
                ctrl: e.ctrlKey || e.metaKey,
                shift: e.shiftKey
            };
            // Note: onPointMove signature in App.tsx needs these? 
            // Or we update the hook signature? Current hook signature: 
            // onPointMove?: (index: number, newPos: Point) => void
            // We need to change the type definition in hook or just pass it as 3rd arg if supported.
            // But hook defines onPointMove type. We should update that type definition first?
            // Actually, we can update the type definition in the replacement content here if it appears in the block.
            // But line 19 defines it. Let's do it in two steps or check if we can reach line 19.
            // For now, let's update the call assuming we will update the type definition too.
            // Wait, I should update the Type Definition FIRST or in the same step if possible.
            // Line 19 is far away.
            // Let's defer this specific replace and first update the type definition.
            onPointMove(dragIndex, finalPos, modifiers);
            setCursor(finalPos);
            setSnapInfo(finalSnapInfo);
        }
        // 2. If Box Selecting
        else if (dragState?.type === 'box') {
            setDragState(prev => prev ? { ...prev, end: rawPoint } : null);
            setCursor(rawPoint);
        }
        // 3. Just Hovering
        else {
            setCursor(rawPoint);
        }
    }, [dragState, handles, scene, onPointMove, gridSize, scale, getMousePos]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        // Check if we are close to a point to grab it
        const clickPoint = getMousePos(e);

        // Check handles
        let bestIdx = -1;
        let bestDist = 15 / scale;

        handles.forEach((h, i) => {
            const p = new Vector2(h.position.x, h.position.y);
            const d = p.distanceTo(clickPoint);
            if (d < bestDist) {
                bestDist = d;
                bestIdx = i;
            }
        });

        if (bestIdx !== -1) {
            if (onDragStart) onDragStart(); // Notify start
            setDragState({ type: 'handle', index: bestIdx });
            e.preventDefault();
        } else {
            // Start Box Selection
            setDragState({ type: 'box', start: clickPoint, end: clickPoint });
            e.preventDefault();
        }
    }, [handles, onDragStart, scale, getMousePos]);

    const handleMouseUp = useCallback(() => {
        setDragState(null);
        setSnapInfo(null);
    }, []);

    return {
        cursor,
        snapInfo,
        dragIndex: dragState?.type === 'handle' ? dragState.index : null,
        selectionBox: dragState?.type === 'box' && dragState.start && dragState.end ? { start: dragState.start, end: dragState.end } : null,
        handleMouseMove,
        handleMouseDown,
        handleMouseUp
    };
}

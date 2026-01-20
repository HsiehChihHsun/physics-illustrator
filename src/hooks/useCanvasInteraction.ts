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
    onPointMove?: (index: number, newPos: Point) => void,
    onDragStart?: () => void,
    gridSize: number = 50,
    scale: number = 1
) {
    const [cursor, setCursor] = useState<Point>(new Vector2(0, 0));
    const [snapInfo, setSnapInfo] = useState<SnapResult | null>(null);

    // Dragging State
    const [dragIndex, setDragIndex] = useState<number | null>(null);

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

        // 1. If Dragging, we enforce the move
        if (dragIndex !== null && onPointMove) {
            const currentHandle = handles[dragIndex];
            const isSnappingDisabled = e.ctrlKey || e.metaKey;

            if (!currentHandle || isSnappingDisabled) {
                // No snapping
                onPointMove(dragIndex, rawPoint);
                setCursor(rawPoint);
                setSnapInfo(null);
                return;
            }

            // Prepare Context
            // If dragging Tip, we need Anchor.
            let context: { anchor?: Vector2 } | undefined;
            if (currentHandle.handleType === 'tip') {
                // Find potential anchor from same object
                // We can search handles or the object itself.
                // Searching handles is generic.
                const anchorHandle = handles.find(h => h.objectId === currentHandle.objectId && h.handleType === 'start');
                if (anchorHandle) {
                    context = { anchor: new Vector2(anchorHandle.position.x, anchorHandle.position.y) };
                }
            }

            // Determine Smart Snapping Preference
            // Default to true if undefined, unless we want to force explicit opt-in.
            // Let's check the objects involved.
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

            // If Logic returns 'none', maybe fallback to Grid?
            // The Logic `getSnapCandidate` currently returns 'none' if no object snap.
            // We should add Grid Snap fallback here or inside logic.
            // Let's add Grid Fallback here for simplicity.

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
            onPointMove(dragIndex, finalPos);

            setCursor(finalPos);
            setSnapInfo(finalSnapInfo);
        }
        // 2. Just Hovering
        else {
            setCursor(rawPoint);
        }
    }, [dragIndex, handles, scene, onPointMove, gridSize, scale, getMousePos]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        // Check if we are close to a point to grab it
        const clickPoint = getMousePos(e);

        // Check points for hit testing (radius 15px interaction / visual is smaller)
        let bestIdx = -1;
        let bestDist = 15 / scale; // Adjust hit radius by scale? No, hit test usually in screen px or consistent units.

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
            setDragIndex(bestIdx);
            e.preventDefault();
        }
    }, [handles, onDragStart, scale, getMousePos]);

    const handleMouseUp = useCallback(() => {
        setDragIndex(null);
        setSnapInfo(null);
    }, []);

    return {
        cursor,
        snapInfo,
        dragIndex,
        handleMouseMove,
        handleMouseDown,
        handleMouseUp
    };
}

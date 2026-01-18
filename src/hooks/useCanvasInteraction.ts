/**
 * useCanvasInteraction.ts
 * Hook for handling mouse events on the SVG canvas.
 * Integrates SnappingSystem and Drag & Drop.
 */

import { useState, useCallback } from 'react';
import type { RefObject } from 'react';
import { Vector2, Point } from '../geometry/Vector2';
import { SnappingSystem } from '../geometry/SnappingSystem';
import type { SnapResult } from '../geometry/SnappingSystem';

export function useCanvasInteraction(
    canvasRef: RefObject<HTMLDivElement | null>,
    interestingPoints: Point[] = [],
    onPointMove?: (index: number, newPos: Point) => void,
    onDragStart?: () => void,
    gridSize: number = 50,
    scale: number = 1 // New Argument for scale factor
) {
    const [cursor, setCursor] = useState<Point>(new Vector2(0, 0));
    const [snapInfo, setSnapInfo] = useState<SnapResult | null>(null);

    // Dragging State
    const [dragIndex, setDragIndex] = useState<number | null>(null);

    // Helper to get relative coordinates from the canvas element (via ref)
    const getMousePos = (e: React.MouseEvent) => {
        if (!canvasRef.current) return new Vector2(0, 0);
        const rect = canvasRef.current.getBoundingClientRect();
        return new Vector2(
            (e.clientX - rect.left) / scale,
            (e.clientY - rect.top) / scale
        );
    };

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const rawPoint = getMousePos(e);

        // 1. If Dragging, we enforce the move
        if (dragIndex !== null && onPointMove) {
            // When dragging, we still want to snap the DESTINATION
            // But we exclude the point itself from "self-snapping" usually
            // For simplicity, we snap against ALL points (including self, which is fine, distance=0)
            // or we could filter it out.

            // Let's filter out the point we are dragging from the snap targets to avoid jitter
            // although 'interestingPoints' comes from props, so we just pass it all for now.
            const currentPointsWithoutSelf = interestingPoints.filter((_, i) => i !== dragIndex);

            // Check for "Disable Snapping" modifier (Ctrl or Cmd)
            const isSnappingDisabled = e.ctrlKey || e.metaKey;

            const snap = SnappingSystem.snap(
                rawPoint,
                currentPointsWithoutSelf,
                { ...SnappingSystem.defaultConfig, enabled: !isSnappingDisabled, gridSize }
            );

            // Notify Parent
            onPointMove(dragIndex, snap.position);

            setCursor(snap.position);
            setSnapInfo(snap);
        }
        // 2. Just Hovering
        else {
            // Check for "Disable Snapping" modifier
            const isSnappingDisabled = e.ctrlKey || e.metaKey;

            const snap = SnappingSystem.snap(
                rawPoint,
                interestingPoints,
                { ...SnappingSystem.defaultConfig, enabled: !isSnappingDisabled, gridSize }
            );
            setCursor(snap.position);
            setSnapInfo(snap);
        }
    }, [dragIndex, interestingPoints, onPointMove, gridSize]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        // Check if we are close to a point to grab it
        const clickPoint = getMousePos(e);

        // Check points for hit testing (radius 10px)
        let bestIdx = -1;
        let bestDist = 15; // Hit radius

        interestingPoints.forEach((p, i) => {
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
    }, [interestingPoints, onDragStart]);

    const handleMouseUp = useCallback(() => {
        setDragIndex(null);
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


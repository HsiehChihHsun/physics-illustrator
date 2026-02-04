import React from 'react';
import { Vector2 } from '../geometry/Vector2';
import { MathLabel } from './MathLabel';
import type { LinearMarkerObject } from '../types/PhysicsObjects';

interface LinearMarkerRendererProps {
    obj: LinearMarkerObject;
}

export const LinearMarkerRenderer: React.FC<LinearMarkerRendererProps> = ({ obj }) => {
    const {
        anchor,
        tip: rawTip,
        label,
        color = 'black',
        fontSize = 20,
        showOneArrow = false,
        textOnLine = false,
        dashedExtension = false,
        showExtensions = true,
        extensionLength = 0,
        strokeWidth = 2,
        bold,
        italic,
        // New Props
        flipLabel = false,
        arrowSize = 16,
        arrowWidth = 12,
        flipExtension = false,
        labelShiftX = 0
    } = obj;

    const start = new Vector2(anchor.x, anchor.y);
    const end = new Vector2(rawTip.x, rawTip.y);
    const vector = end.subtract(start);
    const len = vector.length();

    if (len < 1) return null;

    const dir = vector.normalize();
    const perp = new Vector2(-dir.y, dir.x); // rotated 90 deg counter-clockwise

    // Arrow Config
    // User requested "Head Length" and "Head Width" controls.
    // We adjust them slightly with strokeWidth to match Vector style if needed, or just use raw.
    // Vector Renderer does: arrowSize + (strokeWidth - 3) * 0.5. Let's keep consistency.
    const finalHeadLen = arrowSize + (strokeWidth - 3) * 0.5;
    const finalHeadWidth = arrowWidth + (strokeWidth - 3) * 0.5;

    // Draw Arrow Helper
    const drawArrow = (point: Vector2, direction: Vector2) => {
        const base = point.subtract(direction.multiply(finalHeadLen));
        const side1 = base.add(perp.multiply(finalHeadWidth / 2));
        const side2 = base.subtract(perp.multiply(finalHeadWidth / 2));
        return `M ${side1.x} ${side1.y} L ${point.x} ${point.y} L ${side2.x} ${side2.y} Z`;
    };

    // Extension Lines
    // User said: "Vertical line default length is 4 units" (not pixels).
    // 1 Unit = 6.25px. So 4 units = 25px.
    const UNIT_PX = 6.25;
    const baseExtSize = 4 * UNIT_PX; // 25px

    // We need to extend this line to one side using 'extensionLength' (also in units?).
    // User said "extension line (0~20 units)".
    const additionalExtParam = (extensionLength || 0) * UNIT_PX;

    // Direction of extension
    // Logic: The "vertical line" crosses the arrow tip.
    // It goes from "a bit inside" to "extended outside".
    // Let's assume standard dimension line:
    // Gap: Usually there is a gap between object and extension line start. But here, the Marker IS the thing.
    // So we just draw a line perpendicular to the arrow.

    // By default: 2 units "up" (perp) and (2 + extension) units "down" (-perp)? 
    // Or centered?
    // User: "vertical line (4 units)... extension line... extending to one of the sides".
    // Let's center the base 4 units (2 up, 2 down).
    // Then add extension to ONE side. Which side?
    // Defaults: "down" or "right" (negative perp).
    // flipExtension toggles this.

    // Wait, if I flip, I want the extension to grow in the OTHER direction.

    // Base line: 
    // Center = point.
    // P1 = point + perp * 2 units
    // P2 = point - perp * 2 units
    // If we extend, we add to P2 (if default direction is down).

    // Let's refine:
    // Side A (The "Back" side, usually towards the label?): 2 units.
    // Side B (The "Extension" side): 2 units + extensionLength.
    // If flipExtension is false: Extend "Down" (-perp).
    // If flipExtension is true: Extend "Up" (perp).

    const halfBase = baseExtSize / 2;

    const renderExtension = (point: Vector2) => {
        // Calculate the two ends relative to point
        // One side is fixed at halfBase.
        // The other side is halfBase + additionalExtParam.

        // Which side is extended? 
        // If flipExtension: Extend in POSITIVE perp direction.
        // Else: Extend in NEGATIVE perp direction.

        let pStart, pEnd;

        if (flipExtension) {
            // Extend UP (positive perp)
            // Bottom end (fixed): point - perp * halfBase
            // Top end (extended): point + perp * (halfBase + additionalExtParam)
            pStart = point.subtract(perp.multiply(halfBase));
            pEnd = point.add(perp.multiply(halfBase + additionalExtParam));
        } else {
            // Extend DOWN (negative perp) -> Default
            // Top end (fixed): point + perp * halfBase
            // Bottom end (extended): point - perp * (halfBase + additionalExtParam)
            pStart = point.add(perp.multiply(halfBase));
            pEnd = point.subtract(perp.multiply(halfBase + additionalExtParam));
        }

        return (
            <line
                x1={pStart.x} y1={pStart.y}
                x2={pEnd.x} y2={pEnd.y}
                stroke={color}
                strokeWidth={Math.max(1, strokeWidth - 1)}
                strokeDasharray={dashedExtension ? "4 2" : undefined}
            />
        );
    };

    // Label Position
    // Logic from VectorRenderer:
    // const mid = new Vector2(anchor.x, anchor.y).add(vector.div(2));
    // const perpLabel = new Vector2(-vector.y, vector.x).normalize();
    // const labelOffsetDir = flipLabel ? -1 : 1;
    // const labelPos = mid.add(perpLabel.multiply(20 * labelOffsetDir));

    const mid = start.add(vector.div(2));
    let labelPos = mid;

    if (!textOnLine) {
        // Offset Logic
        const labelOffsetDist = 20; // Standard offset
        // Direction:
        // Vector stores perp as (-y, x) which is 90 deg CCW.
        // Standard "Top" is -y.
        // If vector is (1, 0) [Right], perp is (0, 1) [Down]. Wait. (0, 1) in SVG is Down.
        // Vector2(x, y). 
        // If Right: (1, 0). Perp: (-0, 1) = (0, 1) = Down.
        // If flipLabel is false (Default), we usually want "Above"? 
        // VectorRenderer: labelPos = mid.add(perpLabel.multiply(20 * labelOffsetDir));
        // labelOffsetDir = flipLabel ? -1 : 1.
        // So default (1) moves in 'perp' direction (Down).
        // If user wants "Above" (Up), they might need flip?
        // Wait, "Dimension Lines" usually put text ABOVE the line.
        // For a horizontal line, Above is -Y.
        // Perp is +Y (Down).
        // So VectorRenderer default puts it BELOW?
        // Now I am using it.

        // Wait, flipLabel should be independent of flipExtension? 
        // User asked for "Flip Extension Side" separately.
        // "flipLabel" is for text.
        // Let's use the explicit `flipLabel` prop.

        const labelPerp = perp; // (0, 1) for Right vector.
        // If I want "Above", I want (0, -1). So -perp.
        // If flipLabel is true, I want (0, 1).

        // Let's try: Default = -perp (Above).
        const finalLabelDir = flipLabel ? 1 : -1;

        labelPos = mid.add(labelPerp.multiply(labelOffsetDist * finalLabelDir));
    }

    // Apply X Shift (Horizontal Shift)
    if (labelShiftX) {
        labelPos = new Vector2(labelPos.x + labelShiftX * UNIT_PX, labelPos.y);
    }

    // Calculate Shaft Ends so they don't overlap the sharp arrow tip
    let shaftStart = start;
    let shaftEnd = end;

    // Shorten end (Tip)
    shaftEnd = end.subtract(dir.multiply(finalHeadLen));

    // Shorten start if double arrow
    if (!showOneArrow) {
        shaftStart = start.add(dir.multiply(finalHeadLen));
    }

    return (
        <g>
            {/* Extension Lines */}
            {showExtensions && (
                <>
                    {renderExtension(start)}
                    {renderExtension(end)}
                </>
            )}

            {/* Main Line */}
            <line
                x1={shaftStart.x} y1={shaftStart.y}
                x2={shaftEnd.x} y2={shaftEnd.y}
                stroke={color}
                strokeWidth={strokeWidth}
            />

            {/* Arrows */}
            {/* Tip Arrow */}
            <path d={drawArrow(end, dir)} fill={color} />

            {/* Start Arrow */}
            {!showOneArrow && (
                <path d={drawArrow(start, dir.multiply(-1))} fill={color} />
            )}

            {/* Text Background (if on line) */}
            {textOnLine && label && (
                <rect
                    x={labelPos.x - (label.length * fontSize * 0.3 + 4)}
                    y={labelPos.y - (fontSize * 0.6)}
                    width={label.length * fontSize * 0.6 + 8}
                    height={fontSize * 1.2}
                    fill="white" // Opaque background
                    rx="4"
                />
            )}

            {/* Label */}
            {label && (
                <MathLabel
                    center={labelPos}
                    content={label}
                    color={color}
                    fontSize={fontSize}
                    bold={bold}
                    italic={italic}
                />
            )}
        </g>
    );
};

import React from 'react';
import { Vector2 } from '../geometry/Vector2';
import { MathLabel } from './MathLabel';

interface WireRendererProps {
    start: { x: number, y: number };
    end: { x: number, y: number };
    startDot?: boolean;
    endDot?: boolean;
    showArrow?: boolean;
    flipArrow?: boolean;
    label?: string;
    flipLabel?: boolean;
    fontSize?: number;
    fontFamily?: 'Inter' | 'STIX Two Text';
    bold?: boolean;
    italic?: boolean;
    color?: string; // Default black
    width?: number; // Visual width, default 2
}

export const WireRenderer: React.FC<WireRendererProps> = ({
    start,
    end,
    startDot = false,
    endDot = false,
    showArrow = false,
    flipArrow = false,
    label,
    flipLabel = false,
    fontSize = 20,
    fontFamily = 'Inter',
    bold = false,
    italic = false,
    color = 'black',
    width = 2
}) => {
    const startVec = new Vector2(start.x, start.y);
    const endVec = new Vector2(end.x, end.y);
    const diff = endVec.subtract(startVec);
    const mid = startVec.add(diff.multiply(0.5));
    const length = diff.length();
    const dir = diff.normalize();
    const perp = new Vector2(-dir.y, dir.x);

    // Label Position
    const labelOffsetDir = flipLabel ? -1 : 1;
    const labelPos = mid.add(perp.multiply(20 * labelOffsetDir));

    // Arrow Geometry
    const arrowSize = 12;
    const arrowDir = flipArrow ? dir.multiply(-1) : dir;
    // Arrow centered at midpoint
    const arrowTip = mid.add(arrowDir.multiply(arrowSize * 0.5));
    const arrowBase = mid.add(arrowDir.multiply(-arrowSize * 0.5));
    const arrowP1 = arrowBase.add(perp.multiply(arrowSize * 0.4));
    const arrowP2 = arrowBase.subtract(perp.multiply(arrowSize * 0.4));

    // Draw the arrow visually: Tip, P1, P2
    // We can draw it as a filled polygon or lines. Let's do filled.
    // However, SVG "arrow" style is often just lines. Let's make it a distinct filled triangle on top.

    // Dot Radius
    const dotRadius = Math.max(width * 1.5, 3.5);

    return (
        <g>
            {/* Main Line */}
            <line
                x1={start.x} y1={start.y}
                x2={end.x} y2={end.y}
                stroke={color}
                strokeWidth={width}
                strokeLinecap="round"
            />

            {/* Connection Dots */}
            {startDot && (
                <circle cx={start.x} cy={start.y} r={dotRadius} fill={color} />
            )}
            {endDot && (
                <circle cx={end.x} cy={end.y} r={dotRadius} fill={color} />
            )}

            {/* Current Arrow (Triangle) */}
            {showArrow && length > arrowSize && (
                <path
                    d={`M ${arrowTip.x} ${arrowTip.y} L ${arrowP1.x} ${arrowP1.y} L ${arrowP2.x} ${arrowP2.y} Z`}
                    fill={color}
                />
            )}

            {/* Label */}
            {label && (
                <MathLabel
                    center={labelPos}
                    content={label}
                    fontSize={fontSize}
                    fontFamily={fontFamily}
                    bold={bold}
                    italic={italic}
                    color={color}
                />
            )}
        </g>
    );
};

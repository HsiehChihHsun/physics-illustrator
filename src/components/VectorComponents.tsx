import React from 'react';
import { Vector2 } from '../geometry/Vector2';

interface VectorRendererProps {
    anchor: { x: number, y: number };
    vector: Vector2;
    label?: string;
    showComponents?: boolean;
    color?: string; // Default 'black'
    flipLabel?: boolean;
    fontSize?: number;
}

export const VectorRenderer: React.FC<VectorRendererProps> = ({
    anchor,
    vector,
    label,
    showComponents = false,
    color = 'black',
    flipLabel = false,
    fontSize = 20
}) => {
    const tip = vector.add(new Vector2(anchor.x, anchor.y));
    const len = vector.length();

    if (len < 1) return null;

    // Arrow Geometry
    const arrowSize = 12;
    const angle = Math.atan2(vector.y, vector.x);

    // Shorten the shaft so it doesn't poke through the tip
    const shaftEnd = new Vector2(
        tip.x - Math.cos(angle) * (arrowSize - 2),
        tip.y - Math.sin(angle) * (arrowSize - 2)
    );

    const tip1 = new Vector2(
        tip.x - arrowSize * Math.cos(angle - Math.PI / 6),
        tip.y - arrowSize * Math.sin(angle - Math.PI / 6)
    );
    const tip2 = new Vector2(
        tip.x - arrowSize * Math.cos(angle + Math.PI / 6),
        tip.y - arrowSize * Math.sin(angle + Math.PI / 6)
    );

    // Label Position
    const mid = new Vector2(anchor.x, anchor.y).add(vector.div(2));
    const perp = new Vector2(-vector.y, vector.x).normalize();
    const labelOffsetDir = flipLabel ? -1 : 1;
    const labelPos = mid.add(perp.multiply(20 * labelOffsetDir));

    return (
        <g>
            {/* Components */}
            {showComponents && (
                <>
                    <line x1={anchor.x} y1={anchor.y} x2={tip.x} y2={anchor.y} stroke={color} strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
                    <line x1={tip.x} y1={anchor.y} x2={tip.x} y2={tip.y} stroke={color} strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
                </>
            )}

            {/* Shaft */}
            <line
                x1={anchor.x} y1={anchor.y}
                x2={shaftEnd.x} y2={shaftEnd.y} // Use shortened end
                stroke={color}
                strokeWidth="3"
                markerEnd="none"
            />
            {/* Arrow Head */}
            <path
                d={`M ${tip.x} ${tip.y} L ${tip1.x} ${tip1.y} L ${tip2.x} ${tip2.y} Z`}
                fill={color}
            />

            {/* Label */}
            {label && (
                <text
                    x={labelPos.x}
                    y={labelPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={color}
                    className="select-none pointer-events-none font-sans font-bold"
                    style={{ fontSize: fontSize }}
                >
                    {label}
                </text>
            )}
        </g>
    );
};

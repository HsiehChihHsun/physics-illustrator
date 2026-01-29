import React from 'react';
import { Vector2 } from '../geometry/Vector2';
import { MathLabel } from './MathLabel';

interface VectorRendererProps {
    anchor: { x: number, y: number };
    vector: Vector2;
    label?: string;
    showComponents?: boolean;
    color?: string; // Default 'black'
    flipLabel?: boolean;
    fontSize?: number;
    fontFamily?: 'Inter' | 'STIX Two Text';
    bold?: boolean;
    italic?: boolean;
}


export const VectorRenderer: React.FC<VectorRendererProps & { lineStyle?: 'solid' | 'dashed', strokeWidth?: number, headStyle?: 'filled' | 'hollow' | 'simple', arrowSize?: number, arrowWidth?: number }> = ({
    anchor,
    vector,
    label,
    showComponents = false,
    color = 'black',
    flipLabel = false,
    fontSize = 20,
    fontFamily = 'Inter',
    bold = false,
    italic = false,
    lineStyle = 'solid',
    strokeWidth = 3,
    headStyle = 'filled',
    arrowSize = 16, // Default length 16
    arrowWidth = 12 // Default width 12
}) => {
    const tip = vector.add(new Vector2(anchor.x, anchor.y));
    const len = vector.length();

    if (len < 1) return null;

    // Arrow Geometry Logic Adjustment for "Sharpness"
    // User wants "Head Length" to control sharpness. 
    // This implies that as Length increases, Width should NOT increase proportionally (or stays constant).

    // 1. Calculate direction and perpendicular
    const dir = vector.normalize();
    const perp = new Vector2(-dir.y, dir.x);

    // 2. Determine Head Dimensions
    // Length is directly controlled by arrowSize properties.
    const headLength = arrowSize + (strokeWidth - 3) * 0.5; // Minimal adjustment for stroke

    // Width: controlled by arrowWidth property.
    // Scale slightly with strokeWidth to maintain proportions if thickness increases
    const headWidth = arrowWidth + (strokeWidth - 3) * 0.5;

    // 3. Calculate Points
    const headBaseCenter = tip.subtract(dir.multiply(headLength));
    const tip1 = headBaseCenter.add(perp.multiply(headWidth / 2));
    const tip2 = headBaseCenter.subtract(perp.multiply(headWidth / 2));

    // 4. Shaft End
    // Calculate shaft end based on head style
    let shaftEnd = headBaseCenter;

    if (headStyle === 'simple') {
        // For simple arrow, shaft goes to tip (or very close)
        // Adjust slightly so it doesn't overlap the V point perfectly if stroke is round, but tip is safe.
        shaftEnd = tip;
    }
    // For hollow/filled, headBaseCenter is correct (base of the triangle/arrowhead)


    // Label Position
    const mid = new Vector2(anchor.x, anchor.y).add(vector.div(2));
    const perpLabel = new Vector2(-vector.y, vector.x).normalize();
    const labelOffsetDir = flipLabel ? -1 : 1;
    const labelPos = mid.add(perpLabel.multiply(20 * labelOffsetDir));

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
                x2={shaftEnd.x} y2={shaftEnd.y}
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={lineStyle === 'dashed' ? `${strokeWidth * 2} ${strokeWidth * 1.5}` : undefined}
                strokeLinecap="round" // Round looks better for joining
                markerEnd="none"
            />
            {/* Arrow Head */}
            <path
                d={`M ${tip1.x} ${tip1.y} L ${tip.x} ${tip.y} L ${tip2.x} ${tip2.y} ${headStyle === 'simple' ? '' : 'Z'}`}
                fill={headStyle === 'filled' ? color : 'none'}
                stroke={color}
                strokeWidth={headStyle === 'filled' ? 0 : strokeWidth}
                strokeLinejoin="round"
                strokeLinecap="round"
            />

            {/* Invisible Hit Area for easier selection of thin lines? (Optional, maybe later) */}

            {/* Label */}
            {label && (
                <MathLabel
                    center={labelPos}
                    content={label}
                    color={color}
                    fontSize={fontSize}
                    fontFamily={fontFamily}
                    bold={bold}
                    italic={italic}
                />
            )}
        </g>
    );
};

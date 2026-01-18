import React, { useMemo } from 'react';
import { Vector2, Point } from '../geometry/Vector2';

// --- Wall / Ground ---

export interface WallProps {
    start: Point;
    end: Point;
    hatchAngle?: number; // degrees, default 45
    hatchSpacing?: number; // default 10
    hatchLength?: number; // length of hatch lines, default 15
}

export const WallRenderer: React.FC<WallProps> = ({
    start,
    end,
    hatchAngle = 45,
    hatchSpacing = 10,
    hatchLength = 15
}) => {
    // Generate hatch lines
    const hatches = useMemo(() => {
        const wallVec = new Vector2(end.x - start.x, end.y - start.y);
        const wallLength = wallVec.length();
        const wallDir = wallVec.normalize();
        const wallNormal = new Vector2(-wallDir.y, wallDir.x); // Left normal

        const numHatches = Math.floor(wallLength / hatchSpacing);
        const lines: Array<{ p1: Point; p2: Point }> = [];

        const rad = (hatchAngle * Math.PI) / 180;
        const hatchDirX = wallNormal.x * Math.cos(rad) - wallNormal.y * Math.sin(rad);
        const hatchDirY = wallNormal.x * Math.sin(rad) + wallNormal.y * Math.cos(rad);
        const hatchVec = new Vector2(hatchDirX, hatchDirY).multiply(hatchLength);

        for (let i = 0; i <= numHatches; i++) {
            const t = (i * hatchSpacing);
            if (t > wallLength) break;
            const p1 = new Vector2(start.x + wallDir.x * t, start.y + wallDir.y * t);
            const p2 = p1.add(hatchVec);
            lines.push({ p1, p2 });
        }
        return lines;
    }, [start, end, hatchAngle, hatchSpacing, hatchLength]);

    return (
        <g className="wall-component">
            {/* Main Surface Line */}
            <line
                x1={start.x} y1={start.y}
                x2={end.x} y2={end.y}
                stroke="black" strokeWidth="3"
                strokeLinecap="round"
            />
            {/* Hatch Lines */}
            {hatches.map((line, i) => (
                <line
                    key={i}
                    x1={line.p1.x} y1={line.p1.y}
                    x2={line.p2.x} y2={line.p2.y}
                    stroke="black" strokeWidth="1"
                    opacity="0.6"
                />
            ))}
        </g>
    );
};


// --- Block (Mass) ---

export interface BlockProps {
    center: Point;
    size: Vector2; // width, height
    rotation?: number; // radians
    mass?: number | string;
    fontSize?: number;
    fontFamily?: 'Inter' | 'STIX Two Text';
    bold?: boolean;
    italic?: boolean;
}

export const BlockRenderer: React.FC<BlockProps> = ({
    center,
    size,
    rotation = 0,
    mass = "M",
    fontSize = 20,
    fontFamily = 'Inter',
    bold = false,
    italic = false
}) => {
    // Transform for rotation around center
    const transform = `rotate(${(rotation * 180) / Math.PI}, ${center.x}, ${center.y})`;

    // Counter-rotate text so it stays upright
    const textTransform = `rotate(${(-rotation * 180) / Math.PI}, ${center.x}, ${center.y})`;

    return (
        <g transform={transform} className="block-component cursor-pointer">
            {/* Main Body */}
            <rect
                x={center.x - size.x / 2}
                y={center.y - size.y / 2}
                width={size.x}
                height={size.y}
                fill="#f0f0f0"
                stroke="#333"
                strokeWidth="2"
                rx="2" ry="2"
                className="hover:fill-gray-100 transition-colors"
                vectorEffect="non-scaling-stroke"
            />

            {/* Mass Label (Counter-rotated container) */}
            <g transform={textTransform}>
                <text
                    x={center.x}
                    y={center.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                        fontSize: fontSize,
                        fontFamily: fontFamily === 'Inter' ? 'Inter, sans-serif' : '"STIX Two Text", serif',
                        fontWeight: bold ? 'bold' : 'normal',
                        fontStyle: italic ? 'italic' : 'normal'
                    }}
                    fill="#333"
                    className="select-none pointer-events-none"
                >
                    {mass}
                </text>
            </g>
        </g>
    );
};

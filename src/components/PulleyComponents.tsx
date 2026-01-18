/**
 * PulleyComponents.tsx
 * Visuals for Pulley (Wheel + Hanger).
 */

import React from 'react';

interface PulleyRendererProps {
    center: { x: number, y: number };
    radius: number;
    hasHanger: boolean;
    hangerLength: number;
    hangerAngle: number; // radians
}

export const PulleyRenderer: React.FC<PulleyRendererProps> = ({
    center,
    radius,
    hasHanger,
    hangerLength,
    hangerAngle
}) => {
    // Visual Parameters
    const axleRadius = 4; // The black dot
    const bearingRadius = 8; // The small ring when no hanger
    const hangerWidth = radius * 0.5; // "Thick strip"

    return (
        <g transform={`translate(${center.x}, ${center.y})`}>
            {/* 1. Main Wheel (Perfect Circle) */}
            <circle r={radius} fill="#f0f0f0" stroke="#333" strokeWidth="2" />

            {/* 2. Hanger (If enabled) */}
            {hasHanger && (
                <g transform={`rotate(${(hangerAngle * 180 / Math.PI) - 90})`}>
                    {/* -90 offset: 0 deg = Up */}

                    {/* Hanger Strap: Round side at center, Square side at length */}
                    <path
                        d={`
                            M 0 -${hangerWidth / 2}
                            L ${hangerLength} -${hangerWidth / 2}
                            L ${hangerLength} ${hangerWidth / 2}
                            L 0 ${hangerWidth / 2}
                            A ${hangerWidth / 2} ${hangerWidth / 2} 0 0 1 0 -${hangerWidth / 2}
                        `}
                        fill="#e5e5e5"
                        stroke="#333"
                        strokeWidth="2"
                    />
                </g>
            )}

            {/* 3. Bearing Ring (Only if NO Hanger) */}
            {!hasHanger && (
                <circle r={bearingRadius} fill="none" stroke="#555" strokeWidth="2" />
            )}

            {/* 4. Axle (Black Dot) - Always Top */}
            <circle r={axleRadius} fill="black" />
        </g>
    );
};

/**
 * SpringRenderer.tsx
 * Visual component for the Spring entity.
 */

import React, { useMemo } from 'react';
import { Vector2 } from '../geometry/Vector2';
import { MathLabel } from './MathLabel';

interface SpringRendererProps {
    start: { x: number, y: number };
    end: { x: number, y: number };
    width?: number;
    coils?: number;
    style?: 'coil' | 'zigzag' | 'spiral';
    strokeColor?: string;
    strokeWidth?: number;
    label?: string;
    flipLabel?: boolean;
    fontSize?: number;
    spiralStart?: number;
    spiralEnd?: number;
    fontFamily?: 'Inter' | 'STIX Two Text';
    bold?: boolean;
    italic?: boolean;
}

export const SpringRenderer: React.FC<SpringRendererProps> = (props) => {
    const {
        start,
        end,
        width = 20,
        coils = 8,
        style = 'zigzag',
        strokeColor = 'black',
        strokeWidth = 2,
        label,
        flipLabel = false,
        fontSize = 20,
        fontFamily = 'Inter',
        bold = false,
        italic = false
    } = props;
    const { d, labelPos } = useMemo(() => {
        const startVec = new Vector2(start.x, start.y);
        const endVec = new Vector2(end.x, end.y);
        const diff = endVec.subtract(startVec);
        const totalLen = diff.length();

        // Default label position (midpoint)
        let lPos = startVec.add(endVec).div(2);

        if (totalLen < 1) return { d: "", labelPos: lPos };

        const dir = diff.normalize();
        // Perpendicular vector for width/offset
        const perp = new Vector2(-dir.y, dir.x);

        // Update label pos: Midpoint + Offset (Width + Padding)
        const labelOffsetDir = flipLabel ? -1 : 1;
        lPos = lPos.add(perp.multiply((width / 2 + 15) * labelOffsetDir));

        const bodyRatio = 0.7;
        const lineRatio = (1 - bodyRatio) / 2; // 0.15

        const bodyStart = startVec.add(dir.multiply(totalLen * lineRatio));
        const bodyEnd = startVec.add(dir.multiply(totalLen * (1 - lineRatio)));
        const bodyLen = bodyEnd.distanceTo(bodyStart);

        let bodyPath = "";

        if (style === 'zigzag') {
            let s = `L ${bodyStart.x} ${bodyStart.y}`;
            for (let i = 0; i < coils; i++) {
                // Peak (Up)
                const t1 = (i + 0.25) / coils;
                const p1 = bodyStart.add(dir.multiply(bodyLen * t1)).add(perp.multiply(width / 2));
                s += ` L ${p1.x} ${p1.y}`;
                // Valley (Down)
                const t2 = (i + 0.75) / coils;
                const p2 = bodyStart.add(dir.multiply(bodyLen * t2)).subtract(perp.multiply(width / 2));
                s += ` L ${p2.x} ${p2.y}`;
            }
            s += ` L ${bodyEnd.x} ${bodyEnd.y}`;
            bodyPath = s;

        } else if (style === 'coil') {
            let s = `L ${bodyStart.x} ${bodyStart.y}`;
            const res = 16;
            const totalSteps = coils * res;
            for (let i = 1; i <= totalSteps; i++) {
                const t = i / totalSteps;
                const angle = t * coils * Math.PI * 2;
                const offset = Math.sin(angle) * (width / 2);
                const p = bodyStart.add(dir.multiply(bodyLen * t)).add(perp.multiply(offset));
                s += ` L ${p.x} ${p.y}`;
            }
            s += ` L ${bodyEnd.x} ${bodyEnd.y}`;
            bodyPath = s;

        } else if (style === 'spiral') {
            let s = `L ${bodyStart.x} ${bodyStart.y}`;
            const res = 24;
            const totalSteps = coils * res;

            // User Controls in Degrees -> Radians
            const startRad = (props.spiralStart ?? 75) * Math.PI / 180;
            const endRad = (props.spiralEnd ?? -90) * Math.PI / 180;

            // Calculate sweep: N*2PI + Difference
            const sweep = coils * Math.PI * 2 + (endRad - startRad);

            for (let i = 1; i <= totalSteps; i++) {
                const t = i / totalSteps;
                const theta = startRad + t * sweep;

                // Side offset (Perpendicular)
                const sVal = Math.cos(theta) * width / 2;

                // Along offset (Parallel / loops)
                const aVal = Math.sin(theta) * width * 0.35;

                const pBase = bodyStart.add(dir.multiply(t * bodyLen));
                const side = perp.multiply(sVal);
                const trace = dir.multiply(aVal);

                const pt = pBase.add(trace).add(side);
                s += ` L ${pt.x} ${pt.y}`;
            }
            s += ` L ${bodyEnd.x} ${bodyEnd.y}`;
            bodyPath = s;
        }

        const d1 = `M ${start.x} ${start.y} L ${bodyStart.x} ${bodyStart.y}`;
        const d3 = `L ${end.x} ${end.y}`;

        return { d: d1 + bodyPath + d3, labelPos: lPos };

    }, [start, end, width, coils, style, flipLabel, props.spiralStart, props.spiralEnd]);

    return (
        <g>
            <path
                d={d}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {label && (
                <MathLabel
                    center={labelPos}
                    content={label}
                    fontSize={fontSize}
                    fontFamily={fontFamily}
                    bold={bold}
                    italic={italic}
                    color="#374151" // gray-700
                />
            )}
        </g>
    );
};

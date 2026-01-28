import React from 'react';
import { Vector2 } from '../geometry/Vector2';
import { MathLabel } from './MathLabel';

// --- DC SOURCE (Battery) ---
interface DCSourceProps {
    start: { x: number, y: number };
    end: { x: number, y: number };
    cells?: number;
    showPolarity?: boolean;
    flipPolarity?: boolean;
    showTerminals?: boolean;
    width?: number; // Plate width (Long)
    spacing?: number; // Gap between + and - plates
    label?: string;
    flipLabel?: boolean;
    fontSize?: number;
    fontFamily?: 'Inter' | 'STIX Two Text';
    bold?: boolean;
    italic?: boolean;
}

export const DCSourceRenderer: React.FC<DCSourceProps> = ({
    start,
    end,
    cells = 1,
    showPolarity = false,
    flipPolarity = false,
    showTerminals = true,
    width = 36,
    spacing = 8,
    label,
    flipLabel = false,
    fontSize = 20,
    fontFamily = 'Inter',
    bold = false,
    italic = false,
    startDot = false,
    endDot = false
}) => {
    const startVec = new Vector2(start.x, start.y);
    const endVec = new Vector2(end.x, end.y);
    const diff = endVec.subtract(startVec);
    const dir = diff.normalize();
    const perp = new Vector2(-dir.y, dir.x);

    // Geometry Config
    const shortW = width * 0.5; // Short plate width relative to long
    const cellDepth = spacing; // Distance between + and -
    const interCell = spacing * 1.5; // Distance between cells

    const totalDepth = cells * cellDepth + (cells - 1) * interCell;
    const startDepth = -totalDepth / 2;

    const mid = startVec.add(endVec).div(2);
    let elements: React.JSX.Element[] = [];

    // Terminals
    const batteryStartPos = mid.add(dir.multiply(startDepth));
    const batteryEndPos = mid.add(dir.multiply(startDepth + totalDepth));

    if (showTerminals) {
        elements.push(
            <line key="t1" x1={start.x} y1={start.y} x2={batteryStartPos.x} y2={batteryStartPos.y} stroke="black" strokeWidth={2} />,
            <line key="t2" x1={batteryEndPos.x} y1={batteryEndPos.y} x2={end.x} y2={end.y} stroke="black" strokeWidth={2} />
        );
    }

    // Cells
    for (let i = 0; i < cells; i++) {
        // Center of this cell
        const currentCenterOffset = startDepth + i * (cellDepth + interCell) + cellDepth / 2;
        const cellCenter = mid.add(dir.multiply(currentCenterOffset));

        // Plate locations relative to cellCenter
        // If !flip: Long is at -depth/2, Short is at +depth/2
        const firstPlateOffset = -cellDepth / 2;
        const secondPlateOffset = cellDepth / 2;

        const firstPos = cellCenter.add(dir.multiply(firstPlateOffset));
        const secondPos = cellCenter.add(dir.multiply(secondPlateOffset));

        const isFlipped = flipPolarity;

        // Draw First Plate
        const w1 = isFlipped ? shortW : width;
        const sw1 = isFlipped ? 3 : 2; // Thicker for short?
        const p1a = firstPos.add(perp.multiply(w1 / 2));
        const p1b = firstPos.subtract(perp.multiply(w1 / 2));
        elements.push(<line key={`c${i}1`} x1={p1a.x} y1={p1a.y} x2={p1b.x} y2={p1b.y} stroke="black" strokeWidth={sw1} />);

        // Draw Second Plate
        const w2 = isFlipped ? width : shortW;
        const sw2 = isFlipped ? 2 : 3;
        const p2a = secondPos.add(perp.multiply(w2 / 2));
        const p2b = secondPos.subtract(perp.multiply(w2 / 2));
        elements.push(<line key={`c${i}2`} x1={p2a.x} y1={p2a.y} x2={p2b.x} y2={p2b.y} stroke="black" strokeWidth={sw2} />);
    }

    // Polarity Signs
    if (showPolarity) {
        const isFlipped = flipPolarity;
        // Near start
        const startSignPos = batteryStartPos.subtract(dir.multiply(10)).add(perp.multiply(15));
        // Near end
        const endSignPos = batteryEndPos.add(dir.multiply(10)).add(perp.multiply(15));

        const startSym = isFlipped ? "-" : "+";
        const endSym = isFlipped ? "+" : "-";

        elements.push(
            <text key="p1" x={startSignPos.x} y={startSignPos.y} fontSize={16} fontFamily={fontFamily} textAnchor="middle" dominantBaseline="middle">{startSym}</text>,
            <text key="p2" x={endSignPos.x} y={endSignPos.y} fontSize={16} fontFamily={fontFamily} textAnchor="middle" dominantBaseline="middle">{endSym}</text>
        );
    }

    const labelOffsetDir = flipLabel ? -1 : 1;
    const labelP = mid.add(perp.multiply((width / 2 + 20) * labelOffsetDir));

    return (
        <g>
            {startDot && <circle cx={start.x} cy={start.y} r={3.5} fill="black" />}
            {endDot && <circle cx={end.x} cy={end.y} r={3.5} fill="black" />}
            {elements}
            {label && (
                <MathLabel center={labelP} content={label} fontSize={fontSize} fontFamily={fontFamily} bold={bold} italic={italic} color="black" />
            )}
        </g>
    );
};


// --- AC SOURCE ---
interface ACSourceProps {
    center: { x: number, y: number };
    radius: number;
    label?: string;
    flipLabel?: boolean;
    fontSize?: number;
    fontFamily?: 'Inter' | 'STIX Two Text';
    bold?: boolean;
    italic?: boolean;
}

export const ACSourceRenderer: React.FC<ACSourceProps> = ({
    center, radius, label, flipLabel = false, fontSize = 20, fontFamily = 'Inter', bold = false, italic = false
}) => {
    // Circle
    // Sine wave inside
    // Anchors are handled by the system handles, visually just a circle

    // Sine wave path: From -r to +r inside circle
    // M x,y q ...

    // Simple Bezier approximation for sine centered at `center` with width based on radius
    const labelOffset = flipLabel ? -1 : 1;
    const labelP = new Vector2(center.x, center.y - (radius + 15) * labelOffset);

    return (
        <g>
            <circle cx={center.x} cy={center.y} r={radius} fill="white" stroke="black" strokeWidth={2} />
            <path d={`M ${center.x - radius * 0.6} ${center.y} Q ${center.x - radius * 0.3} ${center.y - radius * 0.5} ${center.x} ${center.y} T ${center.x + radius * 0.6} ${center.y}`} fill="none" stroke="black" strokeWidth={2} strokeLinecap="round" />

            {/* Anchors Visuals (Optional - small dots?) No, standard handles are enough */}

            {label && (
                <MathLabel center={labelP} content={label} fontSize={fontSize} fontFamily={fontFamily} bold={bold} italic={italic} color="black" />
            )}
        </g>
    );
};



// --- CAPACITOR ---
interface CapacitorProps {
    start: { x: number, y: number };
    end: { x: number, y: number };
    width?: number; // Plate width
    separation?: number; // Gap
    label?: string;
    flipLabel?: boolean;
    fontSize?: number;
    fontFamily?: 'Inter' | 'STIX Two Text';
    bold?: boolean;
    italic?: boolean;
    startDot?: boolean;
    endDot?: boolean;
}

export const CapacitorRenderer: React.FC<CapacitorProps> = ({
    start, end, width = 24, separation = 8, label, flipLabel, fontSize = 20, fontFamily = 'Inter', bold, italic,
    startDot = false, endDot = false
}) => {
    const startVec = new Vector2(start.x, start.y);
    const endVec = new Vector2(end.x, end.y);
    const diff = endVec.subtract(startVec);
    const dir = diff.normalize();
    const perp = new Vector2(-dir.y, dir.x);
    const mid = startVec.add(endVec).div(2);

    const plate1Center = mid.subtract(dir.multiply(separation / 2));
    const plate2Center = mid.add(dir.multiply(separation / 2));

    const p1_a = plate1Center.add(perp.multiply(width / 2));
    const p1_b = plate1Center.subtract(perp.multiply(width / 2));

    const p2_a = plate2Center.add(perp.multiply(width / 2));
    const p2_b = plate2Center.subtract(perp.multiply(width / 2));

    // Label
    const labelOffsetDir = flipLabel ? -1 : 1;
    const labelP = mid.add(perp.multiply((width / 2 + 15) * labelOffsetDir));

    return (
        <g>
            {startDot && <circle cx={start.x} cy={start.y} r={3.5} fill="black" />}
            {endDot && <circle cx={end.x} cy={end.y} r={3.5} fill="black" />}
            {/* Wires */}
            <line x1={start.x} y1={start.y} x2={plate1Center.x} y2={plate1Center.y} stroke="black" strokeWidth={2} />
            <line x1={end.x} y1={end.y} x2={plate2Center.x} y2={plate2Center.y} stroke="black" strokeWidth={2} />

            {/* Plates */}
            <line x1={p1_a.x} y1={p1_a.y} x2={p1_b.x} y2={p1_b.y} stroke="black" strokeWidth={2} />
            <line x1={p2_a.x} y1={p2_a.y} x2={p2_b.x} y2={p2_b.y} stroke="black" strokeWidth={2} />

            {label && (
                <MathLabel center={labelP} content={label} fontSize={fontSize} fontFamily={fontFamily} bold={bold} italic={italic} color="black" />
            )}
        </g>
    );
};

// --- DIODE ---
interface DiodeProps {
    start: { x: number, y: number };
    end: { x: number, y: number };
    scale?: number;
    label?: string;
    flipLabel?: boolean;
    fontSize?: number;
    fontFamily?: 'Inter' | 'STIX Two Text';
    bold?: boolean;
    italic?: boolean;
    startDot?: boolean;
    endDot?: boolean;
}

export const DiodeRenderer: React.FC<DiodeProps> = ({
    start, end, scale = 1.0, label, flipLabel, fontSize = 20, fontFamily = 'Inter', bold, italic,
    startDot = false, endDot = false
}) => {
    const startVec = new Vector2(start.x, start.y);
    const endVec = new Vector2(end.x, end.y);
    const mid = startVec.add(endVec).div(2);
    const dir = endVec.subtract(startVec).normalize();
    const perp = new Vector2(-dir.y, dir.x);

    // Size config
    // Base size approx 21 (1.3x of 16)
    const baseSize = 21;
    const finalSize = baseSize * scale;

    // Triangle pointing to end
    const triTip = mid.add(dir.multiply(finalSize / 2));
    const triBase = mid.subtract(dir.multiply(finalSize / 2));

    const triP1 = triBase.add(perp.multiply(finalSize / 2));
    const triP2 = triBase.subtract(perp.multiply(finalSize / 2));

    // Line at tip
    const lineP1 = triTip.add(perp.multiply(finalSize / 2));
    const lineP2 = triTip.subtract(perp.multiply(finalSize / 2));

    const labelOffsetDir = flipLabel ? -1 : 1;
    const labelP = mid.add(perp.multiply((finalSize + 10) * labelOffsetDir));

    return (
        <g>
            {startDot && <circle cx={start.x} cy={start.y} r={3.5} fill="black" />}
            {endDot && <circle cx={end.x} cy={end.y} r={3.5} fill="black" />}
            {/* Wires */}
            <line x1={start.x} y1={start.y} x2={triBase.x} y2={triBase.y} stroke="black" strokeWidth={2} />
            <line x1={end.x} y1={end.y} x2={triTip.x} y2={triTip.y} stroke="black" strokeWidth={2} />

            {/* Triangle */}
            <path d={`M ${triTip.x} ${triTip.y} L ${triP1.x} ${triP1.y} L ${triP2.x} ${triP2.y} Z`} fill="none" stroke="black" strokeWidth={2} />

            {/* Barrier Line */}
            <line x1={lineP1.x} y1={lineP1.y} x2={lineP2.x} y2={lineP2.y} stroke="black" strokeWidth={2} />

            {label && (
                <MathLabel center={labelP} content={label} fontSize={fontSize} fontFamily={fontFamily} bold={bold} italic={italic} color="black" />
            )}
        </g>
    );
};

// --- SWITCH ---
interface SwitchProps {
    start: { x: number, y: number };
    end: { x: number, y: number };
    isOpen?: boolean;
    angle?: number; // degrees
    label?: string;
    flipLabel?: boolean;
    fontSize?: number;
    fontFamily?: 'Inter' | 'STIX Two Text';
    bold?: boolean;
    italic?: boolean;
    startDot?: boolean;
    endDot?: boolean;
}

export const SwitchRenderer: React.FC<SwitchProps> = ({
    start, end, isOpen = true, angle = 30, label, flipLabel, fontSize = 20, fontFamily = 'Inter', bold, italic,
    startDot = false, endDot = false
}) => {
    const startVec = new Vector2(start.x, start.y);
    const endVec = new Vector2(end.x, end.y);
    const diff = endVec.subtract(startVec);
    const totalLen = diff.length();
    const dir = diff.normalize();

    // Gap size for switch
    const gapSize = 40;
    if (totalLen < gapSize) return null; // Too small

    const openStart = startVec.add(dir.multiply((totalLen - gapSize) / 2));
    const openEnd = endVec.subtract(dir.multiply((totalLen - gapSize) / 2));

    // Blade
    let bladeEnd = openEnd;
    if (isOpen) {
        // Rotate blade up
        const rad = -angle * Math.PI / 180;
        // The bladeVec was unused.
        // We need to rotate `dir` by `rad`
        const rx = dir.x * Math.cos(rad) - dir.y * Math.sin(rad);
        const ry = dir.x * Math.sin(rad) + dir.y * Math.cos(rad);
        const rotatedDir = new Vector2(rx, ry);

        bladeEnd = openStart.add(rotatedDir.multiply(gapSize));
    }

    const labelOffsetDir = flipLabel ? -1 : 1;
    const perp = new Vector2(-dir.y, dir.x);
    const mid = startVec.add(endVec).div(2);
    const labelP = mid.add(perp.multiply(30 * labelOffsetDir));

    return (
        <g>
            {startDot && <circle cx={start.x} cy={start.y} r={3.5} fill="black" />}
            {endDot && <circle cx={end.x} cy={end.y} r={3.5} fill="black" />}
            {/* Wires */}
            <line x1={start.x} y1={start.y} x2={openStart.x} y2={openStart.y} stroke="black" strokeWidth={2} />
            <line x1={end.x} y1={end.y} x2={openEnd.x} y2={openEnd.y} stroke="black" strokeWidth={2} />

            {/* Dots */}
            <circle cx={openStart.x} cy={openStart.y} r={3} fill="black" stroke="black" strokeWidth={2} />
            <circle cx={openEnd.x} cy={openEnd.y} r={3} fill="black" stroke="black" strokeWidth={2} />

            {/* Blade */}
            <line x1={openStart.x} y1={openStart.y} x2={bladeEnd.x} y2={bladeEnd.y} stroke="black" strokeWidth={2} />

            {label && (
                <MathLabel center={labelP} content={label} fontSize={fontSize} fontFamily={fontFamily} bold={bold} italic={italic} color="black" />
            )}
        </g>
    );
};

import React from 'react';
import { Vector2, Point } from '../geometry/Vector2';
import katex from 'katex';

// --- Simple Line ---

export interface SimpleLineProps {
    start: Point;
    end: Point;
    color?: string;
    width?: number;
    dashed?: boolean;
}

export const SimpleLine: React.FC<SimpleLineProps> = ({
    start,
    end,
    color = "black",
    width = 2,
    dashed = false
}) => {
    return (
        <line
            x1={start.x} y1={start.y}
            x2={end.x} y2={end.y}
            stroke={color}
            strokeWidth={width}
            strokeDasharray={dashed ? "5,5" : "none"}
            strokeLinecap="round"
        />
    );
};


// --- Catenary (Hanging Rope) ---

export interface CatenaryProps {
    start: Point;
    end: Point;
    slack?: number; // 0 = straight, higher = more drooping
    color?: string;
    width?: number;
}

export const CatenaryRenderer: React.FC<CatenaryProps> = ({
    start,
    end,
    slack = 50, // Default slack depth
    color = "#8B4513", // SaddleBrown-ish for generic rope
    width = 3
}) => {

    // Calculate a Quadratic Bezier curve that looks like a catenary
    const mid = new Vector2((start.x + end.x) / 2, (start.y + end.y) / 2);
    const control = new Vector2(mid.x, mid.y + slack * 2);
    const pathData = `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`;

    return (
        <path
            d={pathData}
            stroke={color}
            strokeWidth={width}
            fill="none"
            strokeLinecap="round"
            className="catenary-component"
        />
    );
};


// --- Triangle ---
export interface TriangleProps {
    p1: Point;
    p2: Point;
    p3: Point;
}
export const TriangleRenderer: React.FC<TriangleProps> = ({ p1, p2, p3 }) => (
    <polygon
        points={`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`}
        fill="#f0f0f0"
        stroke="#333"
        strokeWidth="2"
        className="hover:fill-blue-50 transition-colors"
    />
);

// --- Circle ---
export interface CircleProps {
    center: Point;
    radius: number;
}
export const CircleRenderer: React.FC<CircleProps> = ({ center, radius }) => (
    <circle
        cx={center.x} cy={center.y}
        r={radius}
        fill="#f0f0f0"
        stroke="#333"
        strokeWidth="2"
        className="hover:fill-blue-50 transition-colors"
    />
);

// --- Text ---
export interface TextProps {
    center: Point;
    content: string;
    fontSize?: number;
    fontFamily?: 'Inter' | 'STIX Two Text';
    bold?: boolean;
    italic?: boolean;
}
export const TextRenderer: React.FC<TextProps> = ({
    center,
    content,
    fontSize = 20,
    fontFamily = 'Inter',
    bold = false,
    italic = false
}) => {
    // Check for LaTeX format: $$content$$
    const isLatex = content.startsWith('$$') && content.endsWith('$$');

    if (isLatex) {
        try {
            const latexContent = content.slice(2, -2);
            const html = katex.renderToString(latexContent, {
                throwOnError: false,
                displayMode: false
            });

            // Width/Height estimation is tricky. For now, we use a fixed size foreignObject
            // centered at the point.
            // Improve: Use a reasonable size based on font size.
            const w = 200;
            const h = 100;

            return (
                <foreignObject x={center.x - w / 2} y={center.y - h / 2} width={w} height={h} className="select-none pointer-events-none overflow-visible">
                    <div
                        style={{
                            fontSize: fontSize,
                            fontFamily: fontFamily === 'Inter' ? 'Inter, sans-serif' : '"STIX Two Text", serif', // LaTeX has its own font, but we can pass it if katex supports or wrapper
                            // Actually KaTeX enforces its own fonts. We might not apply 'fontFamily' here.
                            textAlign: 'center',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100%',
                            color: '#333'
                        }}
                        dangerouslySetInnerHTML={{ __html: html }}
                    />
                </foreignObject>
            );
        } catch (e) {
            console.error("KaTeX error", e);
            // Fallback to normal text
        }
    }

    return (
        <text
            x={center.x}
            y={center.y}
            textAnchor="middle" // This centers the text horizontally
            dominantBaseline="middle" // This centers the text vertically
            style={{
                fontSize: fontSize,
                fontFamily: fontFamily === 'Inter' ? 'Inter, sans-serif' : '"STIX Two Text", serif',
                fontWeight: bold ? 'bold' : 'normal',
                fontStyle: italic ? 'italic' : 'normal'
            }}
            fill="#333"
            className="select-none cursor-move"
        >
            {content}
        </text>
    );
};

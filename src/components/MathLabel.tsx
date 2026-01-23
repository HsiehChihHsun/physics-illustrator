import React from 'react';
import katex from 'katex';
import { Point } from '../geometry/Vector2';

export interface MathLabelProps {
    center?: Point; // Use either center OR x,y
    x?: number;
    y?: number;
    content: string;
    fontSize?: number;
    fontFamily?: 'Inter' | 'STIX Two Text';
    color?: string;
    bold?: boolean;
    italic?: boolean;
    className?: string; // For things like "select-none pointer-events-none"
    style?: React.CSSProperties; // Additional styles
}

/**
 * MathLabel
 * A unified component that renders text.
 * - If content matches "$$...$$", it renders using KaTeX inside a foreignObject.
 * - Otherwise, it renders standard SVG <text>.
 */
export const MathLabel: React.FC<MathLabelProps> = ({
    center,
    x,
    y,
    content,
    fontSize = 20,
    fontFamily = 'Inter',
    color = '#333',
    bold = false,
    italic = false,
    className = "select-none pointer-events-none",
    style
}) => {
    // Determine position
    const posX = center ? center.x : (x ?? 0);
    const posY = center ? center.y : (y ?? 0);

    // Check for LaTeX format: $$content$$
    const isLatex = content.startsWith('$$') && content.endsWith('$$');

    if (isLatex) {
        let html = '';
        try {
            const latexContent = content.slice(2, -2);
            html = katex.renderToString(latexContent, {
                throwOnError: false,
                displayMode: false
            });
        } catch (e) {
            console.error("KaTeX error", e);
        }

        if (html) {
            // Constant size for foreignObject container
            // This is a limitation: ideally we'd measure the rendered math.
            const w = 200;
            const h = 100;

            return (
                <foreignObject
                    x={posX - w / 2}
                    y={posY - h / 2}
                    width={w}
                    height={h}
                    className={`${className} overflow-visible`}
                    style={style}
                >
                    <div
                        style={{
                            fontSize: fontSize,
                            // KaTeX provides its own fonts, but we set a fallback
                            fontFamily: fontFamily === 'Inter' ? 'Inter, sans-serif' : '"STIX Two Text", serif',
                            textAlign: 'center',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100%',
                            color: color,
                            ...style
                        }}
                        dangerouslySetInnerHTML={{ __html: html }}
                    />
                </foreignObject>
            );
        }
    }

    // Standard SVG Text
    return (
        <text
            x={posX}
            y={posY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={color}
            className={className}
            style={{
                fontSize: fontSize,
                fontFamily: fontFamily === 'Inter' ? 'Inter, sans-serif' : '"STIX Two Text", serif',
                fontWeight: bold ? 'bold' : 'normal',
                fontStyle: italic ? 'italic' : 'normal',
                ...style
            }}
        >
            {content}
        </text>
    );
};

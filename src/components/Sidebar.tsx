import React, { useState, useRef } from 'react';

export type ToolType = 'spring' | 'wall' | 'block' | 'line' | 'catenary' | 'pulley' | 'vector' | 'triangle' | 'circle' | 'text';

interface SidebarProps {
    onAdd: (type: ToolType) => void;
}

interface TooltipState {
    visible: boolean;
    top: number;
    left: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ onAdd }) => {

    const ToolButton: React.FC<{ label: string; icon: string; onClick: () => void; color?: string }> = ({ label, icon, onClick, color }) => {
        const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, top: 0, left: 0 });
        const buttonRef = useRef<HTMLButtonElement>(null);

        const handleMouseEnter = () => {
            if (buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                setTooltip({
                    visible: true,
                    top: rect.top + (rect.height / 2),
                    left: rect.right + 12 // 12px offset
                });
            }
        };

        const handleMouseLeave = () => {
            setTooltip(prev => ({ ...prev, visible: false }));
        };

        return (
            <div
                className="relative flex items-center justify-center p-1 w-full"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <button
                    ref={buttonRef}
                    onClick={onClick}
                    className={`flex items-center justify-center w-10 h-10 rounded-md transition-all text-gray-600 hover:bg-black/5 hover:text-blue-600 ${color ? 'text-' + color + '-600' : ''}`}
                >
                    <span className="text-xl leading-none">{icon}</span>
                </button>

                {/* Custom Tooltip - Fixed Position to escape overflow clipping */}
                {tooltip.visible && (
                    <div
                        className="fixed bg-gray-900 text-white text-[11px] font-medium px-2.5 py-1.5 rounded shadow-lg z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150"
                        style={{ top: tooltip.top, left: tooltip.left, transform: 'translateY(-50%)' }}
                    >
                        {label}
                        {/* Arrow */}
                        <div className="absolute top-1/2 -left-1 -mt-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                    </div>
                )}
            </div>
        );
    };

    const Separator = () => <div className="h-px w-10 bg-gray-200 my-1 self-center" />;

    const GroupHeader: React.FC<{ label: string }> = ({ label }) => (
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-3 mb-1.5 text-center w-full select-none">
            {label}
        </div>
    );

    return (
        <div className="w-16 bg-[#f5f5f5] border-r border-[#e0e0e0] flex flex-col items-center py-2 gap-1 overflow-y-auto custom-scrollbar flex-shrink-0 z-20">

            <GroupHeader label="Phys" />
            <ToolButton label="Block" icon="□" onClick={() => onAdd('block')} />
            <ToolButton label="Wall" icon="▧" onClick={() => onAdd('wall')} />
            <ToolButton label="Pulley" icon="◎" onClick={() => onAdd('pulley')} />
            <ToolButton label="Spring" icon="⌇" onClick={() => onAdd('spring')} />
            <ToolButton label="Rope" icon="◡" onClick={() => onAdd('catenary')} />

            <Separator />

            <GroupHeader label="Shape" />
            <ToolButton label="Line" icon="／" onClick={() => onAdd('line')} />
            <ToolButton label="Vector" icon="→" onClick={() => onAdd('vector')} />
            <ToolButton label="Triangle" icon="△" onClick={() => onAdd('triangle')} />
            <ToolButton label="Circle" icon="○" onClick={() => onAdd('circle')} />
            <ToolButton label="Text" icon="T" onClick={() => onAdd('text')} />

        </div>
    );
};

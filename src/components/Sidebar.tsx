import React, { useState, useRef } from 'react';
import {
    IconBlock, IconWall, IconPulley, IconSpring, IconRope,
    IconLine, IconVector, IconLinearMarker, IconTriangle, IconCircle, IconText,
    IconWire, IconDC, IconAC, IconResistor, IconInductor, IconCapacitor, IconDiode, IconSwitch
} from './Icons';

export type ToolType = 'spring' | 'wall' | 'block' | 'line' | 'catenary' | 'pulley' | 'vector' | 'linearmarker' | 'triangle' | 'circle' | 'text'
    | 'dcsource' | 'acsource' | 'resistor' | 'inductor' | 'capacitor' | 'diode' | 'switch' | 'wire';

interface SidebarProps {
    onAdd: (type: ToolType) => void;
}

interface TooltipState {
    visible: boolean;
    top: number;
    left: number;
}

// Updated to accept ReactNode for icon
const ToolButton: React.FC<{ label: string; icon: React.ReactNode; onClick: () => void; color?: string }> = ({ label, icon, onClick, color }) => {
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
                <div className="text-current w-6 h-6 flex items-center justify-center">
                    {icon}
                </div>
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

export const Sidebar: React.FC<SidebarProps> = ({ onAdd }) => {

    return (
        <div className="w-16 bg-[#f5f5f5] border-r border-[#e0e0e0] flex flex-col items-center py-2 gap-1 overflow-y-auto custom-scrollbar flex-shrink-0 z-20">

            <GroupHeader label="Phys" />
            <ToolButton label="Block" icon={<IconBlock />} onClick={() => onAdd('block')} />
            <ToolButton label="Wall" icon={<IconWall />} onClick={() => onAdd('wall')} />
            <ToolButton label="Pulley" icon={<IconPulley />} onClick={() => onAdd('pulley')} />
            <ToolButton label="Spring" icon={<IconSpring />} onClick={() => onAdd('spring')} />
            <ToolButton label="Rope" icon={<IconRope />} onClick={() => onAdd('catenary')} />

            <Separator />

            <GroupHeader label="Shape" />
            <ToolButton label="Line" icon={<IconLine />} onClick={() => onAdd('line')} />
            <ToolButton label="Vector" icon={<IconVector />} onClick={() => onAdd('vector')} />
            <ToolButton label="Linear Marker" icon={<IconLinearMarker />} onClick={() => onAdd('linearmarker')} />
            <ToolButton label="Triangle" icon={<IconTriangle />} onClick={() => onAdd('triangle')} />
            <ToolButton label="Circle" icon={<IconCircle />} onClick={() => onAdd('circle')} />
            <ToolButton label="Text" icon={<IconText />} onClick={() => onAdd('text')} />

            <Separator />

            <GroupHeader label="Circuit" />
            <ToolButton label="Wire" icon={<IconWire />} onClick={() => onAdd('wire')} />
            <ToolButton label="DC Source" icon={<IconDC />} onClick={() => onAdd('dcsource')} />
            <ToolButton label="AC Source" icon={<IconAC />} onClick={() => onAdd('acsource')} />
            <ToolButton label="Resistor" icon={<IconResistor />} onClick={() => onAdd('resistor')} />
            <ToolButton label="Inductor" icon={<IconInductor />} onClick={() => onAdd('inductor')} />
            <ToolButton label="Capacitor" icon={<IconCapacitor />} onClick={() => onAdd('capacitor')} />
            <ToolButton label="Diode" icon={<IconDiode />} onClick={() => onAdd('diode')} />
            <ToolButton label="Switch" icon={<IconSwitch />} onClick={() => onAdd('switch')} />

        </div>
    );
};


import React from 'react';

// Update type definition
export type ToolType = 'spring' | 'wall' | 'block' | 'line' | 'catenary' | 'pulley' | 'vector' | 'triangle' | 'circle' | 'text';


interface ToolbarProps {
    onAdd: (type: ToolType) => void;
    onDelete: () => void;
    canDelete: boolean;
    onSave: () => void;
    onLoad: (file: File) => void;
    onExport: (format: 'png' | 'svg') => void;

    // Phase 11 Refinements
    showSnap: boolean;
    onToggleSnap: () => void;
    gridDensity: number;
    onGridDensityChange: (density: number) => void;

    // Phase 12: Canvas Size
    canvasMode: 'small' | 'large';
    onCanvasModeChange: (mode: 'small' | 'large') => void;

    // Phase 12.5: Zoom
    zoom: number;
    onZoomChange: (zoom: number) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
    onAdd, onDelete, canDelete, onSave, onLoad, onExport,
    showSnap, onToggleSnap, gridDensity, onGridDensityChange,
    canvasMode, onCanvasModeChange,
    zoom, onZoomChange
}) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onLoad(e.target.files[0]);
            e.target.value = ''; // Reset
        }
    };

    const ToolButton: React.FC<{ label: string; icon: string; onClick: () => void; color?: string }> = ({ label, icon, onClick, color }) => (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded hover:bg-opacity-80 transition-all ${color ? 'text-' + color + '-600 bg-' + color + '-50 hover:bg-' + color + '-100' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}
            title={`Add ${label}`}
        >
            <span className="text-lg leading-none mb-1">{icon}</span>
            <span className="text-[9px] font-medium leading-none">{label}</span>
        </button>
    );

    const GroupLabel: React.FC<{ label: string }> = ({ label }) => (
        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-1 bg-white select-none">
            {label}
        </div>
    );

    const Separator = () => <div className="w-[1px] h-10 bg-gray-200 mx-2 self-center" />;

    return (
        <div className="flex flex-col gap-2 p-3 bg-white rounded-lg shadow-sm border border-gray-200 mb-2 w-full">
            <div className="flex flex-wrap items-start gap-y-2">

                {/* Group 1: Project */}
                <div className="flex flex-col">
                    <GroupLabel label="Project" />
                    <div className="flex gap-1">
                        <button onClick={onSave} className="flex flex-col items-center justify-center w-10 h-10 rounded hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors" title="Save Scene">
                            <span className="text-lg">💾</span>
                        </button>
                        <label className="flex flex-col items-center justify-center w-10 h-10 rounded hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer" title="Load Scene">
                            <span className="text-lg">📂</span>
                            <input type="file" accept=".json" className="hidden" onChange={handleFileChange} />
                        </label>
                        <div className="flex flex-col gap-1">
                            <button onClick={() => onExport('png')} className="flex items-center justify-center w-8 h-4 rounded hover:bg-blue-50 text-gray-600 hover:text-blue-600 text-[9px] border border-gray-200" title="Export PNG">PNG</button>
                            <button onClick={() => onExport('svg')} className="flex items-center justify-center w-8 h-4 rounded hover:bg-blue-50 text-gray-600 hover:text-blue-600 text-[9px] border border-gray-200" title="Export SVG">SVG</button>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Group 2: View */}
                <div className="flex flex-col">
                    <GroupLabel label="View" />
                    <div className="flex gap-2 items-center">
                        <button
                            onClick={onToggleSnap}
                            className={`flex flex-col items-center justify-center w-10 h-10 rounded transition-colors ${showSnap ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-50 text-gray-400'}`}
                            title={showSnap ? "Snap On" : "Snap Off"}
                        >
                            <span className="text-lg">{showSnap ? '👁️' : '🚫'}</span>
                        </button>

                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between gap-1">
                                <span className="text-[9px] text-gray-400">Grid</span>
                                <select
                                    value={gridDensity}
                                    onChange={(e) => onGridDensityChange(Number(e.target.value))}
                                    className="text-[10px] border border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:border-blue-500 bg-white w-14"
                                >
                                    <option value={1}>1x</option>
                                    <option value={2}>2x</option>
                                    <option value={4}>4x</option>
                                    <option value={8}>8x</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-between gap-1">
                                <span className="text-[9px] text-gray-400">Area</span>
                                <select
                                    value={canvasMode}
                                    onChange={(e) => onCanvasModeChange(e.target.value as 'small' | 'large')}
                                    className="text-[10px] border border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:border-blue-500 bg-white w-14"
                                >
                                    <option value="small">Small</option>
                                    <option value="large">Large</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-between gap-1">
                                <span className="text-[9px] text-gray-400">Zoom</span>
                                <select
                                    value={zoom}
                                    onChange={(e) => onZoomChange(Number(e.target.value))}
                                    className="text-[10px] border border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:border-blue-500 bg-white w-14"
                                >
                                    <option value={2}>200%</option>
                                    <option value={1}>100%</option>
                                    <option value={0.5}>50%</option>
                                    <option value={0.25}>25%</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Group 3: Physics */}
                <div className="flex flex-col">
                    <GroupLabel label="Physics" />
                    <div className="flex gap-1 flex-wrap max-w-[220px]">
                        <ToolButton label="Block" icon="□" onClick={() => onAdd('block')} />
                        <ToolButton label="Wall" icon="▧" onClick={() => onAdd('wall')} />
                        <ToolButton label="Pulley" icon="◎" onClick={() => onAdd('pulley')} />
                        <ToolButton label="Spring" icon="⌇" onClick={() => onAdd('spring')} />
                        <ToolButton label="Rope" icon="◡" onClick={() => onAdd('catenary')} />
                    </div>
                </div>

                <Separator />

                {/* Group 4: Shapes & Annotation */}
                <div className="flex flex-col">
                    <GroupLabel label="Shapes" />
                    <div className="flex gap-1">
                        <ToolButton label="Line" icon="／" onClick={() => onAdd('line')} />
                        <ToolButton label="Vector" icon="→" onClick={() => onAdd('vector')} />
                        <ToolButton label="Tri" icon="△" onClick={() => onAdd('triangle')} />
                        <ToolButton label="Circle" icon="○" onClick={() => onAdd('circle')} />
                        <ToolButton label="Text" icon="T" onClick={() => onAdd('text')} />
                    </div>
                </div>

                <div className="flex-1"></div>

                {/* Group 5: Actions */}
                <div className="flex flex-col self-end mb-1">
                    <button
                        onClick={onDelete}
                        disabled={!canDelete}
                        className={`flex flex-col items-center justify-center w-12 h-12 rounded transition-colors ${canDelete ? 'bg-red-50 hover:bg-red-100 text-red-500' : 'opacity-30 cursor-not-allowed text-gray-400'}`}
                        title="Delete Selected (Del)"
                    >
                        <span className="text-xl">🗑️</span>
                    </button>
                </div>

            </div>
        </div>
    );
};

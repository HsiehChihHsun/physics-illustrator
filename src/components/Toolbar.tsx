import React from 'react';
import { IconSave, IconLoad, IconDelete, IconVisible, IconInvisible, IconDeselect } from './Icons';

export interface ToolbarProps {
    onDelete: () => void;
    canDelete: boolean;
    onDeselect?: () => void; // Optional for backward compatibility if needed, but we will use it
    onSave: () => void;
    onLoad: (file: File) => void;
    onExport: (format: 'png' | 'svg') => void;

    // View Settings
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

    fontFamily: 'Inter' | 'STIX Two Text';
    onFontChange: (font: 'Inter' | 'STIX Two Text') => void;
}

const ToolButton: React.FC<{ label: string; icon: React.ReactNode; onClick: () => void; isActive?: boolean; color?: string }> = ({ label, icon, onClick, isActive, color }) => (
    <button
        onClick={onClick}
        className={`flex items-center justify-center w-9 h-9 rounded transition-all ${isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-black/5'} ${color ? 'text-' + color + '-600' : ''}`}
        title={label}
    >
        <div className="w-5 h-5 flex items-center justify-center text-current">
            {icon}
        </div>
    </button>
);

const Separator = () => <div className="w-px h-6 bg-gray-300 mx-1 self-center" />;


export const Toolbar: React.FC<ToolbarProps> = ({
    onDelete, canDelete, onDeselect, onSave, onLoad, onExport,
    showSnap, onToggleSnap, gridDensity, onGridDensityChange,
    canvasMode, onCanvasModeChange,
    zoom, onZoomChange,
    fontFamily, onFontChange
}) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onLoad(e.target.files[0]);
            e.target.value = ''; // Reset
        }
    };


    return (
        <div className="flex flex-row items-center p-2 bg-[#f5f5f5] border-b border-[#e0e0e0] w-full gap-1 overflow-x-auto shadow-sm z-20 relative">

            {/* Project */}
            <div className="flex items-center gap-1">
                <ToolButton label="Save Scene" icon={<IconSave />} onClick={onSave} />
                <label className="flex items-center justify-center w-9 h-9 rounded text-gray-600 hover:bg-black/5 transition-colors cursor-pointer" title="Load Scene">
                    <div className="w-5 h-5 flex items-center justify-center text-current">
                        <IconLoad />
                    </div>
                    <input type="file" accept=".json" className="hidden" onChange={handleFileChange} />
                </label>
                <div className="flex gap-0.5">
                    <button onClick={() => onExport('png')} className="px-2 py-1 rounded hover:bg-black/5 text-gray-600 text-[10px] font-medium border border-transparent hover:border-gray-300" title="Export PNG">PNG</button>
                    <button onClick={() => onExport('svg')} className="px-2 py-1 rounded hover:bg-black/5 text-gray-600 text-[10px] font-medium border border-transparent hover:border-gray-300" title="Export SVG">SVG</button>
                </div>
            </div>

            <Separator />

            {/* View */}
            <div className="flex items-center gap-2">
                <ToolButton label={showSnap ? "Snap On" : "Snap Off"} icon={showSnap ? <IconVisible /> : <IconInvisible />} onClick={onToggleSnap} isActive={showSnap} />

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1" title="Font Family">
                        <span className="text-[10px] text-gray-500 font-medium">Font</span>
                        <select
                            value={fontFamily}
                            onChange={(e) => onFontChange(e.target.value as 'Inter' | 'STIX Two Text')}
                            className="text-[11px] border-none bg-transparent hover:bg-black/5 rounded cursor-pointer focus:ring-0 py-0.5 pl-1 pr-0 w-24 text-gray-700 font-mono"
                        >
                            <option value="Inter">Inter (Sans)</option>
                            <option value="STIX Two Text">STIX (Serif)</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-1" title="Grid Density">
                        <span className="text-[10px] text-gray-500 font-medium">Grid</span>
                        <select
                            value={gridDensity}
                            onChange={(e) => onGridDensityChange(Number(e.target.value))}
                            className="text-[11px] border-none bg-transparent hover:bg-black/5 rounded cursor-pointer focus:ring-0 py-0.5 pl-1 pr-0 w-20 text-gray-700 font-mono"
                        >
                            <option value={4}>2 units</option>
                            <option value={8}>1 unit</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-1" title="Canvas Size">
                        <span className="text-[10px] text-gray-500 font-medium">Area</span>
                        <select
                            value={canvasMode}
                            onChange={(e) => onCanvasModeChange(e.target.value as 'small' | 'large')}
                            className="text-[11px] border-none bg-transparent hover:bg-black/5 rounded cursor-pointer focus:ring-0 py-0.5 pl-1 pr-0 w-14 text-gray-700 font-mono"
                        >
                            <option value="small">Small</option>
                            <option value="large">Large</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-1" title="Zoom Level">
                        <span className="text-[10px] text-gray-500 font-medium">Zoom</span>
                        <select
                            value={zoom}
                            onChange={(e) => onZoomChange(Number(e.target.value))}
                            className="text-[11px] border-none bg-transparent hover:bg-black/5 rounded cursor-pointer focus:ring-0 py-0.5 pl-1 pr-0 w-14 text-gray-700 font-mono"
                        >
                            <option value={2}>200%</option>
                            <option value={1}>100%</option>
                            <option value={0.5}>50%</option>
                            <option value={0.25}>25%</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex-1"></div>

            {/* Actions */}
            <div className="flex items-center gap-1 pr-2">
                {canDelete && onDeselect && (
                    <button
                        onClick={onDeselect}
                        className="flex items-center justify-center h-9 px-4 rounded bg-pink-500 hover:bg-pink-600 text-white transition-all shadow-sm mr-2"
                        title="Cancel Selection (Esc)"
                    >
                        <div className="w-5 h-5 flex items-center justify-center text-current mr-1">
                            <IconDeselect />
                        </div>
                        <span className="text-xs font-bold">Cancel</span>
                    </button>
                )}

                <button
                    onClick={onDelete}
                    disabled={!canDelete}
                    className={`flex items-center justify-center w-9 h-9 rounded transition-all ${canDelete ? 'text-red-500 hover:bg-red-50' : 'opacity-30 cursor-not-allowed text-gray-400'}`}
                    title="Delete Selected (Del)"
                >
                    <div className="w-5 h-5 flex items-center justify-center text-current">
                        <IconDelete />
                    </div>
                </button>
            </div>
        </div>
    );
};

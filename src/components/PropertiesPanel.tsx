import React from 'react';

export type PropertyType = 'number' | 'color' | 'boolean' | 'range' | 'text' | 'select' | 'separator' | 'note' | 'link' | 'action-group';

export interface PropertyConfig {
    label: string;
    type: PropertyType;
    value: any;
    onChange: (val: any) => void;
    min?: number;
    max?: number;
    step?: number;
    options?: string[]; // For select
    actions?: { label: string, value: string }[]; // For action-group
}

export interface PropertiesPanelProps {
    title: string;
    properties: PropertyConfig[];
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ title, properties }) => {
    if (!title) {
        return (
            <div className="p-4 bg-gray-50 border-l border-gray-300 h-full text-gray-400 text-xs flex items-center justify-center italic">
                Select an object to edit properties
            </div>
        );
    }

    return (
        <div className="w-full bg-white border-l border-gray-300 h-full flex flex-col shadow-none">
            {/* Header */}
            <div className="px-3 py-2 border-b border-gray-200 bg-gray-800">
                <h2 className="font-bold text-gray-400 uppercase text-[10px] tracking-wider mb-0.5">Properties</h2>
                <h3 className="text-sm font-bold text-white truncate">{title}</h3>
            </div>

            {/* Properties List */}
            <div className="p-3 space-y-3 overflow-y-auto custom-scrollbar">
                {properties.map((prop, idx) => (
                    <div key={idx} className={`flex ${['separator', 'note', 'link', 'action-group'].includes(prop.type) ? 'flex-col items-start gap-1' : 'flex-row items-center justify-between gap-2'}`}>
                        {prop.type === 'separator' && (
                            <div className="w-full h-px bg-gray-200 my-2"></div>
                        )}

                        {prop.type === 'note' && (
                            <p className="text-[10px] text-gray-500 italic leading-tight px-1">{prop.value}</p>
                        )}

                        {prop.type === 'link' && (
                            <a href={prop.value} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 hover:underline px-1 flex items-center gap-1">
                                <span>{prop.label}</span>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                            </a>
                        )}

                        {prop.type === 'action-group' && (
                            <div className="w-full">
                                {prop.label && <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide mb-2 block">{prop.label}</label>}
                                <div className="grid grid-cols-4 gap-1">
                                    {prop.actions?.map((action, i) => (
                                        <button
                                            key={i}
                                            onClick={() => prop.onChange(action.value)}
                                            className="h-8 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-[12px] font-serif text-gray-800 flex items-center justify-center transition-colors"
                                            title={action.value}
                                        >
                                            {action.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!['separator', 'note', 'link', 'action-group'].includes(prop.type) && (
                            <>
                                <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide flex-shrink-0">{prop.label}</label>

                                <div className="flex-1 flex justify-end min-w-0">
                                    {prop.type === 'color' && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-mono text-gray-500">{prop.value}</span>
                                            <input
                                                type="color"
                                                value={prop.value}
                                                onChange={(e) => prop.onChange(e.target.value)}
                                                className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                                            />
                                        </div>
                                    )}

                                    {prop.type === 'number' && (
                                        <input
                                            type="number"
                                            value={prop.value}
                                            onChange={(e) => prop.onChange(Number(e.target.value))}
                                            className="w-16 h-7 border border-gray-300 rounded-[2px] px-1.5 py-0.5 text-[11px] bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-right transition-colors"
                                            step={prop.step}
                                            min={prop.min}
                                            max={prop.max}
                                        />
                                    )}

                                    {prop.type === 'range' && (
                                        <div className="flex items-center gap-2 flex-1 justify-end">
                                            <input
                                                type="range"
                                                className="flex-1 w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                                value={prop.value}
                                                onChange={(e) => prop.onChange(Number(e.target.value))}
                                                min={prop.min}
                                                max={prop.max}
                                                step={prop.step}
                                            />
                                            <span className="text-[10px] w-6 text-right font-mono text-gray-600">{prop.value}</span>
                                        </div>
                                    )}

                                    {prop.type === 'boolean' && (
                                        <label className="flex items-center cursor-pointer relative">
                                            <input
                                                type="checkbox"
                                                checked={prop.value}
                                                onChange={(e) => prop.onChange(e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-7 h-4 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    )}

                                    {prop.type === 'text' && (
                                        <input
                                            type="text"
                                            value={prop.value}
                                            onChange={(e) => prop.onChange(e.target.value)}
                                            className="w-full h-7 border border-gray-300 rounded-[2px] px-2 py-0.5 text-[11px] bg-white focus:border-blue-500 outline-none text-right transition-colors"
                                        />
                                    )}

                                    {prop.type === 'select' && (
                                        <select
                                            value={prop.value}
                                            onChange={(e) => prop.onChange(e.target.value)}
                                            className="w-full h-7 border border-gray-300 rounded-[2px] px-1 py-0 text-[11px] bg-white focus:border-blue-500 outline-none text-right cursor-pointer"
                                        >
                                            {prop.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

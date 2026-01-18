import React from 'react';

export type PropertyType = 'number' | 'color' | 'boolean' | 'range' | 'text' | 'select';

export interface PropertyConfig {
    label: string;
    type: PropertyType;
    value: any;
    onChange: (val: any) => void;
    min?: number;
    max?: number;
    step?: number;
    options?: string[]; // For select
}

export interface PropertiesPanelProps {
    title: string;
    properties: PropertyConfig[];
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ title, properties }) => {
    if (!title) {
        return (
            <div className="p-4 bg-gray-50 border-l h-full text-gray-400 text-sm flex items-center justify-center italic">
                Select an object to edit properties
            </div>
        );
    }

    return (
        <div className="w-full bg-white border-l border-gray-200 h-full flex flex-col shadow-sm">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h2 className="font-bold text-gray-700 uppercase text-xs tracking-wider">Properties</h2>
                <h3 className="text-xl font-bold text-blue-600 mt-1">{title}</h3>
            </div>

            <div className="p-4 space-y-6 overflow-y-auto">
                {properties.map((prop, idx) => (
                    <div key={idx} className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase">{prop.label}</label>

                        {prop.type === 'color' && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={prop.value}
                                    onChange={(e) => prop.onChange(e.target.value)}
                                    className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                                />
                                <span className="text-xs font-mono text-gray-600">{prop.value}</span>
                            </div>
                        )}

                        {prop.type === 'number' && (
                            <input
                                type="number"
                                value={prop.value}
                                onChange={(e) => prop.onChange(Number(e.target.value))}
                                className="border rounded px-2 py-1 text-sm bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                                step={prop.step}
                                min={prop.min}
                                max={prop.max}
                            />
                        )}

                        {prop.type === 'range' && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="range"
                                    className="flex-1 accent-blue-600 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    value={prop.value}
                                    onChange={(e) => prop.onChange(Number(e.target.value))}
                                    min={prop.min}
                                    max={prop.max}
                                    step={prop.step}
                                />
                                <span className="text-xs w-8 text-right font-mono">{prop.value}</span>
                            </div>
                        )}

                        {prop.type === 'boolean' && (
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={prop.value}
                                    onChange={(e) => prop.onChange(e.target.checked)}
                                    className="accent-blue-600 w-4 h-4"
                                />
                                <span className="text-sm text-gray-700">{prop.value ? 'Enabled' : 'Disabled'}</span>
                            </label>
                        )}

                        {prop.type === 'text' && (
                            <input
                                type="text"
                                value={prop.value}
                                onChange={(e) => prop.onChange(e.target.value)}
                                className="border rounded px-2 py-1 text-sm bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                        )}

                        {prop.type === 'select' && (
                            <select
                                value={prop.value}
                                onChange={(e) => prop.onChange(e.target.value)}
                                className="border rounded px-2 py-1 text-sm bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                            >
                                {prop.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

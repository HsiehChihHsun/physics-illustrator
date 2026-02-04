import { Vector2, Point } from '../geometry/Vector2';

export type ObjectType = 'spring' | 'wall' | 'block' | 'pulley' | 'vector' | 'line' | 'catenary' | 'triangle' | 'circle' | 'text'
    | 'dcsource' | 'acsource' | 'resistor' | 'inductor' | 'capacitor' | 'diode' | 'switch' | 'wire' | 'linearmarker';

export interface BaseObject {
    id: string;
    type: ObjectType;
    selected?: boolean;
}

export interface SpringObject extends BaseObject {
    type: 'spring';
    start: Point;
    end: Point;
    coils: number;
    width: number;
    style: 'coil' | 'zigzag' | 'spiral';
    label?: string;
    flipLabel?: boolean;
    fontSize?: number;
    spiralStart?: number; // degrees
    spiralEnd?: number; // degrees
    bold?: boolean;
    italic?: boolean;
    wireRatio?: number;
}

export interface WallObject extends BaseObject {
    type: 'wall';
    start: Point;
    end: Point;
    hatchAngle: number;
}

export interface BlockObject extends BaseObject {
    type: 'block';
    center: Point;
    size: Vector2;
    massLabel: string;
    rotation: number;
    fontSize?: number;
    bold?: boolean;
    italic?: boolean;
}

export interface LineObject extends BaseObject {
    type: 'line';
    start: Point;
    end: Point;
    color: string;
    width: number;
    dashed: boolean;
}

export interface CatenaryObject extends BaseObject {
    type: 'catenary';
    start: Point;
    end: Point;
    slack: number;
    color: string;
}

// Pulley: Simple visual, no rope logic
export interface PulleyObject extends BaseObject {
    type: 'pulley';
    center: Point;
    radius: number;
    hasHanger: boolean;
    hangerLength: number;
    hangerAngle: number; // Stored in radians
}

export interface VectorObject extends BaseObject {
    type: 'vector'; // Renamed from 'force'
    anchor: Point;
    tip: Point;
    label: string;
    showComponents: boolean;
    smartSnapping?: boolean; // New Feature Toggle
    flipLabel?: boolean; // New prop for label placement
    fontSize?: number;
    color?: string;
    bold?: boolean;
    italic?: boolean;
    // New Visual Props
    lineStyle?: 'solid' | 'dashed';
    strokeWidth?: number; // 1-10, default 2
    headStyle?: 'filled' | 'hollow' | 'simple';
    arrowSize?: number; // Head Length, default 16
    arrowWidth?: number; // Head Width, default 12
}



export interface TriangleObject extends BaseObject {
    type: 'triangle';
    p1: Point;
    p2: Point;
    p3: Point;
}

export interface CircleObject extends BaseObject {
    type: 'circle';
    center: Point;
    radius: number;
}

export interface TextObject extends BaseObject {
    type: 'text';
    center: Point;
    content: string;
    fontSize: number;
    rotation: number; // Rotation in radians
    bold?: boolean;
    italic?: boolean;
}

export interface LinearMarkerObject extends BaseObject {
    type: 'linearmarker';
    anchor: Point;
    tip: Point;
    label: string;
    flipLabel?: boolean;
    fontSize?: number;
    color?: string;
    bold?: boolean;
    italic?: boolean;
    // New Props for Linear Marker
    showOneArrow?: boolean; // false = double, true = single (at tip)
    textOnLine?: boolean; // false = side, true = on line with bg
    dashedExtension?: boolean;
    showExtensions?: boolean; // Toggle vertical lines
    extensionLength?: number; // 0-20
    flipExtension?: boolean; // New: Flip extension direction
    strokeWidth?: number;
    arrowSize?: number; // Head Length
    arrowWidth?: number; // Head Width
    labelShiftX?: number; // New: Horizontal shift for label
}

export type PhysicsObject =
    | SpringObject
    | WallObject
    | BlockObject
    | LineObject
    | CatenaryObject
    | PulleyObject
    | VectorObject
    | TriangleObject
    | CircleObject
    | TextObject
    | DCSourceObject
    | ACSourceObject
    | ResistorObject
    | InductorObject
    | CapacitorObject
    | DiodeObject
    | SwitchObject
    | WireObject
    | LinearMarkerObject;

export interface DCSourceObject extends BaseObject {
    type: 'dcsource';
    start: Point;
    end: Point;
    cells: number;
    showPolarity: boolean;
    flipPolarity: boolean;
    showTerminals: boolean;
    width: number;
    spacing: number;
    label?: string;
    flipLabel?: boolean;
    fontSize?: number;
    bold?: boolean;
    italic?: boolean;
    startDot?: boolean;
    endDot?: boolean;
}

export interface ACSourceObject extends BaseObject {
    type: 'acsource';
    center: Point; // Center of the circle
    radius: number; // Size of the AC source
    label?: string;
    flipLabel?: boolean;
    fontSize?: number;
    bold?: boolean;
    italic?: boolean;
}

export interface ResistorObject extends BaseObject {
    type: 'resistor';
    start: Point;
    end: Point;
    width: number; // Amplitude of zigzag
    coils: number; // Number of peaks
    label?: string;
    flipLabel?: boolean;
    fontSize?: number;
    bold?: boolean;
    italic?: boolean;
    startDot?: boolean;
    endDot?: boolean;
}

export interface InductorObject extends BaseObject {
    type: 'inductor';
    start: Point;
    end: Point;
    width: number; // Amplitude of loops
    coils: number; // Number of loops
    label?: string;
    flipLabel?: boolean;
    fontSize?: number;
    bold?: boolean;
    italic?: boolean;
    startDot?: boolean;
    endDot?: boolean;
    spiralStart?: number; // degrees
    spiralEnd?: number; // degrees
    wireRatio?: number; // 0 to 0.5, default 0.15
}

export interface CapacitorObject extends BaseObject {
    type: 'capacitor';
    start: Point;
    end: Point;
    width: number; // Plate size
    separation: number; // Distance between plates
    label?: string;
    flipLabel?: boolean;
    fontSize?: number;
    bold?: boolean;
    italic?: boolean;
    startDot?: boolean;
    endDot?: boolean;
}

export interface DiodeObject extends BaseObject {
    type: 'diode';
    start: Point;
    end: Point;
    scale: number;
    label?: string;
    flipLabel?: boolean;
    fontSize?: number;
    bold?: boolean;
    italic?: boolean;
    startDot?: boolean;
    endDot?: boolean;
}

export interface SwitchObject extends BaseObject {
    type: 'switch';
    start: Point;
    end: Point;
    isOpen: boolean; // Not used for logic, just visual. Could be a future prop. Default visual is open.
    angle: number; // Angle of the open switch blade
    label?: string;
    flipLabel?: boolean;
    fontSize?: number;
    bold?: boolean;
    italic?: boolean;
    startDot?: boolean;
    endDot?: boolean;
}

export interface WireObject extends BaseObject {
    type: 'wire';
    start: Point;
    end: Point;
    startDot: boolean;
    endDot: boolean;
    showArrow: boolean;
    flipArrow: boolean;
    label?: string;
    flipLabel?: boolean;
    fontSize?: number;
    bold?: boolean;
    italic?: boolean;
}

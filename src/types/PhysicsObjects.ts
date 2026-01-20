import { Vector2, Point } from '../geometry/Vector2';

export type ObjectType = 'spring' | 'wall' | 'block' | 'pulley' | 'vector' | 'line' | 'catenary' | 'triangle' | 'circle' | 'text';

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
    bold?: boolean;
    italic?: boolean;
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
    | TextObject;

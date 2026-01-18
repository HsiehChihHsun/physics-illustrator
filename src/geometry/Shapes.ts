/**
 * Shapes.ts
 * Geometric primitives constructed from Vectors.
 */

import { Vector2, Point } from './Vector2';

export class Segment {
    readonly start: Point;
    readonly end: Point;

    constructor(start: Point, end: Point) {
        this.start = start;
        this.end = end;
    }

    length(): number {
        return this.start.distanceTo(this.end);
    }

    direction(): Vector2 {
        return this.end.subtract(this.start).normalize();
    }

    // Returns a vector perpendicular to the segment (rotated 90 degrees CCW)
    normal(): Vector2 {
        return this.direction().perpendicular();
    }
}

export class Circle {
    readonly center: Point;
    readonly radius: number;

    constructor(center: Point, radius: number) {
        this.center = center;
        this.radius = radius;
    }
}

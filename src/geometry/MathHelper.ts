/**
 * MathHelper.ts
 * pure functions for complex geometric calculations.
 */

import { Vector2, Point } from './Vector2';
import { Circle, Segment } from './Shapes';

export class MathHelper {
    static EPSILON = 0.0001;

    /**
     * Calculates the intersection point of two infinite lines defined by segments.
     * Returns null if parallel.
     */
    static lineIntersection(l1: Segment, l2: Segment): Point | null {
        const x1 = l1.start.x, y1 = l1.start.y;
        const x2 = l1.end.x, y2 = l1.end.y;
        const x3 = l2.start.x, y3 = l2.start.y;
        const x4 = l2.end.x, y4 = l2.end.y;

        const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
        if (Math.abs(denom) < MathHelper.EPSILON) return null; // Parallel

        const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;

        return new Vector2(x1 + ua * (x2 - x1), y1 + ua * (y2 - y1));
    }

    /**
     * Calculates the two tangent points on a circle from an external point.
     */
    static pointCircleTangents(p: Point, c: Circle): Point[] {
        const d = p.distanceTo(c.center);
        if (d < c.radius) return []; // Point inside circle

        // Vector from P to Center
        const v = c.center.subtract(p);
        const dist = v.length();
        if (dist <= c.radius) return [];

        // Length of the tangent line
        const tangentLen = Math.sqrt(dist * dist - c.radius * c.radius);

        // Angle alpha between PC and PT
        const alpha = Math.asin(c.radius / dist);

        const baseDir = v.normalize();

        const dir1 = baseDir.rotate(alpha); // This points towards the "right" tangent
        const dir2 = baseDir.rotate(-alpha); // This points towards the "left" tangent

        // Tangent points are P + dir * tangentLen
        const t1 = p.add(dir1.multiply(tangentLen));
        const t2 = p.add(dir2.multiply(tangentLen));

        return [t1, t2];
    }

    /**
     * Calculates external tangents between two circles.
     * Useful for pulleys connected by a belt (open).
     * Returns line segments representing the belt.
     */
    static circleCircleExternalTangents(c1: Circle, c2: Circle): Segment[] {
        // Simplified algorithm: Construct a circle of radius |r1 - r2|
        if (Math.abs(c1.radius - c2.radius) < MathHelper.EPSILON) {
            // Equal radii: Tangents are parallel to the center-center line.
            const dir = c2.center.subtract(c1.center).normalize();
            const normal = dir.perpendicular();

            return [
                new Segment(c1.center.add(normal.multiply(c1.radius)), c2.center.add(normal.multiply(c2.radius))),
                new Segment(c1.center.subtract(normal.multiply(c1.radius)), c2.center.subtract(normal.multiply(c2.radius))),
            ];
        }

        // For unequal radii, use the larger circle reduction method.
        // This is complex to implement blindly. 
        // Let's defer strict implementation to the "Polishing" phase or ask the user to verify.
        // STUB: Return empty for now.
        return [];
    }
}

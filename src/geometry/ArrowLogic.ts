import { Vector2, Point } from './Vector2';

export interface ArrowConfig {
    start: Point;
    end: Point;
    headSize: number;
    color: string;
    width: number;
}

export class ArrowLogic {
    /**
     * Returns the points for the arrowhead triangle.
     */
    static solveArrowHead(end: Point, direction: Vector2, size: number): { path: string } {
        // Direction is normalized vector pointing from Start to End

        // 1. Back vector
        const back = direction.multiply(-1);

        // 2. Left and Right perpendiculars relative to the line (to make the arrow base)
        // Arrow head shape: Triangle
        // Tip at 'end'.
        // Base center at 'end + back * size'
        // Base width: let's say 0.6 * size

        const baseCenter = end.add(back.multiply(size));
        const perp = direction.perpendicular(); // (-y, x)

        // Base corners
        const width = size * 0.6;
        const left = baseCenter.add(perp.multiply(width));
        const right = baseCenter.subtract(perp.multiply(width)); // or add(perp.mul(-width))

        // Path
        // M end L left L right Z
        return {
            path: `M ${end.x} ${end.y} L ${left.x} ${left.y} L ${right.x} ${right.y} Z`
        };
    }
}

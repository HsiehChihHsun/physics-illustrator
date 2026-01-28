import { Point } from '../geometry/Vector2';

export interface HandleDef {
    objectId: string;
    handleType: 'start' | 'end' | 'center' | 'tip' | 'ropeStart' | 'ropeEnd' | 'radius' | 'p1' | 'p2' | 'p3' | 'mid_top' | 'mid_bottom' | 'mid_left' | 'mid_right' | 'anchor';
    position: Point;
}

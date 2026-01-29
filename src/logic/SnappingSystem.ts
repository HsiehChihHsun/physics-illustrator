import { Vector2 } from '../geometry/Vector2';
import type { PhysicsObject, WallObject, BlockObject } from '../types/PhysicsObjects';

export interface SnapResult {
    position: Vector2;
    snappedTo: 'none' | 'grid' | 'object' | 'normal' | 'tangent' | 'midpoint';
    guideLine?: { start: Vector2, end: Vector2 };
}

// Helper: Distance from point P to segment VW
function distToSegmentSquared(p: Vector2, v: Vector2, w: Vector2): { distSq: number, closest: Vector2 } {
    const l2 = v.distanceTo(w) ** 2;
    // If line is a point
    if (l2 === 0) return { distSq: p.distanceTo(v) ** 2, closest: v };

    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    const closest = new Vector2(v.x + t * (w.x - v.x), v.y + t * (w.y - v.y));
    return { distSq: p.distanceTo(closest) ** 2, closest };
}

export const getSnapCandidate = (
    scene: PhysicsObject[],
    activePoint: Vector2,
    currentObjectId: string,
    threshold: number = 15,
    context?: { anchor?: Vector2 },
    useSmartSnapping: boolean = true // Toggle
): SnapResult => {

    let bestDistSq = threshold * threshold;
    let bestSnap: SnapResult = { position: activePoint, snappedTo: 'none' };

    // Standard for checking if we are "near" an angular snap
    // We only check angular snap if we are dragging a Vector TIP (context.anchor is present)

    // We iterate all objects
    for (const obj of scene) {
        if (obj.id === currentObjectId) continue;

        if (obj.type === 'wall') {
            const w = obj as WallObject;

            if (useSmartSnapping) {
                // 1. Positional Snap (Stick to wall line)
                const res = distToSegmentSquared(activePoint, w.start, w.end);
                if (res.distSq < bestDistSq) {
                    bestDistSq = res.distSq;
                    bestSnap = { position: res.closest, snappedTo: 'object' };
                }

                // 2. Angular Snap (If Vector)
                if (context?.anchor) {
                    const anchorSnap = distToSegmentSquared(context.anchor, w.start, w.end);
                    if (anchorSnap.distSq < 400) {
                        const wallVec = w.end.subtract(w.start);
                        if (wallVec.length() < 0.1) continue;

                        const unitWall = wallVec.normalize();
                        const unitNormal = new Vector2(-unitWall.y, unitWall.x); // 90 deg standard

                        // Current Vector
                        const vecDisplacement = activePoint.subtract(context.anchor);
                        const vecLen = vecDisplacement.length();
                        if (vecLen < 5) continue; // Too short to have angle

                        const unitVec = vecDisplacement.normalize();

                        // Check Perpendicular (Normal Force)
                        const dotNorm = unitVec.dot(unitNormal);
                        if (Math.abs(dotNorm) > 0.97) {
                            const sign = Math.sign(dotNorm);
                            const snapPos = context.anchor.add(unitNormal.multiply(vecLen * sign || vecLen));
                            if (activePoint.distanceTo(snapPos) < threshold) {
                                return { position: snapPos, snappedTo: 'normal', guideLine: { start: context.anchor, end: snapPos } };
                            }
                        }

                        // Check Parallel (Friction)
                        const dotTan = unitVec.dot(unitWall);
                        if (Math.abs(dotTan) > 0.97) {
                            const sign = Math.sign(dotTan);
                            const snapPos = context.anchor.add(unitWall.multiply(vecLen * sign || vecLen));
                            if (activePoint.distanceTo(snapPos) < threshold) {
                                return { position: snapPos, snappedTo: 'tangent', guideLine: { start: context.anchor, end: snapPos } };
                            }
                        }
                    }
                }
            } else {
                // Smart Snapping OFF:
                // Snap to endpoints and center only? 
                // Wall has Start, End, Center.
                const points = [w.start, w.end, w.start.add(w.end).div(2)];
                for (const p of points) {
                    const d = activePoint.distanceTo(p) ** 2;
                    if (d < bestDistSq) {
                        bestDistSq = d;
                        bestSnap = { position: p, snappedTo: 'midpoint' };
                    }
                }
            }
        }
        else if (obj.type === 'block') {
            const b = obj as BlockObject;
            // Block has 4 sides. 
            // Calculate corners
            const halfW = b.size.x / 2;
            const halfH = b.size.y / 2;
            const rot = b.rotation;
            const c = b.center;

            const rotate = (dx: number, dy: number) => {
                return new Vector2(
                    c.x + dx * Math.cos(rot) - dy * Math.sin(rot),
                    c.y + dx * Math.sin(rot) + dy * Math.cos(rot)
                );
            };

            const p1 = rotate(-halfW, -halfH); // TopLeft
            const p2 = rotate(halfW, -halfH);  // TopRight
            const p3 = rotate(halfW, halfH);   // BottomRight
            const p4 = rotate(-halfW, halfH);  // BottomLeft

            const segments = [[p1, p2], [p2, p3], [p3, p4], [p4, p1]];

            // Retrieve the active object to check its type
            const activeObj = scene.find(o => o.id === currentObjectId);
            // Only allow specialized Block snapping (edges/normals) if the active object is a VECTOR
            // AND smart snapping is enabled. For all other objects, or if disabled, just snap to midpoints (standard behavior).
            const isVector = activeObj?.type === 'vector';
            const shouldSnapEdges = isVector && useSmartSnapping;

            if (shouldSnapEdges) {
                for (const [start, end] of segments) {
                    // Positional
                    const res = distToSegmentSquared(activePoint, start, end);
                    if (res.distSq < bestDistSq) {
                        bestDistSq = res.distSq;
                        bestSnap = { position: res.closest, snappedTo: 'object' };
                    }

                    // Angular
                    if (context?.anchor) {
                        const anchorSnap = distToSegmentSquared(context.anchor, start, end);
                        if (anchorSnap.distSq < 400) {
                            const wallVec = end.subtract(start).normalize();
                            const unitNormal = new Vector2(-wallVec.y, wallVec.x);

                            const vecDisp = activePoint.subtract(context.anchor);
                            const vecLen = vecDisp.length();
                            if (vecLen < 5) continue;
                            const unitVec = vecDisp.normalize();

                            if (Math.abs(unitVec.dot(unitNormal)) > 0.97) {
                                const snapPos = context.anchor.add(unitNormal.multiply(vecLen * Math.sign(unitVec.dot(unitNormal))));
                                if (activePoint.distanceTo(snapPos) < threshold) {
                                    return { position: snapPos, snappedTo: 'normal', guideLine: { start: context.anchor, end: snapPos } };
                                }
                            }
                            if (Math.abs(unitVec.dot(wallVec)) > 0.97) {
                                const snapPos = context.anchor.add(wallVec.multiply(vecLen * Math.sign(unitVec.dot(wallVec))));
                                if (activePoint.distanceTo(snapPos) < threshold) {
                                    return { position: snapPos, snappedTo: 'tangent', guideLine: { start: context.anchor, end: snapPos } };
                                }
                            }
                        }
                    }
                }
            } else {
                // Smart Snapping OFF or NOT a Vector: Snap to 4 Midpoints only
                for (const [start, end] of segments) {
                    const mid = start.add(end).div(2);
                    const d = activePoint.distanceTo(mid) ** 2;
                    if (d < bestDistSq) {
                        bestDistSq = d;
                        bestSnap = { position: mid, snappedTo: 'midpoint' };
                    }
                }
            }
        }
    }

    return bestSnap;
};

import { Vector2, Point } from '../geometry/Vector2';
import type {
    PhysicsObject, BlockObject, VectorObject,
    SpringObject, LineObject, CatenaryObject, WallObject, PulleyObject, TriangleObject, CircleObject, TextObject
} from '../types/PhysicsObjects';

const UNIT_PX = 6.25;

// Helper to rotate point around center
const rotate = (p: { x: number, y: number }, c: { x: number, y: number }, a: number) => {
    const dx = p.x - c.x;
    const dy = p.y - c.y;
    return new Vector2(
        c.x + dx * Math.cos(a) - dy * Math.sin(a),
        c.y + dx * Math.sin(a) + dy * Math.cos(a)
    );
};

export const updateObjectFromHandle = (
    obj: PhysicsObject,
    handleType: string,
    newPos: Point
): PhysicsObject => {
    const p = new Vector2(newPos.x, newPos.y);

    switch (obj.type) {
        case 'spring':
        case 'line':
        case 'catenary':
        case 'wall':
        case 'wire':
        case 'dcsource':
        case 'resistor':
        case 'inductor':
        case 'capacitor':
        case 'diode':
        case 'switch': {
            // These all have start/end
            const o = obj as any; // Safe cast as we check props
            if (handleType === 'start') return { ...o, start: p };
            if (handleType === 'end') return { ...o, end: p };
            if (handleType === 'center') {
                // Move both start and end by delta
                const currentCenter = o.start.add(o.end).div(2);
                const delta = p.subtract(currentCenter);
                return { ...o, start: o.start.add(delta), end: o.end.add(delta) };
            }
            break;
        }
        case 'block': {
            const o = obj as BlockObject;
            if (handleType === 'center') return { ...o, center: p };

            // Symmetric Resizing logic for rotated blocks
            if (handleType.startsWith('mid_')) {
                // We need distance from center projected onto the local axis
                // But handle is snapped to grid, so p is absolute.
                const dVec = p.subtract(o.center);

                // Rotate dVec by -rotation to get local coords
                const cos = Math.cos(-o.rotation);
                const sin = Math.sin(-o.rotation);
                const localDx = dVec.x * cos - dVec.y * sin;
                const localDy = dVec.x * sin + dVec.y * cos;

                const newSize = { ...o.size };

                if (handleType === 'mid_left' || handleType === 'mid_right') {
                    // Width
                    newSize.x = Math.abs(localDx) * 2;
                    // Clamp min size
                    if (newSize.x < 2 * UNIT_PX) newSize.x = 2 * UNIT_PX;
                } else {
                    // Height
                    newSize.y = Math.abs(localDy) * 2;
                    if (newSize.y < 2 * UNIT_PX) newSize.y = 2 * UNIT_PX;
                }
                return { ...o, size: new Vector2(newSize.x, newSize.y) };
            }
            break;
        }
        case 'pulley': {
            const o = obj as PulleyObject;
            if (handleType === 'center') return { ...o, center: p };
            // Pulley specific props handled here if extended (ropeStart/End are not in base PulleyObject yet but in code usage in App.tsx they were hinted at)
            break;
        }
        case 'vector': {
            const o = obj as VectorObject;
            if (handleType === 'start') return { ...o, anchor: p };
            if (handleType === 'tip') return { ...o, tip: p };
            if (handleType === 'center') {
                const center = o.anchor.add(o.tip).div(2);
                const delta = p.subtract(center);
                return { ...o, anchor: o.anchor.add(delta), tip: o.tip.add(delta) };
            }
            break;
        }
        case 'triangle': {
            const o = obj as TriangleObject;
            if (handleType === 'p1') return { ...o, p1: p };
            if (handleType === 'p2') return { ...o, p2: p };
            if (handleType === 'p3') return { ...o, p3: p };
            break;
        }
        case 'circle':
        case 'acsource': {
            const o = obj as any;
            if (handleType === 'center') return { ...o, center: p };
            if (handleType === 'radius') {
                let r = p.distanceTo(o.center);
                if (r < 1) r = 1;
                return { ...o, radius: r };
            }
            break;
        }
        case 'text': {
            const o = obj as TextObject;
            if (handleType === 'center') return { ...o, center: p };
            break;
        }
    }
    return obj;
};

// Helper for handle generation (moving usage from App.tsx)
export const getHandlesForObject = (obj: PhysicsObject): { objectId: string, handleType: string, position: Point }[] => {
    const list: { objectId: string, handleType: string, position: Point }[] = [];

    // Note: HandleType needs to be cast to strict type if we import HandleDef. 
    // For now returning generic structure matching the Logic.

    if (obj.type === 'spring') {
        const o = obj as SpringObject;
        list.push({ objectId: o.id, handleType: 'start', position: o.start });
        list.push({ objectId: o.id, handleType: 'end', position: o.end });
        list.push({ objectId: o.id, handleType: 'center', position: o.start.add(o.end).div(2) });
    } else if (obj.type === 'line') {
        const o = obj as LineObject;
        list.push({ objectId: o.id, handleType: 'start', position: o.start });
        list.push({ objectId: o.id, handleType: 'end', position: o.end });
        list.push({ objectId: o.id, handleType: 'center', position: o.start.add(o.end).div(2) });
    } else if (obj.type === 'catenary') {
        const o = obj as CatenaryObject;
        list.push({ objectId: o.id, handleType: 'start', position: o.start });
        list.push({ objectId: o.id, handleType: 'end', position: o.end });
    } else if (obj.type === 'wall') {
        const o = obj as WallObject;
        list.push({ objectId: o.id, handleType: 'start', position: o.start });
        list.push({ objectId: o.id, handleType: 'end', position: o.end });
        list.push({ objectId: o.id, handleType: 'center', position: o.start.add(o.end).div(2) });
    } else if (obj.type === 'block') {
        const o = obj as BlockObject;
        list.push({ objectId: o.id, handleType: 'center', position: o.center });

        const halfW = o.size.x / 2;
        const halfH = o.size.y / 2;
        const rot = o.rotation;

        const top = { x: o.center.x, y: o.center.y - halfH };
        const bottom = { x: o.center.x, y: o.center.y + halfH };
        const left = { x: o.center.x - halfW, y: o.center.y };
        const right = { x: o.center.x + halfW, y: o.center.y };

        list.push({ objectId: o.id, handleType: 'mid_top', position: rotate(top, o.center, rot) });
        list.push({ objectId: o.id, handleType: 'mid_bottom', position: rotate(bottom, o.center, rot) });
        list.push({ objectId: o.id, handleType: 'mid_left', position: rotate(left, o.center, rot) });
        list.push({ objectId: o.id, handleType: 'mid_right', position: rotate(right, o.center, rot) });

    } else if (obj.type === 'pulley') {
        const o = obj as PulleyObject;
        list.push({ objectId: o.id, handleType: 'center', position: o.center });
    } else if (obj.type === 'vector') {
        const o = obj as VectorObject;
        list.push({ objectId: o.id, handleType: 'start', position: o.anchor });
        list.push({ objectId: o.id, handleType: 'tip', position: o.tip });
        list.push({ objectId: o.id, handleType: 'center', position: o.anchor.add(o.tip).div(2) });
    } else if (obj.type === 'triangle') {
        const o = obj as TriangleObject;
        list.push({ objectId: o.id, handleType: 'p1', position: o.p1 });
        list.push({ objectId: o.id, handleType: 'p2', position: o.p2 });
        list.push({ objectId: o.id, handleType: 'p3', position: o.p3 });
    } else if (obj.type === 'circle') {
        const o = obj as CircleObject;
        list.push({ objectId: o.id, handleType: 'center', position: o.center });
        list.push({ objectId: o.id, handleType: 'radius', position: new Vector2(o.center.x + o.radius, o.center.y) });
    } else if (obj.type === 'text') {
        const o = obj as TextObject;
        list.push({ objectId: o.id, handleType: 'center', position: o.center });
    } else if (obj.type === 'wire') {
        const o = obj as any; // WireObject has start/end
        list.push({ objectId: o.id, handleType: 'start', position: o.start });
        list.push({ objectId: o.id, handleType: 'end', position: o.end });
        list.push({ objectId: o.id, handleType: 'center', position: o.start.add(o.end).div(2) });
    } else if (['dcsource', 'resistor', 'inductor', 'capacitor', 'diode', 'switch'].includes(obj.type)) {
        // Linear components with start/end
        const o = obj as any;
        list.push({ objectId: o.id, handleType: 'start', position: o.start });
        list.push({ objectId: o.id, handleType: 'end', position: o.end });
        list.push({ objectId: o.id, handleType: 'center', position: o.start.add(o.end).div(2) });
    } else if (obj.type === 'acsource') {
        const o = obj as any; // ACSourceObject
        list.push({ objectId: o.id, handleType: 'center', position: o.center });
        // Anchors (Top, Bottom, Left, Right) based on radius
        // Note: These handles are for snapping. If not handled in updateObjectFromHandle, they won't resize/move the object, which matches "control radius in properties only"
        list.push({ objectId: o.id, handleType: 'top', position: new Vector2(o.center.x, o.center.y - o.radius) });
        list.push({ objectId: o.id, handleType: 'bottom', position: new Vector2(o.center.x, o.center.y + o.radius) });
        list.push({ objectId: o.id, handleType: 'left', position: new Vector2(o.center.x - o.radius, o.center.y) });
        list.push({ objectId: o.id, handleType: 'right', position: new Vector2(o.center.x + o.radius, o.center.y) });
    }

    return list;
};

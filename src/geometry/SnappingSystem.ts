/**
 * SnappingSystem.ts
 * Logic for "Smart Snapping" - sticking cursor to grids, points, and alignments.
 */

import { Vector2, Point } from './Vector2';

export interface SnapResult {
    position: Point;
    snappedTo: 'none' | 'grid' | 'object' | 'alignment';
    target?: Point; // The original point we snapped TO
}

export interface SnapConfig {
    gridSize: number;
    snapThreshold: number; // Pixels
    enabled: boolean;
}

export class SnappingSystem {
    static defaultConfig: SnapConfig = {
        gridSize: 50,
        snapThreshold: 10,
        enabled: true
    };

    /**
     * Attempts to snap a candidate point based on active rules.
     * Priority: Object Points > Grid.
     */
    static snap(
        candidate: Point,
        interestingPoints: Point[] = [],
        config: SnapConfig = SnappingSystem.defaultConfig
    ): SnapResult {
        if (!config.enabled) return { position: candidate, snappedTo: 'none' };

        // 1. Object Snapping (Points of Interest)
        // Check if we are close to any existing important point (endpoints, centers)
        let bestObjectDist = config.snapThreshold;
        let bestObjectPoint: Point | null = null;

        for (const p of interestingPoints) {
            const dist = candidate.distanceTo(p);
            if (dist < bestObjectDist) {
                bestObjectDist = dist;
                bestObjectPoint = p;
            }
        }

        if (bestObjectPoint) {
            return { position: bestObjectPoint, snappedTo: 'object', target: bestObjectPoint };
        }

        // 2. Grid Snapping
        // Standard modular arithmetic snap
        const gs = config.gridSize;
        const gridX = Math.round(candidate.x / gs) * gs;
        const gridY = Math.round(candidate.y / gs) * gs;
        const gridPoint = new Vector2(gridX, gridY);

        if (candidate.distanceTo(gridPoint) < config.snapThreshold) {
            return { position: gridPoint, snappedTo: 'grid', target: gridPoint };
        }

        // 3. No Snap
        return { position: candidate, snappedTo: 'none' };
    }
}

/**
 * Vector2.ts
 * Core geometric primitive for the Physics Illustrator.
 * Immutable design pattern.
 */

export class Vector2 {
  readonly x: number;
  readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  static zero = new Vector2(0, 0);
  static right = new Vector2(1, 0);
  static up = new Vector2(0, -1); // Canvas Y is down, but physics Y is up. Stick to Canvas coords for now? 
  // DECISION: Let's stick to standard Cartesian for logic, and map to Canvas later. 
  // So Up is (0, 1).
  // --- Instance Methods ---

  add(v: Vector2): Vector2 {
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  subtract(v: Vector2): Vector2 {
    return new Vector2(this.x - v.x, this.y - v.y);
  }

  multiply(scalar: number): Vector2 {
    return new Vector2(this.x * scalar, this.y * scalar);
  }

  div(scalar: number): Vector2 {
    if (scalar === 0) throw new Error("Division by zero");
    return new Vector2(this.x / scalar, this.y / scalar);
  }

  // Magnitude
  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  magSq(): number {
    return this.x * this.x + this.y * this.y;
  }

  normalize(): Vector2 {
    const m = this.length();
    return m === 0 ? Vector2.zero : this.div(m);
  }

  dot(v: Vector2): number {
    return this.x * v.x + this.y * v.y;
  }

  cross(v: Vector2): number {
    return this.x * v.y - this.y * v.x;
  }

  // Rotate counter-clockwise by radians
  rotate(angle: number): Vector2 {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vector2(
      this.x * cos - this.y * sin,
      this.x * sin + this.y * cos
    );
  }

  distanceTo(v: Vector2): number {
    return this.subtract(v).length();
  }

  perpendicular(): Vector2 {
    return new Vector2(-this.y, this.x);
  }

  toString(): string {
    return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
  }
}

export type Point = Vector2;
export const Point = Vector2;

export type Point = { x: number; y: number; visibility?: number };

export function angleBetween(a: Point, b: Point, c: Point): number {
  const ba = { x: a.x - b.x, y: a.y - b.y };
  const bc = { x: c.x - b.x, y: c.y - b.y };
  const dot = ba.x * bc.x + ba.y * bc.y;
  const magBa = Math.hypot(ba.x, ba.y);
  const magBc = Math.hypot(bc.x, bc.y);
  if (magBa === 0 || magBc === 0) return 180;
  const cos = Math.min(1, Math.max(-1, dot / (magBa * magBc)));
  return (Math.acos(cos) * 180) / Math.PI;
}

export function lineDeviation(a: Point, b: Point, c: Point): number {
  return Math.abs(180 - angleBetween(a, b, c));
}

export function visibilityOf(...points: Point[]): number {
  const vis = points.map((p) => p.visibility ?? 1);
  return vis.reduce((a, b) => a + b, 0) / vis.length;
}

export function pickSide<T>(left: T, right: T, leftVis: number, rightVis: number): T {
  return leftVis >= rightVis ? left : right;
}

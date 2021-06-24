/*
 * Copyright 2021 Zindex Software
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
    Brush,
    BrushType,
    clamp,
    Color,
    Path,
    PathNode,
    Point,
    RectShapeRadius,
    round,
    SolidBrush
} from "@zindex/canvas-engine";

export type InterpolationFunction<T> = (from: T, to: T, percent: number) => T;

export function interpolateNumber(from: number, to: number, percent: number = 0.5): number {
    return from + percent * (to - from);
}

export function interpolatePositiveNumber(from: number, to: number, percent: number = 0.5): number {
    return Math.max(0, from + percent * (to - from));
}

export function interpolatePercent(from: number, to: number, percent: number = 0.5): number {
    return clamp(interpolateNumber(from, to, percent), 0, 1);
}

export function interpolateColorComponent(from: number, to: number, percent: number = 0.5): number {
    return clamp(Math.round(from + percent * (to - from)), 0, 255);
}

export function interpolateAlphaComponent(from: number, to: number, percent: number = 0.5): number {
    if (from == null) {
        from = 1;
    }
    if (to == null) {
        to = 1;
    }
    return clamp(round(from + percent * (to - from)), 0, 1);
}

export function interpolateDiscrete(from: any, to: any, percent: number = 0.5): any {
    return percent < 0.5 ? from : to;
}

export function interpolatePoint(from: Point, to: Point, percent: number = 0.5): Point {
    return new Point(
        interpolateNumber(from.x, to.x, percent),
        interpolateNumber(from.y, to.y, percent),
    );
}

export function interpolatePoly(from: Point[], to: Point[], percent: number = 0.5): Point[] {
    if (from.length !== to.length) {
        return interpolateDiscrete(from, to, percent).slice();
    }

    const list = [];

    const length = from.length;

    for (let i = 0; i < length; i++) {
        list.push(interpolatePoint(from[i], to[i], percent));
    }

    return list;
}

export function interpolateColor(from: Color, to: Color, percent: number = 0.5): Color {
    if (percent <= 0) {
        return from;
    }

    if (percent >= 1) {
        return to;
    }

    return new Color(
        interpolateColorComponent(from.r, to.r, percent),
        interpolateColorComponent(from.g, to.g, percent),
        interpolateColorComponent(from.b, to.b, percent),
        interpolateAlphaComponent(from.a, to.a, percent),
    );
}

export function interpolateBrush(from: Brush, to: Brush, percent: number = 0.5): Brush {
    if (from.type !== to.type) {
        return interpolateDiscrete(from, to, percent);
    }

    switch (from.type) {
        case BrushType.Solid:
            return new SolidBrush((from as SolidBrush).color.interpolate((to as SolidBrush).color, percent));
            // TODO: ...
    }

    return interpolateDiscrete(from, to, percent);
}

export function interpolateDashArray(from: number[], to: number[], percent: number = 0.5): number[] {
    // TODO:
    return percent < 0.5 ? from : to;
}

export function interpolateMotion(from: PathNode, to: PathNode, percent: number = 0.5): PathNode {
    // TODO:
    // @ts-ignore
    return interpolatePoint(from, to, percent);
}

export function interpolateRectRadius(from: RectShapeRadius, to: RectShapeRadius, percent: number = 0.5): RectShapeRadius {
    // TODO:
    return percent < 0.5 ? from : to;
}

export function interpolatePathNode(from: PathNode, to: PathNode, percent: number = 0.5): PathNode {
    // TODO:
    return interpolateDiscrete(from, to, percent).clone();
}

export function interpolatePath(from: Path, to: Path, percent: number = 0.5): Path {
    if (from.nodes.length !== to.nodes.length) {
        return interpolateDiscrete(from, to, percent).clone();
    }

    const length = from.nodes.length;

    const nodes = [];

    for (let i = 0; i < length; i++) {
        nodes.push(interpolatePathNode(from.nodes[i], to.nodes[i], percent));
    }

    // TODO: check if something like mirror, etc.

    return new Path(nodes);
}

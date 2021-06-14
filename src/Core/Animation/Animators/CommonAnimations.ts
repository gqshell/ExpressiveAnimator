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

import {Animation} from "../Animation";
import type {Keyframe} from "../Keyframe";
import type {Brush, Path, PathNode, Point, RectShapeRadius} from "@zindex/canvas-engine";

import * as Interpolation from "../Interpolation";

export class NumberAnimation extends Animation<number> {
    constructor(keyframes: Keyframe<number>[] | null = null, disabled: boolean = false) {
        super(keyframes, disabled, Interpolation.interpolateNumber);
    }
}

export class PercentAnimation extends Animation<number> {
    constructor(keyframes: Keyframe<number>[] | null = null, disabled: boolean = false) {
        super(keyframes, disabled, Interpolation.interpolatePercent);
    }
}

export class PointAnimation extends Animation<Point> {
    constructor(keyframes: Keyframe<Point>[] | null = null, disabled: boolean = false) {
        super(keyframes, disabled, Interpolation.interpolatePoint);
    }
}

export class OpacityAnimation extends Animation<number> {
    constructor(keyframes: Keyframe<number>[] | null = null, disabled: boolean = false) {
        super(keyframes, disabled, Interpolation.interpolateAlphaComponent);
    }
}

export class PositiveNumberAnimation extends Animation<number> {
    constructor(keyframes: Keyframe<number>[] | null = null, disabled: boolean = false) {
        super(keyframes, disabled, Interpolation.interpolatePositiveNumber);
    }
}

export class BrushAnimation extends Animation<Brush> {
    constructor(keyframes: Keyframe<Brush>[] | null = null, disabled: boolean = false) {
        super(keyframes, disabled, Interpolation.interpolateBrush);
    }
}

export class DashArrayAnimation extends Animation<number[]> {
    constructor(keyframes: Keyframe<number[]>[] | null = null, disabled: boolean = false) {
        super(keyframes, disabled, Interpolation.interpolateDashArray);
    }
}

export class MotionAnimation extends Animation<PathNode> {
    constructor(keyframes: Keyframe<PathNode>[] | null = null, disabled: boolean = false) {
        super(keyframes, disabled, Interpolation.interpolateMotion);
    }
}

export class RectRadiusAnimation extends Animation<RectShapeRadius> {
    constructor(keyframes: Keyframe<RectShapeRadius>[] | null = null, disabled: boolean = false) {
        super(keyframes, disabled, Interpolation.interpolateRectRadius);
    }
}

export class PathAnimation extends Animation<Path> {
    constructor(keyframes: Keyframe<Path>[] | null = null, disabled: boolean = false) {
        super(keyframes, disabled, Interpolation.interpolatePath);
    }
}

export class PolyAnimation extends Animation<Point[]> {
    constructor(keyframes: Keyframe<Point[]>[] | null = null, disabled: boolean = false) {
        super(keyframes, disabled, Interpolation.interpolatePoly);
    }
}

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

import type {ElementAnimatorMap} from "../Animator";
import type {Element, VectorElement} from "@zindex/canvas-engine";
import {
    BrushAnimation,
    DashArrayAnimation,
    MotionAnimation,
    NumberAnimation,
    OpacityAnimation,
    PointAnimation,
    PositiveNumberAnimation
} from "./CommonAnimations";

export const ElementAnimators: ElementAnimatorMap<Element> = {
    opacity: {
        id: 'opacity',
        title: 'Opacity',
        create() {
            return new OpacityAnimation();
        }
    }
}

export const TransformAnimators: ElementAnimatorMap<Element> = {
    position: {
        id: 'position',
        title: 'Position',
        //@ts-ignore
        create() {
            // TODO: check this out
            return new MotionAnimation();
        }
    },
    anchor: {
        id: 'anchor',
        title: 'Anchor',
        create() {
            return new PointAnimation();
        }
    },
    rotate: {
        id: 'rotate',
        title: 'Rotate',
        create() {
            return new NumberAnimation();
        }
    },
    scale: {
        id: 'scale',
        title: 'Scale',
        create() {
            return new PointAnimation();
        }
    },
    skewAngle: {
        id: 'skew-angle',
        title: 'Skew angle',
        create() {
            return new NumberAnimation();
        }
    },
    skewAxis: {
        id: 'skew-axis',
        title: 'Skew axis',
        create() {
            return new NumberAnimation();
        }
    },
};

export const FillAnimators: ElementAnimatorMap<VectorElement> = {
    fill: {
        id: 'fill',
        title: 'Fill',
        create() {
            return new BrushAnimation();
        }
    },
    fillOpacity: {
        id: 'fill-opacity',
        title: 'Fill opacity',
        create() {
            return new OpacityAnimation();
        }
    },
}

export const StrokeAnimators: ElementAnimatorMap<VectorElement> = {
    strokeBrush: {
        id: 'stroke',
        title: 'Stroke',
        create() {
            return new BrushAnimation();
        }
    },
    strokeOpacity: {
        id: 'stroke-opacity',
        title: 'Stroke opacity',
        create() {
            return new OpacityAnimation();
        }
    },
    strokeLineWidth: {
        id: 'stroke-width',
        title: 'Stroke width',
        create() {
            return new PositiveNumberAnimation();
        }
    },
    strokeDashOffset: {
        id: 'stroke-dash-offset',
        title: 'Dash offset',
        create() {
            return new NumberAnimation();
        }
    },
    strokeDashArray: {
        id: 'stroke-dash-array',
        title: 'Dash array',
        create() {
            return new DashArrayAnimation();
        }
    },
};

export const VectorAnimators: ElementAnimatorMap<VectorElement> = {
    ...(ElementAnimators as ElementAnimatorMap<VectorElement>),
    ...(TransformAnimators as ElementAnimatorMap<VectorElement>),
    ...FillAnimators,
    ...StrokeAnimators,
};



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
import type {RectElement} from "@zindex/canvas-engine";
import {VectorAnimators} from "./CommonAnimators";
import {PositiveNumberAnimation, RectRadiusAnimation} from "./CommonAnimations";

export const RectAnimators: ElementAnimatorMap<RectElement> = {
    ...(VectorAnimators as ElementAnimatorMap<RectElement>),
    width: {
        id: 'width',
        title: 'Width',
        create() {
            return new PositiveNumberAnimation();
        }
    },
    height: {
        id: 'height',
        title: 'Height',
        create() {
            return new PositiveNumberAnimation();
        }
    },
    radius: {
        id: 'rect-radius',
        title: 'Radius',
        create() {
            return new RectRadiusAnimation();
        }
    }
}

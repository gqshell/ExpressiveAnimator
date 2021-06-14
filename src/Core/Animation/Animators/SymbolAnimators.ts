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
import {ElementAnimators, TransformAnimators} from "./CommonAnimators";
import {PositiveNumberAnimation} from "./CommonAnimations";
import type {AnimatedSymbolElement} from "../../Elements";

export const SymbolAnimators: ElementAnimatorMap<AnimatedSymbolElement> = {
    ...(ElementAnimators as ElementAnimatorMap<AnimatedSymbolElement>),
    ...(TransformAnimators as ElementAnimatorMap<AnimatedSymbolElement>),
    time: {
        id: 'time',
        title: 'Time',
        create() {
            return new PositiveNumberAnimation();
        }
    }
}
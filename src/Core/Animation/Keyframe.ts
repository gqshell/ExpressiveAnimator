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

import type {Cloneable} from "@zindex/canvas-engine";
import type {Easing} from "./Easing";
import {uuid} from "@zindex/canvas-engine";

export class Keyframe<T> implements Cloneable<Keyframe<T>> {
    public readonly id: string;
    public value: T;
    public offset: number;
    public easing: Easing | null;

    constructor(value: T, offset: number = 0, easing: Easing | null = null, id?: string) {
        this.value = value;
        this.offset = offset;
        this.easing = easing;
        this.id = id || uuid();
    }

    clone(newId?: boolean): Keyframe<T> {
        // T should be immutable
        return new Keyframe<T>(this.value, this.offset, this.easing, newId ? null : this.id);
    }
}
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

import type {Easing} from "./Easing";
import type {Cloneable} from "@zindex/canvas-engine";
import type {InterpolationFunction} from "./Interpolation";
import {Keyframe} from "./Keyframe";
import {getRangePercent} from "@zindex/canvas-engine";

export class Animation<T> implements Cloneable<Animation<T>> {
    public disabled: boolean;
    public readonly keyframes: Keyframe<T>[];
    public readonly interpolate: InterpolationFunction<T>;

    public constructor(
        keyframes: Keyframe<T>[] | null = null,
        disabled: boolean = false,
        interpolate: InterpolationFunction<T>
    ) {
        this.keyframes = keyframes ?? [];
        this.disabled = disabled;
        this.interpolate = interpolate;
    }

    get sortedKeyframes(): Keyframe<T>[] {
        return this.keyframes.slice().sort(sortKeyframes);
    }

    clone(): Animation<T> {
        // @ts-ignore
        return new this.constructor(this.keyframes.map(k => k.clone()), this.disabled, this.interpolate);
    }

    get length(): number {
        return this.keyframes.length;
    }

    get isAnimated(): boolean {
        return !this.disabled && this.keyframes.length > 1;
    }

    get hasKeyframes(): boolean {
        return this.keyframes.length > 0;
    }

    getKeyframeAtIndex(index: number): Keyframe<T> | null {
        return this.keyframes[index] || null;
    }

    removeKeyframeAtIndex(index: number): Keyframe<T> | null {
        const r = this.keyframes.splice(index, 1);
        return r.length > 0 ? r[0] : null;
    }

    addKeyframe(keyframe: Keyframe<T>): Keyframe<T> {
        const offset = keyframe.offset;

        const length = this.keyframes.length;

        for (let i = 0; i < length; i++) {
            const k = this.keyframes[i];
            if (offset === k.offset) {
                return this.keyframes[i] = keyframe;
            }

            if (offset < k.offset) {
                this.keyframes.splice(i, 0, keyframe);
                return keyframe;
            }
        }

        this.keyframes.push(keyframe);

        return keyframe;
    }

    removeKeyframe(keyframe: Keyframe<T>): boolean {
        const index = this.keyframes.indexOf(keyframe);
        if (index !== -1) {
            this.keyframes.splice(index, 1);
            return true;
        }
        return false;
    }

    removeKeyframes(keyframes: Keyframe<T>[]): boolean {
        let index: number, removed: boolean = false;

        for (const k of keyframes) {
            index = this.keyframes.indexOf(k);
            if (index !== -1) {
                this.keyframes.splice(index, 1);
                removed = true;
            }
        }

        return removed;
    }

    getKeyframeAtOffset(offset: number): Keyframe<T> | null {
        const length = this.keyframes.length;

        for (let i = 0; i < length; i++) {
            const k = this.keyframes[i];
            if (offset === k.offset) {
                return k;
            }
            if (k.offset > offset) {
                return null;
            }
        }

        return null;
    }

    fixKeyframes(priority: Set<Keyframe<T>>): boolean {
        let l = this.keyframes.length;
        if (l === 0) {
            return false;
        }

        let prev: Keyframe<T> = this.keyframes[0];
        if (prev.offset < 0) {
            prev.offset = 0;
        }

        let current: Keyframe<T>;
        for (let i = 1; i < l; i++) {
            current = this.keyframes[i];
            if (current.offset < 0) {
                current.offset = 0;
            }

            if (prev.offset === current.offset) {
                if (priority.has(current) || !priority.has(prev)) {
                    this.keyframes.splice(i - 1, 1);
                    prev = current;
                    i--;
                } else {
                    this.keyframes.splice(i, 1);
                }
                l--;
            } else {
                prev = current;
            }
        }

        this.keyframes.sort(sortKeyframes);

        return true;
    }

    getIndexOfKeyframe(keyframe: Keyframe<T>): number {
        return this.keyframes.indexOf(keyframe);
    }

    addKeyframeAtOffset(offset: number, value: T | null, easing: Easing | null = null): Keyframe<T> {
        if (value == null) {
            value = this.getValueAtOffset(offset);
        }

        let keyframe: Keyframe<T> = this.getKeyframeAtOffset(offset);

        if (keyframe != null) {
            keyframe.value = value;
            if (easing != null) {
                keyframe.easing = easing;
            }
            return keyframe;
        }

        return this.addKeyframe(this.createKeyframe(value, offset, easing));
    }

    removeKeyframeAtOffset(offset: number): boolean {
        const keyframe = this.getKeyframeAtOffset(offset);
        if (keyframe == null) {
            return false;
        }
        return this.removeKeyframe(keyframe);
    }

    getValueAtOffset(offset: number, priority?: Set<Keyframe<T>>): T {
        if (!priority || this.keyframes.length <= 1) {
            return calcValue<T>(offset, this.keyframes, this.interpolate);
        }

        const keyframes = this.sortedKeyframes;

        let length = keyframes.length;
        let prev = keyframes[0];
        let prevOffset = Math.max(prev.offset, 0);
        if (offset < prevOffset) {
            return prev.value;
        }

        let current;
        let currentOffset;

        for (let i = 1; i < length; i++) {
            current = keyframes[i];
            currentOffset = Math.max(current.offset, 0);

            if (currentOffset === prevOffset) {
                if (priority.has(current) || !priority.has(prev)) {
                    prev = current;
                } else {
                    // if last
                    current = prev;
                }
                continue;
            }

            if (offset === prevOffset) {
                return prev.value;
            }

            if (offset < currentOffset) {
                return this.interpolate(prev.value, current.value, calcPercent(offset, prev, current));
            }

            prevOffset = currentOffset;
            prev = current;
        }

        return current.value;
    }

    createKeyframe(value: T, offset: number, easing: Easing | null = null): Keyframe<T> {
        return new Keyframe<T>(value, offset, easing);
    }

    * [Symbol.iterator](): Iterator<Keyframe<T>> {
        const length = this.keyframes.length;
        for (let i = 0; i < length; i++) {
            yield this.keyframes[i];
        }
    }
}

function sortKeyframes(a: Keyframe<any>, b: Keyframe<any>): number {
    return a.offset - b.offset;
}

function calcValue<T>(offset: number, keyframes: Keyframe<T>[], interpolate: InterpolationFunction<T>): T {
    const last = keyframes.length - 1;

    if (last === -1) {
        return null;
    }

    if (last === 0) {
        return keyframes[0].value;
    }

    if (offset <= keyframes[0].offset) {
        return keyframes[0].value;
    }

    if (offset >= keyframes[last].offset) {
        return keyframes[last].value;
    }

    for (let i = 1; i <= last; i++) {
        if (offset <= keyframes[i].offset) {
            return interpolate(keyframes[i - 1].value, keyframes[i].value, calcPercent<T>(offset, keyframes[i - 1], keyframes[i]));
        }
    }

    return null;
}

function calcPercent<T>(offset: number, from: Keyframe<T>, to: Keyframe<T>): number {
    const percent = getRangePercent(offset, from.offset <= 0 ? 0 : from.offset, to.offset <= 0 ? 0 : to.offset);
    return from.easing ? from.easing.value(percent) : percent;
}
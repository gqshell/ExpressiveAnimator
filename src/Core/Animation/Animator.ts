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

import type {Element} from "@zindex/canvas-engine";
import type {Animation} from "./Animation";
import type {WritableKeys} from "@zindex/canvas-engine";
import {DefaultAnimatorsMap} from "./Animators";

export type Animator<E extends Element, K extends WritableKeys<E>> = {
    id: string;
    create(): Animation<E[K]>;
    // Allow custom properties
    [type: string]: any;
};

export type ElementAnimatorMap<E extends Element> = {
    [Property in WritableKeys<E>]?: Animator<E, Property>;
}

type SourceMap<E extends Element> = Map<string, ElementAnimatorMap<E>>;

export class AnimatorSource {
    protected _source: SourceMap<any>;

    constructor(source?: SourceMap<any>) {
        this._source = source || new Map(Object.entries(DefaultAnimatorsMap));
    }

    setElementAnimators<E extends Element, K extends WritableKeys<E>>(element: E | string, animators: ElementAnimatorMap<E> | null): void {
        const type = typeof element === 'string' ? element : element.type;

        if (!animators) {
            this._source.delete(type);
        } else {
            this._source.set(type, animators);
        }
    }

    setAnimator<E extends Element, K extends WritableKeys<E>>(element: E | string, property: K, animator: Animator<E, K> | null): void {
        const type = typeof element === 'string' ? element : element.type;

        if (!this._source.has(type)) {
            if (!animator) {
                return;
            }
            this._source.set(type, {});
        }

        const map = this._source.get(type);

        if (animator) {
            map[property] = animator;
        } else if (property in map) {
            delete map[property];
        }
    }

    getAnimator<E extends Element, K extends WritableKeys<E>>(element: E, property: K): Animator<E, K> | null {
        const type = element.type;

        if (!this._source.has(type)) {
            return null;
        }

        const list = this._source.get(type) as ElementAnimatorMap<E>;

        if (!(property in list)) {
            return null;
        }

        return list[property];
    }

    isAnimatable<E extends Element, K extends WritableKeys<E>>(element: E, property: K): boolean {
        if (!(property in element)) {
            return false;
        }
        return this.getAnimator(element, property) != null;
    }

    createAnimation<E extends Element, K extends WritableKeys<E>>(element: E, property: K): Animation<E[K]> | null {
        if (!(property in element)) {
            return null;
        }
        return this.getAnimator(element, property)?.create();
    }
}

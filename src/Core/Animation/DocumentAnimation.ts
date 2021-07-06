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

import type {Document, Element} from "@zindex/canvas-engine";
import type {Cloneable, Disposable, WritableKeys} from "@zindex/canvas-engine";
import type {Animation} from "./Animation";
import type {Keyframe} from "./Keyframe";
import {clamp} from "@zindex/canvas-engine";

export type AnimatedProperties<E extends Element> = {
    [Property in WritableKeys<E>]?: Animation<E[Property]>
}

/**
 * {
 *     [element.id]: {
 *          [property]: Animation
 *     }
 * }
 */
type AnimationMap<T extends Element> = Map<string, AnimatedProperties<T>>;

export enum AnimationMode {
    Normal,
    Loop,
    LoopReverse,
}

type AnimatedValueSetter = <E extends Element, K extends WritableKeys<E>, V extends E[K]>(element: E, property: K, value: V) => boolean;

export class DocumentAnimation implements Disposable, Cloneable<DocumentAnimation> {
    private _startTime: number;
    private _endTime: number;
    private _mode: AnimationMode;
    private _map: AnimationMap<any>;

    private _document: Document;

    public constructor(document: Document, startTime: number, endTime: number,
                       mode: AnimationMode = AnimationMode.Normal, animations?: AnimationMap<any>) {
        this._document = document;
        this._startTime = startTime;
        this._endTime = endTime;
        this._mode = mode;
        this._map = animations ?? new Map();
    }

    get document(): Document {
        return this._document;
    }

    get startTime(): number {
        return this._startTime;
    }

    set startTime(value: number) {
        this._startTime = clamp(Math.round(value), 0, this._endTime);
    }

    get endTime(): number {
        return this._endTime;
    }

    set endTime(value: number) {
        this._endTime = clamp(Math.round(value), this._startTime, Number.POSITIVE_INFINITY);
    }

    get duration(): number {
        return this._endTime - this._startTime;
    }

    get mode(): AnimationMode {
        return this._mode;
    }

    set mode(value: AnimationMode) {
        this._mode = value;
    }

    mapTime(time: number): number {
        switch (this._mode) {
            case AnimationMode.Loop:
                time = time % this._endTime;
                break;
            case AnimationMode.LoopReverse:
                // TODO:
                break;
        }

        return clamp(time, this._startTime, this._endTime);
    }

    getAnimatedEntries(): IterableIterator<[string, AnimatedProperties<any>]> {
        return this._map.entries();
    }


    *getAnimatedElements<E extends Element>(): Generator<[E, AnimatedProperties<E>]> {
        let element: E;
        for (const [id, properties] of this._map.entries()) {
            element = this._document.getElementById(id) as E;
            if (element) {
                yield [element, properties];
            }
        }
    }

    /**
     * Updates the property values for animated documents
     */
    updateAnimatedProperties(time: number, setter: AnimatedValueSetter, filter?: {animations: Set<Animation<any>>, keyframes: Set<Keyframe<any>>}): boolean {
        if (this._map.size === 0) {
            return false;
        }

        let updated: boolean = false;

        let element: Element;
        let property;
        let animation: Animation<any>;
        let value: any;

        for (const [id, properties] of this._map.entries()) {
            element = this._document.getElementById(id);
            if (!element) {
                continue;
            }

            for ([property, animation] of Object.entries(properties)) {
                if (animation.disabled || (filter && !filter.animations.has(animation))) {
                    continue;
                }

                value = animation.getValueAtOffset(time, filter?.keyframes);

                if (value === null) {
                    // no keyframes, ignore
                    continue;
                }

                if (setter(element, property, value)) {
                    updated = true;
                }
            }
        }

        return updated;
    }

    /**
     * Remove animated elements that are no longer present in document
     */
    cleanupAnimatedProperties(): boolean {
        let changed: boolean = false;

        for (const id of this._map.keys()) {
            if (this._document.getElementById(id) == null) {
                this._map.delete(id);
                changed = true;
            }
        }

        return changed;
    }

    clone(document: Document): DocumentAnimation {
        return new DocumentAnimation(document || this._document, this._startTime, this._endTime, this._mode, this.cloneAnimationMap());
    }

    protected cloneAnimationMap(): AnimationMap<any> {
        const list = new Map();

        for (const [id, properties] of this._map.entries()) {
            const value = {};
            for (const [property, animation] of Object.entries(properties)) {
                value[property] = animation.clone();
            }
            list.set(id, value);
        }

        return list;
    }

    dispose() {
        this._document = null;
        if (this._map) {
            this._map.clear();
            this._map = null;
        }
    }

    getAnimatedProperties<E extends Element>(element: E): AnimatedProperties<E> | null {
        if (element.document !== this._document) {
            return null;
        }
        return this._map.has(element.id) ? this._map.get(element.id) : null;
    }

    removeAnimatedProperties(element: Element): boolean {
        if (element.document !== this._document) {
            return false;
        }
        if (this._map.has(element.id)) {
            this._map.delete(element.id);
            return true;
        }
        return false;
    }

    isAnimated(element: Element): boolean {
        if (element.document !== this._document) {
            return false;
        }

        const properties = this.getAnimatedProperties(element);
        if (properties == null) {
            return false;
        }

        for (const prop in properties) {
            if (properties[prop].isAnimated) {
                return true;
            }
        }

        return false;
    }

    *allKeyframes(): Generator<Keyframe<any>> {
        for (const properties of this._map.values()) {
            for (const animation of Object.values(properties)) {
                for (const keyframe of animation.keyframes) {
                    yield keyframe;
                }
            }
        }
    }

    fixKeyframes(priority: Set<Keyframe<any>>): boolean {
        let changed: boolean = false;

        for (const properties of this._map.values()) {
            for (const animation of Object.values(properties)) {
                if (animation.fixKeyframes(priority)) {
                    changed = true;
                }
            }
        }

        return changed;
    }

    resolveAnimationsAndKeyframes(ids: Set<string>): {animations: Set<Animation<any>>, keyframes: Set<Keyframe<any>>} | null {
        if (ids.size === 0) {
            return null;
        }

        const animations = new Set<Animation<any>>();
        const keyframes = new Set<Keyframe<any>>();

        for (const properties of this._map.values()) {
            for (const animation of Object.values(properties)) {
                let added: boolean = false;
                for (const keyframe of animation.keyframes) {
                    if (ids.has(keyframe.id)) {
                        keyframes.add(keyframe);
                        added = true;
                    }
                }
                if (added) {
                    animations.add(animation);
                }
            }
        }

        return {animations, keyframes};
    }

    getAnimation<E extends Element, P extends  WritableKeys<E>>(element: E, property: P): Animation<E[P]> | null {
        if (element.document !== this._document) {
            return null;
        }

        const properties = this.getAnimatedProperties(element);

        if (properties == null || !(property in properties)) {
            return null;
        }

        return properties[property];
    }

    removeAnimation<E extends Element, P extends  WritableKeys<E>>(element: E, property: P): boolean {
        if (element.document !== this._document) {
            return false;
        }

        const properties = this.getAnimatedProperties(element);

        if (properties == null || !(property in properties)) {
            return false;
        }

        delete properties[property];

        if (Object.keys(properties).length === 0) {
            // Remove empty list
            this.removeAnimatedProperties(element);
        }

        return true;
    }

    addAnimation<E extends Element, P extends  WritableKeys<E>>(element: E, property: P, animation: Animation<E[P]>): boolean {
        if (element.document !== this._document) {
            return false;
        }

        let properties: AnimatedProperties<E>;

        if (this._map.has(element.id)) {
            properties = this._map.get(element.id);
        } else {
            properties = {};
            this._map.set(element.id, properties);
        }

        properties[property] = animation;

        return true;
    }
}

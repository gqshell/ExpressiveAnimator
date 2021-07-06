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

import type {Disposable, Element, Selection} from "@zindex/canvas-engine";
import type {AnimationDocument} from "./AnimationDocument";
import type {Keyframe, Animation} from "../Animation";

export type KeyframeSelectionMeta = string[];

type Kf = Keyframe<any>;

export class KeyframeSelection implements Disposable {
    private _document: AnimationDocument = null;
    private _selection: Set<string> = new Set<string>();

    constructor() {
    }

    dispose() {
        this._selection = null;
        this._document = null;
    }

    setDocument(document: AnimationDocument, selection?: KeyframeSelectionMeta): void {
        if (selection == null && document != null && this._document != null && document.id === this._document.id) {
            // we have the same document id and no selection, get current selection
            selection = this.getSelectedKeyframes();
        }

        this._document = document;
        this._selection.clear();

        if (document != null && selection != null && selection.length > 0 && document.animation) {
            for (const kf of document.animation.allKeyframes()) {
                if (selection.indexOf(kf.id) !== -1) {
                    this._selection.add(kf.id);
                }
            }
        }
    }

    clear(): boolean {
        if (this._selection.size === 0) {
            return false;
        }
        this._selection.clear();
        return true;
    }

    deselectUnselectedElements(selection: Selection<any>): boolean {
        if (selection.isEmpty) {
            return this.clear();
        }

        let changed: boolean = false;

        const animation = this._document.animation;

        for (const [element, properties] of animation.getAnimatedElements()) {
            if (selection.isSelected(element)) {
                continue;
            }
            for (const animation of Object.values(properties)) {
                for (const keyframe of animation.keyframes) {
                    if (this._selection.has(keyframe.id)) {
                        this._selection.delete(keyframe.id);
                        changed = true;
                    }
                }
            }
        }

        return changed;
    }

    animationHasSelectedKeyframes(animation: Animation<any>): boolean {
        if (this._selection.size === 0) {
            return false;
        }

        for (const keyframe of animation.keyframes) {
            if (this._selection.has(keyframe.id)) {
                return true;
            }
        }

        return false;
    }

    isKeyframeSelected(keyframe: Kf): boolean {
        return this._selection.has(keyframe.id);
    }

    areKeyframesSelected(...keyframes: Kf[]): boolean {
        for (const k of keyframes) {
            if (!k || !this._selection.has(k.id)) {
                return false;
            }
        }
        return true;
    }

    deselectKeyframe(keyframe: Kf): boolean {
        if (!this._selection.has(keyframe.id)) {
            return false;
        }
        this._selection.delete(keyframe.id);
        return true;
    }

    selectMultipleKeyframes(keyframes: Iterable<Kf>, multiple?: boolean): boolean {
        let selected: boolean = false;

        if (!multiple && this._selection.size > 0) {
            this._selection.clear();
            selected = true;
        }

        for (const keyframe of keyframes) {
            if (!this._selection.has(keyframe.id)) {
                this._selection.add(keyframe.id);
                selected = true;
            }
        }

        return selected;
    }

    selectKeyframeIds(ids: Iterable<string>): boolean {
        for (const id of ids) {
            this._selection.add(id);
        }
        return this._selection.size > 0;
    }

    selectKeyframe(keyframe: Kf, multiple?: boolean): boolean {
        if (this._selection.has(keyframe.id)) {
            return false;
        }
        if (!multiple) {
            this._selection.clear();
        }

        this._selection.add(keyframe.id);

        return true;
    }

    getSelectedKeyframes(): KeyframeSelectionMeta | null {
        return Array.from(this._selection);
    }

    resolveSelectedKeyframes(): {animations: Set<Animation<any>>, keyframes: Set<Keyframe<any>>} | null {
        return this._document?.animation?.resolveAnimationsAndKeyframes(this._selection);
    }

}
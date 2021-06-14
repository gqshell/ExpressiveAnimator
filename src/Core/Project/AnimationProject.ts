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

import {Project} from "@zindex/canvas-engine";
import {AnimationMiddleware} from "./AnimationMiddleware";
import type {AnimationStateMeta} from "./AnimationState";
import {AnimationState} from "./AnimationState";
import {KeyframeSelection} from "./KeyframeSelection";
import type {State} from "@zindex/canvas-engine";
import type {AnimatorSource} from "../Animation";
import {clamp} from "@zindex/canvas-engine";
import type {AnimationDocument} from "./AnimationDocument";

export const MAX_TIME = 1000000 * 1000;

export class AnimationProject extends Project<AnimationMiddleware, AnimationStateMeta, AnimationDocument> {
    private _time: number = 0;
    private _isRecording: boolean = false;
    private _keyframeSelection: KeyframeSelection = new KeyframeSelection();
    private _animatorSource: AnimatorSource;

    constructor(source: AnimatorSource) {
        super();
        this._animatorSource = source;
    }

    dispose() {
        super.dispose();

        this._isRecording = false;

        if (this._keyframeSelection) {
            this._keyframeSelection.dispose();
            this._keyframeSelection = null;
        }
    }

    get time(): number {
        return this._time;
    }

    set time(value: number) {
        this.setTime(value);
    }

    setTime(value: number): boolean {
        value = clamp(Math.round(value), 0, MAX_TIME);
        if (this._time === value) {
            return false;
        }
        this._time = value;
        return true;
    }

    /**
     * @inheritDoc
     */
    getDocumentPicture(id: string, time?: number): Skia.SkPicture | null {
        const document = this.getDocumentForDraw(id);
        if (!document) {
            return null;
        }

        if (time != null) {
            this.middleware.updateAnimatedProperties(document, time);
        }

        return document.getPicture();
    }

    get animatorSource(): AnimatorSource {
        return this._animatorSource;
    }

    get keyframeSelection(): KeyframeSelection {
        return this._keyframeSelection;
    }

    get isRecording(): boolean {
        return this._isRecording;
    }

    set isRecording(value: boolean) {
        this._isRecording = value;
    }

    /**
     * @override
     */
    protected setCurrentDocument(value: AnimationDocument, state?: AnimationStateMeta) {
        super.setCurrentDocument(value, state);
        this._keyframeSelection.setDocument(value, state?.keyframeSelection);
        this.middleware.updateAnimatedProperties(value, this._time);
    }

    /**
     * @override
     */
    protected createMiddleware(): AnimationMiddleware {
        return new AnimationMiddleware(this);
    }

    /**
     * @override
     */
    protected createState(maxStack: number): State<AnimationProject, AnimationStateMeta, AnimationDocument> {
        return new AnimationState(this, maxStack);
    }
}
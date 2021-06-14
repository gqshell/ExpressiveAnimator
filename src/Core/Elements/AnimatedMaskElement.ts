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

import {MaskElement} from "@zindex/canvas-engine";

export class AnimatedMaskElement extends MaskElement {
    protected _time: number = 0;

    get time(): number {
        return this._time;
    }

    set time(value: number) {
        if (this._time !== value) {
            this._time = value;
            this.invalidate();
        }
    }

    protected getDocumentPictureOptions(): number {
        return this._time;
    }

    clone(newId?: boolean): AnimatedMaskElement {
        const clone = super.clone(newId) as AnimatedMaskElement;
        clone._time = this._time;
        return clone;
    }
}
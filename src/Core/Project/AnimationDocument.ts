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

import {Rectangle, SingleBoardDocument, Size} from "@zindex/canvas-engine";
import type {DocumentAnimation} from "../Animation";

export class AnimationDocument extends SingleBoardDocument {

    protected _animation: DocumentAnimation = null;

    constructor(size: Size, id?: string|null) {
        super(size, id);
    }

    get board(): Rectangle {
        return this._board;
    }

    set board(value: Rectangle) {
        if (this._board.equals(value)) {
            return;
        }
        this._board = value;
        this.invalidateBoundsAndPicture();
    }

    get animation(): DocumentAnimation | null {
        return this._animation;
    }

    set animation(value: DocumentAnimation | null) {
        if (value.document !== this) {
            return;
        }

        if (this._animation) {
            this._animation.dispose();
        }

        this._animation = value;

        if (value) {
            value.cleanupAnimatedProperties();
        }
    }

    clone(newId?: boolean): AnimationDocument {
        const clone = super.clone(newId) as AnimationDocument;
        clone._animation = this._animation?.clone(clone);
        return clone;
    }
}
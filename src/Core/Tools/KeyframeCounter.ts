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

import type {CanvasEngine} from "@zindex/canvas-engine";

export class KeyframeCounter {
    private count: number = 0;

    start(engine: CanvasEngine): void {
        this.count = this.countSelectionKeyframes(engine);
    }

    hasChanged(engine: CanvasEngine): boolean {
        return this.count !== this.countSelectionKeyframes(engine);
    }

    countSelectionKeyframes(engine: CanvasEngine): number {
        const active = engine.selection.activeElement;
        if (!active || !active.document || !active.document.animation) {
            return 0;
        }

        let total: number = 0;

        for (const [, properties] of active.document.animation.getAnimatedEntries()) {
            for (const animation of Object.values(properties)) {
                total += animation.length;
            }
        }

        return total;
    }
}
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
import type {Guide} from "@zindex/canvas-engine";
import {Point} from "@zindex/canvas-engine";
import type {PointStruct} from "@zindex/canvas-engine";

export function getHoverGuide(engine: CanvasEngine, position: Point): Guide| null {
    const {document, viewBox, dpr} = engine;

    const epsilon = dpr / viewBox.zoom;

    for (const guide of document.guides) {
        const point = new Point(guide.position, guide.position);
        if (guide.isHorizontal) {
            if (Math.abs(point.y - position.y) <= epsilon) {
                return guide;
            }
        } else {
            if (Math.abs(point.x - position.x) <= epsilon) {
                return guide;
            }
        }
    }

    return null;
}

export function getGuideLine(engine: CanvasEngine, guide: Guide): PointStruct[] {
    const point = engine.viewBox.matrix.point(guide.position, guide.position);
    if (guide.isHorizontal) {
        return [{x: 0, y: point.y}, {x: engine.boundingBox.width, y: point.y}];
    }
    return [{x: point.x, y: 0}, {x: point.x, y: engine.boundingBox.height}];
}
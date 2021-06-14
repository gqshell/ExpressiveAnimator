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

import {RectAnimators} from "./RectAnimators";
import {EllipseAnimators} from "./EllipseAnimators";
import {ClipPathAnimators} from "./ClipPathAnimators";
import {PathAnimators} from "./PathAnimators";
import {GroupAnimators} from "./GroupAnimators";
import {PolyAnimators} from "./PolyAnimators";
import {RegularPolygonAnimators} from "./RegularPolygonAnimators";
import {StarAnimators} from "./StarAnimators";
import {TextAnimators} from "./TextAnimators";
import {SymbolAnimators} from "./SymbolAnimators";
import {MaskAnimators} from "./MaskAnimators";

export * from "./CommonAnimations";
export * from "./CommonAnimators";

export {
    RectAnimators, EllipseAnimators,
    ClipPathAnimators, PathAnimators,
    GroupAnimators, PolyAnimators,
    RegularPolygonAnimators, StarAnimators,
    TextAnimators, SymbolAnimators, MaskAnimators,
};

export const DefaultAnimatorsMap = {
    'rect': RectAnimators,
    'ellipse': EllipseAnimators,
    'clip-path': ClipPathAnimators,
    'path': PathAnimators,
    'group': GroupAnimators,
    'poly': PolyAnimators,
    'regular-polygon': RegularPolygonAnimators,
    'star': StarAnimators,
    'text': TextAnimators,
    'symbol': SymbolAnimators,
    'mask': MaskAnimators,
}
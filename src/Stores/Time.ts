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

import {CurrentDocumentAnimation} from "./Project";
import {derived, writable} from "svelte/store";

const MAX_TIME_SCALE = 1.5;

export const CurrentTime = writable<number>(0);
export const CurrentMaxTime = derived([CurrentDocumentAnimation, CurrentTime],
    ([$animation, $time]) => Math.max($time, $animation ? $animation.endTime : 0) * MAX_TIME_SCALE);

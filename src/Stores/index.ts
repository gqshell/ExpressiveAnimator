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

/*
 What we need to know globally

 - current tool
 - current project
    - current selection: hash, activeElement, selectionList, selectionInfo
    - current keyframeSelection: ...
    - current document
        - unit of measure
    - current state info: canUndo, canRedo
    - current time
    - recording status (isRecording)
 - canvas engine
    - viewBox: zoom level
    - global properties: last used fill, stroke, ...
 - play status: if app is in play mode
 - current region: focused region of the app (canvas, timeline, ...) - used to handle keystrokes
 - app preferences (saved to local-storage)
    - theme: dark, light, auto
    - guides: show/hide, lock
    - grid: show/hide
    - ruler: show/hide
    - high-quality: enabled/disabled
    - snapping
        - enabled/disabled
        - enabled modes: grid, guides, pixel, document, object, points
 - current theme: dark or light (auto is resolved)
*/

export * from "./Tool";
export * from "./Theme";
export * from "./Canvas";
export * from "./Project";
export * from "./Time";
export * from "./App";




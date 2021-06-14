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

import {writable} from "svelte/store";
import type {Readable} from "svelte/store";

import {
    PanTool,
    RectangleTool,
    EllipseTool,
    StarTool,
    PolyTool,
    RegularPolygonTool
} from "@zindex/canvas-engine";
import {SelectionTool, TransformTool} from "../Core";
import type {Tool} from "@zindex/canvas-engine";

export const Tools = {
    pan: new PanTool(),
    select: new SelectionTool(),
    transform: new TransformTool(),

    // shape
    rect: new RectangleTool(),
    ellipse: new EllipseTool(),
    'regular-polygon': new RegularPolygonTool(),
    star: new StarTool(),
    poly: new PolyTool(),
    // TODO: add other tools
};

type CurrentToolType = Readable<Tool> & {
    change(tool: Tool | string): boolean;
}

export const CurrentTool: CurrentToolType = ((initial: Tool) => {
    const {subscribe, set, update} = writable<Tool>(initial);

    return {
        subscribe,
        set,
        update,
        change(tool: Tool | string): boolean {
            if (typeof tool === 'string') {
                if (!(tool in Tools)) {
                    return false;
                }
                tool = Tools[tool];
            }

            set(tool as Tool);

            return true;
        }
    };
})(Tools.select);

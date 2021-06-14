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

import type {PointLike} from "@zindex/canvas-engine";
import type {DrawingContext, Path} from "@zindex/canvas-engine";
import {Color, DefaultPen, PathJoint, PathNode, SolidBrush} from "@zindex/canvas-engine";

const SETTINGS = {

}


export const SIZES = {
    PathLine: 2,

    HandleLine: 1,
    HandleRadius: 8,

    NodeRadius: 10,
    NodeRing: 2,
};

export const COLORS = {
    PathLine: Color.from('blue'),



    SelectedNodeBackground: Color.from('blue'),
    NodeBackground: Color.from('white'),
}

export const BRUSHES = {
    PathLine: new SolidBrush(COLORS.PathLine),
    NodeSelected: new SolidBrush(COLORS.PathLine),
    Node: new SolidBrush(COLORS.NodeBackground),
}

export const PENS = {
    PathLine: new DefaultPen(BRUSHES.PathLine),
}

//export const SELECTED_NODE_BRUSH = new SolidBrush();

export function drawPath(context: DrawingContext, path: Path, selected: number[] | null, scale: number = 1) {
    drawPathLine(context, path, scale);
    drawHandles(context, path, scale);
    drawNodes(context, path, selected, scale);
}

export function drawPathLine(context: DrawingContext, path: Path, scale: number = 1) {
    PENS.PathLine.width = SIZES.PathLine / scale;
    context.drawPath(path, PENS.PathLine);
}

function drawHandles(context: DrawingContext, path: Path, scale: number = 1) {
    const nodes = path.nodes;
    const length = nodes.length;

    for (let i = 0; i < length; i++) {
        drawNodeHandles(context, nodes[i], scale);
    }
}

function drawNodes(context: DrawingContext, path: Path, selected: number[] | null, scale: number = 1) {
    const nodes = path.nodes;
    const length = nodes.length;

    for (let i = 0; i < length; i++) {
        drawNode(context, nodes[i], selected && selected.includes(i), scale);
    }
}

function drawNode(context: DrawingContext, node: PathNode, selected: boolean, scale: number = 1) {
    if (selected) {
        //context.fillCircle(center, 10, SELECTED_NODE_BRUSH);
    }
}

function drawNodeHandles(context: DrawingContext, node: PathNode, scale: number = 1) {
    if (node.joint === PathJoint.Corner) {
        // no handles
        return;
    }
    if (node.handleIn) {
        drawHandle(context, node, node.handleIn, scale);
    }
    if (node.handleOut) {
        drawHandle(context, node, node.handleOut, scale);
    }
}

function drawHandle(context: DrawingContext, node: PointLike, handle: PointLike, scale: number = 1) {
    // draw line ...
    PENS.PathLine.width = SIZES.HandleLine / scale;
    context.drawLine(node, handle, PENS.PathLine);

    // draw circle ...
    // TODO:
}

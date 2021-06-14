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

export type ToolButtonDef = {
    tool: string,
    icon: string,
    title: string,
};

export type ToolButtons = (ToolButtonDef | ToolButtonDef[])[];

export const buttons: ToolButtons = [
    {
        tool: 'select',
        icon: 'expr:selection-tool',
        title: 'Selection tool (V)'
    },
    {
        tool: 'path',
        icon: 'expr:direct-selection-tool',
        title: 'Node tool (A)'
    },
    {
        tool: 'transform',
        icon: 'expr:center-origin-object',
        title: 'Transform tool (F)'
    },
    [
        {
            tool: 'pen',
            icon: 'expr:pen-tool',
            title: 'Pen tool (P)'
        },
        // TODO:
        /*
        {
            tool: 'pencil',
            icon: 'expr:pen-tool',
            title: 'Pencil tool (N)'
        },*/
        {
            tool: 'poly',
            icon: 'expr:guidelines-toggle',
            title: 'Polyline tool (W)'
        },
        {
            tool: 'line',
            icon: 'expr:line-tool',
            title: 'Line tool (L)'
        },
    ],
    [
        {
            tool: 'rectangle',
            icon: 'expr:rectangle-tool',
            title: 'Rectangle tool (R)'
        },
        {
            tool: 'ellipse',
            icon: 'expr:ellipse-tool',
            title: 'Ellipse tool (E)'
        },
        {
            tool: 'polygon',
            icon: 'expr:polygon-tool',
            title: 'Polygon tool (O)'
        },
        {
            tool: 'star',
            icon: 'expr:star-tool',
            title: 'Star tool (S)'
        },
    ],
    [
        {
            tool: 'gradient',
            icon: 'expr:gradient-tool',
            title: 'Gradient tool (G)'
        },
        {
            tool: 'color-picker',
            icon: 'expr:colorpicker-tool',
            title: 'Eyedropper tool (I)'
        },
    ],
    // TODO: image tool info
    /*
    {
        tool: 'image',
        icon: 'expr:image-tool',
        title: 'Image tool ()'
    },*/
    {
        tool: 'text',
        icon: 'expr:text-tool',
        title: 'Text tool (T)'
    },
    {
        tool: 'pan',
        icon: 'expr:pan-tool',
        title: 'Hand tool (H)'
    },
    {
        tool: 'zoom',
        icon: 'expr:zoom-tool',
        title: 'Zoom tool (Z)'
    },
];

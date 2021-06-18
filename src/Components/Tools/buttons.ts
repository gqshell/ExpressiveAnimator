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
    disabled?: boolean,
};

export type ToolButtons = (ToolButtonDef | ToolButtonDef[])[];

export const buttons: ToolButtons = [
    {
        tool: 'selection',
        icon: 'expr:selection-tool',
        title: 'Selection tool (V)'
    },
    {
        tool: 'path',
        disabled: true,
        icon: 'expr:direct-selection-tool',
        title: 'Node tool (A)'
    },
    {
        tool: 'transform',
        icon: 'expr:transform-tool',
        title: 'Transform tool (F)'
    },
    [
        {
            tool: 'pen',
            icon: 'expr:pen-tool',
            title: 'Pen tool (P)',
            disabled: true
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
            icon: 'expr:polyline-tool',
            title: 'Polyline tool (W)'
        },
        {
            tool: 'line',
            icon: 'expr:line-tool',
            title: 'Line tool (L)',
            disabled: true
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
            title: 'Gradient tool (G)',
            disabled: true
        },
        {
            tool: 'color-picker',
            icon: 'expr:colorpicker-tool',
            title: 'Eyedropper tool (I)',
            disabled: true
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
        title: 'Text tool (T)',
        disabled: true
    },
    {
        tool: 'pan',
        icon: 'expr:pan-tool',
        title: 'Hand tool (H)'
    },
    {
        tool: 'zoom',
        icon: 'expr:zoom-tool',
        title: 'Zoom tool (Z)',
        disabled: true
    },
];

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

import type {SvelteComponent} from "svelte";
import {getContext} from "svelte";

export type DialogAction = {
    label: string,
    action?: (value?: any) => Promise<boolean | void>,
}

export type DialogDef = {
    title: string,
    value?: any,
    mode?: 'fullscreen' | 'fullscreenTakeover' | undefined,
    size?: 'small' | 'medium' | 'large' | 'alert' | undefined,
    footer?: string,
    dismissable?: boolean,
    divider?: boolean,
    responsive?: boolean,
    underlay?: boolean,

    confirm?: DialogAction,
    secondary?: DialogAction,
    cancel?: DialogAction,
}

export type OpenDialogFunction = (dialog: DialogDef, component: SvelteComponent, props?: object) => void;

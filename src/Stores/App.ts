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

export const IsFillSelected = writable<boolean>(true);
export const CurrentColorMode = writable<string>('HEX');
export const ProportionalScale = writable<boolean>(false);
export const ProportionalSize = writable<boolean>(true);
export const IsProjectSaved = writable<boolean>(false);
export const ProjectFileHandle = writable<FileSystemFileHandle>(null);

export const ShowTreeReverse = writable<boolean>(true);

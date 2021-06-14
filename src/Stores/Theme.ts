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
import type {Writable} from "svelte/store";

// TODO: load from app preferences
const {subscribe, set, update} = writable<"light" | "dark">("dark");
const toggle = () => update(v => v === "light" ? "dark" : "light");

export const CurrentTheme: Writable<"light" | "dark"> & {toggle: () => void} = {
    subscribe,
    set,
    update,
    toggle,
};

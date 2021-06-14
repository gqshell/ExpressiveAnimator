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

import type {Writable} from "svelte/store";
import {writable} from "svelte/store";

type AsyncGenIdStore = Writable<number> & {
    invalidate(): void;
};

function plusOne(v: number): number {
    return v + 1;
}

export function createGenIdStore(): AsyncGenIdStore {
    const {subscribe, set, update} = writable<number>(0);

    return {
        subscribe,
        set,
        update,
        invalidate(): void {
            update(plusOne)
        }
    }
}

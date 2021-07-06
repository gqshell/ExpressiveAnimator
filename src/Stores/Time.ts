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

import {CurrentDocumentAnimation, CurrentProject, CurrentSelection} from "./Project";
import {derived, writable} from "svelte/store";
import type {DocumentAnimation, Animator, Animation} from "../Core";
import type {Element, Selection} from "@zindex/canvas-engine";
import type {AnimatedProperties, AnimatorSource} from "../Core";

const MAX_TIME_SCALE = 1.5;

export const CurrentTime = writable<number>(0);
export const CurrentMaxTime = derived([CurrentDocumentAnimation, CurrentTime],
    ([$animation, $time]) => Math.max($time, $animation ? $animation.endTime : 0) * MAX_TIME_SCALE);

export const ShowOnlySelectedElementsAnimations = writable<boolean>(false);
export const CurrentAnimatedElements = derived(
    [CurrentProject, CurrentDocumentAnimation, CurrentSelection, ShowOnlySelectedElementsAnimations],
    ([$project, $animation, $selection, $onlySelected]): AnimatedElement[] => {
        if (!$animation || ($onlySelected && $selection.isEmpty)) {
            return [];
        }

        return getAnimatedElements(
            $onlySelected ? getSelectedElementsProperties($animation, $selection) : $animation.getAnimatedElements(),
            $project.animatorSource
        );
    });

export type AnimatedProperty = {
    animator: Animator<any, any>,
    property: string,
    animation: Animation<any>,
};

export type AnimatedElement = {
    element: Element,
    animatedProperties: AnimatedProperty[],
}

function *getSelectedElementsProperties(animation: DocumentAnimation, selection: Selection<any>): Generator<[Element, AnimatedProperties<Element>]> {
    for (const entry of animation.getAnimatedElements()) {
        if (selection.isSelected(entry[0])) {
            yield entry;
        }
    }
}

function getAnimatedElements(elements: Iterable<[Element, AnimatedProperties<Element>]>, source: AnimatorSource): AnimatedElement[] {
    const list = [];

    for (const [element, properties] of elements) {
        const animatedProperties: AnimatedProperty[] = [];
        for (const [property, animation] of Object.entries(properties)) {
            const animator = source.getAnimator(element, property as any);
            if (!animator) {
                continue;
            }

            animatedProperties.push({
                animator,
                property,
                animation,
            });
        }

        if (animatedProperties.length > 0) {
            list.push({
                element,
                animatedProperties,
            });
        }
    }

    return list;
}

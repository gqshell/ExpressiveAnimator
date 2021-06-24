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

import {writable, derived} from 'svelte/store';
import type {Readable, Writable} from 'svelte/store';
import type {
    AnimationProject,
    AnimationState,
    KeyframeSelection,
    DocumentAnimation,
    AnimationDocument
} from "../Core";
import type {
    Element,
    Selection,
} from "@zindex/canvas-engine";
import {createGenIdStore} from "./utils";

type AnimationSelection = Selection<AnimationDocument>;

const project = writable<AnimationProject>(null);

type CurrentProjectDef = Writable<AnimationProject> & {
    loadProject(newProject: AnimationProject, callback?: (oldProject: AnimationProject | null)=> void): void;
    unloadProject(dispose: boolean): void;
    changeDocument(document: AnimationDocument): void;
    forceUpdate(): void;
}

const animationGenId = createGenIdStore();
const propertiesGenId = createGenIdStore();
const stateGenId = createGenIdStore();
const selectionGenId = createGenIdStore();
const documentGenId = createGenIdStore();

export const notifyAnimationChanged = animationGenId.invalidate;
export const notifyPropertiesChanged = propertiesGenId.invalidate;
export const notifyStateChanged = stateGenId.invalidate;
export const notifySelectionChanged = selectionGenId.invalidate;

export const CurrentProject: CurrentProjectDef = {
    subscribe: project.subscribe,
    set: project.set,
    update: project.update,
    // ----

    forceUpdate(): void {
        project.update(p => p);
    },
    loadProject(newProject: AnimationProject, callback?: (oldProject: AnimationProject | null) => void): void {
        project.update(oldProject => {
            if (callback) {
                callback(oldProject);
            }
            return newProject;
        })
    },
    unloadProject(dispose: boolean = true): void {
        project.update(currentProject => {
            if (dispose && currentProject) {
                currentProject.dispose();
            }
            return null;
        });
    },
    changeDocument(document: AnimationDocument): void {
        project.update(p => {
            p.document = document;
            return p;
        });
    },
}

export const CurrentSelection = derived<[Readable<AnimationProject>, Readable<number>], AnimationSelection>([project, selectionGenId], ([$project]) => {
    return $project ? $project.selection : null;
});

export const CurrentProjectState = derived<[Readable<AnimationProject>, Readable<number>], AnimationState>([project, stateGenId], ([$project]) => {
    return $project ? ($project.state as AnimationState) : null;
});

export const CurrentKeyframeSelection = derived<Readable<AnimationProject>, KeyframeSelection>(project, ($project) => {
    return $project ? $project.keyframeSelection : null;
});

export const CurrentSelectedElement = derived<[Readable<AnimationSelection>, Readable<number>, Readable<number>], Element>([CurrentSelection, propertiesGenId, stateGenId], ([$selection]) => {
    return $selection ? $selection.activeElement : null;
});

export const CurrentDocument = derived<Readable<AnimationProject>, AnimationDocument>(project, ($project): AnimationDocument => {
    return $project ? $project.document : null;
});

export const CurrentDocumentAnimation = derived<[Readable<AnimationDocument>, Readable<number>], DocumentAnimation>([CurrentDocument, animationGenId], ([$document]): DocumentAnimation => {
    return $document ? $document.animation : null;
});

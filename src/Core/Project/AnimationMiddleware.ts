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

import {Middleware} from "@zindex/canvas-engine";
import type {Element} from "@zindex/canvas-engine";
import type {Point} from "@zindex/canvas-engine";
import type {WritableKeys} from "@zindex/canvas-engine";
import type {AnimationProject} from "./AnimationProject";
import type {Animation, Keyframe} from "../Animation";
import {AnimationProjectEvent} from "./AnimationProjectEvent";
import {equals} from "@zindex/canvas-engine";
import type {AnimationDocument} from "./AnimationDocument";

export class AnimationMiddleware extends Middleware<AnimationProject> {
    setTime(time: number): boolean {
        if (this.project.setTime(time)) {
            return this.updateAnimatedProperties(this.project.document);
        }
        return false;
    }

    getTime(): number {
        return this.project.time;
    }

    /**
     * Updates the document animated properties
     */
    updateAnimatedProperties(document: AnimationDocument, time?: number): boolean {
        const animation = document.animation;

        if (!animation) {
            return false;
        }

        if (time == null) {
            time = this.project.time;
        }

        return animation.updateAnimatedProperties(time, this.setAnimatedPropertyValue.bind(this));
    }

    /**
     * Updates only some animations
     */
    updateAnimations(filter: {animations: Set<Animation<any>>, keyframes: Set<Keyframe<any>>}): boolean {
        return this.project.document.animation.updateAnimatedProperties(this.project.time, this.setAnimatedPropertyValue.bind(this), filter);
    }

    /**
     * Get property animation from element, or null if no animation is defined
     */
    getAnimation<E extends Element, K extends WritableKeys<E>>(element: E, property: K): Animation<E[K]> | null {
        return (element.document as AnimationDocument).animation?.getAnimation(element, property);
    }

    protected setAnimatedPropertyValue<E extends Element, K extends WritableKeys<E>, V extends E[K]>(element: E, property: K, value: V): boolean {
        if (property === 'position') {
            // TODO: use meta to set angle
        }
        return super.setElementProperty(element, property, value);
    }

    /**
     * @override
     */
    setElementPosition(element: Element, position: Point, angle?: number | null): boolean {
        if (angle == null) {
            // TODO: calculate angle
        }

        return super.setElementPosition(element, position, angle);
    }

    /**
     * @override
     */
    setElementProperty<E extends Element, K extends WritableKeys<E>, V extends E[K]>(element: E, property: K, value: V): boolean {
        const project = this._project;

        let animation = this.getAnimation<E, K>(element, property);
        let keyframeAdded: boolean = false;

        if (!animation) {
            const documentAnimation = (element.document as AnimationDocument).animation;

            if (!documentAnimation || !project.isRecording) {
                // document is not animated OR
                // we are not recording animations
                return super.setElementProperty(element, property, value);
            }

            if (project.animatorSource.isAnimatable(element, property)) {
                // create a new empty animation
                animation = project.animatorSource.createAnimation(element, property);
                if (!animation || !documentAnimation.addAnimation(element, property, animation)) {
                    return false;
                }
                // Add first keyframe
                if (documentAnimation.startTime != project.time) {
                    animation.addKeyframeAtOffset(documentAnimation.startTime, element[property]);
                    keyframeAdded = true;
                }
            } else {
                // property is not animatable
                return super.setElementProperty(element, property, value);
            }
        } else if (animation.disabled) {
            // animation is disabled
            return super.setElementProperty(element, property, value);
        }

        const time = project.time;
        let keyframe = animation.getKeyframeAtOffset(time);

        if (keyframe) {
            if (equals(keyframe.value, value)) {
                // Same value on keyframe, check property value
                const changed = super.setElementProperty(element, property, value);
                // New keyframe added
                if (keyframeAdded && project.document === element.document) {
                    project.engine?.emit(AnimationProjectEvent.keyframeAdded, {element, animation});
                }
                return changed;
            }
            // Update keyframe value
            keyframe.value = value;
        } else {
            // Add a new keyframe
            animation.addKeyframe(animation.createKeyframe(value, time));
            keyframeAdded = true;
        }

        super.setElementProperty(element, property, value);

        // New keyframe added
        if (keyframeAdded && project.document === element.document) {
            project.engine?.emit(AnimationProjectEvent.keyframeAdded, {element, animation});
        }

        return true;
    }
}
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

import { createPopper } from '@popperjs/core';

const clickFocusOptions = {
    capture: true,
    passive: true,
};
const hideOptions = {modifiers: [{ name: 'eventListeners', enabled: false}]};

function outsideEventHandler(handler, add: boolean) {
    if (add) {
        document.addEventListener('pointerdown', handler, clickFocusOptions);
        document.addEventListener('focusin', handler, clickFocusOptions);
    } else {
        document.removeEventListener('pointerdown', handler, clickFocusOptions);
        document.removeEventListener('focusin', handler, clickFocusOptions);
    }
}

export function popperAction(trigger: HTMLElement, {content, options, closeOnClickOutside, update}) {
    let instance = null;
    let open: boolean = false;

    const clickOutside = e => {
        if (instance && open && !trigger.contains(e.target)) {
            hide();
        }
    };

    const toggle = () => {
        if (!open) {
            show();
        } else {
            hide();
        }
    }

    const show = () => {
        if (instance) {
            instance.setOptions(options);
            instance.update();
        } else {
            instance = createPopper(trigger, content(), options);
        }
        if (closeOnClickOutside) {
            outsideEventHandler(clickOutside, true);
        }
        open = true;
        update(true);
    }

    const hide = () => {
        if (instance) {
            instance.setOptions(hideOptions);
        }
        if (closeOnClickOutside) {
            outsideEventHandler(clickOutside, false);
        }
        open = false;
        update(false);
    }

    trigger.addEventListener('popper-show', show);
    trigger.addEventListener('popper-hide', hide);
    trigger.addEventListener('popper-toggle', toggle);

    return {
        update(params) {
            if (!params) {
                return;
            }

            let force = false;

            if (params?.options) {
                options = params.options;
                force = true;
            }
            if (params?.closeOnClickOutside !== closeOnClickOutside) {
                closeOnClickOutside = !!params?.closeOnClickOutside;
                outsideEventHandler(clickOutside, closeOnClickOutside);
            }
            if (params?.update) {
                update = params?.update;
            }

            if (params?.content !== content) {
                content = params.content;
                if (instance) {
                    instance.destroy();
                    if (open) {
                        instance = createPopper(trigger, content(), options);
                        force = false;
                    }
                }
            }

            if (force && open && instance) {
                instance.setOptions(options);
                instance.update();
            }
        },
        destroy() {
            if (instance) {
                instance.destroy();
                instance = null;
            }
            trigger.removeEventListener('popper-show', show);
            trigger.removeEventListener('popper-hide', hide);
            trigger.removeEventListener('popper-toggle', toggle);
            if (closeOnClickOutside) {
                outsideEventHandler(clickOutside, false);
            }
        }
    };
}
import "./spectrum";
import "./style.css";
import "./scroll.css";

import {loadIconSet} from "./LoadIcons";
import App from './App.svelte';

// Prevent typescript errors
//@ts-ignore
import CustomIcons from "./icons.svg";
//@ts-ignore
import AdobeWorkflowIcons from "./workflow-icons.svg";

import "@adobe/focus-ring-polyfill";

import {CanvasEngineInit} from "@zindex/canvas-engine";
import {CurrentProject} from "./Stores";
import {project} from "./doc1";

export default LoadApp();

async function LoadApp() {
    await patchIcon();
    await loadIconSet('expr', CustomIcons);
    await loadIconSet('workflow', AdobeWorkflowIcons);
    await CanvasEngineInit({
        defaultFont: document.querySelector('meta[name="expressive:default-font"]').getAttribute('content')
    });
    // Set test project
    // @ts-ignore
    //project.document.test();
    CurrentProject.set(project);
    return new App({
        target: document.body,
        props: {},
    });
}

async function patchIcon() {
    await customElements.whenDefined('sp-icon');
    const icon = customElements.get('sp-icon');
    const prop = Object.getOwnPropertyDescriptor(icon.prototype, 'name')
    const set = prop.set;
    prop.set = function (value) {
        if (this.name === value) {
            return;
        }
        set.call(this, value);
        this.setAttribute('name', value);
    }
    Object.defineProperty(icon.prototype, 'name', prop);

    const updateIcon = icon.prototype.updateIcon;
    icon.prototype.updateIcon = async function () {
        if (this.updateIconPromise) {
            // wait for current update
            await this.updateIconPromise;
        }
        return updateIcon.call(this);
    }
}
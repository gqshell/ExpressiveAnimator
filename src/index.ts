import "./spectrum";
import "./style.css";
import "./scroll.css";

import LoadIcons from "./LoadIcons";
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

LoadIcons(CustomIcons);
LoadIcons(AdobeWorkflowIcons);

export default LoadApp();

async function LoadApp() {
    await CanvasEngineInit({defaultFont: '/engine/font.ttf.woff2'});
    // Set test project
    // @ts-ignore
    //project.document.test();
    CurrentProject.set(project);
    return new App({
        target: document.body,
        props: {},
    });
}
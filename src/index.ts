import "./spectrum";
import "./style.css";
import "./scroll.css";

import LoadIcons from "./LoadIcons";
import App from './App.svelte';

// Prevent typescript errors
//@ts-ignore
import CustomIcons from "./icons.svg";
import {CanvasEngineInit} from "@zindex/canvas-engine";

LoadIcons(CustomIcons);

export default LoadApp();

async function LoadApp() {
    await CanvasEngineInit({defaultFont: '/engine/font.ttf.woff2'});
    return new App({
        target: document.body,
        props: {},
    });
}
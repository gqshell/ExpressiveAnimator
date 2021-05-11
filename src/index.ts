import "./spectrum";
import "./style.css";
import "./scroll.css";

import LoadIcons from "./LoadIcons";
import App from './App.svelte';

// Prevent typescript errors
//@ts-ignore
import CustomIcons from "./icons.svg";

LoadIcons(CustomIcons);

export default LoadApp();


async function LoadApp() {
    window.Skia = await SkiaWasmInit();
    return new App({
        target: document.body,
        props: {},
    });
}
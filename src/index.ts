import "./spectrum";
import "./style.css";
import "./scroll.css";

import LoadIcons from "./LoadIcons";
import App from './App.svelte';

// Prevent typescript errors
//@ts-ignore
import CustomIcons from "./icons.svg";

LoadIcons(CustomIcons);

const app = new App({
    target: document.body,
    props: {},
});

export default app;
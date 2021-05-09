import { writable } from 'svelte/store';

export const CanvasStateTool = writable<string>('pan');
export const CanvasStateRulers = writable<boolean>(false);
export const CanvasStateGuides = writable<boolean>(false);
export const CanvasStateGrid = writable<boolean>(false);


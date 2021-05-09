import {writable} from "svelte/store";

export const TimelinePlayOffset = writable<number>(0);
export const TimelineShowDisabledAnimations = writable<boolean>(true);
export const TimelineShowOnlySelectedElements = writable<boolean>(false);



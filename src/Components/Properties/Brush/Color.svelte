<script lang="ts">
    import {Color} from "@zindex/canvas-engine";
    import ColorControl from "../../../Controls/ColorControl.svelte";
    import {TinyColor} from "@ctrl/tinycolor";
    import {createEventDispatcher} from "svelte";

    const dispatch = createEventDispatcher();

    export let value: Color;
    export let colorMode = undefined;

    let started: boolean = false;

    function onInput(e: CustomEvent<TinyColor>) {
        if (!started) {
            started = true;
            dispatch('start');
        }
        dispatch('update', new Color(e.detail.r, e.detail.g, e.detail.b, e.detail.a));
    }

    function onStart() {
        if (started) {
            return;
        }
        started = true;
        dispatch('start');
    }

    function onDone() {
        started = false;
        dispatch('done');
    }

</script>
<ColorControl value={new TinyColor(value)}
              on:start={onStart}
              on:done={onDone}
              bind:mode={colorMode}
              on:input={onInput}/>
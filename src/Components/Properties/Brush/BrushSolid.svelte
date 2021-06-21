<script lang="ts">
    import ColorControl from "./Color.svelte";
    import {SolidBrush} from "@zindex/canvas-engine";
    import type {Color} from "@zindex/canvas-engine";
    import {createEventDispatcher} from "svelte";

    const dispatch = createEventDispatcher();

    export let value: SolidBrush;
    export let colorMode = undefined;

    function onInput(e: CustomEvent<Color>) {
        dispatch('input', new SolidBrush(e.detail));
    }
</script>
<ColorControl on:input={onInput} bind:colorMode={colorMode} on:start on:stop value={value.color} />
<script lang="ts">
    import ColorControl from "./Color.svelte";
    import {SolidBrush} from "@zindex/canvas-engine";
    import type {Color} from "@zindex/canvas-engine";
    import {createEventDispatcher} from "svelte";

    const dispatch = createEventDispatcher();

    export let value: SolidBrush;
    export let colorMode = undefined;

    function onUpdate(e: CustomEvent<Color>) {
        dispatch('update', value.withColor(e.detail));
    }
</script>
<ColorControl
        on:update={onUpdate}
        on:start
        on:done
        value={value.color} bind:colorMode={colorMode} />
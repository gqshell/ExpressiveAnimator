<script lang="ts">
    import {Color} from "@zindex/canvas-engine";
    import ColorControl from "../../../Controls/ColorControl.svelte";
    import {TinyColor} from "@ctrl/tinycolor";
    import {createEventDispatcher} from "svelte";

    const dispatch = createEventDispatcher();

    export let value: Color;
    export let colorMode = undefined;
</script>
<ColorControl value={new TinyColor(value)}
              bind:mode={colorMode}
              on:input={e => dispatch('input', Color.parse(e.detail))}
              on:start
              on:stop />
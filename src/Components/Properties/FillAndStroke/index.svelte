<script lang="ts">
    import BrushSwitch from "./BrushSwitch.svelte";
    import BrushControl from "../Brush";
    import Fill from "./Fill.svelte";
    import Stroke from "./Stroke.svelte";
    import type {Brush, FillRule, StrokeLineCap, StrokeLineJoin} from "@zindex/canvas-engine";

    export let showFill: boolean = true;
    export let colorMode: string = undefined;

    export let value: {
        // brush
        fill: Brush,
        fillOpacity: number,
        strokeBrush: Brush,
        strokeOpacity: number,

        // fill
        fillRule: FillRule,

        // stroke
        strokeLineWidth: number,
        strokeLineCap: StrokeLineCap,
        strokeLineJoin: StrokeLineJoin,
        strokeMiterLimit: number,
        strokeDashArray: number[],
        strokeDashOffset: number,
    };
</script>
<BrushSwitch value={value} bind:showFill />
<BrushControl value={showFill ? value.fill : value.strokeBrush} bind:colorMode />
{#if showFill}
    <Fill value={value} />
{:else}
    <Stroke value={value} />
{/if}
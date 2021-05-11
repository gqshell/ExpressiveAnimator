<script lang="ts">
    import TimelineControls from "./TimelineControls.svelte";
    import Timeline from "./Timeline.svelte";
    import type {AnimationManager} from "@zindex/canvas-engine";
    import TimelineRuler from "./TimelineRuler.svelte";

    export let animationManager: AnimationManager;

    export let zoom: number = 1;
    export let playOffset: number = 0;
    export let playOffsetMax: number = 3000;

    let scrollTop: number = 0;
    let scrollLeft: number = 0;

    $: unit = zoom * 1;

    // TODO: use zoom and others
    $: style = `
        --timeline-play-offset: ${playOffset};
        --timeline-scroll-top: ${scrollTop}px;
        --timeline-max-offset: ${animationManager.duration};
        --timeline-ms-unit: ${unit}px;
    `;
</script>
<div class="timeline-wrapper" style="{style}">
    <div class="timeline-controls-wrapper">
        <TimelineControls bind:playOffset={playOffset} bind:playOffsetMax={playOffsetMax} />
        <TimelineRuler bind:zoom left={scrollLeft} />
    </div>
    <Timeline bind:animationManager={animationManager}
              bind:scrollTop bind:scrollLeft
              bind:playOffset={playOffset}
              bind:playOffsetMax={playOffsetMax} />
</div>
<style global>
    .timeline-wrapper {
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .timeline-wrapper * {
        user-select: none;
    }

    .timeline-controls-wrapper {
        height: 28px;
        max-height: 28px;
        min-height: 28px;
        display: flex;
        flex-direction: row;
    }
</style>
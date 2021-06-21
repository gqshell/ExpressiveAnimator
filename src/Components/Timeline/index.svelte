<script lang="ts">
    import TimelineControls from "./TimelineControls.svelte";
    import Timeline from "./Timeline.svelte";
    import TimelineRuler from "./TimelineRuler.svelte";

    import {CurrentTime, CurrentMaxTime} from "../../Stores";

    export let zoom: number = 1;

    let scrollTop: number = 0;
    let scrollLeft: number = 0;

    $: unit = zoom * 0.24;

    // TODO: use zoom and others
    $: style = `
        --timeline-play-offset: ${$CurrentTime};
        --timeline-scroll-top: ${scrollTop}px;
        --timeline-scroll-left: ${scrollLeft}px;
        --timeline-max-offset: ${$CurrentMaxTime};
        --timeline-ms-unit: ${unit}px;
    `;
</script>
<div class="timeline-wrapper" style="{style}">
    <div class="timeline-controls-wrapper">
        <TimelineControls />
        <TimelineRuler bind:zoom scroll={scrollLeft} />
    </div>
    <Timeline bind:scrollTop bind:scrollLeft={scrollLeft} />
    <div class="timeline-bottom-bar">
        bar
    </div>
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
        height: 32px;
        max-height: 32px;
        min-height: 32px;
        display: flex;
        flex-direction: row;
    }

    .timeline-bottom-bar {
        box-sizing: border-box;
        border-top: 1px solid var(--separator-color);
        height: 21px;
    }
</style>
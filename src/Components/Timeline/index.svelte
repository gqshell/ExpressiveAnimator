<script lang="ts">
    import TimelineControls from "./TimelineControls.svelte";
    import Timeline from "./Timeline.svelte";
    import TimelineRuler from "./TimelineRuler.svelte";

    import {CurrentTime, CurrentMaxTime} from "../../Stores";
    import TimelineActionBar from "./TimelineActionBar.svelte";

    export let zoom: number = 1;
    export let collapsed: boolean = false;

    let scrollTop: number = 0;
    let scrollLeft: number = 0;

    $: {
        if (collapsed) {
            // reset scroll when collapsing
            scrollLeft = scrollTop = 0;
        }
    }

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
    {#if !collapsed}
        <div class="timeline-controls-wrapper">
            <TimelineControls />
            <TimelineRuler bind:zoom scroll={scrollLeft} />
        </div>
        <Timeline bind:scrollTop bind:scrollLeft={scrollLeft} />
        <TimelineActionBar bind:zoom />
    {/if}
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
</style>
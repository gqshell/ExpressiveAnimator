<script lang="ts">
    import TimelineControls from "./TimelineControls.svelte";
    import Timeline from "./Timeline.svelte";
    import TimelineRuler from "./TimelineRuler.svelte";

    import {CurrentTime, CurrentMaxTime} from "../../Stores";
    import TimelineActionBar from "./TimelineActionBar.svelte";
    import {getScaleFactor, UNIT} from "./utils";

    export let zoom: number = 1;
    export let collapsed: boolean = false;

    let scaleFactor: number;
    let scrollTop: number = 0;
    let scrollLeft: number = 0;

    $: scaleFactor = getScaleFactor(zoom);

    let wrapper: HTMLElement;

    $: {
        if (collapsed) {
            // reset scroll when collapsing
            scrollLeft = scrollTop = 0;
        }
    }

    $: wrapper && wrapper.style.setProperty('--timeline-play-offset', $CurrentTime.toString());
    $: wrapper && wrapper.style.setProperty('--timeline-max-offset', $CurrentMaxTime.toString());
    $: wrapper && wrapper.style.setProperty('--timeline-ms-unit', (zoom * UNIT) + 'px');
    $: wrapper && wrapper.style.setProperty('--timeline-scroll-top', scrollTop + 'px');
    $: wrapper && wrapper.style.setProperty('--timeline-scroll-left', scrollLeft + 'px');
</script>
<div bind:this={wrapper} class="timeline-wrapper">
    {#if !collapsed}
        <div class="timeline-controls-wrapper">
            <TimelineControls />
            <TimelineRuler zoom={zoom} scaleFactor={scaleFactor} scroll={scrollLeft}/>
        </div>
        <Timeline zoom={zoom} scaleFactor={scaleFactor} bind:scrollTop bind:scrollLeft />
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
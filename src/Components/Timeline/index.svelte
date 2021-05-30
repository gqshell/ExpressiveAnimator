<script lang="ts">
    import TimelineControls from "./TimelineControls.svelte";
    import Timeline from "./Timeline.svelte";
    import TimelineRuler from "./TimelineRuler.svelte";
    import type {AnimationProject} from "@zindex/canvas-engine";

    export let project: AnimationProject;

    export let zoom: number = 1;
    export let playOffset: number = 0;
    export let playOffsetMax: number = 3000;

    let scrollTop: number = 0;
    let scrollLeft: number = 0;

    $: unit = zoom * 0.1;

    // TODO: use zoom and others
    $: style = `
        --timeline-play-offset: ${playOffset};
        --timeline-scroll-top: ${scrollTop}px;
        --timeline-max-offset: ${project.document?.animation?.duration || 0};
        --timeline-ms-unit: ${unit}px;
    `;
</script>
<div class="timeline-wrapper" style="{style}">
    <div class="timeline-controls-wrapper">
        <TimelineControls bind:playOffset={playOffset} bind:playOffsetMax={playOffsetMax} />
        <TimelineRuler bind:zoom left={scrollLeft} />
    </div>
    <Timeline bind:project={project}
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
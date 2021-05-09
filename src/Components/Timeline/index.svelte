<script lang="ts">
    import TimelineControls from "./TimelineControls.svelte";
    import Timeline from "./Timeline.svelte";

    export let playOffset: number = 0;
    export let playOffsetMax: number = 3000;

    let scrollTop: number = 0;

    // TODO: use zoom and others
    $: style = `
        --timeline-play-offset: ${playOffset};
        --timeline-scroll-top: ${scrollTop}px;
        --timeline-max-offset: 3000;
        --timeline-ms-unit: 1px;
    `;
</script>
<div class="timeline-wrapper" style="{style}">
    <TimelineControls bind:playOffset={playOffset} bind:playOffsetMax={playOffsetMax} />
    <Timeline bind:scrollTop bind:playOffset={playOffset} bind:playOffsetMax={playOffsetMax} />
</div>
<style global src="./style.css" />
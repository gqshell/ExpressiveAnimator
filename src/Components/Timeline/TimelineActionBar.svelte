<script lang="ts">
    import SpSlider from "../../Controls/SpSlider.svelte";
    export let zoom: number = 1;

    function handleInput(event) {
        zoom = event.detail;
    }

</script>
<div class="timeline-action-bar">
    <div class="timeline-action-bar-zoom-wrapper">
        <SpSlider on:input={handleInput} min={0.1} max={2} step={0.01} value={zoom} />
    </div>
</div>
<style global>
    .timeline-action-bar {
        display: flex;
        border-top: 1px solid var(--separator-color);
        width: 100%;
        height: var(--spectrum-alias-item-height-m);
        align-items: center;
    }
    .timeline-action-bar-zoom-wrapper {
        margin-left: auto;
        padding: 0 8px;
        width: 240px;
    }
</style>
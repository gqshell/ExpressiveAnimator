<script lang="ts">
    import {ShowOnlySelectedElementsAnimations} from "../../Stores";
    import SpSlider from "../../Controls/SpSlider.svelte";
    export let zoom: number = 1;

    function handleInput(event) {
        zoom = event.detail;
    }

</script>
<div class="timeline-action-bar">
    <sp-action-button
            class="very-small"
            on:click={() => $ShowOnlySelectedElementsAnimations = !$ShowOnlySelectedElementsAnimations}
            selected={$ShowOnlySelectedElementsAnimations} size="s" quiet emphasized>
        <sp-icon slot="icon" size="s" name="workflow:Filter"></sp-icon>
    </sp-action-button>
    <div class="timeline-action-bar-zoom-wrapper">
        <SpSlider on:input={handleInput} min={0.05} max={2} step={0.01} value={zoom} fill="middle" middle={1} />
    </div>
</div>
<style global>
    .timeline-action-bar {
        display: flex;
        box-sizing: content-box !important;
        border-top: 2px solid var(--separator-color);
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
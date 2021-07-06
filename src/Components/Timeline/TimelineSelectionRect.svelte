<script lang="ts">
    import type {Rectangle} from "@zindex/canvas-engine";
    export let rect: Rectangle = null;
</script>
{#if rect && rect.isVisible}
<div class="timeline-selection-rect" style={`top: ${rect.top}px; left: ${rect.left}px; width: ${rect.width}px; height: ${rect.height}px;`}></div>
{/if}
<style global>
    .timeline-selection-rect {
        z-index: 10;
        position: absolute;
        top: 0;
        left: 0;
        width: 0;
        height: 0;
        background: var(--spectrum-global-color-blue-700);
        opacity: 0.50;
    }
</style>
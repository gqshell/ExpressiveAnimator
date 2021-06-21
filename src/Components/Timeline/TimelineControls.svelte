<script lang="ts">
    // import {TimelineStore} from "../../Stores";
</script>
<div class="timeline-controls">
    <div class="timeline-controls-container">
        controls
    </div>
</div>
<style global>
    .timeline-controls {
        position: relative;
        box-sizing: border-box;
        width: 240px;
        height: 100%;
        border-right: 1px solid var(--separator-color);
        border-bottom: 1px solid var(--separator-color);
    }
    .timeline-controls-container {
        position: absolute;
        background: var(--spectrum-global-color-gray-75);
        width: 100%;
        height: 100%;
        z-index: 5;
    }
</style>
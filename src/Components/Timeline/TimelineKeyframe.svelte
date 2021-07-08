<script lang="ts">
    export let offset: number;
    export let id: string;
    export let selected: boolean = false;
</script>
<div on:pointerdown data-keyframe-id="{id}" class="timeline-keyframe" class:is-selected={selected} style={`--keyframe-offset: ${offset <= 0 ? 0 : offset}`}></div>
<style global>
    .timeline-keyframe {
        /*--keyframe-offset: 0;*/
        z-index: 6;
        position: absolute;
        left: 0;
        transform: translateX(calc(var(--keyframe-offset) * var(--timeline-ms-unit)));
        width: var(--timeline-keyframe-size);
        height: var(--timeline-keyframe-size);
        border-radius: 50%;
        border: 1px solid var(--spectrum-global-color-gray-100);
        background: var(--spectrum-global-color-gray-800);
    }

    .timeline-keyframe:hover:not(.is-selected) {
        z-index: 7;
        border-color: var(--spectrum-semantic-cta-color-background-default);
        box-shadow: 0 0 4px var(--spectrum-semantic-cta-color-background-default);
    }

    .timeline-keyframe.is-selected {
        z-index: 7;
        background: var(--spectrum-semantic-cta-color-background-default);
    }
</style>
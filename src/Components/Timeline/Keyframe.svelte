<script lang="ts">
    export let offset: number;
    export let selected: boolean = false;

</script>
<div on:click on:pointerdown class="timeline-keyframe" class:is-selected={selected} style={`--keyframe-offset: ${offset}`}></div>
<style global>
    .timeline-keyframe {
        /*--keyframe-offset: 0;*/
        z-index: 6;
        position: absolute;
        left: 0;
        transform: translateX(calc(var(--keyframe-offset) * var(--timeline-ms-unit) + 0.5px));
        width: var(--timeline-keyframe-size);
        height: var(--timeline-keyframe-size);
        border-radius: 50%;
        border: 1px solid var(--spectrum-global-color-gray-100);
        background: var(--spectrum-global-color-gray-800);
    }

    .timeline-keyframe:hover,
    .timeline-keyframe.is-selected {
        background: var(--spectrum-semantic-cta-color-background-default);
    }
</style>
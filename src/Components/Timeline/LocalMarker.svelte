<script lang="ts">
    export let label: string = '';
    export let offset: number = 0;
    export let length: number = 0;
    export let lines: number = 0;
    export let color: 'orange' | 'green' | 'yellow' |
        'seafoam' | 'indigo' | 'purple' | 'fuchsia' |
        'magenta' | 'chartreuse' | 'celery' = 'purple';
</script>
<div class="timeline-local-marker"
     data-color="{color}"
     style={`--timeline-marker-offset: ${offset}; --timeline-marker-length: ${length}; --timeline-marker-lines: ${lines}; background: var(--spectrum-global-color-${color}-400)`}>
    <div on:click on:pointerdown class="timeline-marker-text">{label}</div>
</div>
<style global>
    .timeline-local-marker {
        z-index: 0;
        position: absolute;
        top: 0;
        left: 0;

        /*--timeline-marker-offset: 0;*/
        /*--timeline-marker-length: 0;*/
        /*--timeline-marker-lines: 0;*/

        transform: translateX(calc(var(--timeline-keyframe-size) / 2 + var(--timeline-marker-offset) * var(--timeline-ms-unit)));
        width: calc(var(--timeline-marker-length) * var(--timeline-ms-unit));
        height: calc(var(--timeline-marker-lines) * var(--timeline-item-height));
    }

    .timeline-local-marker > .timeline-marker-text {
        user-select: none;
        max-width: 100%;
        line-height: var(--timeline-item-height);
        vertical-align: center;
        font-size: x-small;
        max-height: var(--timeline-item-height);
        padding: 0 calc(var(--timeline-keyframe-size) / 2);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: start;
        background: none;
    }
</style>
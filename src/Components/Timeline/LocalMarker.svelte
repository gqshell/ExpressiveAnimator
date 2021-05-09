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
     style={`--marker-offset: ${offset}; --marker-length: ${length}; --marker-lines: ${lines}; background: var(--spectrum-global-color-${color}-400)`}>
    <div on:click on:pointerdown class="timeline-marker-text">{label}</div>
</div>
<script lang="ts">
    export let disabled: boolean = false;
    export let selected: boolean = false;
    export let keyframes: boolean = false;
</script>
<div class="timeline-item"
     class:timeline-middle-line={keyframes}
     class:is-disabled={disabled}
     class:is-selected={selected}>
    <slot/>
</div>
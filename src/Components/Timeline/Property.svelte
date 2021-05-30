<script lang="ts">
    export let title: string;
    export let property: string;
    export let disabled: boolean = false;
</script>
<div class="timeline-item" class:is-disabled={disabled}>
    <span>{title}</span>
</div>
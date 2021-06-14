<script lang="ts">
    export let title: string;
</script>
<div>
    <h4>{title}</h4>
    <div class="properties"><slot /></div>
</div>
<style>
    .properties {
        display: flex;
        flex-direction: column;
        gap: var(--spectrum-global-dimension-size-100);
    }
</style>
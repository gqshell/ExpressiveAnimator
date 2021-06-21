<script lang="ts">
    export let title: string = '';
</script>
<div>
    {#if title !== ''}
        <div class="property-title">{title}</div>
    {/if}
    <div class="properties"><slot /></div>
</div>
<style>
    .property-title {
        margin: var(--spectrum-global-dimension-size-150) 0;
        text-transform: uppercase;
        letter-spacing: 2px;
        font-weight: lighter;
        font-size: var(--spectrum-global-dimension-font-size-50);
    }
    .properties {
        display: flex;
        flex-direction: column;
        gap: var(--spectrum-global-dimension-size-75);
    }
</style>
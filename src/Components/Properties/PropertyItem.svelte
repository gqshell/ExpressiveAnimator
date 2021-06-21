<script lang="ts">
    export let title: string;
</script>
<div class="property-item">
    <sp-field-label>{title}</sp-field-label>
    <slot />
</div>
<style>
    .property-item {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        height: var(--spectrum-global-dimension-size-400);
    }

    .property-item > sp-field-label {
        width: var(--spectrum-global-dimension-size-750);
    }
</style>
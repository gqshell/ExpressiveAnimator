<script lang="ts">
    import MenuItem from "./MenuItem.svelte";
    import type {MenuItemDef} from "./utils";
    import MenuOverlay from "./MenuOverlay.svelte";

    export let items: (MenuItemDef | null)[];
</script>
<sp-menu on:pointerenter on:pointerleave>
    {#each items as item}
        {#if item == null}
            <sp-menu-divider></sp-menu-divider>
        {:else if item.children && !item.disabled}
            <MenuOverlay on:action item={item}>
                <svelte:fragment let:onAction>
                    <svelte:self on:action={onAction} items={item.children} />
                </svelte:fragment>
            </MenuOverlay>
        {:else}
            <MenuItem on:action item={item} />
        {/if}
    {/each}
</sp-menu>
<style>
    sp-menu {
        min-width: var(--cascade-menu-min-width, 200px);
    }
</style>
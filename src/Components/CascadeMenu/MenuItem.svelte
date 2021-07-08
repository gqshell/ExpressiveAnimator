<script lang="ts">
    import Shortcut from "./Shortcut.svelte";
    import {createEventDispatcher} from "svelte";
    import type {MenuItemDef} from "./utils";

    const dispatch = createEventDispatcher();

    export let item: MenuItemDef;
    export let element: HTMLElement = undefined;
</script>
<sp-menu-item bind:this={element}
              disabled={item.disabled}
              on:pointerenter
              on:pointerleave
              on:click={item.disabled !== true && item.action != null ? () => dispatch('action', item) : undefined}>
    {item.title}
    {#if item.children}
        <sp-icon disabled={item.disabled} name="workflow:ChevronRight" slot="value"></sp-icon>
    {:else if item.shortcut}
        <kbd slot="value">
            <Shortcut value={item.shortcut} />
        </kbd>
    {/if}
</sp-menu-item>
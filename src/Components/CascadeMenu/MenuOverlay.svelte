<script lang="ts">
    import {Overlay} from '@spectrum-web-components/overlay';
    import {onDestroy, createEventDispatcher} from "svelte";
    import MenuItem from "./MenuItem.svelte";
    import type {MenuItemDef} from "./utils";

    export let item: MenuItemDef;

    const dispatch = createEventDispatcher();

    const DELAY: number = 300;

    let trigger: HTMLElement,
        content: HTMLElement & {open: boolean};
    let closeOverlayPromise: Promise<() => void>;

    let isOpen: boolean = false;
    let hovers: number = 0;

    function open() {
        if (content.open) {
            return;
        }
        content.open = isOpen = true;
        closeOverlayPromise = Overlay.open(trigger, 'inline', content, {
            offset: -18,
            placement: 'auto-end',
            //notImmediatelyClosable: true
        });
    }

    function close() {
        if (!content || !content.open) {
            return;
        }
        closeOverlayPromise.then(close => {
            close();
            closeOverlayPromise = null;
            content.open = isOpen = false;
            hovers = 0;
        });
    }

    function onEnter() {
        hovers++;
        setTimeout(() => {
            if (hovers === 1) {
                open();
            }
        }, DELAY);
    }

    function onLeave() {
        hovers--;
        setTimeout(() => {
            if (hovers === 0) {
                close();
            }
        }, DELAY / 2);
    }

    function onAction(e: CustomEvent<MenuItemDef>) {
        close();
        dispatch('action', e.detail);
    }

    onDestroy(() => {
        close();
    });
</script>
<MenuItem on:pointerenter={onEnter}
          on:pointerleave={onLeave}
          on:action={onAction}
          bind:element={trigger}
          item={item} />
<sp-popover on:pointerenter={onEnter} on:pointerleave={onLeave} bind:this={content}>
    <slot onAction={onAction} />
</sp-popover>
<style>
    sp-popover {
        min-width: var(--cascade-menu-min-width, 200px);
    }
</style>
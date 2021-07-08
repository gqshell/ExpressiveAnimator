<script lang="ts">
    import Dialog from "./Dialog.svelte";
    import type {DialogDef, OpenDialogFunction} from "./DialogType";
    import type {SvelteComponent} from "svelte";

    export let isOpen: boolean = false;

    let items: {
        dialog: DialogDef,
        component: SvelteComponent,
        props?: object
    }[] = [];

    export const openDialog: OpenDialogFunction = (dialog, component, props?) => {
        // update
        items = items.slice();
        items.push({dialog, component, props});
        isOpen = true;
    }

    function onClose(item) {
        const index = items.indexOf(item);
        if (index > -1) {
            items.splice(index, 1);
            // update
            items = items.slice();
            isOpen = items.length > 0;
        }
    }
</script>
<div style="z-index: 1000; position: absolute">
    {#each items as item}
        <Dialog data={item.dialog} on:close={() => onClose(item)}>
            <svelte:fragment let:isWorking let:closeDialog let:value>
                <svelte:component this={item.component} {...item.props} bind:value={item.dialog.value} isWorking={isWorking} closeDialog={closeDialog} />
            </svelte:fragment>
        </Dialog>
    {/each}
</div>
<script lang="ts">
    import {createEventDispatcher} from "svelte";

    export let items: {
        value: any,
        title: string,
        icon: string
    }[];
    export let value;
    export let size: string = 'm';

    const dispatch = createEventDispatcher();

    function onClick(val) {
        if (value === val) {
            return;
        }
        value = val;
        dispatch('change', value);
    }
</script>
<sp-action-group compact emphasized size="{size}">
    {#each items as item (item.value)}
        <sp-action-button on:click={() => onClick(item.value)} selected={item.value === value} title="{item.title}" size="{size}">
            <sp-icon name="{item.icon}" size="{size}" slot="icon"></sp-icon>
        </sp-action-button>
    {/each}
</sp-action-group>
<script lang="ts">
    import {CurrentTool} from "../../Stores";
    import SubTools from "./SubTools.svelte";
    import {buttons} from "./buttons";

    export let disabled: boolean = false;

    function selectTool(e: MouseEvent) {
        CurrentTool.change((e.target as HTMLElement).getAttribute('data-tool-name'));
    }
</script>
<sp-action-group vertical quiet emphasized>
    {#each buttons as button}
        {#if Array.isArray(button)}
            <SubTools buttons={button} disabled={disabled || button.disabled} />
        {:else}
            <sp-action-button on:click={selectTool} title={button.title} selected={!disabled && button.tool === $CurrentTool.name} disabled={disabled || button.disabled} data-tool-name="{button.tool}">
                <sp-icon size="s" name={button.icon} slot="icon"></sp-icon>
            </sp-action-button>
        {/if}
    {/each}
</sp-action-group>
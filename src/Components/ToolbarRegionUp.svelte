<script lang="ts">
    import SVGIcon from "./SVGIcon.svelte";
    import ToolbarSubTools from "./ToolbarSubTools.svelte";
    import {CurrentTool} from "../Stores";

    type ToolbarButtonDef = {
        tool: string,
        icon: string,
        title: string,
        shortcut?: string,
    };

    export let selected: string = undefined;
    export let disabled: boolean = false;
    export let buttons: (ToolbarButtonDef | ToolbarButtonDef[])[] = [];

    function selectTool(e: MouseEvent) {
        CurrentTool.update((e.target as HTMLElement).getAttribute('data-tool-name'));
    }

    function toolLabel(tool: ToolbarButtonDef) {
        if (tool.shortcut) {
            return tool.title + ' (' + tool.shortcut + ')';
        }
        return tool.title;
    }
</script>
<sp-action-group vertical quiet emphasized>
    {#each buttons as button}
        {#if Array.isArray(button)}
            <ToolbarSubTools bind:selected={selected} buttons={button} disabled={disabled} />
        {:else}
            <sp-action-button on:click={selectTool} title={button.title} selected={selected === button.tool} disabled={disabled} data-tool-name="{button.tool}">
                <sp-icon slot="icon">
                    <SVGIcon name={button.icon}/>
                </sp-icon>
            </sp-action-button>
        {/if}
    {/each}
</sp-action-group>
<script lang="ts">
    import SVGIcon from "./SVGIcon.svelte";
    import ToolbarSubTools from "./ToolbarSubTools.svelte";

    type ToolbarButtonDef = {
        tool: string,
        icon: string,
        title: string,
    };

    export let selected: string = undefined;
    export let disabled: boolean = false;
    export let buttons: (ToolbarButtonDef | ToolbarButtonDef[])[] = [];

    function selectTool(e: MouseEvent) {
        const el = e.target as HTMLElement;
        selected = el.getAttribute('data-tool-name');
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
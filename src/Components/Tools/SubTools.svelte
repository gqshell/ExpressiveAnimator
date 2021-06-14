<script lang="ts">
    import {CurrentTool} from "../../Stores";
    import SVGIcon from "../SVGIcon.svelte";
    import type {ToolButtonDef} from "./buttons";

    export let disabled: boolean = false;
    export let buttons = [];

    export let placement: string = 'right';

    $: current = buttons.find((v: ToolButtonDef) => v.tool === $CurrentTool.name) || buttons[0];

    let open = false;

    function selectTool(e: MouseEvent) {
        const el = e.target as HTMLElement;
        el.dispatchEvent(new Event('close', {bubbles: true, composed: true}));
        CurrentTool.change(el.getAttribute('data-tool-name'));
    }
</script>
<overlay-trigger type="inline" placement="{placement}" disabled={disabled}
                 on:sp-opened={() => open = true}
                 on:sp-closed={() => open = false}
>
    <sp-action-button on:click={e => !open && selectTool(e)} title={current.title}
                      data-tool-name="{current.tool}" selected={!disabled && $CurrentTool.name === current.tool}
                      disabled={disabled} hold-affordance slot="trigger">
        <sp-icon slot="icon">
            <SVGIcon name={current.icon}/>
        </sp-icon>
    </sp-action-button>
    <sp-popover slot="longpress-content" tip style="--spectrum-popover-dialog-min-width: 0;">
        <sp-action-group quiet style="padding: var(--spectrum-global-dimension-size-50)">
            {#each buttons as button (button.tool)}
                {#if current !== button}
                    <sp-action-button disabled={button.disabled} on:click={selectTool} data-tool-name="{button.tool}" title={button.title}>
                        <sp-icon slot="icon">
                            <SVGIcon name={button.icon}/>
                        </sp-icon>
                    </sp-action-button>
                {/if}
            {/each}
        </sp-action-group>
    </sp-popover>
</overlay-trigger>
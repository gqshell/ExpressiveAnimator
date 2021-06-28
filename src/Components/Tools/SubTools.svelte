<script lang="ts">
    import {CurrentTool} from "../../Stores";
    import type {ToolButtonDef} from "./buttons";

    export let disabled: boolean = false;
    export let buttons = [];

    export let placement: string = 'right';

    let current, last = null;
    $: {
        current = getCurrentTool(buttons, $CurrentTool.name) || buttons[0];
        last = current;
    }

    let open = false;

    function selectTool(e: MouseEvent) {
        const el = e.target as HTMLElement;
        el.dispatchEvent(new Event('close', {bubbles: true, composed: true}));
        CurrentTool.change(el.getAttribute('data-tool-name'));
    }

    function getCurrentTool(buttons: any[], name: string) {
        return buttons.find((v: ToolButtonDef) => v.tool === name) || last;
    }
</script>
<overlay-trigger type="inline" placement="{placement}" disabled={disabled}
                 on:sp-opened={() => open = true}
                 on:sp-closed={() => open = false}
>
    <sp-action-button on:click={e => !open && selectTool(e)} title={current.title}
                      data-tool-name="{current.tool}" selected={!disabled && $CurrentTool.name === current.tool}
                      disabled={disabled} hold-affordance slot="trigger">
        <sp-icon size="s" name="{current.icon}" slot="icon"></sp-icon>
    </sp-action-button>
    <sp-popover slot="longpress-content" tip style="--spectrum-popover-dialog-min-width: 0;">
        <sp-action-group quiet style="padding: var(--spectrum-global-dimension-size-50)">
            {#each buttons as button (button.tool)}
                {#if current !== button}
                    <sp-action-button disabled={button.disabled} on:click={selectTool} data-tool-name="{button.tool}" title={button.title}>
                        <sp-icon size="s" name={button.icon} slot="icon"></sp-icon>
                    </sp-action-button>
                {/if}
            {/each}
        </sp-action-group>
    </sp-popover>
</overlay-trigger>
<style>
    overlay-trigger, sp-action-button {
        touch-action: none;
    }
</style>
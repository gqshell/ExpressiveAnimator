<script lang="ts">
    import {CurrentProject, CurrentSelection} from "../../Stores";
    import type {AnimationMiddleware} from "../../Core";

    let disabledAlign: boolean = false, disableDistribute: boolean = false;

    $: disabledAlign = !$CurrentSelection || $CurrentSelection.isEmpty;
    $: disableDistribute = !$CurrentSelection || $CurrentSelection.length < 3;

    function align(e: PointerEvent) {
        const middleware: AnimationMiddleware = $CurrentProject?.middleware;
        if (!middleware) {
            return;
        }

        //console.log(middleware.alignElementToRectangle());

        switch ((e.target as HTMLElement).getAttribute('data-position')) {
            case 'left':

                break;
            case 'center':
                break;
            case 'right':
                break;
            case 'top':
                break;
            case 'middle':
                break;
            case 'bottom':
                break;
            default:
                return;
        }
    }

    function distribute(e: PointerEvent) {

    }
</script>
<sp-action-group style="width: 260px;" compact quiet>
    <sp-action-button on:click={align} data-position="top" title="Align top" disabled={disabledAlign}>
        <sp-icon size="s" name="workflow:AlignTop" slot="icon"></sp-icon>
    </sp-action-button>
    <sp-action-button on:click={align} data-position="middle" title="Align middle" disabled={disabledAlign}>
        <sp-icon size="s" name="workflow:AlignMiddle" slot="icon"></sp-icon>
    </sp-action-button>
    <sp-action-button on:click={align} data-position="bottom" title="Align bottom" disabled={disabledAlign}>
        <sp-icon size="s" name="workflow:AlignBottom" slot="icon"></sp-icon>
    </sp-action-button>
    <sp-action-button on:click={distribute} data-position="horizontally" title="Distribute horizontally" disabled={disableDistribute}>
        <sp-icon size="s" name="workflow:DistributeHorizontally" slot="icon"></sp-icon>
    </sp-action-button>

    <sp-divider size="s" vertical style="height: 32px; margin: 0 auto"></sp-divider>

    <sp-action-button on:click={align} data-position="left" title="Align left" disabled={disabledAlign}>
        <sp-icon size="s" name="workflow:AlignLeft" slot="icon"></sp-icon>
    </sp-action-button>
    <sp-action-button on:click={align} data-position="center" title="Align center" disabled={disabledAlign}>
        <sp-icon size="s" name="workflow:AlignCenter" slot="icon"></sp-icon>
    </sp-action-button>
    <sp-action-button on:click={align} data-position="right" title="Align right" disabled={disabledAlign}>
        <sp-icon size="s" name="workflow:AlignRight" slot="icon"></sp-icon>
    </sp-action-button>
    <sp-action-button on:click={distribute} data-position="vertically" title="Distribute vertically" disabled={disableDistribute}>
        <sp-icon size="s" name="workflow:DistributeVertically" slot="icon"></sp-icon>
    </sp-action-button>
</sp-action-group>
<style>
  sp-action-group {
      --spectrum-actiongroup-quiet-compact-button-gap: 0 !important;
      --spectrum-actionbutton-m-textonly-padding-left: 0;
      --spectrum-actionbutton-m-textonly-padding-right: 0;
  }
</style>
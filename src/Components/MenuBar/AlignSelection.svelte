<script lang="ts">
    import SVGIcon from "../SVGIcon.svelte";
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
<sp-action-group style="width: 280px;" compact quiet>
    <sp-action-button on:click={align} data-position="top" title="Align top" disabled={disabledAlign}>
        <sp-icon slot="icon">
            <SVGIcon name="workflow:AlignTop"/>
        </sp-icon>
    </sp-action-button>
    <sp-action-button on:click={align} data-position="middle" title="Align middle" disabled={disabledAlign}>
        <sp-icon slot="icon">
            <SVGIcon name="workflow:AlignMiddle"/>
        </sp-icon>
    </sp-action-button>
    <sp-action-button on:click={align} data-position="bottom" title="Align bottom" disabled={disabledAlign}>
        <sp-icon slot="icon">
            <SVGIcon name="workflow:AlignBottom"/>
        </sp-icon>
    </sp-action-button>
    <sp-action-button on:click={distribute} data-position="horizontally" title="Distribute horizontally" disabled={disableDistribute}>
        <sp-icon slot="icon">
            <SVGIcon name="workflow:DistributeHorizontally"/>
        </sp-icon>
    </sp-action-button>

    <sp-divider size="s" vertical style="height: 32px; margin: 0 auto"></sp-divider>

    <sp-action-button on:click={align} data-position="left" title="Align left" disabled={disabledAlign}>
        <sp-icon slot="icon">
            <SVGIcon name="workflow:AlignLeft"/>
        </sp-icon>
    </sp-action-button>
    <sp-action-button on:click={align} data-position="center" title="Align center" disabled={disabledAlign}>
        <sp-icon slot="icon">
            <SVGIcon name="workflow:AlignCenter"/>
        </sp-icon>
    </sp-action-button>
    <sp-action-button on:click={align} data-position="right" title="Align right" disabled={disabledAlign}>
        <sp-icon slot="icon">
            <SVGIcon name="workflow:AlignRight"/>
        </sp-icon>
    </sp-action-button>
    <sp-action-button on:click={distribute} data-position="vertically" title="Distribute vertically" disabled={disableDistribute}>
        <sp-icon slot="icon">
            <SVGIcon name="workflow:DistributeVertically"/>
        </sp-icon>
    </sp-action-button>
</sp-action-group>
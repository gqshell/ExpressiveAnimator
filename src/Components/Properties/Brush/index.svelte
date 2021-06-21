<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import {Brush, BrushType} from "@zindex/canvas-engine";
    import BrushEmpty from "./BrushEmpty.svelte";
    import BrushSolid from "./BrushSolid.svelte";
    import BrushPattern from "./BrushPattern.svelte";
    import BrushConicalGradient from "./BrushConicalGradient.svelte";
    import BrushLinearGradient from "./BrushLinearGradient.svelte";
    import BrushRadialGradient from "./BrushRadialGradient.svelte";
    import BrushTwoPointConicalGradient from "./BrushTwoPointConicalGradient.svelte";

    const dispatch = createEventDispatcher();

    export let value: Brush;
    export let colorMode: string = undefined;

    let component;

    $: {
        switch (value.type) {
            case BrushType.Solid:
                component = BrushSolid;
                break;
            case BrushType.LinearGradient:
                component = BrushLinearGradient;
                break;
            case BrushType.RadialGradient:
                component = BrushRadialGradient;
                break;
            case BrushType.ConicalGradient:
                component = BrushConicalGradient;
                break;
            case BrushType.TwoPointGradient:
                component = BrushTwoPointConicalGradient;
                break;
            case BrushType.Pattern:
                component = BrushPattern;
                break;
            default:
                component = BrushEmpty;
                break;
        }
    }

    let last: Brush = null;

    function onStart() {
        dispatch('start', value);
        last = value;
    }

    function onStop() {
        dispatch('stop', {start: last, stop: value});
        last = null;
    }
</script>

<div class="brush-control">
    <sp-action-group compact emphasized>
        <sp-action-button selected={value.type === BrushType.None} title="None">
            <sp-icon name="expr:fill-none" slot="icon"></sp-icon>
        </sp-action-button>
        <sp-action-button selected={value.type === BrushType.Solid} title="Solid">
            <sp-icon name="expr:fill-solid" slot="icon"></sp-icon>
        </sp-action-button>
        <sp-action-button selected={value.type === BrushType.LinearGradient} title="Linear gradient">
            <sp-icon name="expr:fill-linear-gradient" slot="icon"></sp-icon>
        </sp-action-button>
        <sp-action-button selected={value.type === BrushType.RadialGradient} title="Radial gradient">
            <sp-icon name="expr:fill-radial-gradient" slot="icon"></sp-icon>
        </sp-action-button>
        <sp-action-button selected={value.type === BrushType.TwoPointGradient} title="Radial gradient with focal point">
            <sp-icon name="expr:fill-radial-focal-gradient" slot="icon">
            </sp-icon>
        </sp-action-button>
        <sp-action-button selected={value.type === BrushType.ConicalGradient} title="Sweep gradient">
            <sp-icon name="expr:fill-conical-gradient" slot="icon"></sp-icon>
        </sp-action-button>
        <sp-action-button selected={value.type === BrushType.Pattern} title="Pattern">
            <sp-icon name="expr:fill-pattern" slot="icon"></sp-icon>
        </sp-action-button>
    </sp-action-group>
</div>
<div class="brush-control-value">
    <svelte:component this={component} value={value} bind:colorMode={colorMode} on:input on:start={onStart} on:stop={onStop} />
</div>
<style>
    .brush-control {
        display: flex;
        flex-direction: row;
        justify-content: center;
    }

    sp-action-group, .brush-control-value {
        padding-top: var(--spectrum-global-dimension-size-75);
        padding-bottom: var(--spectrum-global-dimension-size-75);
    }

    /*sp-action-group {*/
    /*    --spectrum-actionbutton-m-icon-color-selected: var(--spectrum-semantic-cta-color-background-default);*/
    /*    --spectrum-actionbutton-m-icon-color-selected-down: var(--spectrum-semantic-cta-color-background-default);*/
    /*    --spectrum-actionbutton-m-icon-color-selected-hover: var(--spectrum-semantic-cta-color-background-default);*/
    /*}*/
</style>
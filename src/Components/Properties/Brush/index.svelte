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
    import IconSwitch from "../../../Controls/IconSwitch.svelte";

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

    const items = [
        {
            value: BrushType.None,
            title: 'None',
            icon: 'expr:fill-none'
        },
        {
            value: BrushType.Solid,
            title: 'Solid',
            icon: 'expr:fill-solid'
        },
        {
            value: BrushType.LinearGradient,
            title: 'Linear gradient',
            icon: 'expr:fill-linear-gradient'
        },
        {
            value: BrushType.RadialGradient,
            title: 'Radial gradient',
            icon: 'expr:fill-radial-gradient'
        },
        {
            value: BrushType.TwoPointGradient,
            title: 'Radial gradient with focal point',
            icon: 'expr:fill-radial-focal-gradient'
        },
        {
            value: BrushType.ConicalGradient,
            title: 'Sweep gradient',
            icon: 'expr:fill-conical-gradient'
        },
        {
            value: BrushType.Pattern,
            title: 'Pattern',
            icon: 'expr:fill-pattern'
        },
    ];
</script>

<div class="brush-control">
    <IconSwitch on:change={e => dispatch('change', e.detail)} value={value.type} items={items} />
</div>
<div class="brush-control-value">
    <svelte:component this={component} value={value} bind:colorMode={colorMode}
                      on:start on:done on:update on:action
    />
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
<script lang="ts">
    import SpSlider from "../../../Controls/SpSlider.svelte";
    import {BrushType, VectorElement} from "@zindex/canvas-engine";
    import type {Brush, GradientBrush, SolidBrush} from "@zindex/canvas-engine";
    import {createEventDispatcher} from "svelte";
    import {AnimationProject} from "../../../Core";

    const dispatch = createEventDispatcher();

    export let value: {
        fill: Brush,
        fillOpacity: number,
        strokeBrush: Brush,
        strokeOpacity: number,
    };

    export let showFill: boolean = true;

    let opacityProperty: string;
    $: opacityProperty = showFill ? 'fillOpacity' : 'strokeOpacity';

    function getBackground(value: Brush, opacity: number): string {
        let picture: string;
        switch (value.type) {
            case BrushType.None:
                picture = 'linear-gradient(-45deg, transparent 0%, transparent 47.5%, #f00 47.5%, #f00 52.5%, transparent 52.5%, transparent 100%)';
                break;
            case BrushType.Solid:
                picture = (value as SolidBrush).color.toString();
                break;
            case BrushType.LinearGradient:
                picture = `linear-gradient(${(value as GradientBrush).stopColors.toString()})`;
                break;
            case BrushType.RadialGradient:
            case BrushType.TwoPointGradient: // same picture as radial
                picture = `radial-gradient(${(value as GradientBrush).stopColors.toString()})`;
                break;
            case BrushType.ConicalGradient:
                picture = `conic-gradient(${(value as GradientBrush).stopColors.toString()})`;
                break;
            case BrushType.Pattern:
                picture = 'repeating-linear-gradient(transparent, #808080 20%), repeating-linear-gradient(90deg, #fff, #000 20%)';
                break;
            default:
                picture = 'transparent';
                break;
        }

        // this is a trick to also set opacity
        // the background property sets style="background: $picture"
        return `${picture}; opacity: ${opacity};`;
    }

    function swap(project: AnimationProject, element: VectorElement, keepOpacity: boolean): boolean {
        if (!(element instanceof VectorElement)) {
            return false;
        }
        return project.middleware.swapStrokeFill([element], keepOpacity);
    }

    function copyStroke(project: AnimationProject, element: VectorElement, copyOpacity: boolean): boolean {
        if (!(element instanceof VectorElement)) {
            return false;
        }
        return project.middleware.copyStrokeToFill([element], copyOpacity);
    }

    function copyFill(project: AnimationProject, element: VectorElement, copyOpacity: boolean): boolean {
        if (!(element instanceof VectorElement)) {
            return false;
        }
        return project.middleware.copyFillToStroke([element], copyOpacity);
    }

    function onCopy(e: MouseEvent) {
        dispatch('action', {
            action: showFill ? copyStroke : copyFill,
            type: showFill ? 'copyStroke' : 'copyFill',
            value: e.altKey,
        });
    }

    function onSwap(e: MouseEvent) {
        dispatch('action', {
            action: swap,
            type: 'swapFillStroke',
            value: !e.altKey
        });
    }
</script>
<div class="brush-switch">
    <div class="thumbnail-wrapper">
        <sp-thumbnail title="Fill" background="{getBackground(value.fill, value.fillOpacity)}" selected={showFill ? '' : undefined} on:click={() => showFill = true} class="fill"></sp-thumbnail>
        <sp-thumbnail title="Stroke" background="{getBackground(value.strokeBrush, value.strokeOpacity)}" selected={!showFill ? '' : undefined} on:click={() => showFill = false} class="stroke"></sp-thumbnail>
        <div class="action-icon"
             on:click={onCopy} title="{showFill ? 'Copy Stroke' : 'Copy Fill'}" style="bottom: 0; left: 0">
            <sp-icon name="{showFill ? 'expr:swap-arrow-up-left' : 'expr:swap-arrow-down-right'}" size="s"></sp-icon>
        </div>
        <div class="action-icon"
             on:click={onSwap} title="Swap Fill & Stroke" style="top: 0; right: 0">
            <sp-icon name="expr:swap-arrows" size="s"></sp-icon>
        </div>
    </div>
    <SpSlider label={showFill ? 'Fill opacity' : 'Stroke opacity'}
              ticks={3}
              value={value[opacityProperty] * 100}
              style="flex: 1"
              fill="start"
              on:done
              on:input={e => dispatch('update', {property: opacityProperty, value: e.detail / 100})}
              on:start={() => dispatch('start', {property: opacityProperty, value: value[opacityProperty]})}
              editable/>
</div>

<style>
    .action-icon {
        display: inline-block;
        cursor: pointer;
        width: var(--spectrum-global-dimension-size-200);
        height: var(--spectrum-global-dimension-size-200);
    }

    .brush-switch {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: var(--spectrum-global-dimension-size-75);
        padding-top: var(--spectrum-global-dimension-size-75);
        padding-bottom: var(--spectrum-global-dimension-size-75);
    }

    .thumbnail-wrapper {
        position: relative;
        width: var(--spectrum-global-dimension-size-600);
        height: var(--spectrum-global-dimension-size-600);
    }

    .thumbnail-wrapper > * {
        position: absolute;
    }

    sp-icon {
        cursor: pointer;
    }

    sp-thumbnail {
        --spectrum-thumbnail-border-color: var(--spectrum-global-color-gray-400);
        --spectrum-thumbnail-border-color-selected: var(--spectrum-thumbnail-border-color);
        --spectrum-thumbnail-border-size-selected: var(--spectrum-alias-border-size-thin);
    }

    sp-thumbnail.fill {
        top: 0;
        left: 0;
        clip-path: polygon(-5% -5%, -5% 105%, 50% 105%, 50% 50%, 105% 50%, 105% -5%);
    }

    sp-thumbnail[selected].fill {
        z-index: 1;
        clip-path: none;
    }

    sp-thumbnail.stroke {
        bottom: 0;
        right: 0;
        clip-path: polygon(-5% -5%, -5% 105%, 30% 105%, 30% 30%, 70% 30%, 70% 70%, 30% 70%, 30% 105%, 105% 105%, 105% -5%);
    }

    sp-thumbnail > div {
        width: 100%;
        height: 100%;
    }
</style>

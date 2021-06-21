<script lang="ts">
    import {StrokeLineCap, StrokeLineJoin} from "@zindex/canvas-engine";
    import PropertyGroup from "../PropertyGroup.svelte";
    import PropertyItem from "../PropertyItem.svelte";
    import SpTextField from "../../../Controls/SpTextField.svelte";
    import SpSlider from "../../../Controls/SpSlider.svelte";

    export let value: {
        strokeLineWidth: number,
        strokeLineCap: StrokeLineCap,
        strokeLineJoin: StrokeLineJoin,
        strokeMiterLimit: number,
        strokeDashArray: number[],
        strokeDashOffset: number,
    };

    function changeProp(name: string, value: any) {
        console.log(name, value)
    }
</script>
<PropertyGroup title="Stroke">
    <SpSlider label="Width" value={value.strokeLineWidth} allowOverflow min={0} step={1} round={0.01} fill="ramp" editable />
    <PropertyItem title="Line cap">
        <sp-action-group compact emphasized>
            <sp-action-button title="Butt" on:click={() => changeProp('strokeLineCap', StrokeLineCap.Butt)} selected="{value.strokeLineCap === StrokeLineCap.Butt}" size="s">
                <sp-icon name="expr:cap-butt" size="s" slot="icon"></sp-icon>
            </sp-action-button>
            <sp-action-button title="Square" on:click={() => changeProp('strokeLineCap', StrokeLineCap.Square)} selected="{value.strokeLineCap === StrokeLineCap.Square}" size="s">
                <sp-icon name="expr:cap-square" size="s" slot="icon"></sp-icon>
            </sp-action-button>
            <sp-action-button title="Round" on:click={() => changeProp('strokeLineCap', StrokeLineCap.Round)} selected="{value.strokeLineCap === StrokeLineCap.Round}" size="s">
                <sp-icon name="expr:cap-round" size="s" slot="icon"></sp-icon>
            </sp-action-button>
        </sp-action-group>
    </PropertyItem>
    <PropertyItem title="Line join">
        <sp-action-group compact emphasized>
            <sp-action-button title="Miter" on:click={() => changeProp('strokeLineJoin', StrokeLineJoin.Miter)} selected="{value.strokeLineJoin === StrokeLineJoin.Miter}" size="s">
                <sp-icon name="expr:join-miter" size="s" slot="icon"></sp-icon>
            </sp-action-button>
            <sp-action-button title="Bevel" on:click={() => changeProp('strokeLineJoin', StrokeLineJoin.Bevel)} selected="{value.strokeLineJoin === StrokeLineJoin.Bevel}" size="s">
                <sp-icon name="expr:join-bevel" size="s" slot="icon"></sp-icon>
            </sp-action-button>
            <sp-action-button title="Round" on:click={() => changeProp('strokeLineJoin', StrokeLineJoin.Round)} selected="{value.strokeLineJoin === StrokeLineJoin.Round}" size="s">
                <sp-icon name="expr:join-round" size="s" slot="icon"></sp-icon>
            </sp-action-button>
        </sp-action-group>
    </PropertyItem>
    <PropertyItem title="Miter limit">
        <SpTextField disabled={value.strokeLineJoin !== StrokeLineJoin.Miter} style="width: var(--spectrum-global-dimension-size-800)" size="S" value={value.strokeMiterLimit} type="number" min={1} max={1000} step={0.01} />
    </PropertyItem>
    <PropertyItem title="Dash array">
        <SpTextField placeholder="dash, gap, ..."
                     style="flex: 1; margin-left: var(--spectrum-global-dimension-size-40)"
                     size="S"
                     value={value.strokeDashArray.join(', ')} type="text" />
    </PropertyItem>
    <PropertyItem title="Dash offset">
        <SpTextField title="Offset" style="width: var(--spectrum-global-dimension-size-800)" size="S"
                     value={value.strokeDashOffset} type="number"
                     min={Number.NEGATIVE_INFINITY}
                     max={Number.POSITIVE_INFINITY}
                     step={1}
                     round={0.01}
        />
    </PropertyItem>
</PropertyGroup>
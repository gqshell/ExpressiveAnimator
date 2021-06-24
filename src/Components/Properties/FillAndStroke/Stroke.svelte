<script lang="ts">
    import {StrokeLineCap, StrokeLineJoin, parseNumberList} from "@zindex/canvas-engine";
    import {formatNumber} from "../../../Controls/utils";
    import PropertyGroup from "../PropertyGroup.svelte";
    import PropertyItem from "../PropertyItem.svelte";
    import SpTextField from "../../../Controls/SpTextField.svelte";
    import SpSlider from "../../../Controls/SpSlider.svelte";
    import IconSwitch from "../../../Controls/IconSwitch.svelte";
    import {createEventDispatcher} from "svelte";

    const dispatch = createEventDispatcher();

    export let value: {
        strokeLineWidth: number,
        strokeLineCap: StrokeLineCap,
        strokeLineJoin: StrokeLineJoin,
        strokeMiterLimit: number,
        strokeDashArray: number[],
        strokeDashOffset: number,
    };

    function formatDashArray(value: number[]) {
        return value.map(v => formatNumber(v, 4)).join(', ');
    }

    function onDashArrayChange(e) {
        dispatch('update', {property: 'strokeDashArray', value: parseNumberList(e.detail)});
    }

    function onLineCapChange(e) {
        dispatch('update', {property: 'strokeLineCap', value: parseInt(e.detail)});
    }

    function onLineJoinChange(e) {
        dispatch('update', {property: 'strokeLineJoin', value: parseInt(e.detail)});
    }

    function onBlur() {
        dispatch('done');
    }

    const lineCapItems = [
        {
            value: StrokeLineCap.Butt,
            title: 'Butt',
            icon: 'expr:cap-butt'
        },
        {
            value: StrokeLineCap.Square,
            title: 'Square',
            icon: 'expr:cap-square'
        },
        {
            value: StrokeLineCap.Round,
            title: 'Round',
            icon: 'expr:cap-round'
        },
    ];
    const lineJoinItems = [
        {
            value: StrokeLineJoin.Miter,
            title: 'Miter',
            icon: 'expr:join-miter'
        },
        {
            value: StrokeLineJoin.Bevel,
            title: 'Bevel',
            icon: 'expr:join-bevel'
        },
        {
            value: StrokeLineJoin.Round,
            title: 'Round',
            icon: 'expr:join-round'
        },
    ];
</script>
<PropertyGroup title="Stroke">
    <SpSlider
            on:done
            on:input={e => dispatch('update', {property: 'strokeLineWidth', value: e.detail})}
            on:start={() => dispatch('start', {property: 'strokeLineWidth', value: value.strokeLineWidth})}
            label="Width" value={value.strokeLineWidth} allowOverflow min={0} step={1} round={0.01} fill="ramp" editable />
    <PropertyItem title="Line cap">
        <IconSwitch on:change={onLineCapChange} size="s" value={value.strokeLineCap} items={lineCapItems} />
    </PropertyItem>
    <PropertyItem title="Line join">
        <IconSwitch on:change={onLineJoinChange} size="s" value={value.strokeLineJoin} items={lineJoinItems} />
    </PropertyItem>
    <PropertyItem title="Miter limit">
        <SpTextField
                on:input={e => dispatch('update', {property: 'strokeMiterLimit', value: e.detail})}
                on:blur={onBlur}
                on:start={() => dispatch('start', {property: 'strokeMiterLimit', value: value.strokeMiterLimit})}
                disabled={value.strokeLineJoin !== StrokeLineJoin.Miter} style="width: var(--small-control-size)" size="S" value={value.strokeMiterLimit} type="number"
                min={1} max={1000} step={1} round={0.01} />
    </PropertyItem>
    <PropertyItem title="Dash array">
        <SpTextField placeholder="dash, gap, ..."
                     on:change={onDashArrayChange}
                     style="flex: 1; margin-left: var(--spectrum-global-dimension-size-40)"
                     size="S"
                     value={formatDashArray(value.strokeDashArray)} type="text" />
    </PropertyItem>
    <PropertyItem title="Dash offset">
        <SpTextField title="Offset" style="width: var(--small-control-size)" size="S"
                     on:input={e => dispatch('update', {property: 'strokeDashOffset', value: e.detail})}
                     on:blur={onBlur}
                     on:start={() => dispatch('start', {property: 'strokeDashOffset', value: value.strokeDashOffset})}
                     value={value.strokeDashOffset} type="number"
                     min={Number.NEGATIVE_INFINITY}
                     max={Number.POSITIVE_INFINITY}
                     step={1}
                     round={0.01}
        />
    </PropertyItem>
</PropertyGroup>
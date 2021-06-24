<script lang="ts">
    import {FillRule} from "@zindex/canvas-engine";
    import PropertyGroup from "../PropertyGroup.svelte";
    import PropertyItem from "../PropertyItem.svelte";
    import IconSwitch from "../../../Controls/IconSwitch.svelte";
    import {createEventDispatcher} from "svelte";

    const dispatch = createEventDispatcher();

    export let value: {
        fillRule: FillRule,
    };

    function onFillRuleChange(e) {
        dispatch('update', {property: 'fillRule', value: parseInt(e.detail)});
    }

    const fillRuleItems = [
        {
            value: FillRule.NonZero,
            title: 'Non-Zero',
            icon: 'expr:fill-nonzero'
        },
        {
            value: FillRule.EvenOdd,
            title: 'Even-Odd',
            icon: 'expr:fill-evenodd'
        },
    ];
</script>
<PropertyGroup title="Fill">
    <PropertyItem title="Fill rule">
        <IconSwitch on:change={onFillRuleChange} size="s" value={value.fillRule} items={fillRuleItems} />
    </PropertyItem>
</PropertyGroup>
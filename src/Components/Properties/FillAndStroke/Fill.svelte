<script lang="ts">
    import {FillRule} from "@zindex/canvas-engine";
    import PropertyGroup from "../PropertyGroup.svelte";
    import PropertyItem from "../PropertyItem.svelte";

    export let value: {
        fillRule: FillRule,
    };
</script>
<PropertyGroup title="Fill">
    <PropertyItem title="Fill rule">
        <sp-action-group compact emphasized>
            <sp-action-button title="Non-Zero" selected={value.fillRule === FillRule.NonZero} size="s">
                <sp-icon name="expr:fill-nonzero" size="s" slot="icon"></sp-icon>
            </sp-action-button>
            <sp-action-button title="Even-Odd" selected={value.fillRule === FillRule.EvenOdd} size="s">
                <sp-icon name="expr:fill-evenodd" size="s" slot="icon"></sp-icon>
            </sp-action-button>
        </sp-action-group>
    </PropertyItem>
</PropertyGroup>
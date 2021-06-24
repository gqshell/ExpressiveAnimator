<script lang="ts">
    import PropertyGroup from "./PropertyGroup.svelte";
    import SpSlider from "../../Controls/SpSlider.svelte";
    import type {Element} from "@zindex/canvas-engine";
    import {BlendMode} from "@zindex/canvas-engine";
    import PropertyItem from "./PropertyItem.svelte";
    import {createEventDispatcher} from "svelte";

    const dispatch = createEventDispatcher();

    export let element: Element;


</script>
<PropertyGroup title="Compositing">
    <SpSlider
            on:done
            on:start={() => dispatch('start', {property: 'opacity', value: element.opacity})}
            on:input={e => dispatch('update', {property: 'opacity', value: e.detail / 100})}
            label="Opacity" ticks={3} value={element.opacity * 100} fill="start" editable />
    <PropertyItem title="Blend">
        <sp-picker on:change={e => dispatch('update', {property: 'blend', value: parseInt(e.target.value)})}
                   value={element.blend.toString()} style="flex: 1" size="s">
            <sp-menu-item value={BlendMode.Normal.toString()}>Normal</sp-menu-item>
            <sp-menu-divider></sp-menu-divider>
            <sp-menu-item value={BlendMode.Color.toString()}>Color</sp-menu-item>
            <sp-menu-item value={BlendMode.ColorBurn.toString()}>Color burn</sp-menu-item>
            <sp-menu-item value={BlendMode.ColorDodge.toString()}>Color dodge</sp-menu-item>
            <sp-menu-divider></sp-menu-divider>
            <sp-menu-item value={BlendMode.Darken.toString()}>Darken</sp-menu-item>
            <sp-menu-item value={BlendMode.Lighten.toString()}>Lighten</sp-menu-item>
            <sp-menu-divider></sp-menu-divider>
            <sp-menu-item value={BlendMode.Difference.toString()}>Difference</sp-menu-item>
            <sp-menu-item value={BlendMode.Exclusion.toString()}>Exclusion</sp-menu-item>
            <sp-menu-item value={BlendMode.Multiply.toString()}>Multiply</sp-menu-item>
            <sp-menu-divider></sp-menu-divider>
            <sp-menu-item value={BlendMode.SoftLight.toString()}>SoftLight</sp-menu-item>
            <sp-menu-item value={BlendMode.HardLight.toString()}>HardLight</sp-menu-item>
            <sp-menu-divider></sp-menu-divider>
            <sp-menu-item value={BlendMode.Hue.toString()}>Hue</sp-menu-item>
            <sp-menu-item value={BlendMode.Saturation.toString()}>Saturation</sp-menu-item>
            <sp-menu-item value={BlendMode.Luminosity.toString()}>Luminosity</sp-menu-item>
            <sp-menu-divider></sp-menu-divider>
            <sp-menu-item value={BlendMode.Overlay.toString()}>Overlay</sp-menu-item>
            <sp-menu-item value={BlendMode.Screen.toString()}>Screen</sp-menu-item>
        </sp-picker>
    </PropertyItem>
    <PropertyItem title="Isolate">
        <sp-switch checked={element.isolate}
                   on:change={e => dispatch('update', {property: 'isolate', value: e.target.checked})}
                   style="width: var(--spectrum-switch-track-width)"></sp-switch>
        <div style="flex: 1"></div>
    </PropertyItem>
</PropertyGroup>
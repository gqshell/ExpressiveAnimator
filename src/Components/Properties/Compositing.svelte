<script lang="ts">
    import PropertyGroup from "./PropertyGroup.svelte";
    import SpSlider from "../../Controls/SpSlider.svelte";
    import type {Element} from "@zindex/canvas-engine";
    import {BlendMode} from "@zindex/canvas-engine";
    import PropertyItem from "./PropertyItem.svelte";
    import {CurrentProject} from "../../Stores";

    export let element: Element;

    function setPropertyValue(property: any, value: any, save?: boolean) {
        const project = $CurrentProject;
        if (project.middleware.setElementsProperty(project.selection, property, value)) {
            if (save) {
                project.state.snapshot();
            }
            project.engine?.invalidate();
        }
    }

</script>
<PropertyGroup title="Compositing">
    <SpSlider
            on:change={e => setPropertyValue("opacity", e.detail / 100, true)}
            on:input={e => setPropertyValue("opacity", e.detail / 100, false)}
            label="Opacity" ticks={3} value={element.opacity * 100} fill="start" editable />
    <PropertyItem title="Blend">
        <sp-picker on:change={e => setPropertyValue("blend", parseInt(e.target.value), true)} value={element.blend + ''} style="flex: 1" size="s">
            <sp-menu-item value={BlendMode.Normal.toString()}>Normal</sp-menu-item>
            <sp-menu-item value={BlendMode.Color.toString()}>Color</sp-menu-item>
        </sp-picker>
    </PropertyItem>
    <PropertyItem title="Isolate">
        <sp-switch checked={element.isolate}
                   on:change={e => setPropertyValue("isolate", e.target.checked, true)}
                   style="width: var(--spectrum-switch-track-width)"></sp-switch>
        <div style="flex: 1"></div>
    </PropertyItem>
</PropertyGroup>
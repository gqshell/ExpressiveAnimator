<script lang="ts">
    import type {Element, AxisPointPosition} from "@zindex/canvas-engine";
    import type {AnimationProject} from "../../Core";
    import {Point, Orientation} from "@zindex/canvas-engine";
    import NumberPair from "./NumberPair.svelte";
    import PropertyGroup from "./PropertyGroup.svelte";
    import SidePosition from "./SidePosition.svelte";
    import {createEventDispatcher} from "svelte";

    const dispatch = createEventDispatcher();

    export let element: Element;
    export let proportionalScale: boolean = false;

    function alignAnchor(project: AnimationProject, element: Element, value: AxisPointPosition) {
        return project.middleware.alignElementToOrigin(element, value.x, value.y);
    }

    function alignOrigin(project: AnimationProject, element: Element, value: AxisPointPosition) {
        return project.middleware.alignOriginToElement(element, value.x, value.y);
    }

    function onStart(property: string) {
        dispatch('start', {property, value: element[property]});
    }

    function onUpdate(property: string, value: any) {
        dispatch('update', {property, value});
    }

    let currentSkew: 'skewAngle' | 'skewAxis' = 'skewAngle';

</script>
<PropertyGroup title="Transform">
    <NumberPair on:done
                on:start={() => onStart('position')}
                on:input={e => onUpdate('position', Point.fromObject(e.detail))}
                value={element.position} label="Position" xTitle="X" yTitle="Y">
        <SidePosition
                on:input={e => dispatch('action', {action: alignOrigin, value: e.detail})}
                icon="expr:center-origin-object" />
    </NumberPair>
    <NumberPair on:done
                on:start={() => onStart('anchor')}
                on:input={e => onUpdate('anchor', Point.fromObject(e.detail))}
                value={element.anchor} label="Anchor" xTitle="X" yTitle="Y">
        <SidePosition
                on:input={e => dispatch('action', {action: alignAnchor, value: e.detail})}
                icon="expr:center-object-origin" />
    </NumberPair>
    <NumberPair on:done
                on:start={() => onStart('rotate')}
                on:input={e => onUpdate('rotate', e.detail.x * 360 + e.detail.y)}
                value={{x: Math.trunc(element.rotate / 360), y: element.rotate % 360}} label="Rotate" xTitle="Turns" yTitle="Degrees">
        <sp-action-button
                title="Auto rotate"
                on:click={() => onUpdate('orientation', element.orientation === Orientation.None ? Orientation.Auto : Orientation.None)}
                size="s" emphasized quiet selected={element.orientation !== Orientation.None}>
            <sp-icon slot="icon" name='expr:rotate' size="s"></sp-icon>
        </sp-action-button>
    </NumberPair>
    <NumberPair on:done
                on:start={() => onStart('scale')}
                on:input={e => onUpdate('scale', Point.fromObject(e.detail))}
                proportions={proportionalScale}
                value={element.scale} label="Scale" xTitle="X" yTitle="Y">
        <sp-action-button title="Proportional scale" on:click={() => proportionalScale = !proportionalScale} size="s" emphasized quiet selected={proportionalScale}>
            <sp-icon slot="icon" name={proportionalScale ? 'expr:maintain-checked' : 'expr:maintain-unchecked'} size="s"></sp-icon>
        </sp-action-button>
    </NumberPair>
    <NumberPair on:done
                on:start={e => {currentSkew = e.detail === 'x' ? 'skewAngle' : 'skewAxis'; onStart(currentSkew)}}
                on:input={e => onUpdate(currentSkew, currentSkew === 'skewAngle' ? e.detail.x : e.detail.y)}
                value={{x: element.skewAngle, y: element.skewAxis}} label="Skew" xTitle="Angle" yTitle="Axis">
    </NumberPair>
</PropertyGroup>
<script lang="ts">
    import type {Element, PointLike} from "@zindex/canvas-engine";
    import type {AnimationProject} from "../../Core";
    import {Point} from "@zindex/canvas-engine";
    import NumberPair from "./NumberPair.svelte";
    import PropertyGroup from "./PropertyGroup.svelte";
    import {CurrentProject} from "../../Stores";
    import SidePosition from "./SidePosition.svelte";

    export let element: Element;

    function changePosition(e) {
        const project = $CurrentProject;
        const position = Point.fromObject(e.detail);

        let changed = false;
        for (const el of project.selection) {
            if (project.middleware.setElementPosition(el, position)) {
                changed = true;
            }
        }
        if (changed) {
            doSnapshot(project);
        }
    }

    function setPointProperty(property, value: PointLike) {
        const project = $CurrentProject;
        if (project.middleware.setElementsProperty(project.selection, property, Point.fromObject(value))) {
            doSnapshot(project);
        }
    }

    function alignAnchor(e) {
        const project = $CurrentProject;
        if (project.middleware.alignElementToOrigin(element, e.detail.x, e.detail.y)) {
            doSnapshot(project);
        }
    }

    function alignOrigin(e) {
        const project = $CurrentProject;
        if (project.middleware.alignOriginToElement(element, e.detail.x, e.detail.y)) {
            doSnapshot(project);
        }
    }

    function changeSkew(e) {
        let property, value;
        if (element.skewAngle !== e.detail.x) {
            property = "skewAngle";
            value = e.detail.x;
        } else if (element.skewAxis !== e.detail.y) {
            property = "skewAxis";
            value = e.detail.y;
        } else {
            return;
        }

        const project = $CurrentProject;
        if (project.middleware.setElementsProperty(project.selection, property, value)) {
            doSnapshot(project);
        }
    }

    function changeRotate(e) {
        const rotate = e.detail.x * 360 + e.detail.y;
        if (rotate === element.rotate) {
            return;
        }
        const project = $CurrentProject;
        if (project.middleware.setElementsProperty(project.selection, "rotate", rotate)) {
            doSnapshot(project);
        }
    }

    function doSnapshot(project: AnimationProject) {
        project.state.snapshot();
        project.engine?.invalidate();
    }
</script>
<PropertyGroup title="Transform">
    <NumberPair on:change={changePosition} value={element.position} label="Position" xTitle="X" yTitle="Y">
        <SidePosition on:input={alignOrigin} icon="expr:center-origin-object" />
    </NumberPair>
    <NumberPair on:change={e => setPointProperty("anchor", e.detail)} value={element.anchor} label="Anchor" xTitle="X" yTitle="Y">
        <SidePosition on:input={alignAnchor} icon="expr:center-object-origin" />
    </NumberPair>
    <NumberPair on:change={changeRotate} value={{x: Math.trunc(element.rotate / 360), y: element.rotate % 360}} label="Rotate" xTitle="Turns" yTitle="Degrees">
    </NumberPair>
    <NumberPair on:change={e => setPointProperty("scale", e.detail)} value={element.scale} label="Scale" xTitle="X" yTitle="Y">
    </NumberPair>
    <NumberPair on:change={changeSkew} value={{x: element.skewAngle, y: element.skewAxis}} label="Skew" xTitle="Angle" yTitle="Axis">
    </NumberPair>
</PropertyGroup>
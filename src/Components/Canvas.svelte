<script lang="ts">
    import {onMount, onDestroy, tick} from "svelte";
    import type {KeyframeSelection, AnimationDocument} from "../Core";
    import type {CanvasEngine, Selection} from "@zindex/canvas-engine";

    import {
        CurrentTool, CurrentTheme, CurrentTime,
        CanvasEngineState, CurrentProject, CurrentDocument,
        CurrentCanvasZoom, CurrentGlobalElementProperties,
        notifyAnimationChanged,
        notifyPropertiesChanged,
        notifyStateChanged,
        notifySelectionChanged,
    } from "../Stores";

    const {showRuler, showGuides, lockGuides, showGrid, showGridToBack, highQuality} = CanvasEngineState;

    export let hidden: boolean = false;

    let canvas: CanvasEngine;

    $: if (canvas) hidden ? canvas.stopRenderLoop() : canvas.startRenderLoop();
    $: if (canvas) canvas.setAttribute('theme', $CurrentTheme);
    $: if (canvas) canvas.tool = $CurrentTool;
    $: if (canvas) canvas.showRuler = $showRuler;
    $: if (canvas) canvas.showGuides = $showGuides;
    $: if (canvas) canvas.lockGuides = $lockGuides;
    $: if (canvas) canvas.showGrid = $showGrid;
    $: if (canvas) canvas.showGridToBack = $showGridToBack;
    $: if (canvas) canvas.highQuality = $highQuality;
    $: if (canvas) canvas.project = $CurrentProject;
    $: {
        if (canvas && $CurrentProject && $CurrentProject.middleware.setTime($CurrentTime)) {
            notifyPropertiesChanged();
            canvas.invalidate();
        }
    }


    onMount(() => {
        canvas.preventSurfaceDisposal();
        canvas.globalElementProperties = CurrentGlobalElementProperties;
        canvas.setAttribute('theme', $CurrentTheme);
        canvas.highQuality = $highQuality;
        canvas.showRuler = $showRuler;
        canvas.showGuides = $showGuides;
        canvas.lockGuides = $lockGuides;
        canvas.showGrid = $showGrid;
        canvas.showGridToBack = $showGridToBack;

        canvas.tool = $CurrentTool;
        canvas.allowSurfaceDisposal();

        canvas.project = $CurrentProject;

        CurrentProject.subscribe(p => {
            canvas.project = p;
        });
    });

    onDestroy(() => {
        canvas.project = null;
        canvas.dispose();
    });

    function beforeWindowUnload() {
        if (canvas) {
            // canvas.dispose();
            // removing the canvas from dom
            canvas.parentNode.removeChild(canvas);
            canvas = null;
        }
    }

    async function onZoomChanged(e: CustomEvent<number>) {
        await tick();
        $CurrentCanvasZoom = e.detail;
    }

    async function onPropertiesChanged() {
        await tick();
        notifyPropertiesChanged();
    }

    async function onSnapshotCreated(e: CustomEvent) {
        await tick();
        //notifyStateChanged();
        CurrentProject.forceUpdate();
    }

    async function onSelectionChanged(e: CustomEvent<Selection<AnimationDocument>>) {
        await tick();
        notifySelectionChanged();
    }

    async function onKeyframeSelectionChanged(e: CustomEvent<KeyframeSelection>) {
        await tick();
        // TODO: update keyframe selection
        console.log('update keyframe selection')
    }

    async function onKeyframeAdded(e: CustomEvent) {
        await tick();
        notifyAnimationChanged();
    }

    async function onDocumentStateChanged() {
        await tick();
        CurrentProject.forceUpdate();
    }

    async function onDocumentChanged(e: CustomEvent<AnimationDocument>) {
        if ($CurrentDocument === e.detail) {
            return;
        }
        await tick();
        // TODO:
    }

    async function onDocumentAdded(e: CustomEvent<AnimationDocument>) {
        await tick();
        // TODO:
    }

    async function onDocumentRemoved(e: CustomEvent<{document: AnimationDocument, dispose: boolean}>) {
        await tick();
        // TODO:
    }
</script>
<svelte:window on:beforeunload={beforeWindowUnload}/>
<div class="canvas-wrapper" tabindex="0">
    <canvas-engine
            class:hidden={hidden} bind:this={canvas}

            on:zoomChanged={onZoomChanged}
            on:documentAdded={onDocumentAdded}
            on:documentRemoved={onDocumentRemoved}
            on:documentChanged={onDocumentChanged}
            on:documentStateChanged={onDocumentStateChanged}
            on:selectionChanged={onSelectionChanged}
            on:propertyChanged={onPropertiesChanged}
            on:snapshotCreated={onSnapshotCreated}

            on:keyframeAdded={onKeyframeAdded}
            on:keyframeSelectionChanged={onKeyframeSelectionChanged}
    ></canvas-engine>
    {#if hidden}
        <slot />
    {/if}
</div>
<style>
    .canvas-wrapper {
        box-sizing: border-box;
        overflow: hidden;
        background: var(--separator-color);
    }
    canvas-engine {
        touch-action: none;
        --canvas-engine-background-color: var(--separator-color);
    }
    canvas-engine.hidden {
        display: none;
    }
</style>
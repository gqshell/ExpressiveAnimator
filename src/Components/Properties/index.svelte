<script lang="ts">
    import Transform from "./Transform.svelte";
    import {
        CurrentProject,
        CurrentSelectedElement,
        CurrentDocument,
        IsFillSelected,
        CurrentColorMode,
        ProportionalScale,
        ProportionalSize,
        CurrentTool,
        notifyPropertiesChanged,
    } from "../../Stores";
    import Compositing from "./Compositing.svelte";
    import FillAndStroke from "./FillAndStroke";
    import {AnimationProject, KeyframeCounter} from "../../Core";
    import {equals, VectorElement, ShapeBuilderTool} from "@zindex/canvas-engine";
    import type {Element, GlobalElementProperties} from "@zindex/canvas-engine";
    import DocumentProps from "./DocumentProps.svelte";

    let globalProperties: GlobalElementProperties;
    $: globalProperties = $CurrentProject.engine?.globalElementProperties;

    const keyframeCounter = new KeyframeCounter();
    let started: boolean = false;
    let currentPropertyName: string = undefined;
    let currentPropertyValue: any = undefined;
    let initialPropertyValue: any = undefined;

    const debug: boolean = false;


    function onDone() {
        if (!started) {
            return;
        }

        const engine = $CurrentProject.engine;
        if ((currentPropertyValue !== undefined && !equals(initialPropertyValue, currentPropertyValue)) || keyframeCounter.hasChanged(engine)) {
            globalProperties.updateFromElement(engine.project.selection.activeElement);
            engine.project.state.snapshot();
            debug && console.log('snapshot', currentPropertyName);
        }
        debug && console.log('stop', currentPropertyName);
        started = false;
        currentPropertyName = undefined;
        currentPropertyValue = undefined;
        initialPropertyValue = undefined;
    }

    function onStart(e: CustomEvent<{ property: string, value: any }>) {
        const engine = $CurrentProject.engine;
        debug && console.log('start', e.detail.property, e.detail.value);
        if (started) {
            if (currentPropertyName !== e.detail.property) {
                // finish current started if different property (if any)
                onDone();
            }
        }

        started = true;
        currentPropertyName = e.detail.property;
        initialPropertyValue = e.detail.value;
        currentPropertyValue = undefined;
        keyframeCounter.start(engine);
    }

    function updateProperty(property: string, value: any, snapshot?: boolean) {
        const project = $CurrentProject;
        if (project.middleware.setElementsProperty(project.selection, property as any, value)) {
            if (snapshot) {
                globalProperties.updateFromElement(project.selection.activeElement);
                project.state.snapshot();
            } else {
                notifyPropertiesChanged();
            }
            project.engine.invalidate();
            debug && console.log('update', property, value);
            return true;
        }
        return false;
    }

    function onUpdate(e: CustomEvent<{ property: string, value: any }>) {
        if (currentPropertyName !== e.detail.property) {
            onDone();
        }

        if (!started) {
            updateProperty(e.detail.property, e.detail.value, true);
            return;
        }

        if (!equals(currentPropertyValue, e.detail.value)) {
            currentPropertyValue = e.detail.value;
            updateProperty(e.detail.property, e.detail.value, false);
        }
    }

    function onAction(e: CustomEvent<{ action: (project: AnimationProject, element: Element, value: any) => boolean, value?: any }>) {
        onDone();

        const project = $CurrentProject;
        keyframeCounter.start(project.engine);
        let changed: boolean = false;

        for (const element of project.selection) {
            if (e.detail.action(project, element, e.detail.value)) {
                changed = true;
            }
        }

        if (changed || keyframeCounter.hasChanged(project.engine)) {
            snapshot();
        }
    }

    function snapshot() {
        const project = $CurrentProject;
        project.state.snapshot();
        project.engine?.invalidate();
    }

    function onGlobalPropertiesUpdate(e: CustomEvent<{ property: string, value: any }>) {
        globalProperties.updateProperty(e.detail.property, e.detail.value);
        // force update
        globalProperties = globalProperties;
    }

    function onGlobalPropertiesAction(e: CustomEvent<{ action: any, type?: string, value?: any }>) {
        if (!e.detail.type) {
            return;
        }

        switch (e.detail.type) {
            case 'copyFill':
                globalProperties.strokeBrush = globalProperties.fill;
                if (!e.detail.value) {
                    globalProperties.strokeOpacity = globalProperties.fillOpacity;
                }
                return;
            case 'copyStroke':
                globalProperties.fill = globalProperties.strokeBrush;
                if (!e.detail.value) {
                    globalProperties.fillOpacity = globalProperties.strokeOpacity;
                }
                return;
            case 'swapFillStroke':
                const fill = globalProperties.fill;
                globalProperties.fill = globalProperties.strokeBrush;
                globalProperties.strokeBrush = fill;
                if (e.detail.value) {
                    const op = globalProperties.fillOpacity;
                    globalProperties.fillOpacity = globalProperties.strokeOpacity;
                    globalProperties.strokeOpacity = op;
                }
                return;
        }
    }

    function onDocumentProperty(e: CustomEvent<{property: string, value: any}>) {
        const document = $CurrentDocument;
        const {property, value} = e.detail;
        if (!document || !(property in document) || equals(document[property], value)) {
            return;
        }

        document[property] = value;

        snapshot();
    }

    let isShapeTool: boolean;
    $: isShapeTool = $CurrentTool instanceof ShapeBuilderTool;
</script>
<div class="scroll" hidden-x>
    {#if isShapeTool}
        {#if globalProperties != null}
            <FillAndStroke
                    on:action={onGlobalPropertiesAction} on:update={onGlobalPropertiesUpdate}
                    value={globalProperties}
                    bind:showFill={$IsFillSelected}
                    bind:colorMode={$CurrentColorMode} />
        {/if}
    {:else if $CurrentSelectedElement == null}
        {#if $CurrentDocument != null}
            <DocumentProps value={$CurrentDocument} on:update={onDocumentProperty} bind:proportionalSize={$ProportionalSize} />
        {/if}
    {:else}
        {#if $CurrentSelectedElement instanceof VectorElement}
            <FillAndStroke
                    on:action={onAction} on:start={onStart} on:update={onUpdate} on:done={onDone}
                    value={$CurrentSelectedElement}
                    bind:showFill={$IsFillSelected}
                    bind:colorMode={$CurrentColorMode} />
        {/if}
        <Transform on:action={onAction} on:start={onStart} on:update={onUpdate} on:done={onDone}
                   element={$CurrentSelectedElement} bind:proportionalScale={$ProportionalScale}/>
        <Compositing on:action={onAction} on:start={onStart} on:update={onUpdate} on:done={onDone}
                     element={$CurrentSelectedElement} />
    {/if}
</div>
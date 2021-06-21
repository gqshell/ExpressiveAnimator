<script lang="ts">
    import Transform from "./Transform.svelte";
    import {CurrentProject, CurrentSelectedElement, IsFillSelected, CurrentColorMode} from "../../Stores";
    import type {Element, Document} from "@zindex/canvas-engine";
    import Brush from "./Brush";
    import Compositing from "./Compositing.svelte";
    import FillAndStroke from "./FillAndStroke";
    import {KeyframeCounter} from "../../Core";
    import {VectorElement} from "@zindex/canvas-engine";

    const keyframeCounter = new KeyframeCounter();

    function onStart() {
        keyframeCounter.start($CurrentProject.engine);
    }

    function onStop(e) {
        const keyframesAdded = keyframeCounter.hasChanged($CurrentProject.engine);
        console.log(keyframesAdded, e.detail)
    }

    function onBrushInput(e) {
        console.log('input', e.detail)
    }
</script>
<div class="scroll" hidden-x>
    {#if $CurrentSelectedElement != null}
        {#if $CurrentSelectedElement instanceof VectorElement}
            <FillAndStroke
                    value={$CurrentSelectedElement}
                    bind:showFill={$IsFillSelected}
                    bind:colorMode={$CurrentColorMode} />
        {/if}
        <Transform element={$CurrentSelectedElement}/>
        <Compositing element={$CurrentSelectedElement} />
    {/if}
</div>
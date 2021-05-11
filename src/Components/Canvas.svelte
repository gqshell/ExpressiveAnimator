<script lang="ts">
    import {onMount} from "svelte";
    import {CanvasEngine, Document, PanTool} from "@zindex/canvas-engine";

    export let document: Document;

    let canvas: CanvasEngine;

    onMount(() => {
        canvas.document = document;
        canvas.tool = new PanTool();
        canvas.render();
        //console.log(canvas.themeProperties)
    })
</script>
<div>
    <expressive-canvas-engine theme="dark" bind:this={canvas}/>
</div>
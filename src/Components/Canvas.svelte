<script lang="ts">
    import {onMount} from "svelte";
    import {CanvasEngine, PanTool, SelectTool, Project} from "@zindex/canvas-engine";

    export let project: Project;

    let canvas: CanvasEngine;

    onMount(() => {
        canvas.project = project;
        canvas.tool = new SelectTool();
        canvas.startRenderLoop();
        //console.log(canvas.themeProperties)
    })
</script>
<canvas-engine style="touch-action: none" bind:this={canvas}/>
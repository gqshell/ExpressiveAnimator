<script lang="ts">
    import {onMount} from "svelte";
    import {CanvasEngine, PanTool, SelectTool, AnimationProject} from "@zindex/canvas-engine";

    export let project: AnimationProject;

    let canvas: CanvasEngine;

    onMount(() => {
        canvas.project = project;
        canvas.tool = new SelectTool();
        canvas.startRenderLoop();
        //console.log(canvas.themeProperties)
    })
</script>
<div class="canvas-wrapper">
    <canvas-engine style="touch-action: none" bind:this={canvas}/>
</div>
<style>
    .canvas-wrapper {
        box-sizing: border-box;
        overflow: hidden;
    }
</style>
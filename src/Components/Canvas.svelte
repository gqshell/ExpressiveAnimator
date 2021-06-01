<script lang="ts">
    import {onMount} from "svelte";
    import {CanvasEngine, PanTool, SelectTool, AnimationProject} from "@zindex/canvas-engine";

    export let project: AnimationProject;
    export let theme: string;

    let canvas: CanvasEngine;

    $: if (canvas) canvas.setAttribute('theme', theme);

    onMount(() => {
        canvas.project = project;
        canvas.tool = new SelectTool();
        canvas.startRenderLoop();
        canvas.setAttribute('theme', theme);
        //console.log(canvas.themeProperties)
    })
</script>
<div class="canvas-wrapper">
    <canvas-engine style="touch-action: none" bind:this={canvas} />
</div>
<style>
    .canvas-wrapper {
        box-sizing: border-box;
        overflow: hidden;
    }
</style>
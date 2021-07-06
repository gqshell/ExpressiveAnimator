<script lang="ts">
    import {onMount, tick} from "svelte";
    import {renderRuler, roundTime, getTimeAtX, getDeltaTimeByX, getDurationBounds} from "./utils";
    import {CurrentTheme, CurrentTime} from "../../Stores";

    export let zoom: number = 1;
    export let scroll: number = 0;
    export let scaleFactor: number = 1;

    let canvas: HTMLCanvasElement;
    let context: CanvasRenderingContext2D;
    let playHead: HTMLElement;
    let bounds: DOMRect;

    let width = 100;
    let height = 31;
    // TODO: use dpo observer
    let dpi = window.devicePixelRatio;
    let foreground: string;
    let background: string;
    let overlay: string;
    let paintReady: boolean = false;

    let playHeadPosition: number,
        currentTime: number;

    $: if (canvas && $CurrentTheme) {
        updateTheme(canvas);
    }

    async function updateTheme(canvas: HTMLCanvasElement) {
        await tick();
        const style = window.getComputedStyle(canvas);
        background = style.getPropertyValue('--ruler-background') || 'black';
        foreground = style.getPropertyValue('--ruler-foreground') || 'white';
        overlay = style.getPropertyValue('--ruler-overlay') || 'gray';
    }

    $: if (paintReady && context) {
        context.save();
        context.scale(dpi, dpi);
        context.clearRect(0, 0, width, height);
        context.fillStyle = background;
        context.strokeStyle = foreground;
        context.fillRect(0, 0, width, height);
        // const dBounds = getDurationBounds($CurrentDocumentAnimation.startTime, $CurrentDocumentAnimation.endTime, width, scroll, zoom);
        // if (dBounds) {
        //     context.fillStyle = overlay;
        //     context.fillRect(dBounds[0], 0, dBounds[1] - dBounds[0], height);
        // }
        context.fillStyle = foreground;
        renderRuler(context, width, height, scroll, zoom, scaleFactor);
        context.restore();
    }

    function playHeadPointerDown(event: PointerEvent) {
        playHead.setPointerCapture(event.pointerId);
        currentTime = $CurrentTime;
        playHeadPosition = event.x;
    }

    function playHeadPointerMove(event: PointerEvent) {
        if (playHeadPosition === undefined) {
            return;
        }
        currentTime += getDeltaTimeByX(event.x - playHeadPosition, zoom);
        playHeadPosition = event.x;
        $CurrentTime = roundTime(currentTime, scaleFactor);
    }

    function playHeadPointerUp(event: PointerEvent) {
        playHead.releasePointerCapture(event.pointerId);
        playHeadPosition = undefined;
    }

    function onRulerClick(e: MouseEvent) {
        $CurrentTime = roundTime(getTimeAtX(e.clientX - bounds.x, scroll, zoom), scaleFactor);
    }

    function setupCanvas() {
        bounds = canvas.parentElement.getBoundingClientRect();
        width = bounds.width;
        height = bounds.height;
        canvas.width = width * dpi;
        canvas.height = height * dpi;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        context = canvas.getContext('2d', {alpha: false});
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.lineWidth = 1;
        context.font = '10px sans-serif';
        context.textAlign = 'left';
        context.textBaseline = "ideographic";
    }

    onMount(() => {
        setTimeout(() => {
            // next frame
            paintReady = true;
        });
        setupCanvas();
        const observer = new ResizeObserver(() => {
            setupCanvas();
        });
        observer.observe(canvas.parentElement);

        return () => {
            observer.disconnect();
        };
    });
</script>
<div class="timeline-ruler">
    <canvas bind:this={canvas} on:click={onRulerClick}></canvas>
    <div bind:this={playHead}
         on:pointerdown|self={playHeadPointerDown}
         on:pointermove={playHeadPointerMove}
         on:pointerup={playHeadPointerUp}
         class="timeline-ruler-play-head"></div>
</div>
<style global>
    .timeline-ruler {
        flex: 1;
        box-sizing: border-box;
        position: relative;
        overflow: hidden;
        border-bottom: 1px solid var(--separator-color);
        --ruler-overlay: var(--spectrum-global-color-gray-200);
        --ruler-background: var(--spectrum-global-color-gray-75);
        --ruler-foreground: var(--spectrum-alias-text-color);
    }
    .timeline-ruler > canvas {
        width: 100%;
        height: 100%;
    }
    .timeline-ruler-play-head {
        position: absolute;
        width: 13px;
        height: 13px;
        top: 19px;
        left: 0;
        clip-path: polygon(0 0, 100% 0, 50% 100%, 0 0);
        background: var(--spectrum-global-color-blue-500);
        transform: translateX(calc(var(--timeline-play-offset) * var(--timeline-ms-unit) - var(--timeline-scroll-left)));
        will-change: transform;
    }
</style>
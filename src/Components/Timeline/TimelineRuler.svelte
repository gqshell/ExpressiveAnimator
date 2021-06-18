<script lang="ts">
    import {onMount, tick} from "svelte";
    import {CurrentTheme, CurrentTime, CurrentMaxTime} from "../../Stores";
    import {clamp} from "@zindex/canvas-engine";

    export let zoom: number = 1;
    export let scroll: number = 0;
    export let divisions: number = 30;
    export let padding: number = 6;
    export let majorGraduationWidth = 240;

    let canvas: HTMLCanvasElement;
    let context: CanvasRenderingContext2D;
    let playHead: HTMLElement;
    let bounds: DOMRect;

    let width = 100;
    let height = 31;
    let dpi = window.devicePixelRatio;
    let foreground: string;
    let background: string;
    let paintReady: boolean = false;

    let playHeadPosition: number;
    let currentTime: number = $CurrentTime;

    const minorGraduationWidth = majorGraduationWidth / divisions;
    const halfDivisions = divisions / 2;
    const unit = majorGraduationWidth / 1000;


    $: if (paintReady && canvas && $CurrentTheme) {
        const style = window.getComputedStyle(canvas);
        background = style.getPropertyValue('--ruler-background') || 'black';
        foreground = style.getPropertyValue('--ruler-foreground') || 'white';
    }

    $: if (paintReady && context) {
        context.save();
        context.scale(dpi, dpi);
        context.clearRect(0, 0, width, height);
        context.fillStyle = background;
        context.strokeStyle = foreground;
        context.fillRect(0, 0, width, height);
        context.fillStyle = foreground;
        render(context, width, height, scroll/zoom, zoom);
        context.restore();
    }

    function render(context: CanvasRenderingContext2D, width: number, height: number, scroll: number, zoom: number) {
        const path = new Path2D();

        const t = scroll / minorGraduationWidth;
        let graduationNo = Math.floor(t);
        let delta = ((Math.round(t * 100) - graduationNo * 100) / 100);

        let x = padding > scroll ? padding - scroll : padding;
        x -= delta * minorGraduationWidth * zoom;

        while (true) {
            path.moveTo(x + 0.5, height);

            if (graduationNo % divisions === 0) {
                let s = graduationNo / divisions;
                let m = (s - s % 60) / 60;
                let h = (m - m % 60) / 60;
                m = m % 60;
                s = s % 60;
                let text = s > 9 ? s.toString() : '0' + s;
                if (h > 0) {
                    text = `${h}:${m > 9 ? m.toString() : '0' + m}:${text}`;
                } else {
                    text = `${m}:${text}`;
                }
                path.lineTo(x + 0.5, height - 20);
                context.fillText(text, x + 4, height - 15);
            } else if (graduationNo % halfDivisions === 0) {
                path.lineTo(x + 0.5, height - 15);
            } else {
                path.lineTo(x + 0.5, height - 10);
            }

            x += minorGraduationWidth * zoom;
            graduationNo++;

            if (x > width) {
                break;
            }
        }

        context.stroke(path);
    }

    function computeTime(currentTime: number): number {
        let time = Math.round(currentTime);
        let frame = Math.round(1000 / divisions);
        time = time - time % frame;
        let totalFrames = time / frame;
        let elapsedFrames = totalFrames % divisions;
        let elapsedSeconds = (totalFrames - elapsedFrames) / divisions;
        return Math.round(elapsedSeconds * 1000 + elapsedFrames * 1000 / divisions);
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

        let delta = (event.x - playHeadPosition) / zoom / unit;

        currentTime += delta;
        playHeadPosition = event.x;

        $CurrentTime = clamp(computeTime(currentTime), 0, $CurrentMaxTime);
    }

    function playHedPointerUp(event: PointerEvent) {
        playHead.releasePointerCapture(event.pointerId);
        playHeadPosition = undefined;
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

        playHead.addEventListener('pointerdown', playHeadPointerDown);
        playHead.addEventListener('pointermove', playHeadPointerMove);
        playHead.addEventListener('pointerup', playHedPointerUp);

        canvas.addEventListener('click', function (event: MouseEvent) {
            const x = ((event.clientX - bounds.x - padding) + scroll) / zoom;
            $CurrentTime = clamp(computeTime(x / majorGraduationWidth * 1000), 0, $CurrentMaxTime);
        });

        return () => {
            observer.disconnect();
        };
    });

</script>
<div class="timeline-ruler">
    <canvas bind:this={canvas}></canvas>
    <div bind:this={playHead} class="timeline-ruler-play-head"></div>
</div>
<style global>
    .timeline-ruler {
        flex: 1;
        box-sizing: border-box;
        position: relative;
        overflow: hidden;
        border-bottom: 1px solid var(--spectrum-global-color-gray-300);
        --ruler-background: var(--spectrum-global-color-gray-75);
        --ruler-foreground: var(--spectrum-global-color-gray-800);
    }
    .timeline-ruler > canvas {
        width: 100%;
        height: 100%;
        background: var(--spectrum-global-color-gray-800);
    }
    .timeline-ruler-play-head {
        position: absolute;
        width: 12px;
        height: 12px;
        top: calc(32.5px - 12px);
        left: 0;
        clip-path: polygon(0 0, 12px 0, 6px 12px, 0 0);
        background: var(--spectrum-global-color-blue-500);
        transform: translateX(calc(calc(var(--timeline-play-offset) * var(--timeline-ms-unit)) - var(--timeline-scroll-left) + 0.5px));
        will-change: transform;
    }
</style>
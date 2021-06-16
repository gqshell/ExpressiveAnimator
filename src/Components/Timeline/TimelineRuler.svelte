<script lang="ts">
    import {onMount} from "svelte";
    import {CurrentTheme} from "../../Stores";

    export let zoom: number = 1;
    export let scroll: number = 0;
    export let divisions: number = 24;
    export let padding: number = 6;
    export let majorGraduationWidth = 240;

    let canvas: HTMLCanvasElement;
    let context: CanvasRenderingContext2D;

    let width = 100;
    let height = 31;
    let dpi = window.devicePixelRatio;
    let foreground: string = 'white';
    let background: string = 'black';

    const minorGraduationWidth = majorGraduationWidth / divisions;
    const halfDivisions = divisions / 2;

    $: if (canvas && $CurrentTheme) {
        const style = window.getComputedStyle(canvas);
        background = style.getPropertyValue('--ruler-background') || 'black';
        foreground = style.getPropertyValue('--ruler-foreground') || 'white';
    }

    $: if (context) {
        context.save();
        context.scale(dpi, dpi);
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
                context.fillText(text, x + 4, height - 15);
                path.lineTo(x + 0.5, height - 20);
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

    onMount(() => {
        context = canvas.getContext('2d', {alpha: false});
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.lineWidth = 1;
        context.font = '10px sans-serif';
        context.textAlign = 'left';
        context.textBaseline = "ideographic";

        const observer = new ResizeObserver(() => {
            const rect = canvas.parentElement.getBoundingClientRect();
            width = rect.width;
            height = rect.height;
            canvas.width = width * dpi;
            canvas.height = height * dpi;
        });
        observer.observe(canvas.parentElement);

        return () => {
            observer.disconnect();
        };
    });

</script>
<div class="timeline-ruler">
    <canvas bind:this={canvas}></canvas>
    <div class="timeline-ruler-play-head"></div>
</div>
<style global>
    .timeline-ruler {
        flex: 1;
        box-sizing: border-box;
        position: relative;
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
        clip-path: polygon(0 0, 12px 0, 6.5px 12px, 0 0);
        background: var(--spectrum-global-color-red-400);
        transform: translateX(calc(calc(var(--timeline-play-offset) * var(--timeline-ms-unit)) - var(--timeline-scroll-left)));
        will-change: transform;
    }
</style>
<script lang="ts">
    import {onMount} from "svelte";

    export let zoom: number = 1;
    export let scroll: number = 0;
    export let divisions: number = 24;
    export let padding: number = 6;
    export let majorGraduationWidth = 240;
    export let background: string = '#3e3e3e';
    export let foreground: string = '#e3e3e3';

    let canvas: HTMLCanvasElement;
    let context: CanvasRenderingContext2D;

    let width = 100;
    let height = 32;
    let dpi = window.devicePixelRatio;

    const minorGraduationWidth = majorGraduationWidth / divisions;
    const halfDivisions = divisions / 2;

    $: if (context) {
        context.save();
        context.scale(dpi, dpi);
        context.clearRect(0, 0, width, height);
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
                let text = `${h > 9 ? h.toString() : '0' + h}:${m > 9 ? m.toString() : '0' + m}:${s > 9 ? s.toString() : '0' + s}`;
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
        const observer = new ResizeObserver(() => {
            const rect = canvas.parentElement.getBoundingClientRect();
            width = rect.width;
            height = rect.height;
            canvas.width = width * dpi;
            canvas.height = height * dpi;
            context = canvas.getContext('2d', {alpha: false});
            context.imageSmoothingEnabled = true;
            context.imageSmoothingQuality = "high";
            context.lineWidth = 1;
            context.strokeStyle = '#ffffff';
            context.fillStyle = '#000000';
            context.font = '10px sans-serif';
            context.textAlign = 'left';
            context.textBaseline = "ideographic";
        });
        observer.observe(canvas.parentElement);
    });

</script>
<div style="flex: 1; box-sizing: border-box">
    <canvas bind:this={canvas} class="timeline-ruler"></canvas>
</div>
<style global>
    .timeline-ruler {
        box-sizing: border-box;
        background: black;
        width: 100%;
        height: 100%;
    }
</style>
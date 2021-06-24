<script lang="ts">
    import "@spectrum-css/colorwheel/dist/index-vars.css";
    import {clampStep, mergeClasses} from "./utils";
    import {createEventDispatcher} from "svelte";
    import SpColorHandle from "./SpColorHandle.svelte";

    export let value: number = 0;
    export let step: number = 1;

    export let size: number = 160;

    export let disabled: boolean = false;
    export let loupe: boolean = false;
    export let small: boolean = false;

    const dispatch = createEventDispatcher();

    let dragged: boolean = false,
        focused: boolean = false;

    $: handlerSize = small ? 16 : 24;
    $: radius = (size - handlerSize) / 2;

    let colorHandle, surface, original;

    function onDragStart() {
        dragged = true;
        original = value;
        dispatch('start');
    }

    function onDragEnd() {
        dragged = false;
        if (value !== original) {
            dispatch('input', value);
        }
        colorHandle.blur();
    }

    function getAngle(x: number, y: number, bbox: DOMRect) {
        const cx = bbox.left + bbox.width / 2;
        const cy = bbox.top + bbox.height / 2;

        const angle = Math.atan2((y - cy) / radius, (x - cx) / radius) * 180 / Math.PI;

        return (angle + 360) % 360;
    }

    function onDrag(pos: {x: number, y: number, bbox: DOMRect}) {
        const v = clampStep(getAngle(pos.x, pos.y, pos.bbox), 0, 360, step);

        if (value !== v) {
            value = v;
            dispatch('input', v);
        }
    }

    function onArrow(e) {
        let add = 0;

        switch (e.detail) {
            case 'ArrowLeft':
            case 'ArrowDown':
                add = -1;
                break;
            case 'ArrowRight':
            case 'ArrowUp':
                add = 1;
                break;
            default:
                return;
        }

        let v = value + add * step;
        if (v > 360) {
            v %= 360;
        } else if (v <= 0) {
            v = 360 - v % 360;
        }

        v = clampStep(v, 0, 360, step);

        if (value !== v) {
            value = v;
            dispatch('input', value);
        }
    }

    function onClick(e: MouseEvent) {
        const v = clampStep(getAngle(e.clientX, e.clientY, surface.getBoundingClientRect()), 0, 360, step);
        if (value !== v) {
            value = v;
            dispatch('start');
            dispatch('input', v);
            dispatch('done');
        }
    }

    function onFocus() {
        focused = true;
        dispatch('focus');
    }

    function onBlur() {
        focused = false;
        dispatch('done');
        dispatch('blur');
    }

    let transform: string, clipPath: string;
    $: {
        const rad = value * Math.PI / 180;

        transform = `transform: translate(${radius * Math.cos(rad)}px, ${radius * Math.sin(rad)}px);`;

        const hSz = size / 2;
        const hCh = hSz - handlerSize;
        const dCh = size - 2 * handlerSize;
        clipPath = `M ${hSz} ${hSz} m -${hSz} 0 a ${hSz} ${hSz} 0 1 0 ${size} 0 a ${hSz} ${hSz} 0 1 0 -${size} 0 M ${hSz} ${hSz} m -${hCh} 0 a ${hCh} ${hCh} 0 1 0 ${dCh} 0 a ${hCh} ${hCh} 0 1 0 -${dCh} 0`;
    }

    $: computedClass = mergeClasses({
        'spectrum-ColorWheel': true,
        'is-disabled': disabled,
        'is-dragged': dragged,
        'is-focused': focused,
    }, $$props.class);
</script>
<div {...$$restProps} class={computedClass} bind:this={surface} style={`--spectrum-colorwheel-width: ${size}px; --spectrum-colorwheel-height: ${size}px;`}>
    <div on:click|self={onClick} class="spectrum-ColorWheel-gradient" style={`clip-path: path(evenodd, "${clipPath}");`}></div>
    <slot />
    <SpColorHandle class="spectrum-ColorWheel-handle" tabindex="0"
                   color={`hsl(${value}, 100%, 50%)`}
                   style={transform}
                   bind:element={colorHandle}
                   dragOptions={{surface, start: onDragStart, move: onDrag, end: onDragEnd, raw: true}}
                   on:arrow={onArrow}
                   on:focus={onFocus} on:blur={onBlur}
                   loupe={loupe} disabled={disabled} />
</div>
<style global>
    .spectrum-ColorWheel.is-disabled div.spectrum-ColorWheel-gradient {
        background: var(--spectrum-colorwheel-border-color);
    }
    .spectrum-ColorWheel:not(.is-disabled) div.spectrum-ColorWheel-gradient {
        border: none;
        background: conic-gradient(from 90deg, rgb(255, 0, 0), rgb(255, 128, 0), rgb(255, 255, 0), rgb(128, 255, 0), rgb(0, 255, 0), rgb(0, 255, 128), rgb(0, 255, 255), rgb(0, 128, 255), rgb(0, 0, 255), rgb(128, 0, 255), rgb(255, 0, 255), rgb(255, 0, 128), rgb(255, 0, 0));
    }
    .spectrum-ColorWheel:not(.is-focused) > .spectrum-ColorArea.is-focused .spectrum-ColorHandle {
        z-index: 2;
    }
    .spectrum-ColorWheel > .spectrum-ColorArea {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: calc((var(--spectrum-colorwheel-width) - 2 * 24px) * 0.7071067811865476);
        height: calc((var(--spectrum-colorwheel-height) - 2 * 24px) * 0.7071067811865476);
    }
</style>
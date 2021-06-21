<script lang="ts">
    import "@spectrum-css/colorarea/dist/index-vars.css";
    import {mergeClasses, clampStep, getXYPercent} from "./utils";
    import {createEventDispatcher, onMount} from "svelte";
    import SpColorHandle from "./SpColorHandle.svelte";

    const dispatch = createEventDispatcher();

    export let hue: number = 0;
    export let saturation: number = 100;
    export let value: number = 50;

    export let disabled: boolean = false;
    export let loupe: boolean = false;

    const step: number = 0.01;
    let colorArea: HTMLElement, colorHandle: HTMLElement;

    let sat, light, color;

    function clamp(value: number): number {
        return clampStep(value, 0, 1, step);
    }

    $: {
        light = clamp(value * (1 - saturation / 2));
        sat = clamp(light === 0 || light === 1 ? 0 : (value - light) / Math.min(light, 1 - light));
        color = `hsl(${hue}, ${sat * 100}%, ${light * 100}%)`;
    }

    function dispatchValue(...events) {
        const v = {x: saturation, y: value};
        for (const event of events) {
            dispatch(event, v);
        }
    }

    function changeValue(x: number, y: number): boolean {
        x = clamp(x);
        y = clamp(1 - y);

        let modified = false;

        if (x !== saturation) {
            saturation = x;
            modified = true;
        }

        if (y !== value) {
            value = y;
            modified = true;
        }

        return modified;
    }

    function onClick(e) {
        const value = getXYPercent(e, colorArea.getBoundingClientRect());
        if (changeValue(value.x, value.y)) {
            dispatch('start');
            dispatchValue('input', 'change');
            dispatch('stop');
        }
    }

    function onArrow(e) {
        let x = 0, y = 0;

        switch (e.detail) {
            case 'ArrowLeft':
                x = -1;
                break;
            case 'ArrowRight':
                x = 1;
                break;
            case 'ArrowUp':
                y = 1;
                break;
            case 'ArrowDown':
                y = -1;
                break;
            default:
                return;
        }

        if (x) {
            const v = clamp(saturation + x * step * 2);
            if (v !== saturation) {
                dispatch('start');
                saturation = v;
                dispatchValue('input', 'change');
                dispatch('stop');
            }
        } else if (y) {
            const v = clamp(value + y * step * 2);
            if (v !== value) {
                dispatch('start');
                value = v;
                dispatchValue('input', 'change');
                dispatch('stop');
            }
        }
    }

    function onDragStart() {
        dispatch('start');
    }

    function onDrag({x, y}) {
        if (changeValue(x, y)) {
            dispatchValue('input');
        }
    }

    function onDragEnd(changed) {
        if (changed) {
            dispatchValue('change');
            colorHandle.blur();
        }
        dispatch('stop');
    }

    let focused: boolean = false;
    function onFocus() {
        focused = true;
        dispatch('focus');
    }
    function onBlur() {
        focused = false;
        dispatch('blur');
    }

    let dragOptions;
    onMount(() => {
        dragOptions = {
            surface: colorArea,
            start: onDragStart,
            move: onDrag,
            end: onDragEnd,
        }
    });

    $: computedClass = mergeClasses({
        'spectrum-ColorArea': true,
        'is-disabled': disabled,
        'is-focused': focused,
    }, $$props.class);
</script>
<div {...$$restProps} class={computedClass} bind:this={colorArea} on:click|self={onClick}>
    <div class="spectrum-ColorArea-gradient"
         style={`background: linear-gradient(to top, black 0%, rgba(0, 0, 0, 0) 100%), linear-gradient(to right, white 0%, rgba(0, 0, 0, 0) 100%), hsl(${hue}, 100%, 50%);`}></div>
    <SpColorHandle dragOptions={dragOptions} bind:element={colorHandle} on:arrow={onArrow} on:focus={onFocus} on:blur={onBlur}
                   class="spectrum-ColorArea-handle" loupe={loupe} color={color} disabled={disabled}
                   tabindex="0" style={`left: ${saturation * 100}%; top: ${(1 - value) * 100}%`}/>
    <input tabindex="-1" value={saturation} type="range" class="spectrum-ColorArea-slider" name="x" aria-label="saturation and value" min="0" max="1" step="0.01">
    <input tabindex="-1" value={value} type="range" class="spectrum-ColorArea-slider" name="y" aria-label="saturation and value" min="0" max="1" step="0.01">
</div>
<script lang="ts">
    import "@spectrum-css/colorslider/dist/index-vars.css";
    import {getPercentValue, getXYPercent, getPercentage, clampStep, mergeClasses} from "./utils";
    import {createEventDispatcher} from "svelte";
    import SpColorHandle from "./SpColorHandle.svelte";

    const dispatch = createEventDispatcher();

    export let vertical: boolean = false;
    export let invert: boolean = false;
    export let disabled: boolean = false;
    export let loupe: boolean = false;

    export let value: number = 0;

    export let min: number = 0;
    export let max: number = 100;
    export let step: number = 1;

    export let small: boolean = false;

    export let color: string = 'transparent';
    export let gradient: string = 'transparent';

    let surface, colorHandle, bg, percent;

    $: {
        percent = getPercentage(value, min, max);
        if (invert) {
            percent = 100 - percent;
        }
        if (vertical) {
            bg = invert ? 'top' : 'bottom';
        } else {
            bg = invert ? 'left' : 'right';
        }
        bg = `background: linear-gradient(to ${bg}, ${gradient});`;
    }

    let original;

    function onDragStart() {
        original = value;
        dispatch('start');
    }

    function onDrag(v) {
        v = getPercentValue(v[vertical ? 'y' : 'x'], min, max);
        if (invert) {
            v = max - v;
        }
        v = clampStep(v, min, max, step);

        if (value !== v) {
            value = v;
            dispatch('input', v);
        }
    }

    function onDragEnd() {
        if (original !== value) {
            dispatch('change', value);
        }
        colorHandle.blur();
    }

    function onArrow(e) {
        let add = 0;

        switch (e.detail) {
            case 'ArrowLeft':
            case 'ArrowUp':
                add = 1;
                break;
            case 'ArrowRight':
            case 'ArrowDown':
                add = -1;
                break;
            default:
                return;
        }

        if (!invert) {
            add = -add;
        }

        const v = clampStep(value + add * step * 2, min, max, step);
        if (value !== v) {
            value = v;
            dispatch('input', v);
        }
    }

    function onClick(e) {
        let v = getXYPercent(e, surface.getBoundingClientRect())[vertical ? 'y' : 'x'];
        v = getPercentValue(v, min, max);
        if (invert) {
            v = max - v;
        }
        v = clampStep(v, min, max, step);

        if (value !== v) {
            value = v;
            dispatch('start');
            dispatch('input', v);
            dispatch('done');
        }
    }

    function onBlur() {
        dispatch('done');
        dispatch('blur');
    }

    $: computedClass = mergeClasses({
        'spectrum-ColorSlider': true,
        'spectrum-ColorSlider--vertical': vertical,
        'spectrum-ColorSlider--small': small,
        'is-disabled': disabled,
    }, $$props.class);
</script>
<div {...$$restProps} class={computedClass} bind:this={surface}>
    <div class="spectrum-ColorSlider-checkerboard" role="presentation" on:click|self={onClick}>
        <div class="spectrum-ColorSlider-gradient" role="presentation" style={bg}></div>
    </div>
    <SpColorHandle bind:element={colorHandle} on:arrow={onArrow} on:focus on:blur={onBlur}
                   dragOptions={{surface, start: onDragStart, end: onDragEnd, move: onDrag}}
                   style={vertical ? `top: ${percent}%` : `left: ${percent}%;`}
                   tabindex="0"
                   color="{color}" class="spectrum-ColorSlider-handle" disabled={disabled} loupe={loupe} />
    <input tabindex="-1" type="range" class="spectrum-ColorSlider-slider" value="{value}" min="{min}" max="{max}" step="{step}">
</div>
<style global>
    .spectrum-ColorSlider.spectrum-ColorSlider--small {
        --spectrum-colorslider-height: var(--spectrum-global-dimension-size-200);
    }
    .spectrum-ColorSlider.spectrum-ColorSlider--vertical.spectrum-ColorSlider--small {
        --spectrum-colorslider-vertical-width: var(--spectrum-global-dimension-size-200);
    }
</style>
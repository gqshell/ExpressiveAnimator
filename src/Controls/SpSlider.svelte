<script lang="ts">
    import "@spectrum-css/slider/dist/index-vars.css";
    import {mergeClasses, getPercentage, getPercentValue, clampStep, getXYPercent, dragAction, nextId, formatNumber} from "./utils";
    import {createEventDispatcher} from "svelte";

    const dispatch = createEventDispatcher();

    export let label: string | undefined = undefined;

    export let value: number | [number, number] = 0;

    export let min: number = 0;
    export let max: number = 100;
    export let step: number = 1;
    export let round: number = null;
    export let digits: number = 4;

    export let fill: 'none' | 'start' | 'middle' | 'ramp' = 'none';
    export let ticks: number | string[] = 0;
    export let disabled: boolean = false;
    export let editable: boolean = false;
    export let allowOverflow: boolean = false;

    const genId = nextId();
    const labelId = `spectrum-slider-label-${genId}`;
    const inputId = `spectrum-slider-input-${genId}`;

    $: isRange = Array.isArray(value);
    $: computedValue = isRange ? clampRange(value as [number, number]) : clampStep(value, min, max, round ?? step);
    $: hasTicks = Array.isArray(ticks) ? ticks.length > 0 : ticks > 0;

    let tickLabels;
    $: {
        if (Array.isArray(ticks)) {
            tickLabels = ticks;
        } else {
            tickLabels = [];
            for (let i = 0; i < ticks; i++) {
                tickLabels.push(null);
            }
        }
    }

    let track1, track2, percent;
    $: {
        if (isRange) {
            percent = [
                getPercentage(computedValue[0], min, max),
                getPercentage(computedValue[1], min, max),
            ];
            track1 = percent[0];
            track2 = 100 - percent[1];
        } else {
            percent = getPercentage(computedValue, min, max);
            track1 = percent;
            track2 = 100 - percent;
        }
    }

    let focused: number = 0;
    let dragged: number = 0;
    let started: boolean = false;

    let surface: HTMLElement;

    function onFocus(e) {
        if (isRange) {
            focused = ((e.target as HTMLElement).closest('.spectrum-Slider-handle') as HTMLElement).dataset.sliderName === 'left' ? 1 : 2;
        } else {
            focused = 1;
        }
        dispatch('focus');
    }

    function onSliderBlur() {
        focused = 0;
        if (started) {
            started = false;
            dispatch('done');
        }
        dispatch('blur');
    }

    function onClick(e: MouseEvent) {
        const list = (e.target as HTMLElement).classList;

        if (list.contains('spectrum-Slider-handle') || list.contains('spectrum-Slider-input')) {
            return;
        }

        let v: any = getXYPercent(e as PointerEvent, surface.getBoundingClientRect()).x;

        v = clampStep(getPercentValue(v, min, max), min, max, round ?? step);

        if (isRange) {
            const index = Math.abs(v - computedValue[0]) <= Math.abs(v - computedValue[1]) ? 0 : 1;
            if (computedValue[index] === v) {
                return;
            }
            const arr = [...computedValue];
            arr[index] = v;
            v = arr;
        } else if (v === value) {
            return;
        }

        value = v;
        dispatch('start', 0);
        dispatch('input', value);
        dispatch('done');
    }

    function onSliderKeyDown(e: KeyboardEvent) {
        if (!focused) {
            return;
        }

        let add = 0;

        switch (e.key) {
            case 'ArrowDown':
            case 'ArrowLeft':
                add = -step;
                break;
            case 'ArrowUp':
            case 'ArrowRight':
                add = +step;
                break;
            default:
                return;
        }

        let v;

        if (isRange) {
            if (focused === 1) {
                v = clampStep(computedValue[0] + add, min, computedValue[1], round ?? step);
                if (v === computedValue[0]) {
                    return;
                }
                v = [v, computedValue[1]];
            } else {
                v = clampStep(computedValue[1] + add, computedValue[0], max, round ?? step);
                if (v === computedValue[1]) {
                    return;
                }
                v = [computedValue[0], v];
            }
        } else {
            v = clampStep(computedValue + add, min, max, round ?? step);
            if (value === v) {
                return;
            }
        }

        if (!started) {
            started = true;
            dispatch('start', focused);
        }

        value = v;
        dispatch('input', value);
    }


    function onNumberInput(e) {
        if (!started) {
            started = true;
            dispatch('start', focused);
        }
        let v = (e.target as HTMLInputElement).valueAsNumber;
        if (Number.isNaN(v) || !Number.isFinite(v)) {
            return;
        }

        v = clampStep(v, min, allowOverflow ? Number.POSITIVE_INFINITY : max, round ?? step);
        value = v;
        dispatch('input', value);
    }

    function onInputBlur(e: InputEvent) {
        let v = (e.target as HTMLInputElement).valueAsNumber;
        v = clampStep(v, min, allowOverflow ? Number.POSITIVE_INFINITY : max, round ?? step);
        if (v !== value) {
            value = v;
            dispatch('change', value);
        }
        (e.target as HTMLInputElement).valueAsNumber = v;
        if (started) {
            started = false;
            dispatch('done');
        }
    }

    function onInputKeyDown(e: KeyboardEvent) {
        if (e.key === 'Enter' || e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            (e.target as HTMLInputElement).blur();
        }
    }

    function clampRange(value: [number, number]): [number, number] {
        let a = clampStep(value[0], min, max, round ?? step);
        let b = clampStep(value[1], min, max, round ?? step);
        return a <= b ? [a, b] : [b, a];
    }

    function onDragStart(index) {
        dragged = index;
        dispatch('start', index);
    }

    function onDrag(v, index) {
        v = getPercentValue(v, min, max);

        if (isRange) {
            index--;
            v = index === 0
                ? clampStep(v, min, computedValue[1], round ?? step)
                : clampStep(v, computedValue[0], max, round ?? step);
            if (computedValue[index] === v) {
                return;
            }
            v = index === 0 ? [v, computedValue[1]] : [computedValue[0], v];
        } else {
            v = clampStep(v, min, max, round ?? step);
            if (computedValue === v) {
                return;
            }
        }

        value = v;
        dispatch('input', v);
    }

    function onDragEnd(changed) {
        dragged = 0;
        if (changed) {
            dispatch('change', computedValue);
        }
        dispatch('done');
    }

    $: useTextbox = editable && !isRange;
    $: computedClass = mergeClasses({
        'spectrum-Slider': true,
        'spectrum-Slider--filled': fill === 'start',
        'spectrum-Slider--ramp': fill === 'ramp',
        'spectrum-Slider--range': isRange,
        'spectrum-Slider--tick': hasTicks && typeof ticks === 'number',
        'is-disabled': disabled,
    }, $$props.class);
</script>
<div {...$$restProps} class={computedClass} bind:this={surface}
     role={isRange ? 'group' : undefined}
     aria-labelledby={isRange && label ? labelId : undefined}>
    {#if useTextbox || label}
        <div class="spectrum-Slider-labelContainer" role={isRange ? 'presentation' : undefined}>
            <label class="spectrum-Slider-label" id="{labelId}" for="{inputId}">{label}</label>
            {#if useTextbox}
                <input on:input={onNumberInput} value={formatNumber(allowOverflow ? value : computedValue, digits)}
                       on:keydown|self={onInputKeyDown} on:blur={onInputBlur} tabindex="-1"
                       class="spectrum-Textfield-input spectrum-Slider-value" type="number"
                       min="{min}" max="{allowOverflow ? undefined : max}" step="{step}">
            {:else}
                <div class="spectrum-Slider-value" role="textbox" aria-readonly="true" aria-labelledby="{labelId}">
                    {Array.isArray(computedValue) ? computedValue.join(' - ') : computedValue}
                </div>
            {/if}
        </div>
    {/if}
    <div class="spectrum-Slider-controls" on:click={onClick} role={isRange ? 'presentation' : undefined}>
        {#if !isRange && fill === 'ramp'}
            <div class="spectrum-Slider-ramp">
                <svg viewBox="0 0 240 16" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                    <path d="M240,4v8c0,2.3-1.9,4.1-4.2,4L1,9C0.4,9,0,8.5,0,8c0-0.5,0.4-1,1-1l234.8-7C238.1-0.1,240,1.7,240,4z"></path>
                </svg>
            </div>
        {:else}
            <div class="spectrum-Slider-track" style={`width: ${track1}%;`}></div>
        {/if}
        {#if hasTicks}
            <div class="spectrum-Slider-ticks">
                {#each tickLabels as tick}
                    <div class="spectrum-Slider-tick">
                        {#if tick != null}
                            <div class="spectrum-Slider-tickLabel">{tick}</div>
                        {/if}
                    </div>
                {/each}
            </div>
        {/if}
        {#if isRange}
            <div class="spectrum-Slider-handle" role="presentation"
                 data-slider-name="left"
                 use:dragAction={{surface, move: v => onDrag(v.x, 1), start: () => onDragStart(1), end: onDragEnd}}
                 class:is-dragged={dragged === 1} class:is-focused={focused === 1} style={`left: ${percent[0]}%;`}>
                <input on:focus={onFocus} on:blur={onSliderBlur} on:keydown={onSliderKeyDown}
                       id="{inputId}" type="range" class="spectrum-Slider-input"
                       disabled="{disabled}" value={computedValue[0]} step={step} min={min} max={max}>
            </div>
            <div class="spectrum-Slider-track" style={`left: ${track1}%; right: ${track2}%;`}></div>
            <div class="spectrum-Slider-handle" role="presentation"
                 data-slider-name="right"
                 use:dragAction={{surface, move: v => onDrag(v.x, 2), start: () => onDragStart(2), end: onDragEnd}}
                 class:is-dragged={dragged === 2} class:is-focused={focused === 2} style={`left: ${percent[1]}%;`}>
                <input on:focus={onFocus} on:blur={onSliderBlur} on:keydown={onSliderKeyDown}
                       id="{inputId + '-alt'}" type="range" class="spectrum-Slider-input"
                       disabled="{disabled}" value={computedValue[1]} step={step} min={min} max={max}>
            </div>
        {:else}
            <div class="spectrum-Slider-handle"
                 use:dragAction={{surface, move: v => onDrag(v.x, 1), start: () => onDragStart(1), end: onDragEnd}}
                 class:is-dragged={dragged !== 0} class:is-focused={focused !== 0} style={`left: ${percent}%;`}>
                <input on:focus={onFocus} on:blur={onSliderBlur} on:keydown={onSliderKeyDown}
                       id="{inputId}" type="range" class="spectrum-Slider-input"
                       disabled="{disabled}" value={computedValue} step={step} min={min} max={max}>
            </div>
        {/if}
        {#if isRange || fill !== 'ramp'}
            <div class="spectrum-Slider-track" style={`width: ${track2}%;`}></div>
        {/if}
        {#if !isRange && fill === 'middle'}
            <div class="spectrum-Slider-fill"
                 class:spectrum-Slider-fill--right={percent > 50}
                 style={percent === 50 ? undefined : (percent < 50 ? `left: ${percent}%; width: ${50 - percent}%` : `left: 50%; width: ${percent - 50}%`)}></div>
        {/if}
    </div>
</div>
<style global>
    .spectrum-Slider {
        touch-action: none;
    }

    .spectrum-Textfield-input.spectrum-Slider-value {
        width: 42px;
        height: 15px;
        background: transparent;
    }
</style>
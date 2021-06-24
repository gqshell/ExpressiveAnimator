<script lang="ts">
    import {rgbToHsv, TinyColor} from "@ctrl/tinycolor";
    import {createEventDispatcher} from "svelte";
    import SpColorWheel from "./SpColorWheel.svelte";
    import SpColorArea from "./SpColorArea.svelte";
    import SpAlphaSlider from "./SpAlphaSlider.svelte";
    import {parseColor} from "@zindex/canvas-engine";
    import SpTextField from "./SpTextField.svelte";

    const dispatch = createEventDispatcher();

    export let value: TinyColor;
    export let size: number = 180;
    export let details: boolean = true;
    export let loupe: boolean = false;
    export let mode: 'HEX' | 'RGB' | 'HSL' | 'HSV' = 'HEX';

    let hsva = {h: 0, s: 0, v: 0, a: 1};
    let currentColor: TinyColor;
    let alphaTemplate: string;
    let colorString: string;

    function onColorChange(value: TinyColor) {
        if (!value) {
            return;
        }

        const hsv = value.toHsv();

        hsva.a = hsv.a;

        if (hsv.v === 0 && hsva.v === 0 || hsv.s === 0 && hsva.s === 0) {
            return;
        }

        hsva.h = Math.round(hsv.h);
        hsva.s = Math.round(hsv.s * 100) / 100;
        hsva.v = Math.round(hsv.v * 100) / 100;
    }

    function onChange() {
        const color = new TinyColor(hsva, {format: 'rgb'});
        if (value.toRgbString() !== color.toRgbString()) {
            dispatch('input', color);
        }
    }

    function onColorInput(e) {
        const color = parseColor(e.detail);
        if (color.ok) {
            const hsv = rgbToHsv(color.r, color.g, color.b);
            hsva.a = color.a ?? 1;
            hsva.h = hsv.h * 360;
            hsva.s = hsv.s;
            hsva.v = hsv.v;
            onChange();
        }
    }

    function getColorString(mode: string, color: TinyColor): string {
        switch (mode) {
            case 'RGB':
                return color.toRgbString();
            case 'HSV':
                return color.toHsvString();
            case 'HSL':
                return color.toHslString();
            default:
                return color.a !== 1 ? color.toHex8String(true) : color.toHexString(true);
        }
    }

    $: onColorChange(value);
    $: currentColor = new TinyColor(hsva, {format: 'hsv'});
    $: colorString = details ? getColorString(mode, currentColor) : null;
    $: {
        const rgb = currentColor.toRgb();
        alphaTemplate = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, %alpha)`;
    }
</script>
<div class="color-control">
    <div class="color-control-wheel" style={`--color-control-slider-size: ${size - 2 * 16}px;`}>
        <SpColorWheel on:start on:done on:input={onChange} bind:value={hsva.h} step={1} size={size} loupe={loupe} small>
            <SpColorArea on:start on:done on:input={onChange} bind:hue={hsva.h} bind:saturation={hsva.s} bind:value={hsva.v}
                         loupe={loupe}/>
        </SpColorWheel>
        <SpAlphaSlider on:start on:done on:input={onChange} vertical invert bind:value={hsva.a} colorTemplate={alphaTemplate} small/>
    </div>
    {#if details}
        <div class="color-control-details">
            <SpTextField
                    size="S"
                    on:change={onColorInput}
                    value={colorString}
                    autocomplete="off" spellcheck={false}
            />
            <sp-picker value="{mode}" size="s" on:change={e => mode = e.target.value}>
                <sp-menu-item value="HEX">HEX</sp-menu-item>
                <sp-menu-item value="RGB">RGB</sp-menu-item>
                <sp-menu-item value="HSV">HSV</sp-menu-item>
                <sp-menu-item value="HSL">HSL</sp-menu-item>
            </sp-picker>
        </div>
    {/if}
</div>
<style>
    .color-control {
        display: flex;
        flex-direction: column;
        gap: var(--spectrum-global-dimension-size-125);
    }

    .color-control-wheel {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-around;
        --spectrum-colorslider-vertical-default-length: var(--color-control-slider-size);
    }

    .color-control-details {
        display: flex;
        flex-direction: row;
    }

    :global(.color-control-details .spectrum-Textfield) {
        --spectrum-textfield-border-radius: var(--spectrum-alias-border-radius-regular) 0 0 var(--spectrum-alias-border-radius-regular);
    }

    .color-control-details sp-picker {
        --spectrum-picker-width: var(--spectrum-global-dimension-size-1000);
        --spectrum-picker-border-radius: 0 var(--spectrum-alias-border-radius-regular) var(--spectrum-alias-border-radius-regular) 0;
    }
</style>

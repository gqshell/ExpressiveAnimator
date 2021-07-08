<script lang="ts">
    import "@spectrum-css/textfield/dist/index-vars.css";
    import {hasContext, createEventDispatcher} from "svelte";
    import {mergeClasses, clampStep, formatNumber} from "./utils";
    import type {TShirtSize} from "./utils";
    import SpClearButton from "./SpClearButton.svelte";

    const inputGroup = hasContext('InputGroup');

    const dispatch = createEventDispatcher();

    export let value: string | number = '';
    export let icon: string | null = null;
    export let status: 'none' | 'valid' | 'invalid' = 'none';
    export let size: TShirtSize = 'M';

    export let type: string = 'text';
    export let multiline: boolean = false;
    export let clearable: boolean = false;
    export let placeholder: string | undefined = undefined;
    export let name: string | undefined = undefined;
    export let autocomplete: string | undefined = undefined;
    export let spellcheck: string | undefined = undefined;
    export let readonly: boolean = false;

    export let centerText: boolean = true;
    export let pattern: string | undefined = undefined;
    export let minlength: number | undefined = undefined;
    export let maxlength: number | undefined = undefined;

    export let min: number = 0;
    export let max: number = 100;
    export let step: number = 1;
    export let round: number = null;
    export let digits: number = 4;

    export let quiet: boolean = false;
    export let disabled: boolean = false;
    export let focused: boolean = false;
    export let kbFocused: boolean = false;

    export let tabindex: string = '0';

    export let inputClass: string | undefined = undefined;
    export let clearClass: string | undefined = undefined;

    let computedClass: string,
        computedInputClass: string,
        isNumberInput: boolean,
        isSearchInput: boolean;

    $: computedInputClass = mergeClasses({
        'spectrum-Textfield-input': true,
        'spectrum-InputGroup-input': inputGroup,
    }, inputClass);

    $: isNumberInput = !multiline && type === 'number';
    $: isSearchInput = !multiline && type === 'search';

    let started: boolean = false;

    function onFocus() {
        focused = true;
        dispatch('focus', value);
    }

    function onBlur(e) {
        focused = false;
        started = false;

        let changed: boolean = false;

        if (isNumberInput) {
            const original = e.target.valueAsNumber;
            value = clampStep(original, min, max, round || step);
            if (original !== value) {
                e.target.valueAsNumber = value;
                changed = true;
            }
        } else {
            changed = value.toString() !== e.target.value;
        }

        if (changed) {
            //dispatch('input', value);
            dispatch('change', value);
        }

        dispatch('blur');
    }

    function onInput(e) {
        if (isNumberInput) {
            value = e.target.valueAsNumber;
            if (Number.isNaN(value)) {
                return;
            }
        } else {
            value = e.target.value;
        }
        if (!started) {
            started = true;
            dispatch('start');
        }

        dispatch('input', value);
    }

    function onChange(e) {
        if (isNumberInput) {
            value = clampStep(e.target.valueAsNumber, min, max, round || step);
        }
        if (!started) {
            started = true;
            dispatch('start');
        }

        dispatch('change', value);
    }

    function onKeyUp(e: KeyboardEvent) {
        if (e.key === 'Enter' || e.key === 'Escape') {
            (e.target as HTMLElement).blur();
        }
    }

    function onClear(e) {
        e.preventDefault();
        e.stopPropagation();
        value = null;
        dispatch('clear');
        return false;
    }

    let attributes;

    $: {
        if (isNumberInput) {
            attributes = {pattern, min, max, step};
        } else {
            attributes = {pattern, minlength, maxlength};
        }
    }

    $: computedClass = mergeClasses({
        'spectrum-Textfield': true,
        'spectrum-Textfield--size': size,
        'spectrum-Textfield--quiet': quiet,
        'spectrum-Textfield--multiline': multiline,
        'spectrum-InputGroup-textfield': inputGroup,
        'is-disabled': disabled,
        'is-valid': status === 'valid',
        'is-invalid': status === 'invalid',
        'is-focused': focused,
        'is-keyboardFocused': kbFocused,
        'is-centered': centerText,
    }, $$props.class);
</script>
<div {...$$restProps} class={computedClass}>
    {#if icon}
        <sp-icon size="{size}" name={icon} class="spectrum-Textfield-icon" />
    {/if}
    {#if status === 'valid'}
        <sp-icon name="spectrum-css-icon-Checkmark100" class="spectrum-UIIcon-Checkmark100 spectrum-Textfield-validationIcon"/>
    {/if}
    {#if status === 'invalid'}
        <sp-icon name="spectrum-icon-18-Alert" class="spectrum-Textfield-validationIcon"/>
    {/if}
    {#if multiline}
        <textarea on:focus={onFocus} on:blur={onBlur} on:input={onInput} on:change={onChange}
               value={value} tabindex="{tabindex}"
               class="{computedInputClass}"
               placeholder="{placeholder}" name="{name}" spellcheck="{spellcheck}"
               disabled="{disabled}" readonly={readonly} {...attributes}></textarea>
    {:else}
        <input on:focus={onFocus} on:blur={onBlur} on:input={onInput} on:change={onChange}
               on:keyup={onKeyUp}
               value={isNumberInput ? formatNumber(value, digits) : value} tabindex="{tabindex}"
               class="{computedInputClass}"
               type="{type}" placeholder="{placeholder}" autocomplete="{autocomplete}" spellcheck="{spellcheck}"
               name="{name}" disabled="{disabled}" readonly={readonly} {...attributes}>
    {/if}
    {#if clearable && !focused}
        <SpClearButton on:click={onClear} disabled={disabled} class={clearClass} />
    {/if}
</div>
<style global>
    .spectrum-Textfield.is-centered .spectrum-Textfield-input {
        text-align: center;
    }

    .spectrum-Textfield.spectrum-Textfield--sizeS {
        --spectrum-textfield-m-text-size: var(--spectrum-alias-item-text-size-s);
        --spectrum-textfield-m-height: var(--spectrum-alias-item-height-s);
        --spectrum-textfield-m-padding-left: var(--spectrum-alias-item-padding-s);
        --spectrum-textfield-m-padding-right: var(--spectrum-alias-item-padding-s);
        --spectrum-textfield-m-min-width: var(--spectrum-global-dimension-size-450);
    }

    .spectrum-Textfield.spectrum-Textfield--sizeL {
        --spectrum-textfield-m-text-size: var(--spectrum-alias-item-text-size-l);
        --spectrum-textfield-m-height: var(--spectrum-alias-item-height-l);
        --spectrum-textfield-m-padding-left: var(--spectrum-alias-item-padding-l);
        --spectrum-textfield-m-padding-right: var(--spectrum-alias-item-padding-l);
        --spectrum-textfield-m-min-width: var(--spectrum-global-dimension-size-750);
    }

    .spectrum-Textfield.spectrum-Textfield--sizeXL {
        --spectrum-textfield-m-text-size: var(--spectrum-alias-item-text-size-xl);
        --spectrum-textfield-m-height: var(--spectrum-alias-item-height-xl);
        --spectrum-textfield-m-padding-left: var(--spectrum-alias-item-padding-xl);
        --spectrum-textfield-m-padding-right: var(--spectrum-alias-item-padding-xl);
        --spectrum-textfield-m-min-width: var(--spectrum-global-dimension-size-900);
    }

    input[type="number"].spectrum-Textfield-input::-webkit-outer-spin-button,
    input[type="number"].spectrum-Textfield-input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    /* Firefox */
    input[type="number"].spectrum-Textfield-input {
        -moz-appearance: textfield;
    }
</style>
<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import {clampStep} from "./utils";

    const dispatch = createEventDispatcher();

    export let min: number = 0;
    export let max: number = 100;
    export let step: number = 1;
    export let value: number = 0;
    export let round: number = null;

    let field: HTMLElement;

    let focused: boolean = false;

    function onFocus() {
        focused = true;
        dispatch('focus', value);
    }

    function onBlur(e) {
        checkNum(e.target.value, 'change');
        dispatch('blur', value);
    }

    function onInput(e) {
        checkNum(e.target.value, 'input');
    }

    function onChange(e) {
        checkNum(e.target.value, 'change');
    }

    function checkNum(num: number, event?: string) {
        if (isNaN(num) || !isFinite(num)) {
            return;
        }
        num = clampStep(num, min, max, round ?? step);
        // console.log(num, value, event)
        if (num !== value) {
            value = num;
            if (event) {
                dispatch(event, num);
            }
        }
    }
</script>
<sp-number-field
        {...$$restProps}
        bind:this={field}
        on:input={onInput} on:change={onChange} on:focus={onFocus} on:blur={onBlur}
        value={value} min={min} max={max} step={step}
></sp-number-field>
<style global>
    sp-number-field[size="s"] {
        --spectrum-textfield-height: var(--spectrum-alias-item-height-s);
        --spectrum-textfield-padding-left: var(--spectrum-alias-item-padding-s);
        --spectrum-textfield-padding-right: var(--spectrum-alias-item-padding-s);
    }
    sp-number-field[disabled] {
        pointer-events: none;
        user-select: none;
    }
    sp-number-field[quiet] {
        --spectrum-alias-border-radius-regular: 0;
    }
</style>
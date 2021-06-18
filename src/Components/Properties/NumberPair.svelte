<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import {NumberFieldControl} from "../../Controls";
    import type {PointStruct} from "@zindex/canvas-engine";

    const dispatch = createEventDispatcher();

    export let label: string = '';

    export let value: PointStruct;

    export let proportions: boolean = false;

    export let xTitle: string = undefined;
    export let yTitle: string = undefined;

    export let min: number = Number.MIN_SAFE_INTEGER;
    export let max: number = Number.MAX_SAFE_INTEGER;
    export let step: number = 1;
    export let round: number = 0.01;

    function getData(item: 'x' | 'y', input: number): PointStruct {
        if (input === value[item]) {
            return;
        }

        let data = {x: value.x, y: value.y};

        data[item] = input;

        if (proportions) {
            data[item === 'x' ? 'y' : 'x'] *= input / value[item];
        }

        return data;
    }

    function onInput(item: 'x' | 'y', input: number) {
        value = getData(item, input);
        console.log(value)
    }

    function onChange(item: 'x' | 'y', input: number) {
        value = getData(item, input);
        dispatch('change', value);
    }
</script>
<div class="number-pair-wrapper">
    <sp-field-label>{label}</sp-field-label>
    <div class="number-pair">
        <NumberFieldControl hide-stepper size="s" title={xTitle}
                            on:input={e => onInput('x', e.detail)}
                            on:change={e => onChange('x', e.detail)}
                            style="width: var(--spectrum-global-dimension-size-800)"
                            value={value.x} min={min} max={max} step={step} round={round} />
        <NumberFieldControl hide-stepper size="s" title={yTitle}
                            on:input={e => onInput('y', e.detail)}
                            on:change={e => onChange('y', e.detail)}
                            style="width: var(--spectrum-global-dimension-size-800)"
                            value={value.y} min={min} max={max} step={step} round={round} />
    </div>
    {#if $$slots.default}
        <slot />
    {:else}
        <div class="action-wrapper"></div>
    {/if}
</div>
<style>
    .number-pair-wrapper {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        height: var(--spectrum-global-dimension-size-400);
    }

    .number-pair-wrapper > sp-field-label {
        width: var(--spectrum-global-dimension-size-750);
    }

    .action-wrapper {
        width: var(--spectrum-global-dimension-size-400);
        height: var(--spectrum-global-dimension-size-400);
    }

    .number-pair {
        flex: 1;
        display: flex;
        justify-content: space-around;
        /*gap: var(--spectrum-global-dimension-size-100);*/
    }
</style>

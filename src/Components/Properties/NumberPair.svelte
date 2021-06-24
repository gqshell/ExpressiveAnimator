<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import type {PointStruct} from "@zindex/canvas-engine";
    import SpTextField from "../../Controls/SpTextField.svelte";

    const dispatch = createEventDispatcher();

    export let label: string = '';

    export let value: PointStruct;

    export let proportions: boolean = false;

    export let xTitle: string = undefined;
    export let yTitle: string = undefined;

    export let min: number = Number.MIN_SAFE_INTEGER;
    export let max: number = Number.MAX_SAFE_INTEGER;
    export let step: number = 1;
    export let round: number = 0.0001;

    function getData(item: 'x' | 'y', input: number): PointStruct {
        if (input === value[item]) {
            return value;
        }

        let data = {x: value.x, y: value.y};

        data[item] = input;

        if (proportions) {
            data[item === 'x' ? 'y' : 'x'] *= input / value[item];
        }

        return data;
    }

    function onInput(item: 'x' | 'y', input: number) {
        dispatch('input', getData(item, input));
    }
</script>
<div class="number-pair-wrapper">
    <sp-field-label>{label}</sp-field-label>
    <div class="number-pair">
        <SpTextField
                type="number"
                size="S" style="width: var(--small-control-size)"
                title={xTitle}
                value={value.x} min={min} max={max} step={step} round={round}
                on:input={e => onInput('x', e.detail)}
                on:blur={() => dispatch('done', 'x')}
                on:start={() => dispatch('start', 'x')}
        />
        <SpTextField
                type="number"
                size="S" style="width: var(--small-control-size)"
                title={yTitle}
                value={value.y} min={min} max={max} step={step} round={round}
                on:input={e => onInput('y', e.detail)}
                on:blur={() => dispatch('done', 'y')}
                on:start={() => dispatch('start', 'y')}
        />
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

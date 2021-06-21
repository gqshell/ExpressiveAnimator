<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import {Position} from "@zindex/canvas-engine";
    export let icon: string;

    export let size: number = 50;
    export let radius: number = 4;

    $: half = size / 2 - radius;

    const positions = [Position.Start, Position.Middle, Position.End];
    const dispatch = createEventDispatcher();

    let popover: HTMLElement;

    function onClick(x: Position, y: Position) {
        dispatch('input', {x, y});
        popover.dispatchEvent(new Event('close', {bubbles: true, composed: true}));
    }

</script>
<overlay-trigger placement="left" type="inline">
    <sp-action-button slot="trigger" quiet size="s">
        <sp-icon name={icon} slot="icon"></sp-icon>
    </sp-action-button>
    <sp-popover bind:this={popover} slot="click-content" open tip>
        <svg width={size + radius} height={size + radius} viewBox={`${-radius} ${-radius} ${size} ${size}`}>
            <rect x={0} y={0} width={size - 2 * radius} height={size - 2 * radius} stroke-width="2"/>
            {#each positions as x}
                {#each positions as y}
                    <circle on:click={() => onClick(x, y)} cx="{(x - 1) * half}" cy="{(y - 1) * half}" r={radius} />
                {/each}
            {/each}
        </svg>
    </sp-popover>
</overlay-trigger>
<style>
    sp-popover {
        padding: var(--spectrum-global-dimension-size-100);
    }
    svg rect {
        fill: none;
        stroke: var(--spectrum-global-color-gray-300);
    }
    svg circle {
        stroke: none;
        fill: var(--spectrum-alias-text-color);
        cursor: pointer;
    }

    svg circle:hover {
        fill: var(--spectrum-semantic-cta-color-background-default);
    }
</style>
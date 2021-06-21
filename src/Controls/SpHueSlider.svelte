<script lang="ts">
    import SpColorSliderBase from "./SpColorSliderBase.svelte";

    export let value: number = 0;
    export let step: number = 1;

    export let vertical: boolean = false;
    export let invert: boolean = false;
    export let disabled: boolean = false;
    export let loupe: boolean = false;

    export let small: boolean = false;

</script>
<SpColorSliderBase bind:value on:focus on:blur on:input on:change on:start on:stop
                   vertical={vertical} invert={invert} small={small}
                   color={`hsl(${value}, 100%, 50%)`}
                   gradient="rgb(255, 0, 0), rgb(255, 255, 0), rgb(0, 255, 0), rgb(0, 255, 255), rgb(0, 0, 255), rgb(255, 0, 255), rgb(255, 0, 0)"
                   min={0} max={360} step={step}
                   disabled={disabled} loupe={loupe} />
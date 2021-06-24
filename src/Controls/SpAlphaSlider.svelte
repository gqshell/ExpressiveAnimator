<script lang="ts">
    import SpColorSliderBase from "./SpColorSliderBase.svelte";

    export let value: number = 0;
    export let step: number = 0.01;
    export let small: boolean = false;

    export let vertical: boolean = false;
    export let invert: boolean = false;
    export let disabled: boolean = false;

    export let colorTemplate: string = 'rgba(0, 0, 0, %alpha)';

    function getColor(template: string, alpha: number): string {
        return template.replace('%alpha', alpha.toString());
    }

</script>
<SpColorSliderBase bind:value on:focus on:blur on:input on:change on:start on:done
                   vertical={vertical} invert={invert} small={small}
                   color={getColor(colorTemplate, value)} gradient={`${getColor(colorTemplate, 0)} 0%, ${getColor(colorTemplate, 1)} 100%`}
                   min={0} max={1} step={step}
                   disabled={disabled} />
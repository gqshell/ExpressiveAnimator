<script lang="ts">
    import {PropertyNameMap} from "../Mapping";
    import SVGIcon from "../SVGIcon.svelte";

    export let name: string;
    export let property: string;
    export let disabled: boolean = false;

    $: title = ((name in PropertyNameMap) ? PropertyNameMap[name][property] : false) || 'Unknown';
</script>
<div class="timeline-item" class:is-disabled={disabled}>
    <span>{title}</span>
</div>
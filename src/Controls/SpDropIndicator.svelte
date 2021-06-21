<script lang="ts">
    import "@spectrum-css/dropindicator/dist/index-vars.css";
    import {mergeClasses} from "./utils";

    export let vertical: boolean = false;

    $: computedClass = mergeClasses({
        'spectrum-DropIndicator': true,
        'spectrum-DropIndicator--': vertical ? 'vertical' : 'horizontal',
    }, $$props.class);
</script>
<div {...$$restProps} class={computedClass}><slot/></div>
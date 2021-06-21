<script lang="ts">
    import {mergeClasses} from "./utils";
    // import "@spectrum-css/button/dist/index-vars.css";
    export let disabled: boolean = false;
    export let variant: 'overBackground' | null = null;
    export let small: boolean = false;

    $: iconSize = small ? 75 : 100;

    $: computedClass = mergeClasses({
        'spectrum-ClearButton': true,
        'spectrum-ClearButton--small': small,
        'spectrum-ClearButton--': variant,
    }, $$props.class);
</script>
<button on:click on:focus on:blur on:pointerdown on:pointerup
        {...$$restProps} class={computedClass} disabled="{disabled}">
    <sp-icon name={`spectrum-css-icon-Cross${iconSize}`} class={`spectrum-UIIcon-Cross${iconSize}`}/>
</button>
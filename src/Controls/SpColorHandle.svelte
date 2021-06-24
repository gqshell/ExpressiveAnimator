<script lang="ts">
    import "@spectrum-css/colorhandle/dist/index-vars.css";
    import {mergeClasses, dragAction} from "./utils";
    import {createEventDispatcher} from "svelte";
    import SpColorLoupe from "./SpColorLoupe.svelte";

    const dispatch = createEventDispatcher();

    export let disabled: boolean = false;
    export let open: boolean = false;
    export let loupe: boolean = false;
    export let color: string = 'transparent';
    export let dragOptions = null;

    export let element = undefined;

    let focused: boolean = false;

    function onFocus(e) {
        focused = true;
        dispatch('focus', e);
    }
    function onBlur(e) {
        focused = false;
        dispatch('blur', e);
    }
    function onKeyDown(e: KeyboardEvent) {
        if (focused) {
            if (e.key === 'Escape' || e.key === 'Enter') {
                e.preventDefault();
                (e.target as HTMLElement).blur();
            } else if (e.key.indexOf('Arrow') === 0) {
                e.preventDefault();
                dispatch('arrow', e.key);
            }
        }
    }

    $: computedClass = mergeClasses({
        'spectrum-ColorHandle': true,
        'is-disabled': disabled,
        'is-focused': focused,
    }, $$props.class);
</script>
<div {...$$restProps} class={computedClass} bind:this={element}
     on:focus={onFocus} on:blur={onBlur} on:keydown={onKeyDown} on:pointerdown use:dragAction={dragOptions}>
    <div class="spectrum-ColorHandle-color" style={`background-color: ${color};`}></div>
    {#if loupe && !disabled}
        <div class="spectrum-ColorLoupe--wrapper">
            <SpColorLoupe color={color} open={focused || open}/>
        </div>
    {/if}
</div>
<style global>
    .spectrum-ColorHandle > .spectrum-ColorLoupe--wrapper {
        position: absolute;
        left: 50%;
        top: 50%;
    }
    .spectrum-ColorHandle.is-focused, .spectrum-ColorHandle.focus-ring {
        outline: none !important;
    }
</style>
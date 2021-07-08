<script lang="ts">
    import {getElementIcon, getElementTitle} from "../Mapping";
    import type {Element} from "@zindex/canvas-engine";
    import {createEventDispatcher} from "svelte";

    const dispatch = createEventDispatcher();

    export let element: Element;
    export let disabled: boolean = false;
    export let selected: boolean = false;
</script>
<div class="timeline-item is-alt timeline-element-item"
     on:click={e => dispatch('select', {element, multiple: e.shiftKey})}
     class:is-disabled={disabled}
     class:is-selected={selected}>
    <sp-icon name={getElementIcon(element)} size="s"></sp-icon>
    <span class="timeline-element-title">{getElementTitle(element)}</span>
<!--    <sp-action-button class="very-small" quiet size="s">-->
<!--        <sp-icon name="expr:player-reverseplay" size="s"></sp-icon>-->
<!--    </sp-action-button>-->
</div>
<style global>
    .timeline-element-item {
        padding: 0 var(--spectrum-global-dimension-size-100);
    }

    .timeline-element-item > sp-icon {
        margin: 0 var(--spectrum-global-dimension-size-100);
    }

    .timeline-element-item > span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1;
    }
</style>
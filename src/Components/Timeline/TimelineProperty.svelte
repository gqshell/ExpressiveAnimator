<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import type {AnimatedProperty} from "../../Stores";

    const dispatch = createEventDispatcher();

    export let animated: AnimatedProperty;
    export let selected: boolean = false;
    export let selectedKeyframes: boolean = false;
</script>
<div class="timeline-item timeline-property-item" class:is-disabled={animated.animation.disabled} class:is-selected={selected}>
<!--    <sp-action-button class="very-small" quiet size="s" on:click={() => dispatch('disabled', !disabled)}>-->
<!--        <sp-icon name="workflow:Visibility" size="s"></sp-icon>-->
<!--    </sp-action-button>-->
    <span on:click={e => dispatch('selectAnimationKeyframes', {animation: animated.animation, multiple: e.shiftKey})} class:is-selected={selectedKeyframes}>{animated.animator.title}</span>
    <sp-action-button title="Add keyframe" disabled={animated.animation.disabled} on:click={() => dispatch('add', animated)} class="very-small" quiet size="s">
        <sp-icon name="workflow:AddCircle" slot="icon" size="s"></sp-icon>
    </sp-action-button>
</div>
<style>
    .timeline-property-item {
        padding: 0 var(--spectrum-global-dimension-size-100);
    }

    .timeline-property-item > span {
        margin-left: var(--spectrum-global-dimension-size-400);
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1;
    }

    .timeline-property-item > span.is-selected {
        color: var(--spectrum-global-color-blue-500);
    }
</style>
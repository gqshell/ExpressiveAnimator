<script lang="ts">
    import TimelineElement from "./TimelineElement.svelte";
    import TimelineProperty from "./TimelineProperty.svelte";
    import {createEventDispatcher} from "svelte";
    import type {AnimatedElement} from "../../Stores";
    import type {KeyframeSelection} from "../../Core";

    const dispatch = createEventDispatcher();

    export let animated: AnimatedElement;

    export let selected: boolean = false;
    export let selection: KeyframeSelection;
</script>
<TimelineElement
        on:select
        selected={selected}
        element={animated.element}
/>
{#each animated.animatedProperties as animatedProperty (animatedProperty.animator.id)}
    <TimelineProperty
            on:add
            on:selectAnimationKeyframes
            selected={selected}
            animated={animatedProperty}
            selectedKeyframes={selection.animationHasSelectedKeyframes(animatedProperty.animation)}
    />
{/each}
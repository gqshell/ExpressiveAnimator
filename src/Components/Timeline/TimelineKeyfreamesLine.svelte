<script lang="ts">
    import type {Animation, Keyframe, KeyframeSelection} from "../../Core";
    import TimelineKeyframe from "./TimelineKeyframe.svelte";
    import TimelineEasing from "./TimelineEasing.svelte";
    import {CurrentKeyframeSelection} from "../../Stores";
    import {createEventDispatcher} from "svelte";

    const dispatch = createEventDispatcher();

    export let animation: Animation<any> = undefined;
    export let moving: boolean = false;
    export let renderId: number = 1;

    let keyframes: Keyframe<any>[];
    $: keyframes = getKeyframes(animation, moving, $CurrentKeyframeSelection, renderId);

    function getKeyframes(animation: Animation<any>, moving: boolean, selection: KeyframeSelection, junk?): Keyframe<any>[] {
        return moving && selection.animationHasSelectedKeyframes(animation) ? animation.sortedKeyframes : animation.keyframes;
    }
</script>
{#each keyframes as keyframe, index (keyframe.id)}
    <TimelineKeyframe
            on:pointerdown={event => dispatch('keyframe', {event, keyframe})}
            selected={$CurrentKeyframeSelection.isKeyframeSelected(keyframe)}
            id={keyframe.id}
            offset={keyframe.offset} />
    <TimelineEasing
            on:pointerdown={event => dispatch('easing', {event, keyframe})}
            selected={$CurrentKeyframeSelection.areKeyframesSelected(keyframe, keyframes[index + 1])}
            start={keyframe.offset}
            end={keyframes[index + 1]?.offset}
    />
{/each}




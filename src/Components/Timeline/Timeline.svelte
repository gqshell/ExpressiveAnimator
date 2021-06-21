<script lang="ts">
    import TimelineItem from "./TimelineItem.svelte";
    import Keyframe from "./Keyframe.svelte";
    import Easing from "./Easing.svelte";
    // import LocalMarker from "./LocalMarker.svelte";
    import Element from "./Element.svelte";
    import Property from "./Property.svelte";
    // import SelectionRect from "./SelectionRect.svelte";
    import {CurrentDocumentAnimation, CurrentProject} from "../../Stores";
    import type {DocumentAnimation, AnimationProject} from "../../Core";

    export let scrollTop: number = 0;
    export let scrollLeft: number = 0;

    $: animatedElements = mapAnimations($CurrentProject, $CurrentDocumentAnimation);

    /* Scroll sync Y */
    let leftPane: HTMLElement;
    let rightPane: HTMLElement;
    let isScrollingTop: boolean = false;
    let prevScrollTop = scrollTop;
    const onScroll = e => {
        if (isScrollingTop) {
            e.preventDefault();
            return;
        }
        isScrollingTop = true;
        const el = e.target as HTMLElement;

        const top = el.scrollTop;
        if (top !== prevScrollTop) {
            (el === rightPane ? leftPane : rightPane).scrollTop = top;
            scrollTop = prevScrollTop = top;
        } else if (el === rightPane) {
            scrollLeft = rightPane.scrollLeft;
            //rightPane.scrollWidth
        }
        isScrollingTop = false;
    };

    function mapAnimations(project: AnimationProject, documentAnimation: DocumentAnimation | null) {
        if (!project || !documentAnimation) {
            return [];
        }
        const animators = project.animatorSource;

        const list = [];

        let element, properties, animation, property, animator;
        for ([element, properties] of documentAnimation.getAnimatedElements()) {
            const animations = [];

            for ([property, animation] of Object.entries(properties)) {
                animator = animators.getAnimator(element, property);
                animations.push({
                    title: animator.title,
                    property,
                    animation,
                })
            }

            list.push({element, animations});
        }

        return list;
    }
</script>
<div class="timeline">
    <div bind:this={leftPane} on:scroll={onScroll} class="timeline-elements scroll scroll-invisible scroll-no-padding" hidden-x>
        {#each animatedElements as animated}
            <Element title={animated.element.title} type={animated.element.type} />
            {#each animated.animations as animationObject}
                <Property title={animationObject.title} property={animationObject.property} disabled={animationObject.animation.disabled}/>
            {/each}
        {/each}
    </div>
    <div bind:this={rightPane} on:scroll={onScroll} class="timeline-keyframes scroll scroll-no-hide scroll-no-padding">
        <div class="timeline-items-wrapper">
            {#each animatedElements as animated}
                <TimelineItem>
                    <!--                <LocalMarker label="This is a marker" color="celery" offset={0} length={120} lines={3} />-->
                </TimelineItem>
                {#each animated.animations as animationObject}
                    <TimelineItem keyframes={true} disabled={animationObject.animation.disabled}>
                        {#each animationObject.animation.keyframes as keyframe, index}
                            <Keyframe offset={keyframe.offset} />
                            <Easing start={keyframe.offset} end={animationObject.animation.keyframes[index + 1]?.offset} />
                        {/each}
                    </TimelineItem>
                {/each}
            {/each}
        </div>

<!--        <SelectionRect />-->
        <div class="timeline-play-line"></div>
    </div>
</div>
<style global>
    .timeline {
        flex: 1;
        display: flex;
        flex-direction: row;
        min-height: 0;

        --timeline-item-height: 23px;
        --timeline-keyframe-size: 13px;

        background: var(--spectrum-global-color-gray-100);
    }

    .timeline, .timeline * {
        box-sizing: border-box;
    }

    .timeline > .timeline-elements {
        width: 240px;
        border-right: 1px solid var(--separator-color);
        border-bottom: var(--scrollbar-width) solid transparent;
    }

    .timeline > .timeline-keyframes {
        position: relative;
        flex: 1;
    }

    .timeline > .timeline-keyframes > .timeline-items-wrapper {
        position: relative;
        min-width: 100%;
        /* this gives the width */
        width: calc(var(--timeline-max-offset) * var(--timeline-ms-unit));
    }

    .timeline > .timeline-keyframes > .timeline-play-line {
        z-index: 5;
        --timeline-play-line-size: 1px;
        width: var(--timeline-play-line-size);
        user-select: none;
        pointer-events: none;
        position: absolute;
        top: var(--timeline-scroll-top);
        bottom: calc(0px - var(--timeline-scroll-top));
        left: calc(calc(var(--timeline-keyframe-size) - var(--timeline-play-line-size)) / 2);
        transform: translateX(calc(var(--timeline-play-offset) * var(--timeline-ms-unit)));
        background: var(--spectrum-global-color-blue-500);
        will-change: top, bottom, transform;
    }
</style>
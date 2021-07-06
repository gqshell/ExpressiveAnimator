<script lang="ts">
    import TimelineItem from "./TimelineItem.svelte";
    // import TimelineLocalMarker from "./TimelineLocalMarker.svelte";
    import TimelineSelectionRect from "./TimelineSelectionRect.svelte";
    import TimelineElementWrapper from "./TimelineElementWrapper.svelte";
    import TimelineKeyfreamesLine from "./TimelineKeyfreamesLine.svelte";
    import {
        CurrentProject,
        CurrentTime,
        CurrentSelection,
        CurrentKeyframeSelection,
        CurrentAnimatedElements,
        ShowOnlySelectedElementsAnimations,
        notifySelectionChanged,
        notifyKeyframeSelectionChanged,
        notifyPropertiesChanged,
    } from "../../Stores";
    import type {AnimatedProperty} from "../../Stores";
    import type {Element} from "@zindex/canvas-engine";
    import type {Animation, Keyframe} from "../../Core";
    import {getRoundedDeltaTimeByX, getXAtTime} from "./utils";
    import {MouseButton, Point, Rectangle} from "@zindex/canvas-engine";

    export let zoom: number = 1;
    export let scaleFactor: number = 1;
    export let scrollTop: number = 0;
    export let scrollLeft: number = 0;
    export let disabled: boolean = false;

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

    let selectionRect: Rectangle = null;
    let selectionRectPivot = null;

    let reRender: number = 1;
    let deselectKeyframe: Keyframe<any> = null;
    let startKeyframe: Keyframe<any> = null;
    let startOffset: number = 0;
    let positionDelta: number = 0;
    let isMoving: boolean = false;
    let position: number = 0;
    let currentSelectionData: { animations: Set<Animation<any>>, keyframes: Set<Keyframe<any>> } = null;

    function getTimelinePoint(e: PointerEvent): Point {
        return new Point(
            e.clientX - rightPane.offsetLeft + rightPane.scrollLeft,
            e.clientY - rightPane.offsetTop + rightPane.scrollTop
        );
    }

    function onTimelinePointerDown(e: PointerEvent) {
        const target = e.target as HTMLElement;
        if (target.classList.contains('timeline-keyframe') ||
            target.classList.contains('timeline-easing')) {
            return;
        }

        // if ((e.clientX - rightPane.offsetWidth - rightPane.offsetLeft > rightPane.clientWidth - rightPane.offsetWidth) ||
        //     (e.clientY - rightPane.offsetHeight - rightPane.offsetTop > rightPane.clientHeight - rightPane.offsetHeight)) {

        if ((e.clientX - rightPane.offsetLeft > rightPane.clientWidth) ||
            (e.clientY - rightPane.offsetTop > rightPane.clientHeight)) {
            // click on scrollbar
            return;
        }

        if ($CurrentKeyframeSelection.clear()) {
            notifyKeyframeSelectionChanged();
        }

        selectionRectPivot = getTimelinePoint(e);

        rightPane.addEventListener('pointermove', onTimelinePointerMove);
        rightPane.addEventListener('pointerup', onTimelinePointerUp);
        rightPane.setPointerCapture(e.pointerId);
    }

    function onTimelinePointerMove(e: PointerEvent) {
        selectionRect = Rectangle.fromPoints(selectionRectPivot, getTimelinePoint(e));
    }

    function* getKeyframeIdsFromRect(pane: HTMLElement, rect: Rectangle): Generator<string> {
        if (!rect || !rect.isVisible) {
            return;
        }

        for (const element of pane.querySelectorAll('.timeline-keyframe') as NodeListOf<HTMLElement>) {
            const bounds = element.getBoundingClientRect();
            if (rect.contains(bounds.x + pane.scrollLeft - pane.offsetLeft + bounds.width / 2, bounds.y + pane.scrollTop - pane.offsetTop + bounds.height / 2)) {
                yield element.getAttribute('data-keyframe-id');
            }
        }
    }

    function onTimelinePointerUp(e: PointerEvent) {
        rightPane.removeEventListener('pointermove', onTimelinePointerMove);
        rightPane.removeEventListener('pointerup', onTimelinePointerUp);
        rightPane.releasePointerCapture(e.pointerId);

        if ($CurrentKeyframeSelection.selectKeyframeIds(getKeyframeIdsFromRect(rightPane, selectionRect))) {
            notifyKeyframeSelectionChanged();
        }

        selectionRectPivot = null;
        selectionRect = null;
    }

    function prepareMove(e: PointerEvent, keyframe: Keyframe<any>) {
        rightPane.addEventListener('pointermove', onKeyframePointerMove);
        rightPane.addEventListener('pointerup', onKeyframePointerUp);
        rightPane.setPointerCapture(e.pointerId);

        position = e.clientX;
        isMoving = false;

        startKeyframe = keyframe;
        startOffset = keyframe.offset;
        positionDelta = getXAtTime(keyframe.offset, scrollLeft, zoom) + rightPane.offsetLeft - position;
    }

    function destroyMove(e: PointerEvent) {
        rightPane.removeEventListener('pointermove', onKeyframePointerMove);
        rightPane.removeEventListener('pointerup', onKeyframePointerUp);
        rightPane.releasePointerCapture(e.pointerId);
        deselectKeyframe = null;
        currentSelectionData = null;
        startKeyframe = null;
        isMoving = false;
    }

    function onEasingPointerDown(e: PointerEvent, element: Element, info: AnimatedProperty, keyframe: Keyframe<any>) {
        if (e.button !== MouseButton.Left) {
            return;
        }

        const index = info.animation.getIndexOfKeyframe(keyframe);
        const next = index === -1 ? null : info.animation.getKeyframeAtIndex(index + 1);

        const selection = $CurrentKeyframeSelection;

        if (!selection.areKeyframesSelected(keyframe, next)) {
            if (!e.shiftKey) {
                selection.clear();
            }
            selection.selectKeyframe(keyframe, true);
            if (next) {
                selection.selectKeyframe(next, true);
            }
            notifyKeyframeSelectionChanged();
        }

        prepareMove(e, keyframe);
    }

    function onKeyframePointerDown(e: PointerEvent, element: Element, info: AnimatedProperty, keyframe: Keyframe<any>) {
        if (e.button !== MouseButton.Left) {
            return;
        }
        if ($CurrentKeyframeSelection.selectKeyframe(keyframe, e.shiftKey)) {
            notifyKeyframeSelectionChanged();
        } else if (e.shiftKey) {
            deselectKeyframe = keyframe;
        }
        prepareMove(e, keyframe);
    }

    function getKeyframeMoveDelta(x: number): number {
        return getRoundedDeltaTimeByX(x, startKeyframe.offset, zoom, scaleFactor);
    }

    function onKeyframePointerMove(e: PointerEvent) {
        const delta = getKeyframeMoveDelta(e.clientX - position);

        if (delta === 0) {
            return;
        }

        position = rightPane.offsetLeft + getXAtTime(startKeyframe.offset + delta, rightPane.scrollLeft, zoom) - positionDelta;

        if (!isMoving) {
            isMoving = true;
            currentSelectionData = $CurrentKeyframeSelection.resolveSelectedKeyframes();
        }

        for (const k of currentSelectionData.keyframes) {
            k.offset += delta;
        }

        // re-eval
        const project = $CurrentProject;
        if (project.middleware.updateAnimations(currentSelectionData)) {
            project.engine?.invalidate();
            notifyPropertiesChanged();
        }

        // force update of keyframe offsets
        reRender++;
    }

    function onKeyframePointerUp(e: PointerEvent) {
        if (isMoving && startOffset !== startKeyframe.offset) {
            const project = $CurrentProject;

            // changed
            for (const animation of currentSelectionData.animations) {
                animation.fixKeyframes(currentSelectionData.keyframes);
            }

            if (project.middleware.updateAnimatedProperties(project.document)) {
                project.engine?.invalidate();
            }

            snapshot();
        } else if (!isMoving && deselectKeyframe != null) {
            if ($CurrentKeyframeSelection.deselectKeyframe(deselectKeyframe)) {
                notifyKeyframeSelectionChanged();
            }
        }

        destroyMove(e);
    }

    function onAddKeyframe(e: CustomEvent<AnimatedProperty>) {
        if (disabled) {
            return;
        }

        const time = $CurrentTime;
        if (e.detail.animation.getKeyframeAtOffset(time) == null) {
            const keyframe = e.detail.animation.addKeyframeAtOffset(time, null);
            $CurrentKeyframeSelection.clear();
            $CurrentKeyframeSelection.selectKeyframe(keyframe);
            snapshot();
        }
    }

    function onElementSelect(e: CustomEvent<{ element: Element, multiple: boolean }>) {
        if (disabled) {
            return;
        }
        if ($CurrentSelection.toggle(e.detail.element, e.detail.multiple)) {
            $CurrentProject.engine?.invalidate();
            notifySelectionChanged();
        }
    }

    function onSelectAnimationKeyframes(e: CustomEvent<{ animation: Animation<any>, multiple: boolean }>) {
        if ($CurrentKeyframeSelection.selectMultipleKeyframes(e.detail.animation.keyframes, e.detail.multiple)) {
            notifyKeyframeSelectionChanged();
        }
    }

    function snapshot() {
        $CurrentProject.state.snapshot();
        $CurrentProject.engine.invalidate();
    }

    $: if ($ShowOnlySelectedElementsAnimations && $CurrentKeyframeSelection.deselectUnselectedElements($CurrentSelection)) {
        notifyKeyframeSelectionChanged();
    }
</script>
<div class="timeline">
    <div bind:this={leftPane} on:scroll={onScroll} class="timeline-elements scroll scroll-invisible scroll-no-padding" hidden-x>
        {#each $CurrentAnimatedElements as animated (animated.element.id)}
            <TimelineElementWrapper
                    animated={animated}
                    selected={$CurrentSelection.isSelected(animated.element)}
                    selection={$CurrentKeyframeSelection}
                    on:select={onElementSelect}
                    on:add={onAddKeyframe}
                    on:selectAnimationKeyframes={onSelectAnimationKeyframes}
            />
        {/each}
    </div>
    <div bind:this={rightPane} on:scroll={onScroll} on:pointerdown={onTimelinePointerDown}
         class="timeline-keyframes scroll scroll-no-hide scroll-no-padding">
        <div class="timeline-items-wrapper">
            {#each $CurrentAnimatedElements as animated}
                <TimelineItem isAlt={true}>
<!--                  <TimelineLocalMarker label="This is a marker" color="seafoam" offset={300} length={1200} lines={animated.animations.length + 1} />-->
                </TimelineItem>
                {#each animated.animatedProperties as animatedProperty}
                    <TimelineItem keyframes={true} disabled={animatedProperty.animation.disabled}>
                        <TimelineKeyfreamesLine
                                on:keyframe={e => onKeyframePointerDown(e.detail.event, animated.element, animatedProperty, e.detail.keyframe)}
                                on:easing={e => onEasingPointerDown(e.detail.event, animated.element, animatedProperty, e.detail.keyframe)}
                                animation={animatedProperty.animation}
                                moving={isMoving}
                                renderId={reRender}
                        />
                    </TimelineItem>
                {/each}
            {/each}
        </div>
        <TimelineSelectionRect rect={selectionRect} />
        <div class="timeline-play-line"></div>
    </div>
</div>
<style global>
    .timeline {
        flex: 1;
        display: flex;
        flex-direction: row;
        min-height: 0;

        --timeline-item-height: var(--spectrum-alias-item-height-s);
        --timeline-keyframe-size: calc(var(--timeline-item-height) / 2 + 1px);

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
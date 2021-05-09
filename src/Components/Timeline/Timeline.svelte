<script lang="ts">
    import TimelineItem from "./TimelineItem.svelte";
    import type {Animation} from "@zindex/canvas-engine";
    import Keyframe from "./Keyframe.svelte";
    import Easing from "./Easing.svelte";
    import LocalMarker from "./LocalMarker.svelte";

    export let playOffset: number;
    export let playOffsetMax: number;
    export let scrollTop: number = 0;
    export let scrollLeft: number = 0;

    export let animations: Animation<any>[] = [];
    export let selected: Animation<any>[] = [];

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
</script>
<div class="timeline">
    <div bind:this={leftPane} on:scroll={onScroll} class="timeline-elements scroll scroll-invisible scroll-no-padding" hidden-x>
        <TimelineItem selected disabled>
            {scrollTop} - {scrollLeft}
        </TimelineItem>
        <TimelineItem disabled>
            Position X
        </TimelineItem>
    </div>
    <div bind:this={rightPane} on:scroll={onScroll} class="timeline-keyframes scroll scroll-no-hide scroll-no-padding">
        <div class="timeline-items-wrapper">
            <TimelineItem>
<!--                <LocalMarker label="This is a marker" color="celery" offset={0} length={120} lines={3} />-->
            </TimelineItem>
            <TimelineItem keyframes={true}>
                <Keyframe offset={0} />
                <Keyframe offset={120} />
                <Keyframe offset={720} />

                <Easing start={0} end={120} />
                <Easing start={120} end={720} />
            </TimelineItem>
        </div>

        <div class="timeline-play-line"></div>
        <div class="timeline-selection-rect" style="top: 100px; left: 400px; width: 200px; height: 150px;"></div>
    </div>
</div>
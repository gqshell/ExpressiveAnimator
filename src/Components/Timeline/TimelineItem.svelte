<script lang="ts">
    export let disabled: boolean = false;
    export let selected: boolean = false;
    export let keyframes: boolean = false;
    export let isAlt: boolean = false;
</script>
<div class="timeline-item"
     class:has-keyframes={keyframes}
     class:is-alt={isAlt}
     class:is-disabled={disabled}
     class:is-selected={selected}>
    {#if keyframes}
        <div class="timeline-keyframes-line"></div>
    {/if}
    <slot/>
</div>
<style global>
    .timeline-item {
        height: var(--timeline-item-height);
        max-height: var(--timeline-item-height);

        display: flex;
        flex-direction: row;
        align-items: center;
        /*background: var(--spectrum-global-color-gray-75);*/
    }

    .timeline-item.is-selected {
        background: var(--spectrum-alias-background-color-hover-overlay);
    }

    .timeline-item.is-alt {
        /*background: var(--spectrum-global-color-gray-100);*/
    }

    /*.timeline-item.is-selected {*/
    /*    background: var(--spectrum-semantic-cta-color-background-default);*/
    /*}*/

    .timeline-item.is-disabled {

    }

    .timeline-item.has-keyframes {
        position: relative;
        min-width: 100%;
        padding-left: calc(var(--timeline-keyframe-size) / 2);
    }

    .timeline-item > .timeline-keyframes-line {
        width: 100%;
        height: 1px;
        position: absolute;
        left: 0;
        top: 50%;
        background: var(--spectrum-global-color-gray-400);
        user-select: none;
        pointer-events: none;
    }
</style>
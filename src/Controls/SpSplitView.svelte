<script lang="ts">
    import {tick} from "svelte";

    let collapsedEnd: boolean = false;
    let collapsedStart: boolean = false;

    async function fixSplitter(e) {
        await tick();
        const splitter = (e.target as {splitter: HTMLElement}).splitter;
        if (!splitter) {
            return;
        }

        collapsedStart = splitter.classList.contains('is-collapsed-start');
        collapsedEnd = splitter.classList.contains('is-collapsed-end');

        e.target.shadowRoot.getElementById('gripper')?.style.display = (collapsedStart || collapsedEnd) ? 'block' : 'none';
    }
</script>
<sp-split-view
        {...$$restProps}
        on:change={fixSplitter}
        class:is-collapsed={collapsedEnd || collapsedStart}>
    <slot collapsed={collapsedStart} name="primary" />
    <slot collapsed={collapsedEnd} name="secondary" />
</sp-split-view>
<style>
    sp-split-view {
        --splitview-gripper-display: none;
    }
    sp-split-view.is-collapsed {
        --splitview-gripper-display: block;
        --spectrum-dragbar-handle-background-color: var(--spectrum-global-color-gray-500);
        --spectrum-dragbar-handle-background-color-hover: var(--spectrum-global-color-gray-500);
    }
</style>
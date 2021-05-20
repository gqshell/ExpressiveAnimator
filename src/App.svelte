<script context="module">
    const ToolbarRegionUpButtons = [
        {
            tool: 'pan',
            icon: 'expr:pan-tool',
            title: 'Pan Tool'
        },
        {
            tool: 'selection',
            icon: 'expr:selection-tool',
            title: 'Selection Tool'
        },
        [
            {
                tool: 'rectangle-tool',
                icon: 'expr:rectangle-tool',
                title: 'Rectangle Tool'
            },
            {
                tool: 'polygon-tool',
                icon: 'expr:polygon-tool',
                title: 'Polygon Tool'
            },
            {
                tool: 'star-tool',
                icon: 'expr:star-tool',
                title: 'Star Tool'
            },
            {
                tool: 'line-tool',
                icon: 'expr:line-tool',
                title: 'Line Tool'
            },
        ]
    ];
</script>
<script lang="ts">
    import {TimelinePlayOffset} from "./Stores";
    import ToolbarRegionUp from "./Components/ToolbarRegionUp.svelte";
    import Timeline from "./Components/Timeline/index.svelte";
    import {project, doc, animationManager} from "./doc1";

    import {CanvasStateTool} from "./Stores";
    import Canvas from "./Components/Canvas.svelte";


    let themeLight = false;



</script>
<sp-icons-medium></sp-icons-medium>
<sp-theme scale="medium" color={themeLight ? 'light' : 'dark'} class="app">
    <div style="grid-area: menubar">
        {$CanvasStateTool}
    </div>
    <div class="toolbar">
        <ToolbarRegionUp bind:selected={$CanvasStateTool} buttons={ToolbarRegionUpButtons} />
        <div>down</div>
    </div>
    <sp-split-view style="grid-area: sidebar" resizable vertical primary-min="380" primary-size="75%">
        <div class="scroll" hidden-x>
            <sp-button on:click={() => themeLight = !themeLight}>Change theme</sp-button>
        </div>
        <div class="scroll" hidden-x>
            tree
        </div>
    </sp-split-view>
    <sp-split-view class="content" resizable vertical
            primary-size="80%"
            secondary-min="0"
            secondary-max="600">
        <Canvas project={project} />
        <Timeline animationManager={animationManager} playOffset={$TimelinePlayOffset} />
    </sp-split-view>
</sp-theme>
<style>
    .app {
        display: grid;
        grid-gap: 0;
        margin: 0;
        padding: 0;
        box-sizing: border-box;

        background: var(--spectrum-global-color-gray-75);
        color: var(--spectrum-global-color-gray-800);

        width: 100%;
        height: 100%;

        grid-template-areas:
                'menubar menubar sidebar'
                'toolbar content sidebar'
        ;
        grid-template-rows: 56px auto;
        grid-template-columns: 56px auto 280px;

        --scrollbar-width: 6px;
        --scrollbar-radius: 0px;
        --scrollbar-color: var(--spectrum-global-color-gray-300);
    }

    .app div {
        box-sizing: border-box;
    }

    .toolbar {
        grid-area: toolbar;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
    }

    .content {
        box-sizing: border-box;

        grid-area: content;
        border: var(--spectrum-global-dimension-static-size-25) solid var(--spectrum-global-color-gray-300);
        border-bottom: none;
    }

</style>
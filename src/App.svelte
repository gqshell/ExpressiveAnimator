<script lang="ts">
    import ToolsComponent from "./Components/Tools";
    import CanvasComponent from "./Components/Canvas.svelte";
    import TimelineComponent from "./Components/Timeline";
    import MenuComponent from "./Components/Menu.svelte";
    import ProjectStateComponent from "./Components/MenuBar/ProjectState.svelte";
    import AlignSelectionComponent from "./Components/MenuBar/AlignSelection.svelte";
    import TreeComponent from "./Components/Tree";
    import PropertiesComponent from "./Components/Properties";

    import {NumberFieldControl} from "./Controls";

    import {CurrentTheme, CurrentProject, CurrentTime, CurrentMaxTime} from "./Stores";

    let hidden = false;

</script>
<sp-icons-medium></sp-icons-medium>
<sp-theme scale="medium" color={$CurrentTheme} class="app">
    <div class="logo">
        <MenuComponent />
    </div>
    <div class="menubar">
        <ProjectStateComponent />
        <div>
            {$CurrentTime}
            <NumberFieldControl quiet hide-stepper style="width: 64px" bind:value={$CurrentTime} min={0} max={100000} step={0.01} />
        </div>
        <div>
            <sp-button size="s" on:click={CurrentTheme.toggle}>Change theme</sp-button>
            <sp-button size="s" on:click={() => hidden = !hidden}>Toggle visibility</sp-button>
        </div>
        <AlignSelectionComponent />
    </div>
    <div class="toolbar">
        <ToolsComponent disabled={$CurrentProject == null} />
        <div>down</div>
    </div>
    <sp-split-view class="sidebar" resizable vertical primary-min="380" primary-size="75%">
        <PropertiesComponent />
        <TreeComponent />
    </sp-split-view>
    <sp-split-view
            class="content" resizable vertical
            primary-size="80%"
            secondary-min="0"
            secondary-max="600">
        <CanvasComponent hidden={hidden}>Now canvas is hidden and this is the fallback content</CanvasComponent>
        <TimelineComponent />
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
                'logo menubar menubar'
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

    .logo {
        grid-area: logo;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        user-select: none;
    }

    .menubar {
        grid-area: menubar;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        user-select: none;
    }

    .toolbar {
        grid-area: toolbar;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        user-select: none;
    }

    .sidebar {
        grid-area: sidebar;
        user-select: none;
        box-sizing: border-box;
        border-top: var(--spectrum-global-dimension-static-size-25) solid var(--spectrum-global-color-gray-300);
    }

    .content {
        box-sizing: border-box;

        grid-area: content;
        border: var(--spectrum-global-dimension-static-size-25) solid var(--spectrum-global-color-gray-300);
        border-bottom: none;
    }

</style>
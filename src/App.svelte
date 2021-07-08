<script lang="ts">
    import ToolsComponent from "./Components/Tools";
    import CanvasComponent from "./Components/Canvas.svelte";
    import TimelineComponent from "./Components/Timeline";
    import LogoComponent from "./Components/Logo.svelte";
    import ProjectStateComponent from "./Components/MenuBar/ProjectState.svelte";
    import AlignSelectionComponent from "./Components/MenuBar/AlignSelection.svelte";
    import TreeComponent from "./Components/Tree.svelte";
    import PropertiesComponent from "./Components/Properties";
    import SpSplitView from "./Controls/SpSplitView.svelte";

    import {CurrentTheme, CurrentProject} from "./Stores";
    import DialogManager from "./Components/DialogManager.svelte";
    import type {OpenDialogFunction} from "./Components/DialogType";
    import {onMount, setContext} from "svelte";
    import SettingsBar from "./Components/SettingsBar.svelte";

    function noCtxMenu(e: Event) {
        e.preventDefault();
        return false;
    }

    let hidden = false;
    let openDialog: OpenDialogFunction;
    setContext<OpenDialogFunction>('openDialog', (dialog, component, props?) => openDialog(dialog, component, props));

    onMount(() => {
        // TODO: ...
    });
</script>
<sp-icons-medium></sp-icons-medium>
<sp-icons-workflow></sp-icons-workflow>
<sp-icons-expr></sp-icons-expr>
<sp-theme scale="medium" color={$CurrentTheme} class="app">
    <div class="app-logo" on:contextmenu={noCtxMenu}>
        <LogoComponent />
    </div>
    <div class="app-menubar" on:contextmenu={noCtxMenu}>
        <ProjectStateComponent />
        <div></div>
        <AlignSelectionComponent />
    </div>
    <div class="app-toolbar" on:contextmenu={noCtxMenu}>
        <ToolsComponent disabled={$CurrentProject == null} />
        <SettingsBar disabled={true} />
    </div>
    <SpSplitView class="app-sidebar" resizable vertical primary-min="160" primary-size="75%">
        <svelte:fragment slot="primary">
            <PropertiesComponent />
        </svelte:fragment>
        <svelte:fragment slot="secondary" let:collapsed>
            <TreeComponent on:contextmenu={noCtxMenu} collapsed={collapsed} />
        </svelte:fragment>
    </SpSplitView>
    <SpSplitView class="app-content" resizable vertical
                 primary-size="80%"
                 secondary-min="0"
                 secondary-max="600">
        <svelte:fragment slot="primary">
            <CanvasComponent hidden={hidden}>Now canvas is hidden and this is the fallback content</CanvasComponent>
        </svelte:fragment>
        <svelte:fragment slot="secondary" let:collapsed>
            <TimelineComponent collapsed={collapsed} />
        </svelte:fragment>
    </SpSplitView>
    <DialogManager bind:openDialog />
</sp-theme>
<style global>
    .app {
        display: grid;
        grid-gap: 0;
        margin: 0;
        padding: 0;
        box-sizing: border-box;

        background: var(--spectrum-global-color-gray-100);
        color: var(--spectrum-global-color-gray-800);

        width: 100%;
        height: 100%;

        grid-template-areas:
                'logo menubar menubar'
                'toolbar content sidebar'
        ;
        grid-template-rows: 48px auto;
        grid-template-columns: 48px auto 260px;

        --spectrum-global-font-family-base: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Trebuchet MS', 'Lucida Grande', sans-serif;
        --spectrum-global-font-family-serif: 'Source Serif Pro', Georgia, serif;
        --spectrum-global-font-family-code: 'Source Code Pro', Monaco, monospace;

        --separator-color: var(--spectrum-global-color-gray-300);

        --scrollbar-width: 6px;
        --scrollbar-radius: 0px;
        --scrollbar-color: var(--spectrum-global-color-gray-500);

        --spectrum-dragbar-handle-background-color: var(--separator-color);
        --spectrum-dragbar-handle-background-color-hover: var(--separator-color);
    }

    .app kbd {
        font-family: var(--spectrum-global-font-family-code);
    }

    .app[color="dark"] {
        --separator-color: var(--spectrum-global-color-gray-50);
    }

    .app div {
        box-sizing: border-box;
    }

    .app-logo {
        grid-area: logo;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        user-select: none;
    }

    .app-menubar {
        grid-area: menubar;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        user-select: none;
    }

    .app-toolbar {
        grid-area: toolbar;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        user-select: none;
        border-top: var(--spectrum-global-dimension-static-size-25) solid var(--separator-color);
    }

    .app-sidebar {
        grid-area: sidebar;
        user-select: none;
        box-sizing: border-box;
        border-top: var(--spectrum-global-dimension-static-size-25) solid var(--separator-color);
    }

    .app-content {
        box-sizing: border-box;

        grid-area: content;
        border: var(--spectrum-global-dimension-static-size-25) solid var(--separator-color);
        border-bottom: none;
    }
</style>
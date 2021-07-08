<script lang="ts">
    import {ProjectFileHandle, CurrentProject, CurrentProjectState, IsProjectSaved} from "../../Stores";
    import {NativeAnimationExporter, NativeAnimationImporter} from "../../Core";
    import GlobalMenu from "./GlobalMenu.svelte";

    declare global {
        interface Window {
            showOpenFilePicker(): FileSystemFileHandle[];

            showSaveFilePicker(options?: any): FileSystemFileHandle;
        }
    }

    function undo() {
        const engine = $CurrentProject.engine;
        if (engine) {
            engine.undo();
        }
    }

    function redo() {
        const engine = $CurrentProject.engine;
        if (engine) {
            engine.redo();
        }
    }

    async function open() {
        if (!$IsProjectSaved) {
            // Ask user if they want to save the current project
        }

        let fileHandle: FileSystemFileHandle;

        try {
            [fileHandle] = await window.showOpenFilePicker();
        } catch (e) {
            return;
        }

        $ProjectFileHandle = fileHandle;
        const stream = (await fileHandle.getFile()).stream();
        const importer = new NativeAnimationImporter();
        const project = await importer.import(stream);
        const old = $CurrentProject;
        $CurrentProject = project;
        $IsProjectSaved = true;
        old.dispose();
        importer.dispose();
    }

    async function save() {
        if (!$ProjectFileHandle) {
            try {
                $ProjectFileHandle = await window.showSaveFilePicker({
                    types: [
                        {
                            description: 'Expressive Animation files',
                            startIn: 'documents',
                            accept: {
                                'expressive/animation': ['.eaf']
                            }
                        }
                    ]
                });
            } catch {
                return;
            }
        }

        const exporter = new NativeAnimationExporter();
        const stream = await exporter.export($CurrentProject)
        await stream.pipeTo(await $ProjectFileHandle.createWritable());

        $IsProjectSaved = true;
        exporter.dispose();
    }
</script>
<sp-action-group compact quiet>
<!--    <GlobalMenu />-->
    <sp-action-button title="Open"
                      on:click={open}>
        <sp-icon size="s" name="workflow:FolderOpen" slot="icon"></sp-icon>
    </sp-action-button>
    <sp-action-button title="Save" on:click={save}>
        <sp-icon size="s" name="workflow:SaveFloppy" slot="icon"></sp-icon>
    </sp-action-button>
    <sp-action-button title="Undo"
                      on:click={undo}
                      disabled={!$CurrentProjectState || !$CurrentProjectState.canUndo}>
        <sp-icon size="s" name="workflow:Undo" slot="icon"></sp-icon>
    </sp-action-button>
    <sp-action-button title="Redo"
                      on:click={redo}
                      disabled={!$CurrentProjectState || !$CurrentProjectState.canRedo}>
        <sp-icon size="s" name="workflow:Redo" slot="icon"></sp-icon>
    </sp-action-button>
</sp-action-group>
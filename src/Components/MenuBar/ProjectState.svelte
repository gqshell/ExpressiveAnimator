<script lang="ts">
    import SVGIcon from "../SVGIcon.svelte";
    import {CurrentProject, CurrentProjectState} from "../../Stores";

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
</script>
<sp-action-group compact quiet>
    <sp-action-button title="Open">
        <sp-icon slot="icon">
            <SVGIcon name="workflow:FolderOpen"/>
        </sp-icon>
    </sp-action-button>
    <sp-action-button title="Save">
        <sp-icon slot="icon">
            <SVGIcon name="workflow:SaveFloppy"/>
        </sp-icon>
    </sp-action-button>
    <sp-action-button title="Undo"
                      on:click={undo}
                      disabled={!$CurrentProjectState || !$CurrentProjectState.canUndo}>
        <sp-icon slot="icon">
            <SVGIcon name="workflow:Undo"/>
        </sp-icon>
    </sp-action-button>
    <sp-action-button title="Redo"
                      on:click={redo}
                      disabled={!$CurrentProjectState || !$CurrentProjectState.canRedo}>
        <sp-icon slot="icon">
            <SVGIcon name="workflow:Redo"/>
        </sp-icon>
    </sp-action-button>
</sp-action-group>
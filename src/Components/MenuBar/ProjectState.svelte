<script lang="ts">
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
        <sp-icon size="s" name="workflow:FolderOpen" slot="icon"></sp-icon>
    </sp-action-button>
    <sp-action-button title="Save">
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
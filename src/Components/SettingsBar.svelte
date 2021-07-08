<script lang="ts">
    import {getContext} from "svelte";
    import type {OpenDialogFunction} from "./DialogType";
    import SettingsDialog from "./Dialogs/SettingsDialog.svelte";

    const openDialog = getContext<OpenDialogFunction>('openDialog');

    export let disabled: boolean = false;

    function showSettings() {
        openDialog({
            title: 'Settings',
            dismissable: true,
            size: 'large'
        }, SettingsDialog)
    }
</script>
<sp-action-group vertical quiet emphasized>
    <sp-action-button on:click={() => showSettings()} title="Settings" disabled={disabled}>
        <sp-icon size="s" name="workflow:Settings" slot="icon"></sp-icon>
    </sp-action-button>
</sp-action-group>
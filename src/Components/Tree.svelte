<script lang="ts">
    import {CurrentProject, CurrentDocument, CurrentSelection, ShowTreeReverse, notifySelectionChanged} from "../Stores";
    import type {Element, Document, MoveElementMode, Selection} from "@zindex/canvas-engine";
    import SpTreeView from "../Controls/SpTreeView";
    import {ElementInfoMap} from "./Mapping";
    import EditElementNameDialog from "./Dialogs/EditElementNameDialog.svelte";
    import {getContext} from "svelte";
    import type {OpenDialogFunction} from "./DialogType";

    const openDialog = getContext<OpenDialogFunction>('openDialog');

    export let collapsed: boolean = false;

    let noSelection: boolean;
    $: noSelection = !$CurrentSelection || $CurrentSelection.isEmpty;

    function onSelection() {
        $CurrentProject.engine?.invalidate();
        notifySelectionChanged();
    }

    function onDrop(e: CustomEvent<{element: Element, target: Element, mode: MoveElementMode, selection: Selection<Document>}>) {
        if ($CurrentProject.middleware.sendToTarget(e.detail.element, e.detail.target, e.detail.mode, e.detail.selection)) {
            snapshot();
        }
    }

    function onLock(e: CustomEvent<Element>) {
        e.detail.locked = !e.detail.locked;
        snapshot();
    }

    function onHide(e: CustomEvent<Element>) {
        e.detail.hidden = !e.detail.hidden;
        snapshot();
    }

    function onEditTitle(e: CustomEvent<Element>) {
        openDialog({
            title: 'Rename element',
            value: e.detail.title || '',
            dismissable: false,
            size: 'small',
            confirm: {
                label: 'Rename',
                action: async (value: string) => {
                    value = value.trim();
                    if (e.detail.title === value) {
                        return;
                    }
                    e.detail.title = value;
                    $CurrentProject.state.snapshot();
                }
            },
            cancel: {
                label: 'Cancel'
            }
        }, EditElementNameDialog);
    }

    function onDelete() {
        if ($CurrentProject.middleware.deleteSelectedElements()) {
            snapshot();
        }
    }

    function snapshot() {
        const project = $CurrentProject;
        project.state.snapshot();
        project.engine?.invalidate();
    }
</script>
<div on:contextmenu class="tree-wrapper">
    {#if !collapsed}
        <div class="scroll scroll-no-hide" on:click|self={() => $CurrentSelection.clear() && notifySelectionChanged()}>
            <SpTreeView
                    reverse={$ShowTreeReverse}
                    document={$CurrentDocument}
                    selection={$CurrentSelection}
                    infoMap={ElementInfoMap}
                    on:title={onEditTitle}
                    on:drop={onDrop}
                    on:lock={onLock}
                    on:hide={onHide}
                    on:selection={onSelection} />
        </div>
        <div class="tree-tools">
            <sp-action-button
                    title="Delete elements"
                    class="very-small"
                    disabled={noSelection}
                    on:click={onDelete} size="s" quiet>
                <sp-icon slot="icon" size="s" name="workflow:Delete"></sp-icon>
            </sp-action-button>
<!--            <sp-action-group compact quiet class="very-small">-->
<!--                <sp-action-button disabled={noSelection} title="Bring forward" size="s">-->
<!--                    <sp-icon name="expr:bring-forward" size="s"></sp-icon>-->
<!--                </sp-action-button>-->
<!--                <sp-action-button disabled={noSelection} title="Bring to front" size="s">-->
<!--                    <sp-icon name="expr:bring-front" size="s"></sp-icon>-->
<!--                </sp-action-button>-->
<!--                <sp-action-button disabled={noSelection} title="Send backward" size="s">-->
<!--                    <sp-icon name="expr:send-backward" size="s"></sp-icon>-->
<!--                </sp-action-button>-->
<!--                <sp-action-button disabled={noSelection} title="Send to back" size="s">-->
<!--                    <sp-icon name="expr:send-back" size="s"></sp-icon>-->
<!--                </sp-action-button>-->
<!--            </sp-action-group>-->
            {#if $CurrentDocument}
                <sp-picker size="s" value="{$CurrentDocument.id}" quiet>
                    {#each Array.from($CurrentProject.getDocuments()) as doc (doc.id)}
                        <sp-menu-item value="{doc.id}">{doc.title || '(document)'}</sp-menu-item>
                    {/each}
                </sp-picker>
            {/if}
        </div>
    {/if}
</div>
<style>
    .tree-wrapper {
        display: flex;
        flex-direction: column;
    }

    .tree-wrapper > .scroll {
        flex: 1;
        padding: 0 !important;
        margin-left: calc(var(--scrollbar-width) / 2);
    }

    .tree-tools {
        width: 100%;
        overflow: hidden;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        box-sizing: content-box;
        border-top: 2px solid var(--separator-color);
        height: var(--spectrum-alias-item-height-m);
    }

    .tree-tools > :first-child {
        margin-left: var(--spectrum-global-dimension-size-100);
    }
    .tree-tools > :last-child {
        margin-right: var(--spectrum-global-dimension-size-100);
    }

</style>
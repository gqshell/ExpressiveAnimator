<script lang="ts">
    import {CurrentProject, CurrentDocument, CurrentSelection, ShowTreeReverse, notifySelectionChanged} from "../Stores";
    import type {Element, Document, MoveElementMode, Selection} from "@zindex/canvas-engine";
    import SpTreeView from "../Controls/SpTreeView";
    import {ElementInfoMap} from "./Mapping";

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

    function onContextMenu(e: CustomEvent<Selection<Document>>) {
        // TODO: implement context-menu
    }

    function snapshot() {
        const project = $CurrentProject;
        project.state.snapshot();
        project.engine?.invalidate();
    }
</script>
<div class="tree-wrapper">
    {#if !collapsed}
        <div class="scroll scroll-no-hide">
            <SpTreeView
                    reverse={$ShowTreeReverse}
                    document={$CurrentDocument}
                    selection={$CurrentSelection}
                    infoMap={ElementInfoMap}
                    on:drop={onDrop}
                    on:lock={onLock}
                    on:hide={onHide}
                    on:contextMenu={onContextMenu}
                    on:selection={onSelection} />
        </div>
        <div class="tree-tools">
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
        box-sizing: content-box;
        border-top: 1px solid var(--separator-color);
        height: var(--spectrum-alias-item-height-m);
    }
</style>
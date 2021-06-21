<script context="module" lang="ts">
    const ONE_PIXEL = new Image();
    ONE_PIXEL.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
</script>
<script lang="ts">
    import "./sp-treeview.css";
    import {CurrentProject, CurrentDocument, CurrentSelection, notifySelectionChanged} from "../../Stores";
    import TreeItem from "./TreeItem.svelte";
    import {MoveElementMode} from "@zindex/canvas-engine";
    import type {Element} from "@zindex/canvas-engine";

    export let reverse: boolean = false;

    let dragging: boolean = false;
    let moveMode: MoveElementMode = null;
    let moveTarget: string = null;

    function onClick(e: PointerEvent) {
        const id = (e.target as HTMLElement).getAttribute('data-element-id');
        if (!id) {
            return;
        }
        const element = $CurrentDocument.getElementById(id);
        if (!element) {
            return;
        }
        if ($CurrentSelection.toggle(element, e.shiftKey)) {
            $CurrentProject.engine?.invalidate();
            notifySelectionChanged();
        }
    }

    async function onDragStart(e: DragEvent) {
        if (!$CurrentSelection || $CurrentSelection.isEmpty) {
            return;
        }

        e.stopPropagation();

        e.dataTransfer.setData('expressive.animator.private', '\0');
        e.dataTransfer.setDragImage(ONE_PIXEL, 0, 0);
        e.dataTransfer.effectAllowed = "move";

        setTimeout(() => dragging = true, 10);
    }

    async function onDragOver(e: DragEvent) {
        const id = (e.target as HTMLElement).getAttribute('data-element-id');
        if (!id) {
            return;
        }

        const target = $CurrentDocument?.getElementById(id);
        if (!target) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "move";

        moveTarget = id;
        moveMode = getMode(e, target, reverse);

        return false;
    }

    async function onDragEnd(e: DragEvent) {
        if (!dragging || !moveTarget) {
            return;
        }

        e.preventDefault();

        if (e.dataTransfer.dropEffect === "move") {
            const target = $CurrentDocument?.getElementById(moveTarget);

            // this is a correct drop
            let mode = moveMode;
            if (reverse) {
                if (mode === MoveElementMode.BEFORE) {
                    mode = MoveElementMode.AFTER;
                } else if (mode === MoveElementMode.AFTER) {
                    mode = MoveElementMode.BEFORE;
                }
            }

            if ($CurrentProject.middleware.sendToTarget($CurrentSelection.activeElement, target, mode, $CurrentSelection)) {
                // snapshot
                $CurrentProject.state.snapshot();
                $CurrentProject.engine?.invalidate();
            }
        }

        dragging = false;
        moveTarget = null;
        moveMode = null;
    }

    function getMode(e: DragEvent, element: Element, reverse: boolean): MoveElementMode {
        const box = (e.target as HTMLElement).getBoundingClientRect();
        const top = (e.clientY - box.top) / box.height;

        const isFirst = (reverse ? element.nextSibling : element.previousSibling) == null;

        if (element.supportsChildren) {
            if (isFirst && top < 0.25) {
                return MoveElementMode.BEFORE;
            }
            if (top < 0.5 || (e.target as HTMLElement).classList.contains('is-open')) {
                return MoveElementMode.APPEND;
            }
            return MoveElementMode.AFTER;
        }

        if (isFirst && top < 0.5) {
            return MoveElementMode.BEFORE;
        }

        return MoveElementMode.AFTER;
    }
</script>
<div class="tree-wrapper">
    <div class="tree-tools">
        {#if $CurrentDocument}
        <sp-picker
                size="s"
                value="{$CurrentDocument.id}"
        >
            {#each Array.from($CurrentProject.getDocuments()) as doc (doc.id)}
                <sp-menu-item value="{doc.id}">{doc.title || '(document)'}</sp-menu-item>
            {/each}
        </sp-picker>
        {/if}
    </div>
    {#if $CurrentDocument != null}
        <div class="scroll scroll-no-hide" on:dragstart={onDragStart}>
            <ul class="spectrum-TreeView">
                {#each Array.from($CurrentDocument.children(reverse)) as child (child.id)}
                    <TreeItem
                            on:click={onClick}
                            on:dragend={onDragEnd}
                            on:dragover={onDragOver}
                            element={child}
                            selection={$CurrentSelection}
                            reverse={reverse}
                            dragging={dragging}
                            moveMode={moveMode}
                            moveTarget="{moveTarget}"
                    />
                {/each}
            </ul>
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

    .tree-wrapper .spectrum-TreeView {
        margin: 0;
    }

    .tree-tools {
        width: 100%;
        height: 32px;
        overflow: hidden;
        display: flex;
        flex-direction: row;
        align-items: center;
    }
</style>
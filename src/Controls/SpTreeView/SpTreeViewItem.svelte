<script lang="ts">
    import type {Element, Selection, Document} from "@zindex/canvas-engine";
    import {MoveElementMode} from "@zindex/canvas-engine";
    import {createEventDispatcher} from "svelte";
    import SpDropIndicator from "../SpDropIndicator.svelte";

    const dispatch = createEventDispatcher();

    export let element: Element;
    export let selection: Selection<Document>;
    export let indent: number = 0;
    export let open: boolean = false;
    export let reverse: boolean = false;
    export let dragging: boolean = false;
    export let moveMode: MoveElementMode = null;
    export let moveTarget: string = null;
    export let infoMap: {
        [key: string]: {
            icon: string,
            title: string,
        }
    } = null;

    let isSelected: boolean = false,
        isMoveTarget: boolean = false;

    $: isSelected = selection.isSelected(element);
    $: isMoveTarget = dragging && moveTarget === element.id;


    function getTitle(element: Element): string {
        return element.title || infoMap[element.type]?.title || ('(' + element.type + ')');
    }

    function getIcon(element: Element): string {
        return infoMap[element.type]?.icon || 'expr:unknown';
    }
</script>
{#if element.isElement}
    {#if isMoveTarget && moveMode === MoveElementMode.BEFORE}
        <SpDropIndicator />
    {/if}
    <li class="spectrum-TreeView-item"
        on:dblclick
        on:pointerdown
        on:dragend
        on:dragover
        on:dragleave
        draggable={!dragging && isSelected}
        class:is-selected={isSelected}
        class:is-open={element.supportsChildren && open}
        class:is-dragged={isSelected && dragging}
        class:is-drop-target={isMoveTarget && (moveMode === MoveElementMode.APPEND || moveMode === MoveElementMode.PREPEND)}
        style={'--spectrum-treeview-item-indent: ' + indent}
    >
        <a tabindex="0" data-element-id={element.id} draggable={false} class="spectrum-TreeView-itemLink" href={'javascript:void(0);'}>
            {#if element.supportsChildren}
                <sp-icon
                        name="workflow:ChevronRight"
                        class="spectrum-TreeView-itemIndicator"
                        on:click|preventDefault|stopPropagation={() => open = !open}>
                </sp-icon>
            {/if}
            <sp-icon name="{getIcon(element)}" class="spectrum-TreeView-itemIcon"></sp-icon>
            <span class="spectrum-TreeView-itemLabel">{getTitle(element)}</span>
            <sp-action-group class="spectrum-TreeView-itemActions" class:show-actions={element.locked || element.hidden} compact quiet>
                <sp-action-button title="{element.hidden ? 'Show' : 'Hide'}" on:click={() => dispatch('hide', element)} selected={element.hidden} size="s">
                    <sp-icon name="{element.hidden ? 'workflow:VisibilityOff' : 'workflow:Visibility'}" size="s"></sp-icon>
                </sp-action-button>
                <sp-action-button title="{element.locked ? 'Unlock' : 'Lock'}" on:click={() => dispatch('lock', element)} selected={element.locked} size="s">
                    <sp-icon name="{element.locked ? 'workflow:LockClosed' : 'workflow:LockOpen'}" size="s"></sp-icon>
                </sp-action-button>
            </sp-action-group>
        </a>
    </li>
    {#if isMoveTarget && moveMode === MoveElementMode.AFTER}
        <SpDropIndicator />
    {/if}
{/if}
{#if open && element.supportsChildren && element.hasChildren && !(dragging && isSelected)}
    {#each Array.from(element.children(reverse)) as child (child.id)}
        <svelte:self
                on:hide
                on:lock
                on:dblclick
                on:pointerdown
                on:dragend
                on:dragover
                on:dragleave
                element={child}
                selection={selection}
                indent={indent + 1}
                reverse={reverse}
                dragging={dragging}
                moveMode={moveMode}
                moveTarget="{moveTarget}"
                infoMap={infoMap}
        />
    {/each}
{/if}
<style global>
    .spectrum-TreeView-item {
        touch-action: none;
    }
    .spectrum-TreeView-item.is-dragged {
        display: none;
        pointer-events: none;
    }

    .spectrum-TreeView-itemIndicator,
    .spectrum-TreeView-itemIcon {
        flex-shrink: 0;
    }

    .spectrum-TreeView-itemLink {
        padding-right: 0 !important;
    }

    .spectrum-TreeView-itemActions,
    .spectrum-TreeView-item.is-dragged .spectrum-TreeView-itemActions {
        visibility: hidden;
    }

    .spectrum-TreeView-item:hover .spectrum-TreeView-itemActions,
    .spectrum-TreeView-itemActions.show-actions {
        visibility: visible;
    }


    .spectrum-TreeView-itemActions sp-action-button:not([selected]) {
        --spectrum-actionbutton-m-quiet-text-color: var(--spectrum-alias-text-color-disabled);
    }

    .spectrum-TreeView-itemActions {
        flex-shrink: 0;
        margin-left: auto;

        /*--spectrum-alias-workflow-icon-size-s: var(--spectrum-global-dimension-size-175);*/

        --spectrum-actionbutton-s-textonly-padding-left: var(--spectrum-alias-border-size-thin);
        --spectrum-actionbutton-s-textonly-padding-right: var(--spectrum-alias-border-size-thin);
        --spectrum-actionbutton-s-min-width: var(--spectrum-global-dimension-size-300);

        --spectrum-actionbutton-m-quiet-background-color-selected: transparent;
        --spectrum-actionbutton-m-quiet-background-color-down: transparent;
        --spectrum-actionbutton-m-quiet-background-color-selected-down: transparent;
        --spectrum-actionbutton-m-quiet-background-color-selected-hover: transparent;
    }

    [dir="ltr"] .spectrum-TreeView-item {
        padding-left: calc(var(--spectrum-treeview-item-indent) * var(--spectrum-treeview-item-indentation));
    }

    [dir="rtl"] .spectrum-TreeView-item {
        padding-right: calc(var(--spectrum-treeview-item-indent) * var(--spectrum-treeview-item-indentation));
    }
</style>
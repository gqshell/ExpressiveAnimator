<script lang="ts">
    import type {Element, Selection} from "@zindex/canvas-engine";
    import DropIndicator from "./DropIndicator";
    import {MoveElementMode} from "@zindex/canvas-engine";
    import {AnimationDocument} from "../../Core";

    export let element: Element;
    export let selection: Selection<AnimationDocument>;
    export let indent: number = 0;
    export let open: boolean = false;
    export let reverse: boolean = false;
    export let dragging: boolean = false;
    export let moveMode: MoveElementMode = null;
    export let moveTarget: string = null;

    let isSelected: boolean, isMoveTarget: boolean = false;
    $: isSelected = selection.isSelected(element);
    $: isMoveTarget = moveTarget === element.id;

</script>
{#if element.isElement}
    {#if isMoveTarget && moveMode === MoveElementMode.BEFORE}
        <DropIndicator />
    {/if}
    <li class="spectrum-TreeView-item"
        on:dragend
        on:dragover
        draggable={(!dragging && isSelected) ? 'true' : 'false'}
        style={'--spectrum-treeview-item-indent: ' + indent}
        class:is-selected={isSelected}
        class:is-open={element.supportsChildren && open}
        class:is-dragged={isSelected && dragging}
        class:is-drop-target={isMoveTarget && (moveMode === MoveElementMode.APPEND || moveMode === MoveElementMode.PREPEND)}
    >
        <a tabindex="0" on:click data-element-id={element.id} class="spectrum-TreeView-itemLink" href={'javascript:void(0);'}>
            {#if element.supportsChildren}
                <sp-icon
                        name="workflow:ChevronRight"
                        class="spectrum-TreeView-itemIndicator"
                        on:click|preventDefault|stopPropagation={() => open = !open}>
                </sp-icon>
            {/if}
            <sp-icon name="expr:polygon" class="spectrum-TreeView-itemIcon"></sp-icon>
            <span class="spectrum-TreeView-itemLabel">{element.title || `(${element.type.toLowerCase()})`}</span>
        </a>
    </li>
    {#if isMoveTarget && moveMode === MoveElementMode.AFTER}
        <DropIndicator />
    {/if}
{/if}
{#if open && element.supportsChildren && element.hasChildren}
    {#each Array.from(element.children(reverse)) as child (child.id)}
        <svelte:self
                on:click
                on:dragend
                on:dragover
                element={child}
                selection={selection}
                indent={indent + 1}
                reverse={reverse}
                dragging={dragging}
                moveMode={moveMode}
                moveTarget="{moveTarget}"
        />
    {/each}
{/if}
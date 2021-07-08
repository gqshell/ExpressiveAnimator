<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import PropertyGroup from "./PropertyGroup.svelte";
    import NumberPair from "./NumberPair.svelte";
    import type {AnimationDocument} from "../../Core";
    import PropertyItem from "./PropertyItem.svelte";
    import SpTextField from "../../Controls/SpTextField.svelte";
    import type {Size} from "@zindex/canvas-engine";
    import {Rectangle} from "@zindex/canvas-engine";

    const dispatch = createEventDispatcher();

    export let value: AnimationDocument;
    export let proportionalSize: boolean = true;

    let size: Size = null;

    function onSizeDone() {
        if (!size) {
            return;
        }
        dispatch('update', {property: 'board', value: Rectangle.fromSize(size)});
        size = null;
    }
</script>
<PropertyGroup title="Document">
    <PropertyItem title="Title">
        <SpTextField
                     on:change={e => dispatch('update', {property: 'title', value: e.detail})}
                     style="flex: 1; margin-left: var(--spectrum-global-dimension-size-40)"
                     size="S"
                     value={value.title || ''} type="text" />
    </PropertyItem>
    <NumberPair on:done={onSizeDone}
                on:start={() => size = value.board}
                on:input={e => size = {width: e.detail.x, height: e.detail.y}}
                proportions={proportionalSize}
                value={{x: value.board.width, y: value.board.height}} label="Size" xTitle="Width" yTitle="Height">
        <sp-action-button title="Proportional size" on:click={() => proportionalSize = !proportionalSize} size="s" emphasized quiet selected={proportionalSize}>
            <sp-icon slot="icon" name={proportionalSize ? 'expr:maintain-checked' : 'expr:maintain-unchecked'} size="s"></sp-icon>
        </sp-action-button>
    </NumberPair>
</PropertyGroup>
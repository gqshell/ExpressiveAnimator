<div style="position: relative">
    Canvas
<!--    <sp-popover open style="position: absolute; top: 0">-->
<!--        <sp-menu>-->
<!--            <overlay-trigger placement="auto-start" type="inline" offset="-10">-->
<!--                <sp-menu-item slot="trigger" value="item-1">-->
<!--                    Deselect-->
<!--                    <sp-icon style="float: right" size="s" name="ui:Chevron75"></sp-icon>-->
<!--                </sp-menu-item>-->

<!--                <sp-popover slot="hover-content" open>-->
<!--                    <sp-menu>-->
<!--                        <sp-menu-item value="item-2">Select inverse</sp-menu-item>-->
<!--                        <sp-menu-item value="item-3">Feather...</sp-menu-item>-->
<!--                        <sp-menu-item value="item-4">Select and mask...</sp-menu-item>-->
<!--                        <sp-menu-item value="item-5">Save selection</sp-menu-item>-->
<!--                        <sp-menu-item value="item-6" disabled>Make work path</sp-menu-item>-->
<!--                    </sp-menu>-->
<!--                </sp-popover>-->
<!--            </overlay-trigger>-->
<!--            <sp-menu-item value="item-11">-->
<!--                <overlay-trigger placement="auto-start" type="inline">-->
<!--                    <div slot="trigger">-->
<!--                        Deselect-->
<!--                        <sp-icon style="float: right" size="s" name="ui:Chevron75"></sp-icon>-->
<!--                    </div>-->

<!--                    <sp-popover slot="hover-content" open>-->
<!--                        <sp-menu>-->
<!--                            <sp-menu-item value="item-2">Select inverse</sp-menu-item>-->
<!--                            <sp-menu-item value="item-3">Feather...</sp-menu-item>-->
<!--                            <sp-menu-item value="item-4">Select and mask...</sp-menu-item>-->
<!--                            <sp-menu-item value="item-5">Save selection</sp-menu-item>-->
<!--                            <sp-menu-item value="item-6" disabled>Make work path</sp-menu-item>-->
<!--                        </sp-menu>-->
<!--                    </sp-popover>-->
<!--                </overlay-trigger>-->

<!--            </sp-menu-item>-->
<!--            <sp-menu-item value="item-2">Select inverse</sp-menu-item>-->
<!--            <sp-menu-item value="item-3">Feather...</sp-menu-item>-->
<!--            <sp-menu-item value="item-4">Select and mask...</sp-menu-item>-->
<!--            <sp-menu-item value="item-5">Save selection</sp-menu-item>-->
<!--            <sp-menu-item value="item-6" disabled>Make work path</sp-menu-item>-->
<!--        </sp-menu>-->
<!--    </sp-popover>-->


    <overlay-trigger placement="auto-start" type="inline" offset="-10">
        <sp-button
                on:pointerenter={() => open = true}
                on:pointerleave={() => open = false}
                slot="trigger">Overlay Trigger</sp-button>

        <sp-popover slot="hover-content" placement="auto">
            <sp-menu>
                <sp-menu-item value="item-2">Select inverse</sp-menu-item>
                <sp-menu-item value="item-3">Feather...</sp-menu-item>
                <sp-menu-item value="item-4">Select and mask...</sp-menu-item>
                <sp-menu-item value="item-5">Save selection</sp-menu-item>
                <sp-menu-item value="item-6" disabled>Make work path</sp-menu-item>
            </sp-menu>
        </sp-popover>
    </overlay-trigger>
</div>
<script>
    let open = false;
</script>
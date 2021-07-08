<script lang="ts">
    import CascadeMenu from "../CascadeMenu";
    let open: boolean = false;

    const items = [
        {
            title: 'File',
            children: [
                {
                    title: 'Open',
                    action: () => null
                },
                {
                    title: 'Save',
                    action: () => null
                },
            ]
        }
    ];
</script>
<overlay-trigger placement="bottom-end"
                 type="modal"
                 open="click"
                 offset={-6}
                 on:sp-closed={() => open = false}
    >
    <sp-action-button on:click={() => open = true} slot="trigger">
        <sp-icon size="s" name="workflow:More" slot="icon"></sp-icon>
    </sp-action-button>
    {#if open}
        <sp-popover open={open} slot="click-content">
            <CascadeMenu items={items} />
        </sp-popover>
    {/if}
</overlay-trigger>
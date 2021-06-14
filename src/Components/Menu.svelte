<overlay-trigger placement="right-start" type="inline">
    <img slot="trigger" class="logo" alt="Expressive Animator" src="./icons/icon-48.png">
    <sp-popover slot="click-content" open>
        <sp-dialog size="small">
            <h2 slot="heading">Expressive Animator</h2>
            ...
        </sp-dialog>
    </sp-popover>
</overlay-trigger>
<style>
    img.logo {
        cursor: pointer;
        width: 48px;
        height: 48px;
    }
</style>
<script lang="ts">
    import {Overlay} from '@spectrum-web-components/overlay';
    import {createEventDispatcher, onMount} from "svelte";
    import type {DialogDef} from "./DialogType";

    export let data: DialogDef;
    const dispatch = createEventDispatcher();

    let isWorking: boolean = false;
    let error = null;

    async function onAction(action: (value?: any) => Promise<boolean | void>) {
        if (isWorking) {
            return;
        }

        error = null;

        if (action) {
            isWorking = true;
            try {
                if ((await action(data.value)) === false) {
                    return;
                }
            } catch (e: Error) {
                error = e.message;
                return;
            } finally {
                isWorking = false;
            }
        }

        close();
    }

    async function onCancel() {
        await onAction(data.cancel?.action);
    }

    async function onConfirm() {
        await onAction(data.confirm?.action);
    }

    async function onSecondary() {
        await onAction(data.secondary?.action);
    }


    let content: HTMLElement & {open: boolean} = undefined;
    let closeOverlayPromise: Promise<() => void>;

    function open() {
        if (content.open) {
            return;
        }
        content.open = true;
        closeOverlayPromise = Overlay.open(content.parentElement, 'modal', content, {
            placement: 'none',
            receivesFocus: 'auto'
        });
    }

    function close() {
        if (!content || !content.open) {
            return;
        }
        closeOverlayPromise.then(close => {
            close();
            closeOverlayPromise = null;
            content.open = false;
        });
    }

    onMount(() => {
       open();
       return close;
    });
</script>
<sp-dialog-wrapper
        bind:this={content}
        error={error != null}
        headline={data.title}
        footer={error ? error : data.footer}
        mode={data.mode}
        size={data.size}
        no-divider={data.divider ? undefined : ''}
        responsive={!!data.responsive}
        dismissable={!isWorking && data.dismissable !== false}
        underlay={data.underlay !== false}

        confirm-label={data.confirm?.label || undefined}
        secondary-label={data.secondary?.label || undefined}
        cancel-label={data.cancel?.label || undefined}

        on:close={close}
        on:cancel={onCancel}
        on:confirm={onConfirm}
        on:secondary={onSecondary}
>
    <slot isWorking={isWorking} closeDialog={close} value={data.value} />
</sp-dialog-wrapper>
<style>
    sp-dialog-wrapper[error] {
        --spectrum-dialog-confirm-description-text-color: var(--spectrum-semantic-negative-color-icon);
    }
</style>

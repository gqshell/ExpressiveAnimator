<script context="module" lang="ts">
    const ONE_PIXEL = new Image();
    ONE_PIXEL.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
</script>
<script lang="ts">
    import {tick} from "svelte";
    import {MoveElementMode, SelectionBulkOp} from "@zindex/canvas-engine";

    export let moveElementMode: MoveElementMode = MoveElementMode.APPEND;

    export let reverse: boolean = false;
    export let dragging: boolean = false;

    async function handleDragStart(e: DragEvent) {
        e.stopPropagation();

        e.dataTransfer.setData('private.expressive', '\0');
        e.dataTransfer.setDragImage(ONE_PIXEL, 0, 0);
        e.dataTransfer.effectAllowed = "move";

        await tick();
        dragging = true;
    }

    function handleDragEnd(e: DragEvent) {
        if (!dragging) {
            return;
        }

        e.preventDefault();

        if (e.dataTransfer.dropEffect === "move" && this.moveElementTarget) {
            // this is a correct drop
            let mode = moveElementMode;
            let shouldOpen = false;
            if (reverse) {
                if (mode == MoveElementMode.BEFORE) {
                    mode = MoveElementMode.AFTER;
                } else if (mode == MoveElementMode.AFTER) {
                    mode = MoveElementMode.BEFORE;
                } else {
                    shouldOpen = true;
                }
            } else {
                shouldOpen = mode == MoveElementMode.APPEND || mode == MoveElementMode.PREPEND;
            }

            // TODO: emit
            if (SelectionBulkOperations.moveTo(this.selection, this.moveElementTarget, mode)) {
                if (shouldOpen) {
                    this.openItems.add(this.moveElementTarget);
                }
                this.doUpdate();
            }
        }

        dragging = false;
        this.moveElementTarget = null;
    }
</script>
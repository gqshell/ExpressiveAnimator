<script lang="ts">
    import Transform from "./Transform.svelte";

    import {CurrentSelection, CurrentSelectedElement} from "../../Stores";
    import type {Element, Document} from "@zindex/canvas-engine";
</script>
<div class="scroll" hidden-x>
    {#if $CurrentSelectedElement != null}
        <Transform element={$CurrentSelectedElement}/>
    {/if}
</div>
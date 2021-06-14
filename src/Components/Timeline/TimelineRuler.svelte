<script lang="ts">
    // import {TimelineStore} from "../../Stores";

    export let zoom: number = 1;
    export let left: number = 0;



    let canvas: HTMLCanvasElement;

</script>
<canvas bind:this={canvas} class="timeline-ruler"></canvas>
<style global>
    .timeline-ruler {
        flex: 1;
        box-sizing: border-box;
        background: transparent;
    }
</style>
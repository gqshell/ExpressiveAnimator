<script lang="ts">
    export let offset: number;
</script>
<div on:click on:pointerdown class="timeline-keyframe" style={`--keyframe-offset: ${offset}`}></div>
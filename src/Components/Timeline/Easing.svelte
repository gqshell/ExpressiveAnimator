<script lang="ts">
    export let start: number = 0;
    export let end: number = 0;
</script>
<div on:click on:pointerdown class="timeline-easing"
     style={`--keyframe-easing-start: ${start}; --keyframe-easing-end: ${end}`}></div>
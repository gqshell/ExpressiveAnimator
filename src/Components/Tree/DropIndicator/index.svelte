<script lang="ts">
    import "./sp-dropindicator.css";
    export let vertical: boolean = false;
</script>
<div class={`spectrum-DropIndicator spectrum-DropIndicator--${vertical ? 'vertical' : 'horizontal'}`}></div>
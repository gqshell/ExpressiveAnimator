<script lang="ts">
    import SpTextField from "../../Controls/SpTextField.svelte";
    export let value: string;
    export let isWorking;
    export let closeDialog;
</script>
<SpTextField style="width: 100%" centerText={false} type="text" bind:value={value} />
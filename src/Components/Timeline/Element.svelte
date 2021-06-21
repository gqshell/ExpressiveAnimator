<script lang="ts">
    import {FallbackElementIcon, ElementIconMap, ElementTitleMap} from "../Mapping";

    export let type: string;
    export let title: string | null = null;
    export let disabled: boolean = false;
    export let selected: boolean = false;
</script>
<div class="timeline-item"
     class:is-disabled={disabled}
     class:is-selected={selected}>
    <sp-icon name={ElementIconMap[type] || FallbackElementIcon} size="s"></sp-icon>
    <span>{title || ElementIconMap[type] || 'Unknown'}</span>
</div>
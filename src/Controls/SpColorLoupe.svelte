<script lang="ts">
    import "@spectrum-css/colorloupe/dist/index-vars.css";
    import {mergeClasses} from "./utils";

    export let open: boolean = false;
    export let color: string = 'transparent';
    export let checkerboard: boolean = false;

    $: computedClass = mergeClasses({
        'spectrum-ColorLoupe': true,
        'is-open': open,
    }, $$props.class);
</script>
<svg {...$$restProps} class={computedClass}>
    {#if checkerboard}
        <defs>
            <pattern id="spectrum-ColorLoupe-checkerboard" shape-rendering="geometricPrecision" color-rendering="optimizeQuality" x="0" y="0" width="50%" height="50%">
                <rect x="0" y="0" width="12" height="16" style="fill: var(--spectrum-global-color-static-gray-500)" />
                <rect x="12" y="0" width="12" height="16" style="fill: var(--spectrum-global-color-static-white)" />
                <rect x="0" y="16" width="12" height="16" style="fill: var(--spectrum-global-color-static-white)" />
                <rect x="12" y="16" width="12" height="16" style="fill: var(--spectrum-global-color-static-gray-500)" />
            </pattern>
        </defs>
    {/if}
    <g transform="translate(1 1)">
        {#if checkerboard}
            <path fill="url(#spectrum-ColorLoupe-checkerboard)" d="M24,0A24,24,0,0,1,48,24c0,16.255-24,40-24,40S0,40.255,0,24A24,24,0,0,1,24,0Z" />
        {/if}
        <path fill={color} class="spectrum-ColorLoupe-inner" d="M24,0A24,24,0,0,1,48,24c0,16.255-24,40-24,40S0,40.255,0,24A24,24,0,0,1,24,0Z" />
        <path class="spectrum-ColorLoupe-outer" d="M24,2A21.98,21.98,0,0,0,2,24c0,6.2,4,14.794,11.568,24.853A144.233,144.233,0,0,0,24,61.132,144.085,144.085,0,0,0,34.4,48.893C41.99,38.816,46,30.209,46,24A21.98,21.98,0,0,0,24,2m0-2A24,24,0,0,1,48,24c0,16.255-24,40-24,40S0,40.255,0,24A24,24,0,0,1,24,0Z"/>
    </g>
</svg>
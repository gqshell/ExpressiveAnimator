<script lang="ts">
    // import {TimelineStore} from "../../Stores";
    import {CurrentDocumentAnimation, CurrentTime, CurrentProject} from "../../Stores";
    import {AnimationProject, DocumentAnimation} from "../../Core";
    import {formatTime} from "./utils";

    let animationHandle: number = null;
    let animationStartTime: number;
    $: isRecording = ($CurrentProject as AnimationProject).isRecording;
    $: isPlaying = animationHandle !== null;

    function goToEnd() {
        $CurrentTime = ($CurrentDocumentAnimation as DocumentAnimation).endTime;
    }

    function goToStart() {
        $CurrentTime = ($CurrentDocumentAnimation as DocumentAnimation).startTime;
    }

    function toggleRecording() {
        ($CurrentProject as AnimationProject).isRecording = !($CurrentProject as AnimationProject).isRecording;
    }

    function playAnimation() {
        if (animationHandle !== null) {
            cancelAnimationFrame(animationHandle);
            animationHandle = null;
            return;
        }
        const endTime = ($CurrentDocumentAnimation as DocumentAnimation).endTime;
        animationStartTime = performance.now();
        let f = () => {
            let now = performance.now();
            $CurrentTime += now - animationStartTime;
            if ($CurrentTime >= endTime) {
                $CurrentTime = endTime;
                animationHandle = null;
                return;
            }
            animationStartTime = Math.round(now);
            animationHandle = requestAnimationFrame(f);
        }
        animationHandle = requestAnimationFrame(f);
    }

</script>
<div class="timeline-controls">
    <div class="timeline-controls-container">
        <sp-action-group quiet compact>
            <sp-action-button title="Record"
                              on:click={toggleRecording}
                              class:timeline-controls-recording={isRecording}>
                <sp-icon name="expr:player-record" slot="icon" size="s"></sp-icon>
            </sp-action-button>
            <sp-action-button title="Go to start" on:click={goToStart}>
                <sp-icon name="expr:player-start" slot="icon" size="s"></sp-icon>
            </sp-action-button>
            <sp-action-button title="Play" on:click={playAnimation}>
                <sp-icon name="{isPlaying ? 'expr:player-stop' : 'expr:player-play'}" slot="icon" size="s"></sp-icon>
            </sp-action-button>
            <sp-action-button title="Go to end" on:click={goToEnd}>
                <sp-icon name="expr:player-end" slot="icon" size="s"></sp-icon>
            </sp-action-button>
            <div class="timeline-controls-time">{formatTime($CurrentTime)}</div>
            <sp-action-button title="Add animator" disabled>
                <sp-icon name="expr:add-color" slot="icon" size="s"></sp-icon>
            </sp-action-button>
        </sp-action-group>
    </div>
</div>
<style global>
    .timeline-controls {
        position: relative;
        box-sizing: border-box;
        width: 240px;
        height: 100%;
        border-right: 1px solid var(--separator-color);
        border-bottom: 1px solid var(--separator-color);
    }
    .timeline-controls-container {
        position: absolute;
        background: var(--spectrum-global-color-gray-75);
        width: 100%;
        height: 100%;
        z-index: 5;
    }
    .timeline-controls-time {
        padding: 0 4px;
        line-height: 32px;
        vertical-align: middle;
        font-size: 12px;
        text-align: center;
        flex: 1;
    }
    .timeline-controls-recording {
        --spectrum-alias-icon-color: var(--spectrum-global-color-red-400);
    }
    .timeline-controls-recording:hover {
        --spectrum-alias-icon-color-hover: var(--spectrum-global-color-red-700);
    }
</style>
/*
 * Copyright 2021 Zindex Software
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type {Animation} from "../../Core";

export const RULER_PADDING: number = 6;
export const RULER_DIVISIONS: number = 30;
export const FRAME = 1000 / RULER_DIVISIONS;
export const MAJOR_GRADUATION_WIDTH: number = 240;
export const MINOR_GRADUATION_WIDTH: number = MAJOR_GRADUATION_WIDTH / RULER_DIVISIONS;
export const UNIT: number = MAJOR_GRADUATION_WIDTH / 1000;

export function roundTime(time: number, scaleFactor: number = 1): number {
    if (time <= 0) {
        return 0;
    }
    const frame = scaleFactor * FRAME;
    return Math.round(Math.round(time / frame) * frame);
    //
    // time = Math.round(time);
    // const frame = Math.round(FRAME);
    // time = time - time % frame;
    // const totalFrames = time / frame;
    // const elapsedFrames = totalFrames % RULER_DIVISIONS;
    // const elapsedSeconds = (totalFrames - elapsedFrames) / RULER_DIVISIONS;
    // return Math.round(elapsedSeconds * 1000 + elapsedFrames * FRAME);
}

export function getTimeAtX(x: number, scroll: number, zoom: number): number {
    return (x + scroll - RULER_PADDING) / zoom / UNIT;
}

export function getXAtTime(time: number, scroll: number, zoom: number): number {
    return time * UNIT * zoom - scroll + RULER_PADDING;
}

export function getDeltaTimeByX(x: number, zoom: number): number {
    return x / zoom / UNIT;
}

export function getRoundedDeltaTimeByX(x: number, offset: number, zoom: number, scaleFactor: number): number {
    return roundTime(offset + getDeltaTimeByX(x, zoom), scaleFactor) - offset;
}

const SCALES = [0.05, 0.1, 0.125, 0.25, 0.5];
const LAST_SCALE = SCALES.length - 1;
export function getScaleFactor(zoom: number): number {
    if (zoom > SCALES[LAST_SCALE]) {
        return 1;
    }

    for (let i = 0; i <= LAST_SCALE; i++) {
        if (zoom <= SCALES[i]) {
            return 1 / SCALES[i];
        }
    }

    return 1;
}

export function renderRuler(context: CanvasRenderingContext2D, width: number, height: number, scroll: number, zoom: number, scaleFactor: number): void {
    scroll /= zoom;

    const t = scroll / MINOR_GRADUATION_WIDTH;
    let graduationNo = Math.floor(t);
    const delta = ((Math.round(t * 100) - graduationNo * 100) / 100);

    let x = RULER_PADDING > scroll ? RULER_PADDING - scroll : RULER_PADDING;
    x -= delta * MINOR_GRADUATION_WIDTH * zoom;

    const step = MINOR_GRADUATION_WIDTH * zoom;

    const path = new Path2D();

    while (true) {
        path.moveTo(x + 0.5, height);

        if (graduationNo % (RULER_DIVISIONS * scaleFactor) === 0) {
            path.lineTo(x + 0.5, height - 20);
            context.fillText(formatSeconds(graduationNo / RULER_DIVISIONS), Math.ceil(x) + 4.5, height - 15);
        } else if (graduationNo % (RULER_DIVISIONS * scaleFactor / 2) === 0) {
            path.lineTo(x + 0.5, height - 15);
        } else if (graduationNo % scaleFactor === 0) {
            path.lineTo(x + 0.5, height - 10);
        }

        x += step;
        graduationNo++;

        if (x > width) {
            break;
        }
    }

    context.stroke(path);
}

export function getDurationBounds(startTime: number, endTime: number, width: number, scroll: number, zoom: number): [number, number] | null {
    let start = getXAtTime(startTime, scroll, zoom);
    if (start <= 0) {
        start = 0;
    }
    let stop = getXAtTime(endTime, scroll, zoom);
    if (stop < 0) {
        stop = 0;
    } else if (stop - start > width) {
        stop = width + start;
    }
    if (stop <= start) {
        return null;
    }

    return [start, stop];
}


export function formatSeconds(s: number): string {
    let m = (s - s % 60) / 60;
    let h = (m - m % 60) / 60;
    m = m % 60;
    s = s % 60;

    if (h > 0) {
        return `${h}:${m > 9 ? m : '0' + m}:${s > 9 ? s : '0' + s}`;
    }

    return `${m > 9 ? m : '0' + m}:${s > 9 ? s : '0' + s}`;
}

export function formatTime(time: number): string {
    time = Math.round(time);
    let k = time % 1000;
    time = (time - k) / 1000;
    let s = time % 60;
    time = (time - s) / 60;
    // let m = time % 60;
    // time = (time - m) / 60;
    // return `${time}:${m > 9 ? m : '0' + m}:${s > 9 ? s : '0' + s}:${k > 99 ? k : '0' + (k > 9 ? k : '0' + k)}`;
    return `${time > 9 ? time : '0' + time}:${s > 9 ? s : '0' + s}.${k > 99 ? k : '0' + (k > 9 ? k : '0' + k)}`;
}

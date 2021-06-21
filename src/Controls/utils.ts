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

export type TShirtSize = 'S' | 'M' | 'L' | 'XL';
export type TShirtSizeSimple = 'S' | 'M' | 'L';
export type TShirtSizeExtended = 'XXS' | 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';
export type ButtonVariant = 'cta' | 'primary' | 'secondary' | 'negative' | 'overBackground';

export function TShirtSizeToNumber(size: TShirtSize, fallback: string = '100'): string {
    switch (size) {
        case 'XL':
            return '300';
        case 'L':
            return '200';
        case 'M':
            return '100';
        case 'S':
            return '75';
        default:
            return fallback;
    }
}

export function formatNumber(value: number, digits: number): string {
    if (Number.isInteger(value)) {
        return value.toFixed(0);
    }
    return (+value.toFixed(digits)).toString();
}

export function clampStep(value: number, min: number, max: number, step: number = 1): number {
    if (isNaN(value) || value <= min) {
        return min;
    }

    if (value >= max) {
        return max;
    }

    if (step != null) {
        if (step === 1 || step === -1) {
            return Math.round(value);
        }
        if (!Number.isInteger(value / step)) {
            // value = Math.round(value * 1000000000) / 1000000000;
            return value - (value % step);
        }
    }

    return value;
}

export function getPercentage(value: number, min: number, max: number): number {
    return Math.round((value - min) / (max - min) * 10000) / 100;
}

export function getPercentValue(percent: number, min: number, max: number): number {
    return (max - min) * percent + min;
}

export function mergeClasses(...cls): string | null {
    if (!cls.length) {
        return null;
    }

    const ret = [];

    for (let c of cls) {
        c = parseClass(c);
        if (c == null || c.length === 0) {
            continue;
        }
        for (const v of c) {
            if (!ret.includes(v)) {
                ret.push(v);
            }
        }
    }

    return ret.length === 0 ? null : ret.join(' ');
}

function isString(data: any): boolean {
    return typeof data === 'string';
}

function trim(data: string): string {
    return data.trim();
}

function parseClass(cls: any): string[] | null {
    switch (typeof cls) {
        case 'string':
            cls = cls.trim();
            if (cls === '') {
                return null;
            }
            if (cls.indexOf(' ') === -1) {
                return [cls];
            }
            return cls.split(' ');
        case 'function':
            return parseClass(cls());
        case 'object':
            if (Array.isArray(cls)) {
                return cls.filter(isString).map(trim);
            }
            let obj = [];
            for (const p in cls) {
                if (cls.hasOwnProperty(p) && cls[p]) {
                    if (typeof cls[p] === 'string') {
                        obj.push(p + cls[p]);
                    } else {
                        obj.push(p);
                    }
                }
            }
            return obj.length > 0 ? obj : null;
    }

    return null;
}

export function getXYPercent(e: PointerEvent, bbox: DOMRect): {x: number, y: number} {
    return {
        x: clampStep((e.clientX - bbox.left) / bbox.width, 0, 1, null),
        y: clampStep((e.clientY - bbox.top) / bbox.height, 0, 1, null),
    };
}

export function dragAction(node, params) {
    let surface: HTMLElement = params?.surface,
        move: ((value: {x: number, y: number}) => void) = params?.move,
        start: (value: {x: number, y: number}) => void = params?.start,
        end: (changed: boolean, value: {x: number, y: number}) => void = params?.end,
        raw: boolean = params?.raw
    ;

    let last: {x: number, y: number, bbox?: DOMRect};
    let original: {x: number, y: number, bbox?: DOMRect};
    let bbox: DOMRect;

    const onPointerMove = (e: PointerEvent) => {
        const value = raw ? {x: e.clientX, y: e.clientY, bbox} : getXYPercent(e, bbox);
        if (last.x !== value.x || last.y !== value.y) {
            last = value;
            move && move(value);
        }
    };

    const onPointerUp = () => {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);

        end && end(original.x !== last.x || original.y !== last.y, last);
        bbox = original = last = null;
    };

    const onPointerDown = e => {
        bbox = surface.getBoundingClientRect();
        original = last = raw ? {x: e.clientX, y: e.clientY, bbox} : getXYPercent(e, bbox);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        start && start(original);
    }

    let added = false;
    if (surface) {
        added = true;
        node.addEventListener('pointerdown', onPointerDown);
    }

    return {
        update(params) {
            surface = params?.surface;
            start = params?.start;
            end = params?.end;
            move = params?.move;
            raw = params?.raw;
            if (surface && !added) {
                node.addEventListener('pointerdown', onPointerDown);
                added = true;
            }
        },
        destroy() {
            if (bbox) {
                onPointerUp();
            }
        },
    };
}

let id = 0;

export function nextId(): number {
    return id++;
}

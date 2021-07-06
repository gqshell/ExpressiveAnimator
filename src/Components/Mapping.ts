import type {Element} from "@zindex/canvas-engine";

type ElementInfo = {
    title: string,
    icon: string
};

export const ElementInfoMap: {[type: string]: ElementInfo} = {
    rect: {
        title: 'Rectangle',
        icon: 'expr:rectangle-tool'
    },
    ellipse: {
        title: 'Ellipse',
        icon: 'expr:ellipse'
    },
    star: {
        title: 'Star',
        icon: 'expr:star-tool'
    },
    'regular-polygon': {
        title: 'Regular polygon',
        icon: 'expr:polygon'
    },
    poly: {
        title: 'Polyline',
        icon: 'expr:polyline-tool'
    },
    path: {
        title: 'Path',
        icon: 'expr:path'
    },
    symbol: {
        title: 'Symbol',
        icon: 'expr:symbol'
    },
    group: {
        title: 'Group',
        icon: 'expr:group'
    },
    'clip-path': {
        title: 'Clip path',
        icon: 'expr:clip-path'
    },
    'mask': {
        title: 'Mask',
        icon: null, // TODO
    },
    text: {
        title: 'Text',
        icon: 'expr:text-tool'
    },
};

export function getElementTitle(element: Element): string {
    return element.title || ElementInfoMap[element.type].title || ('(' + element.type + ')');
}

export function getElementIcon(element: Element): string {
    return ElementInfoMap[element.type]?.icon || 'expr:unknown';
}


export const PropertyNameMap = {
    global: {
        // Transform
        originX: 'Origin X',
        originY: 'Origin Y',
        translateX: 'Translate X',
        translateY: 'Translate Y',
        scaleX: 'Scale X',
        scaleY: 'Scale Y',
        skewX: 'Skew X',
        skewY: 'Skew Y',
        rotate: 'Rotate',

        //
        opacity: 'Opacity',

        // Fill
        fill: 'Fill',
        fillOpacity: 'Fill opacity',

        // Stroke
        strokeBrush: 'Stroke',
        strokeOpacity: 'Stroke opacity',
        strokeLineWidth: 'Stroke width',
        strokeDashArray: 'Stroke dashes',
        strokeDashOffset: 'Stroke dash offset',
    },
    rect: {
        width: 'Width',
        height: 'Height',
        // TODO: radius
        radius: 'Corner radius',
    },
    ellipse: {
        width: 'Width',
        height: 'Height',
    },
    poly: {
        // TODO: poly
        //shape: 'Points',
    },
    // TODO: rest
}
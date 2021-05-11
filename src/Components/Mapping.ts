export const ElementIconMap = {
    group: 'expr:group',
    rect: 'expr:rectangle-tool',
    ellipse: 'expr:ellipse',
    poly: 'expr:polygon',
}

export const FallbackElementIcon = 'expr:unknown';

export const ElementTitleMap = {
    group: 'Group',
    rect: 'Rectangle',
    ellipse: 'Ellipse',
    path: 'Path',
    star: 'Star',
    poly: 'Polygon',
    'regular-polygon': 'Regular polygon',
    'clip-path': 'Clip path',
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
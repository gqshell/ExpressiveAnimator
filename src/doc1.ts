import {
    Document,
    Rectangle,
    RectElement,
    RectShape,
    SolidBrush,
    Color,
    DefaultPen,
    NumberAnimation, Keyframe, AnimationManager
} from "@zindex/canvas-engine";

const doc = new Document(new Rectangle(0, 0, 500, 800), 'doc-1');

const rect = new RectElement(new RectShape(100, 100), 'rect-1');
rect.title = 'Rect 1';
rect.fill = new SolidBrush(Color.from('green'));
rect.stroke = new DefaultPen(
    new SolidBrush(Color.from('blue')),
    5
);

const rect2 = new RectElement(new RectShape(300, 300), 'rect-2');
rect2.title = 'Rect 2';
rect2.fill = new SolidBrush(Color.from('yellow'));
rect2.stroke = new DefaultPen(
    new SolidBrush(Color.from('red')),
    3
);
rect2.translateX = 500;
rect2.translateY = 200;

doc.appendChild(rect);
doc.appendChild(rect2);

const animationManager = new AnimationManager(1200);

animationManager.addAnimation(rect, 'global', 'translateX', new NumberAnimation([
    new Keyframe(0, 0),
    new Keyframe(100, 500),
    new Keyframe(300, 1000),
], false));

animationManager.addAnimation(rect, 'global', 'translateY', new NumberAnimation([
    new Keyframe(0, 100),
    new Keyframe(10, 300),
    new Keyframe(50, 800),
], false));

animationManager.addAnimation(rect2, 'global', 'scaleX', new NumberAnimation([
    new Keyframe(0, 0),
    new Keyframe(100, 500),
    new Keyframe(300, 1000),
], false));

export {
    doc,
    animationManager
}

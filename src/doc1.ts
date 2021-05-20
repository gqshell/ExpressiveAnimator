import {
    MasterDocument,
    Project,
    RectElement,
    RectShape,
    SolidBrush,
    Color,
    DefaultPen,
    Point,
    NumberAnimation, Keyframe, AnimationManager, Size
} from "@zindex/canvas-engine";

const doc = new MasterDocument(new Size(500, 800));

const rect = new RectElement(doc, new RectShape(100, 100));
rect.title = 'Rect 1';
rect.fill = new SolidBrush(Color.from('green'));
rect.stroke = new DefaultPen(
    new SolidBrush(Color.from('blue')),
    5
);

const rect2 = new RectElement(doc, new RectShape(300, 300));
rect2.title = 'Rect 2';
rect2.fill = new SolidBrush(Color.from('yellow'));
rect2.stroke = new DefaultPen(
    new SolidBrush(Color.from('red')),
    3
);
rect2.position = new Point(500, 200);

doc.appendChild(rect);
doc.appendChild(rect2);

const animationManager = new AnimationManager(1200);

animationManager.addAnimation(rect, 'global', 'positionX', new NumberAnimation([
    new Keyframe(0, 0),
    new Keyframe(100, 500),
    new Keyframe(300, 1000),
], false));

animationManager.addAnimation(rect, 'global', 'positionY', new NumberAnimation([
    new Keyframe(0, 100),
    new Keyframe(10, 300),
    new Keyframe(50, 800),
], false));

animationManager.addAnimation(rect2, 'global', 'scaleX', new NumberAnimation([
    new Keyframe(0, 0),
    new Keyframe(100, 500),
    new Keyframe(300, 1000),
], false));

const project = new Project(doc);

export {
    project,
    doc,
    animationManager
}

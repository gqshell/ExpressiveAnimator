import {
    RectElement,
    RectShape,
    SolidBrush,
    Color,
    DefaultPen,
    Point,
    Size,
    GroupElement,
} from "@zindex/canvas-engine";

import {DocumentAnimation, AnimatorSource, AnimationProject, AnimationDocument} from "./Core";

const animators = new AnimatorSource();
const project = new AnimationProject(animators);

const doc = new AnimationDocument(new Size(500, 800));
doc.title = 'Test document 1';
doc.animation = new DocumentAnimation(doc, 0, 10000);

const rect = new RectElement(new RectShape(100, 100), doc);
rect.title = 'Rect 1';
rect.fill = new SolidBrush(Color.from('green'));
rect.stroke = new DefaultPen(
    new SolidBrush(Color.from('blue')),
    5
);
doc.appendChild(rect);

const a1 = animators.createAnimation(rect, "position");
a1.addKeyframeAtOffset(0, new Point(0, 0));
a1.addKeyframeAtOffset(2000, new Point(100, 0));
a1.addKeyframeAtOffset(5000, new Point(500, 0));
doc.animation.addAnimation(rect, "position", a1);

const rect2 = new RectElement(new RectShape(300, 300), doc);
rect2.title = 'Rect 2';
rect2.fill = new SolidBrush(Color.from('yellow'));
rect2.stroke = new DefaultPen(
    new SolidBrush(Color.from('red')),
    3
);

const a2 = animators.createAnimation(rect2, "position");
a2.addKeyframeAtOffset(1000, new Point(0, 300));
a2.addKeyframeAtOffset(5000, new Point(400, 500));
a2.addKeyframeAtOffset(9000, new Point(800, 700));
doc.animation.addAnimation(rect2, "position", a2);

const g1 = new GroupElement(doc);
g1.title = 'Group 1';
g1.appendChild(rect2);

doc.appendChild(g1);

project.addDocument(doc);

project.isRecording = true;

export {
    project,
    doc,
}

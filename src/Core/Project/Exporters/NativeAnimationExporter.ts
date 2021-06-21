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

import type {Exporter} from "@zindex/canvas-engine";
import type {AnimationProject} from "../AnimationProject";
import {AutomaticGrid, NativeWriter} from "@zindex/canvas-engine";
import type {
    ClipPathElement,
    Element,
    EllipseElement, Grid,
    GroupElement, GuideList, PathElement, PolyElement, RectElement,
    RegularPolygonElement, StarElement, TextElement,
    VectorElement
} from "@zindex/canvas-engine";
import {
    Brush,
    BrushType, ConicalGradientBrush, Font,
    GradientBrush,
    LinearGradientBrush, Matrix, Path, PathNode, Pen,
    Point,
    RadialGradientBrush, RectShapeRadius,
    SolidBrush
} from "@zindex/canvas-engine";
import {
    Animation,
    BrushAnimation,
    DocumentAnimation,
    MotionAnimation, PathAnimation,
    PointAnimation, PolyAnimation,
    RectRadiusAnimation
} from "../../Animation";
import type {AnimationDocument} from "../AnimationDocument";
import type {AnimatedMaskElement, AnimatedSymbolElement} from "../../Elements";

export class NativeAnimationExporter implements Exporter<AnimationProject> {
    private writer: NativeWriter;

    constructor() {
        this.writer = new NativeWriter();
    }

    async export(project: AnimationProject): Promise<ReadableStream> {
        await this.writer.addManifest(this.getManifest(project));

        for (const doc of project.getDocuments()) {
            await this.writer.addDocument(this.serializeDocument(doc));
        }

        return this.writer.toStream();
    }

    dispose() {
        this.writer.dispose();
    }

    protected getManifest(project: AnimationProject): any {
        const data: any = {
            type: 'expressive/animation',
            version: 10,
            documents: [],
            masterDocument: project.masterDocument.id
        };

        for (const doc of project.getDocuments()) {
            data.documents.push(doc.id);
        }

        return data;
    }

    protected serializeDocument(document: AnimationDocument): any {
        const data: any = {
            id: document.id,
            title: document.title,
            guides: this.serializeGuides(document.guides),
            grid: this.serializeGrid(document.grid),
            properties: {
                size: {width: document.size.width, height: document.size.height},
            },
            animation: this.serializeAnimation(document.animation),
            children: [],
        }

        for (const element of document.children()) {
            data.children.push(this.serializeElement(element));
        }

        return data;
    }

    protected serializeElement(element: Element): any {
        const data: any = {
            id: element.id,
            title: element.title,
            type: element.type,
            locked: element.locked,
            hidden: element.hidden,
            properties: this.serializeElementProperties(element),
        };

        if (element.supportsChildren) {
            data.children = [];
            for (let child of element.children()) {
                data.children.push(this.serializeElement(child));
            }
        }

        return data;
    }

    protected serializeElementProperties(element: Element): any {
        const data: any = {
            element: {
                anchor: this.serializePoint(element.anchor),
                scale: this.serializePoint(element.scale),
                position: this.serializePoint(element.position),
                rotate: element.rotate,
                skewAngle: element.skewAngle,
                skewAxis: element.skewAxis,
                orientation: element.orientation,
                opacity: element.opacity,
                blend: element.blend,
                isolate: element.isolate,
            }
        }

        switch (element.type) {
            case "clip-path":
                data.clipPath = this.serializeClipPathElementProperties(element as ClipPathElement);
                break;
            case "ellipse":
                data.vector = this.serializeVectorElementProperties(element as VectorElement);
                data.ellipse = this.serializeEllipseElementProperties(element as EllipseElement);
                break;
            case "group":
                data.group = this.serializeGroupElementProperties(element as GroupElement);
                break;
            case "mask":
                data.mask = this.serializeMaskElementProperties(element as AnimatedMaskElement);
                break;
            case "path":
                data.vector = this.serializeVectorElementProperties(element as VectorElement);
                data.path = this.serializePathElementProperties(element as PathElement);
                break;
            case "poly":
                data.vector = this.serializeVectorElementProperties(element as VectorElement);
                data.poly = this.serializePolyElementProperties(element as PolyElement);
                break;
            case "rect":
                data.vector = this.serializeVectorElementProperties(element as VectorElement);
                data.rect = this.serializeRectElementProperties(element as RectElement);
                break;
            case "regular-polygon":
                data.vector = this.serializeVectorElementProperties(element as VectorElement);
                data.regularPolygon = this.serializeRegularPolygonElementProperties(element as RegularPolygonElement);
                break;
            case "star":
                data.vector = this.serializeVectorElementProperties(element as VectorElement);
                data.star = this.serializeStarElementProperties(element as StarElement);
                break;
            case "symbol":
                data.symbol = this.serializeSymbolElementProperties(element as AnimatedSymbolElement);
                break;
            case "text":
                data.vector = this.serializeVectorElementProperties(element as VectorElement);
                data.text = this.serializeTextElementProperties(element as TextElement);
                break;
        }

        return data;
    }

    protected serializeVectorElementProperties(element: VectorElement): any {
        return {
            stroke: this.serializePen(element.stroke),
            fill: this.serializeBrush(element.fill),
            fillOpacity: element.fillOpacity,
            strokeOpacity: element.strokeOpacity,
            paintOrder: element.paintOrder,
            fillRule: element.fillRule
        }
    }

    protected serializeClipPathElementProperties(element: ClipPathElement): any {
        return {
            path: this.serializePath(element.path)
        }
    }

    protected serializeEllipseElementProperties(element: EllipseElement): any {
        return {
            width: element.width,
            height: element.height,
        }
    }

    protected serializeGroupElementProperties(element: GroupElement): any {
        return {};
    }

    protected serializeMaskElementProperties(element: AnimatedMaskElement): any {
        return {
            reference: element.reference,
            time: element.time,
        }
    }

    protected serializePathElementProperties(element: PathElement): any {
        return {
            path: this.serializePath(element.path)
        }
    }

    protected serializePolyElementProperties(element: PolyElement): any {
        return {
            points: this.serializePoints(element.points),
            isClosed: element.isClosed,
        }
    }

    protected serializeRectElementProperties(element: RectElement): any {
        return {
            width: element.width,
            height: element.height,
            radius: this.serializeRectShapeRadius(element.radius),
        }
    }

    protected serializeRegularPolygonElementProperties(element: RegularPolygonElement): any {
        return {
            sides: element.sides,
            radius: element.radius,
            cornerRadius: element.cornerRadius,
            angle: element.angle
        }
    }

    protected serializeStarElementProperties(element: StarElement): any {
        return {
            sides: element.sides,
            outerRotate: element.outerRotate,
            outerRadius: element.outerRadius,
            outerCornerRadius: element.outerCornerRadius,
            innerRotate: element.innerRotate,
            innerRadius: element.innerRadius,
            innerCornerRadius: element.innerCornerRadius,
            angle: element.angle
        }
    }

    protected serializeSymbolElementProperties(element: AnimatedSymbolElement): any {
        return {
            reference: element.reference,
            width: element.width,
            height: element.height,
            time: element.time
        }
    }

    protected serializeTextElementProperties(element: TextElement): any {
        return {
            text: element.text,
            font: this.serializeFont(element.font)
        }
    }

    protected serializePoints(points: Point[]): any {
        return points.map(this.serializePoint);
    }

    protected serializePoint(point: Point): any {
        return {x: point.x, y: point.y};
    }

    protected serializeBrush(brush: Brush): any {
        const data: any = {
            type: brush.type,
        };

        switch (brush.type) {
            case  BrushType.Solid:
                data.color = (brush as SolidBrush).color.code;
                break;
            case BrushType.LinearGradient:
            case BrushType.RadialGradient:
            case BrushType.ConicalGradient:
                data.spread = (brush as GradientBrush).spread;
                data.stopColors = (brush as GradientBrush).stopColors.list.map(sc => ({color: sc.color.code, offset: sc.offset}));
                data.transform = this.serializeMatrix((brush as GradientBrush).transform);
                break;
        }

        switch (brush.type) {
            case BrushType.LinearGradient:
                data.start = (brush as LinearGradientBrush).start;
                data.end = (brush as LinearGradientBrush).end;
                break;
            case BrushType.RadialGradient:
                data.center = (brush as RadialGradientBrush).center;
                data.radius = (brush as RadialGradientBrush).radius;
                break;
            case BrushType.ConicalGradient:
                data.center = (brush as ConicalGradientBrush).center;
                data.startAngle = (brush as ConicalGradientBrush).startAngle;
                data.endAngle = (brush as ConicalGradientBrush).endAngle;
                break;
        }

        return data;
    }

    protected serializePen(pen: Pen): any {
        return {
            brush: this.serializeBrush(pen.brush),
            width: pen.width,
            lineCap: pen.lineCap,
            lineJoin: pen.lineJoin,
            miterLimit: pen.miterLimit,
            dashes: pen.dashes,
            offset: pen.offset
        }
    }

    protected serializePath(path: Path): any {
        return path.nodes.map(this.serializePathNode);
    }

    protected serializePathNode(pathNode: PathNode): any {
        return {
            x: pathNode.x,
            y: pathNode.y,
            type: pathNode.type,
            joint: pathNode.joint,
            handleIn: pathNode.handleIn,
            handleOut: pathNode.handleOut
        };
    }

    protected serializeFont(font: Font): any {
        return {
            family: font.family,
            style: font.style,
            weight: font.weight,
            size: font.size,
        }
    }

    protected serializeMatrix(matrix: Matrix | null): any {
        if (matrix === null) {
            return null;
        }
        return  {a: matrix.a, b: matrix.b, c: matrix.c, d: matrix.d, e: matrix.e, f: matrix.f};
    }

    protected serializeRectShapeRadius(radius: RectShapeRadius): any {
        return {
            rx: radius.rx,
            ry: radius.ry,
            multiple: radius.multiple,
        };
    }

    protected serializeAnimation(animation: DocumentAnimation): any {
        return {
            startTime: animation.startTime,
            endTime: animation.endTime,
            mode: animation.mode,
            animations: this.serializeAnimationList(animation),
        };
    }

    protected serializeAnimationList(animation: DocumentAnimation): any {
        const hold = {};

        for (const [elementId, properties] of animation.getAnimatedEntries()) {
            const h = {};
            for (const [propertyName, animation] of Object.entries(properties)) {
                h[propertyName] = this.serializeAnimationItem(animation);
            }
            hold[elementId] = h;
        }

        return hold;
    }

    protected serializeAnimationItem(animation: Animation<any>): any {
        let type = "generic";
        let valueSerializer = v => v;
        let easingSerializer = v => v;

        if (animation instanceof PointAnimation) {
            type = "point";
            valueSerializer = this.serializePoint.bind(this);
        } else if (animation instanceof BrushAnimation) {
            type = "brush";
            valueSerializer = this.serializeBrush.bind(this);
        } else if (animation instanceof MotionAnimation) {
            type = "path-node";
            valueSerializer = this.serializePathNode.bind(this);
        } else if (animation instanceof RectRadiusAnimation) {
            type = "rect-shape-radius";
            valueSerializer = this.serializeRectShapeRadius.bind(this);
        } else if (animation instanceof PathAnimation) {
            type = "path";
            valueSerializer = this.serializePath.bind(this);
        } else if (animation instanceof PolyAnimation) {
            type = "point-array";
            valueSerializer = this.serializePoints.bind(this);
        }

        return {
            type,
            disabled: animation.disabled,
            keyframes: animation.keyframes.map(k => ({
                easing: easingSerializer(k.easing),
                offset: k.offset,
                value: valueSerializer(k.value)
            })),
        }
    }

    protected serializeGuides(guideList: GuideList): any {
        const guides = [];
        for (const guide of guideList) {
            guides.push({
                position: guide.position,
                isHidden: guide.isHidden,
                isHorizontal: guide.isHorizontal
            })
        }
        return {
            guides
        };
    }

    protected serializeGrid(grid: Grid): any {
        if (grid instanceof AutomaticGrid) {
            return {
                horizontalSubdivisions: grid.horizontalSubdivisions,
                verticalSubdivisions: grid.verticalSubdivisions,
                color: grid.color.code,
            }
        }
        return null;
    }
}
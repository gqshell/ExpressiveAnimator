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

import type {Importer} from "@zindex/canvas-engine";
import {AnimationProject} from "../AnimationProject";
import {NativeReader} from "@zindex/canvas-engine";
import {AnimatorSource, DocumentAnimation} from "../../Animation";
import {
    AutomaticGrid,
    ClipPathElement,
    Document,
    Element,
    EllipseElement, Grid,
    GroupElement, Guide, GuideList,
    Orientation, PathElement, PolyElement, RectElement, RegularPolygonElement, StarElement, TextElement,
    VectorElement
} from "@zindex/canvas-engine";
import {
    BlendMode, Brush, BrushType, Color, ConicalGradientBrush, DefaultPen,
    EllipseShape,
    FillRule, Font, FontManager, LinearGradientBrush, Matrix,
    PaintOrder, Path, PathNode, Pen, Point,
    PolyShape, RadialGradientBrush,
    RectShape,
    RectShapeRadius, RectShapeRadiusAxis, RegularPolygonShape,
    Size, SolidBrush, StarShape, StopColorList
} from "@zindex/canvas-engine";
import {AnimationDocument} from "../AnimationDocument";
import {AnimatedMaskElement, AnimatedSymbolElement} from "../../Elements";

export class NativeAnimationImporter implements Importer<AnimationProject> {

    private source: AnimatorSource;

    async import(stream: ReadableStream): Promise<AnimationProject> {
        const reader = await NativeReader.fromStream(stream);
        const manifest = reader.getManifest();

        this.source = new AnimatorSource();

        const project = new AnimationProject(this.source);

        for (const docId of manifest.documents) {
            project.addDocument(this.deserializeDocument(reader.getDocument(docId) as AnimationDocument));
        }

        project.masterDocument = project.getDocumentById(manifest.masterDocument);

        return project;
    }

    dispose() {
        // nothing here
    }

    protected deserializeDocument(data: any): AnimationDocument {
        // TODO: We should have specialized documents
        const document = new AnimationDocument(new Size(data.properties.size.width, data.properties.size.height), data.id);

        document.title = data.title;
        document.grid = this.deserializeGrid(data.grid);
        document.guides = this.deserializeGuides(data.guides);


        for (const child of data.children) {
            document.appendChild(this.deserializeElement(document, child));
        }

        document.animation = this.deserializeAnimation(document, data.animation);

        return document;
    }

    protected deserializeElement(document: Document, data: any): Element {
        let element: Element = null, isVector = false;

        switch (data.type) {
            case "clip-path":
                element = this.deserializeClipPathElement(document, data.id, data.properties.clipPath);
                break;
            case "ellipse":
                element = this.deserializeEllipseElement(document, data.id, data.properties.ellipse);
                isVector = true;
                break;
            case "group":
                element = this.deserializeGroupElement(document, data.id, data.properties.group);
                break;
            case "mask":
                element = this.deserializeMaskElement(document, data.id, data.properties.mask);
                break;
            case "path":
                element = this.deserializePathElement(document, data.id, data.properties.path);
                isVector = true;
                break;
            case "poly":
                element = this.deserializePolyElement(document, data.id, data.properties.poly);
                isVector = true;
                break;
            case "rect":
                element = this.deserializeRectElement(document, data.id, data.properties.rect);
                isVector = true;
                break;
            case "regular-polygon":
                element = this.deserializeRegularPolygonElement(document, data.id, data.properties.regularPolygon);
                isVector = true;
                break;
            case "star":
                element = this.deserializeStarElement(document, data.id, data.properties.star);
                isVector = true;
                break;
            case "symbol":
                element = this.deserializeSymbolElement(document, data.id, data.properties.symbol);
                break;
            case "text":
                element = this.deserializeTextElement(document, data.id, data.properties.text);
                isVector = true;
                break;
        }

        if (element === null) {
            throw new Error("Unknown element type '" + data.type + "'");
        }

        element.title = data.title;
        element.locked = data.locked;
        element.hidden = data.hidden;

        this.setElementProperties(element, data.properties.element);

        if (isVector) {
            this.setVectorElementProperties(element as VectorElement, data.properties.vector);
        }

        if (data.children) {
            for (let d of (data.children as any[])) {
                element.appendChild(this.deserializeElement(document, d));
            }
        }

        return element;
    }

    protected setElementProperties(element: Element, properties: any) {
        element.anchor = this.deserializePoint(properties.anchor);
        element.scale = this.deserializePoint(properties.scale);
        element.position = this.deserializePoint(properties.position);
        element.rotate = properties.rotate;
        element.skewAngle = properties.skewAngle;
        element.skewAxis = properties.skewAxis;
        element.orientation = properties.orientation as Orientation;
        element.opacity = properties.opacity;
        element.blend = properties.blend as BlendMode;
        element.isolate = properties.isolate;
    }

    protected setVectorElementProperties(element: VectorElement, properties: any): VectorElement {
        element.stroke = this.deserializePen(properties.stroke);
        element.fill = this.deserializeBrush(properties.fill);
        element.fillOpacity = properties.fillOpacity;
        element.strokeOpacity = properties.strokeOpacity;
        element.paintOrder = properties.paintOrder as PaintOrder;
        element.fillRule = properties.fillRule as FillRule;

        return element;
    }

    protected deserializeClipPathElement(document: Document, id: string, properties: any): ClipPathElement {
        return new ClipPathElement(
            this.deserializePath(properties.path),
            document,
            id
        );
    }

    protected deserializeEllipseElement(document: Document, id: string, properties: any): EllipseElement {
        return new EllipseElement(
            new EllipseShape(properties.width, properties.height),
            document,
            id
        );
    }

    protected deserializeGroupElement(document: Document, id: string, properties: any): GroupElement {
        return new GroupElement(document, id);
    }

    protected deserializeMaskElement(document: Document, id: string, properties: any): AnimatedMaskElement {
        const element: AnimatedMaskElement = new AnimatedMaskElement(properties.reference, document, id);
        element.time = properties.reference;
        return element;
    }

    protected deserializePathElement(document: Document, id: string, properties: any): PathElement {
        return new PathElement(this.deserializePath(properties.path), document, id);
    }

    protected deserializePolyElement(document: Document, id: string, properties: any): PolyElement {
        return new PolyElement(
            new PolyShape(this.deserializePoints(properties.points), properties.isClosed),
            document,
            id
        );
    }

    protected deserializeRectElement(document: Document, id: string, properties: any): RectElement {
        return new RectElement(
            new RectShape(
                properties.width,
                properties.height,
                this.deserializeRectShapeRadius(properties.radius)
            ),
            document,
            id
        );
    }

    protected deserializeRegularPolygonElement(document: Document, id: string, properties: any): RegularPolygonElement {
        return new RegularPolygonElement(
            new RegularPolygonShape(
                properties.sides,
                properties.radius,
                properties.cornerRadius,
                properties.angle
            ),
            document,
            id
        );
    }

    protected deserializeStarElement(document: Document, id: string, properties: any): StarElement {
        return new StarElement(
            new StarShape(
                properties.sides,
                properties.outerRadius,
                properties.innerRadius,
                properties.outerCornerRadius,
                properties.innerCornerRadius,
                properties.outerRotate,
                properties.innerRotate,
                properties.angle
            ),
            document,
            id
        );
    }

    protected deserializeSymbolElement(document: Document, id: string, properties: any): AnimatedSymbolElement {
        const element: AnimatedSymbolElement = new AnimatedSymbolElement(properties.reference, document, id);
        element.width = properties.width;
        element.height = properties.height;
        element.time = properties.time;
        return element;
    }

    protected deserializeTextElement(document: Document, id: string, properties: any): TextElement {
        return new TextElement(document, properties.text, this.deserializeFont(properties.font), id);
    }

    protected deserializePoints(data: any[]): Point[] {
        return data.map(this.deserializePoint);
    }

    protected deserializePoint(data: any): Point {
        return new Point(data.x, data.y);
    }

    protected deserializeBrush(data: any): Brush {
        switch (data.type as BrushType) {
            case BrushType.Solid:
                return new SolidBrush(Color.fromCode(data.color));
            case BrushType.LinearGradient:
                return new LinearGradientBrush(
                    this.deserializePoint(data.start),
                    this.deserializePoint(data.end),
                    new StopColorList(
                        data.stopColors.map(sc => ({color: Color.fromCode(sc.color), offset: sc.offset}))
                    ),
                    data.spread,
                    this.deserializeMatrix(data.transform)
                );
            case BrushType.RadialGradient:
                return new RadialGradientBrush(
                    this.deserializePoint(data.center),
                    data.radius,
                    new StopColorList(
                        data.stopColors.map(sc => ({color: Color.fromCode(sc.color), offset: sc.offset}))
                    ),
                    data.spread,
                    this.deserializeMatrix(data.transform)
                );
            case BrushType.ConicalGradient:
                return new ConicalGradientBrush(
                    this.deserializePoint(data.center),
                    data.startAngle,
                    data.endAngle,
                    new StopColorList(
                        data.stopColors.map(sc => ({color: Color.fromCode(sc.color), offset: sc.offset}))
                    ),
                    data.spread,
                    this.deserializeMatrix(data.transform)
                );
        }

        throw new Error("Unsupported brush type '" + data.type  + "'");
    }

    protected deserializePen(data: any): Pen {
        return new DefaultPen(
            this.deserializeBrush(data.brush),
            data.width,
            data.lineCap,
            data.lineJoin,
            data.miterLimit,
            data.dashes,
            data.offset
        );
    }

    protected deserializePath(data: any): Path {
        return new Path(data.map(this.deserializePathNode));
    }

    protected deserializePathNode(data: any): PathNode {
        return new PathNode(data.x, data.y, data.type, data.joint, data.handleIn, data.handleOut);
    }

    protected deserializeRectShapeRadius(data: any): RectShapeRadius {
        return new RectShapeRadius(data.rx, data.ry, data.multiple);
    }

    protected deserializeFont(data: any): Font {
        return FontManager.getFont(
            data.family,
            data.style,
            data.weight,
            data.size
        );
    }

    protected deserializeMatrix(data: any): Matrix {
        if (!data) {
            return null;
        }
        return Matrix.Create(data);
    }

    protected deserializeAnimation(document, data: any): DocumentAnimation {
        const docAnimation = new DocumentAnimation(document, data.startTime, data.endTime, data.mode);
        return this.deserializeAnimationList(docAnimation, data.animations)
    }

    protected deserializeAnimationList(documentAnimation: DocumentAnimation, data: any): DocumentAnimation {
        let easingDeserializer =  v => v;
        let valueDeserializer = null;

        for (let [elementID, properties] of Object.entries(data)) {
            const element = documentAnimation.document.getElementById(elementID);
            for (let [propertyName, animation] of Object.entries(properties)) {
                switch (animation.type) {
                    case "point":
                        valueDeserializer = this.deserializePoint.bind(this);
                        break;
                    case "brush":
                        valueDeserializer = this.deserializeBrush.bind(this);
                        break;
                    case "path-node":
                        valueDeserializer = this.deserializePathNode.bind(this);
                        break;
                    case "rect-shape-radius":
                        valueDeserializer = this.deserializeRectShapeRadius.bind(this);
                        break;
                    case "path":
                        valueDeserializer = this.deserializePath.bind(this);
                        break;
                    case "point-array":
                        valueDeserializer = this.deserializePoints.bind(this);
                        break;
                    default:
                        valueDeserializer = v => v;
                }
                const anim = this.source.createAnimation(element, propertyName as any);
                anim.disabled = animation.disabled;
                for (let keyframe of animation.keyframes) {
                    anim.addKeyframeAtOffset(keyframe.offset, valueDeserializer(keyframe.value), easingDeserializer(keyframe.easing));
                }
                documentAnimation.addAnimation(element, propertyName as any, anim);
            }
        }

        return documentAnimation;
    }

    protected deserializeGuides(data: any): GuideList {
        const guides: GuideList = new GuideList(
            data.guides.map(g => new Guide(g.position, g.isHorizontal, g.isHidden))
        );
        guides.isVisible = data.isVisible;
        return guides;
    }

    protected deserializeGrid(data: any): Grid {
        const grid: Grid = new AutomaticGrid();
        grid.isVisible = data.isVisible;
        grid.drawToBack = data.drawToBack;
        return grid;
    }
}
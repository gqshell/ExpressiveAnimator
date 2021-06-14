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

import {Color, Matrix, DefaultPen, SolidBrush, Point, Rectangle, ConvexQuad} from "@zindex/canvas-engine";
import type {DrawingContext} from "@zindex/canvas-engine";
import type {Element} from "@zindex/canvas-engine";
import type {CanvasEngine} from "@zindex/canvas-engine";
import type {AxisPointPosition} from "@zindex/canvas-engine";
import {ShapeElement, ClipPathElement} from "@zindex/canvas-engine";

const BBoxLineWidth = 1;
const HandleRadius = 4;
const OriginRadius = 6;
const RotateRadius = 2;
const RotateOffset = HandleRadius + RotateRadius * 2;
const RotatePen = new DefaultPen(new SolidBrush(Color.from('gray')));
const OriginPen = new DefaultPen(new SolidBrush(Color.from('darkblue')));
const OutlinePen = new DefaultPen(new SolidBrush(Color.from('red')));
const HandleFill = new SolidBrush(Color.from('blue'));
const SelectionPen = new DefaultPen(HandleFill);
const SelectionWrapperPen = new DefaultPen(new SolidBrush(Color.from('lightgray')));
const SelectionRectangleFill = new SolidBrush(Color.from('blue'), 0.25);
const AngleFill = new SolidBrush(Color.from('orange'), 0.5);

export function drawRotateIndicator(context: DrawingContext, position: Point, startAngle: number, endAngle: number, point: Point | null, dpr: number = 1): void {
    if (startAngle === endAngle) {
        return;
    }

    const scale = context.matrix.lineScale / dpr;
    const size = OriginRadius * 3 / scale;

    startAngle = (startAngle + 180) % 360
    endAngle = (endAngle + 180) % 360;
    endAngle -= startAngle;
    if (endAngle < 0) {
        endAngle += 360;
    }

    context.drawArc(Rectangle.fromLTRB(
        position.x - size,
        position.y - size,
        position.x + size,
        position.y + size
    ), startAngle, endAngle, AngleFill);

    if (point) {
        OriginPen.width = 1 / scale;
        context.drawLine(position, point, OriginPen);
    }
}

export function calcRotatePointPosition(middle: Point, corner: Point, offset: number): Point {
    return Point.fromDirection(middle.getDirectionTo(corner), middle.distanceTo(corner) + offset, middle);
}

export function drawRotatePoints(context: DrawingContext, element: Element, dpr: number = 1): void {
    const scale = context.matrix.lineScale / dpr;
    const radius = RotateRadius / scale;
    const offset = RotateOffset / scale;

    RotatePen.width = 1 / scale;

    const bounds = element.globalBounds;
    for (const point of bounds.points) {
        context.drawCircle(calcRotatePointPosition(bounds.middle, point, offset), radius, RotatePen);
    }
}

export function getRotatePoint(element: Element, position: Point, scale: number = 1): Point | null {
    const radius = RotateRadius * scale;
    const offset = RotateOffset * scale;
    const bounds = element.globalBounds;

    for (const point of bounds.points) {
        if (position.distanceTo(calcRotatePointPosition(bounds.middle, point, offset)) <= radius) {
            return point;
        }
    }

    return null;
}

export function drawOrigin(context: DrawingContext, element: Element, rotate: boolean = true, dpr: number = 1) {
    const scale = context.matrix.lineScale / dpr;
    OriginPen.width = 1 / scale;

    const matrix = element.parent?.globalMatrix;
    const position  = matrix && !matrix.isIdentity ? matrix.transformPoint(element.position) : element.position;
    const radius = OriginRadius / scale;

    let rotateMatrix: Matrix = null;
    if (rotate) {
        const angle = (element.totalRotate % 360) * Math.sign(element.globalMatrix.a * element.globalMatrix.d);
        if (angle) {
            rotateMatrix = (new Matrix())
                .translate(position.x, position.y)
                .rotate(angle)
                .translate(-position.x, -position.y);
        }
    }

    const quad = ConvexQuad.fromPoints([
        {x: position.x, y: position.y - radius * 1.5},
        {x: position.x + radius * 1.5, y: position.y},
        {x: position.x, y: position.y + radius * 1.5},
        {x: position.x - radius * 1.5, y: position.y}
    ], rotateMatrix);

    context.drawCircle(position, radius, OriginPen);
    context.drawLine(quad.points[0], quad.points[2], OriginPen);
    context.drawLine(quad.points[1], quad.points[3], OriginPen);
}

export function isOverOrigin(element: Element, position: Point, scale: number = 1): boolean {
    const matrix = element.parent?.globalMatrix;
    const origin = matrix && !matrix.isIdentity ? matrix.transformPoint(element.position) : element.position;
    return position.distanceTo(origin) <= OriginRadius * scale;
}

export function getElementHandle(element: Element, position: Point, scale: number = 1): Readonly<AxisPointPosition> | null {
    return element?.globalBounds.getQuadPointPosition(position, HandleRadius * scale);
}

export function drawBBoxWrapper(context: DrawingContext, box: Rectangle, dpr: number = 1): void {
    if (!box.isVisible) {
        return;
    }
    SelectionWrapperPen.width = BBoxLineWidth / (context.matrix.lineScale / dpr);
    context.drawRect(box, SelectionWrapperPen);
}

export function drawElementBoundingBox(context: DrawingContext, element: Element, handles: boolean, forResize: boolean, dpr: number = 1): void {
    if (!element) {
        return;
    }

    const scale = context.matrix.lineScale / dpr;
    SelectionPen.width = BBoxLineWidth / scale;

    const box = element.globalBounds;

    context.drawQuad(box, SelectionPen);

    if (!handles || (forResize && !element.isResizable)) {
        return;
    }

    const radius = HandleRadius / scale;
    for (const point of box.sidePoints()) {
        context.drawCircle(point, radius, HandleFill);
    }
}

export function drawElementOutline(context: DrawingContext, element: Element, matrix: Matrix | null, dpr: number = 1): void {
    if (!element) {
        return;
    }

    const multiplied = matrix && !matrix.isIdentity;
    if (multiplied) {
        context.save();
        context.multiplyMatrix(matrix);
    }

    OutlinePen.width = 1 / (context.matrix.lineScale / dpr);

    if (element instanceof ShapeElement) {
        context.drawPath(element.globalPath, OutlinePen);
    } else if (element instanceof ClipPathElement) {
        const path = new Skia.SkPath(element.path.path);
        path.transform(element.globalMatrix);
        context.drawPath(path, OutlinePen);
        path.delete();
    } else {
        context.drawQuad(element.globalBounds, OutlinePen);
    }

    if (multiplied) {
        context.restore();
    }
}

export function drawSelectionRectangle(engine: CanvasEngine, from: Point, to: Point): void {
    if (from && to && !from.equals(to)) {
        engine.context.drawRect(engine.viewBox.getRectangleFromPoints(from, to), SelectionRectangleFill);
    }
}

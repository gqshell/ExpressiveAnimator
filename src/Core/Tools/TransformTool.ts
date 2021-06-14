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

import type {ToolMouseEvent} from "@zindex/canvas-engine";
import type {CanvasEngine} from "@zindex/canvas-engine";
import type {Element} from "@zindex/canvas-engine";
import {Point, Rectangle} from "@zindex/canvas-engine";
import {BaseTool} from "@zindex/canvas-engine";
import {AxisPointPosition, Cursor} from "@zindex/canvas-engine";
import {ProjectEvent} from "@zindex/canvas-engine";
import {
    drawBBoxWrapper,
    drawElementBoundingBox,
    drawElementOutline,
    drawOrigin,
    drawRotateIndicator,
    drawRotatePoints,
    drawSelectionRectangle,
    getElementHandle,
    getRotatePoint,
    isOverOrigin,
} from "./Helper";
import {KeyframeCounter} from "./KeyframeCounter";

enum Action {None, Hover, Move, Select, RectangleSelection, Pan, Scale, Origin, Rotate}

export class TransformTool extends BaseTool {
    private selectionStart: Point = null;
    private selectionEnd: Point = null;

    private position: Point = null;
    private origin: Point = null;
    private hoverElement: Element | null = null;

    private rotatePivot: Point = null;
    private rotateAngle: number = 0;
    private rotateAngleStart: number = 0;
    private rotateSign: number = 1;
    private rotateStart: number = 0;

    private scalePosition: AxisPointPosition | null = null;
    private scaleStart: Point | null = null;

    protected defaultCanvasCursor: Cursor = Cursor.PointerAlt;
    private action: Action = Action.None;
    private changed: boolean = false;

    private keyframeCounter: KeyframeCounter = new KeyframeCounter();

    get name(): string {
        return "transform";
    }

    deactivate(engine: CanvasEngine) {
        super.deactivate(engine);
        this.selectionStart = null;
        this.selectionEnd = null;
        this.position = null;
        this.hoverElement = null;
        this.scalePosition = null;
        this.scaleStart = null;
        this.rotatePivot = null;
        this.changed = false;
        this.action = Action.None;
    }

    updateTheme(engine:CanvasEngine) {
        // TODO: remove this
    }

    draw(engine: CanvasEngine) {
        switch (this.action) {
            case Action.Hover:
                drawElementOutline(engine.context, this.hoverElement, engine.viewBox.matrix, engine.dpr);
                this.drawTool(engine);
                engine.cursor = Cursor.PointerSelectableAlt;
                break;
            case Action.Select:
                drawElementOutline(engine.context, this.hoverElement, engine.viewBox.matrix, engine.dpr);
            // fall
            case Action.Move:
                this.drawTool(engine);
                engine.cursor = Cursor.PointerMoveAlt;
                break;
            case Action.RectangleSelection:
                drawSelectionRectangle(engine, this.selectionStart, this.selectionEnd);
                engine.cursor = Cursor.PointerAlt;
                break;
            case Action.Pan:
                engine.cursor = Cursor.HandHold;
                break;
            case Action.Rotate:
                this.drawTool(engine);
                engine.cursor = Cursor.RotateAlt;
                break;
            case Action.Origin:
                this.drawTool(engine);
                engine.cursor = Cursor.PointerMoveAlt;
                break;
            case Action.Scale:
                this.drawTool(engine);
                engine.cursor = Cursor.PointerResizeAlt;
                break;
            default:
                drawElementOutline(engine.context, this.hoverElement, engine.viewBox.matrix, engine.dpr);
                this.drawTool(engine);
                engine.cursor = this.defaultCanvasCursor;
                break;
        }
    }

    protected drawTool(engine: CanvasEngine): void {
        const selection = engine.selection;
        if (selection.isEmpty) {
            return;
        }

        const isRotating = this.rotatePivot != null;

        const context = engine.context;
        context.save();
        context.multiplyMatrix(engine.viewBox.matrix);

        // Draw wrapper
        if (!isRotating) {
            drawBBoxWrapper(context, selection.boundingBox, engine.dpr);
        }

        const active = selection.activeElement;

        // Draw other elements bbox, without handles
        for (const element of selection) {
            if (element !== active) {
                drawElementBoundingBox(context, element, false, false, engine.dpr);
            }
        }

        // Draw active element bbox
        drawElementBoundingBox(context, active, !isRotating, false, engine.dpr);

        if (isRotating) {
            drawRotateIndicator(context, this.rotatePivot, this.rotateAngleStart, this.rotateAngle, this.position, engine.dpr);
        } else if (!this.position) {
            // Draw rotate points
            drawRotatePoints(engine.context, active, engine.dpr);
        }

        // Draw origin
        drawOrigin(context, active, true, engine.dpr);
        // TODO: Draw motion path

        context.restore();
    }

    onMouseHover(engine: CanvasEngine, event: ToolMouseEvent) {
        if (engine.selection.isEmpty) {
            return this.handleHover(engine, event);
        }

        const lineWidth = engine.viewBox.getLineWidth();
        const active = engine.selection.activeElement;

        if (isOverOrigin(active, event.position, lineWidth)) {
            this.action = Action.Origin;
            this.hoverElement = null;
            this.invalidateToolDrawing();
            return;
        }

        const rotatePoint = getRotatePoint(active, event.position, lineWidth);
        if (rotatePoint) {
            this.action = Action.Rotate;
            this.hoverElement = null;
            this.invalidateToolDrawing();
            return;
        }
        // TODO: handle path

        const handle = getElementHandle(active, event.position, lineWidth);
        if (handle) {
            this.scalePosition = handle;
            this.action = Action.Scale;
            this.hoverElement = null;
            this.invalidateToolDrawing();
            return;
        }

        if (this.scalePosition) {
            this.scalePosition = null
        }

        this.restoreAction(engine, event.position);
    }

    protected handleHover(engine: CanvasEngine, event: ToolMouseEvent): void {
        const prev = this.hoverElement;
        this.hoverElement = this.getHoverElement(engine, event.position);
        this.action = this.hoverElement ? Action.Hover : Action.None;
        if (prev !== this.hoverElement) {
            this.invalidateToolDrawing();
        }
    }

    onMouseLeftButtonDown(engine: CanvasEngine, event: ToolMouseEvent) {
        this.changed = false;

        const active = engine.selection.activeElement;

        // Handle origin
        if (this.action === Action.Origin) {
            this.origin = active.position;
            this.position = event.position;
            this.snapping.init(engine);
            this.keyframeCounter.start(engine);
            return;
        }

        // Handle rotate
        if (this.action === Action.Rotate) {
            this.rotateSign = Math.sign(active.globalMatrix.a * active.globalMatrix.d * active.localMatrix.a * active.localMatrix.d) || 1;
            if (active.parent && !active.parent.globalMatrix.isIdentity) {
                this.rotatePivot = active.parent.globalMatrix.transformPoint(active.position);
            } else {
                this.rotatePivot = active.position;
            }
            this.rotateStart = active.totalRotate;
            this.rotateAngleStart = this.rotateAngle = this.rotatePivot.getPositiveAngleTo(event.position);
            this.position = event.position;
            this.keyframeCounter.start(engine);
            return;
        }

        // TODO: handle path

        // Handle scale
        if (this.scalePosition != null) {
            this.scaleStart = active.scale;
            this.position = event.position;
            this.keyframeCounter.start(engine);
            this.snapping.init(engine, engine.selection);
            return;
        }

        // Handle selection
        const node = this.getHoverElement(engine, event.position);
        if (node !== null) {
            this.action = Action.Select;
            this.position = event.position;
            if (engine.selection.selectOrDeselect(node, this.keyboardStatus.isShift)) {
                this.invalidateToolDrawing();
                engine.emit(ProjectEvent.selectionChanged);
            }
            return;
        }

        // Handle rectangle selection
        this.action = Action.RectangleSelection;
        this.selectionStart = event.position;
        this.selectionEnd = null;
        if (engine.selection.clear()) {
            engine.emit(ProjectEvent.selectionChanged);
        }
        this.invalidateToolDrawing();
    }

    onMouseLeftButtonMove(engine: CanvasEngine, event: ToolMouseEvent) {
        // Handle rectangle selection
        if (this.selectionStart != null) {
            this.selectionEnd = event.position;
            this.invalidateToolDrawing();
            return;
        }

        if (!this.position || this.position.equals(event.position)) {
            // not moved
            return;
        }

        const prevPosition = this.position;
        this.position = event.position;

        // Handle origin
        if (this.origin != null) {
            const origin = this.snapping.snapPoint(event.position);
            const active = engine.selection.activeElement;
            const delta = origin.sub(active.parent.globalMatrix.transformPoint(active.position));
            if (engine.project.middleware.moveOriginBy(engine.selection, delta)) {
                this.changed = true;
                this.invalidate();
                engine.emit(ProjectEvent.propertyChanged);
            }
            return;
        }

        // Handle rotate
        if (this.rotatePivot != null) {
            let angle = this.rotatePivot.getPositiveAngleTo(event.position);

            let angleDelta = angle - this.rotateAngle;

            angleDelta *= this.rotateSign;

            // console.log(this.rotateSign);
            // console.log(engine.selection.activeElement.globalMatrix.a, engine.selection.activeElement.globalMatrix.d);
            if (this.keyboardStatus.isShift) {
                // TODO: Implement this
            }

            if (engine.project.middleware.rotateElementsBy(engine.selection, angleDelta)) {
                this.changed = true;
                this.rotateAngle = angle;
                this.invalidate();
                engine.emit(ProjectEvent.propertyChanged);
            }
            return;
        }

        // Handle scale
        if (this.scalePosition != null) {
            const factor = engine.project.middleware.getScaleFactor(
                engine.selection.activeElement,
                this.scalePosition,
                // TODO: snap handle not position...
                this.snapping.snapPoint(event.position),
                this.keyboardStatus.isShift
            );

            if (engine.project.middleware.scaleElementsByFactor(engine.selection, factor)) {
                this.changed = true;
                this.invalidate();
                engine.emit(ProjectEvent.propertyChanged);
            }
            return;
        }

        // TODO: handle path

        if (this.action !== Action.Move) {
            this.snapping.init(engine, engine.selection);
        }

        const delta = this.snapping.snapToSelectionBounds(engine, event.position.sub(prevPosition));
        // Handle move
        if (engine.project.middleware.moveElementsBy(engine.selection, delta, this.keyboardStatus.isShift)) {
            this.changed = true;
            this.action = Action.Move;
            this.invalidate();
            engine.emit(ProjectEvent.propertyChanged);
        }
    }

    onMouseLeftButtonUp(engine: CanvasEngine, event: ToolMouseEvent) {
        this.removeSnapping();

        // Handle selection rect
        if (this.selectionStart) {
            const selection = engine.selection;
            if (selection.rectSelect(
                Rectangle.fromTransformedPoints(engine.document.globalMatrix, this.selectionStart, event.position),
                engine.document,
                !this.keyboardStatus.isCtrl
            )) {
                engine.emit(ProjectEvent.selectionChanged);
            }
            this.selectionStart = this.selectionEnd = null;
            this.restoreAction(engine, event.position);
            return;
        }

        if (this.position !== null) {
            if (this.changed) {
                let save: boolean = false;
                const active = engine.selection.activeElement;
                switch (this.action) {
                    case Action.Scale:
                        save = !this.scaleStart.equals(active.scale);
                        break;
                    case Action.Rotate:
                        save = this.rotateStart !== active.totalRotate;
                        break;
                    case Action.Origin:
                        save = this.origin && !this.origin.equals(active.position);
                        break;
                    case Action.Move:
                        // TODO: check position & anchor
                        save = true;
                        break;
                }
                if (save || this.keyframeCounter.hasChanged(engine)) {
                    engine.project.state.snapshot();
                }
            }

            this.restoreAction(engine, event.position);
        }

        this.origin = null;
        this.position = null;
        this.scalePosition = null;
        this.rotatePivot = null;
        this.scaleStart = null;
        this.changed = false;
    }

    protected restoreAction(engine: CanvasEngine, position: Point, invalidate?: boolean) {
        this.hoverElement = this.getHoverElement(engine, position);
        this.action = this.hoverElement ? Action.Hover : Action.None;
        if (invalidate) {
            this.invalidate();
        } else {
            this.invalidateToolDrawing();
        }
    }

    protected getHoverElement(engine: CanvasEngine, position: Point): Element | null {
        return engine.document.getElementAt(position, !this.keyboardStatus.isCtrl);
    }

    onMouseWheelButtonDown(engine: CanvasEngine, event: ToolMouseEvent) {
        super.onMouseWheelButtonDown(engine, event);
        this.action = Action.Pan;
        this.invalidateToolDrawing();
    }

    onMouseWheelButtonUp(engine: CanvasEngine, event: ToolMouseEvent) {
        super.onMouseWheelButtonUp(engine, event);
        this.restoreAction(engine, event.position);
    }
}
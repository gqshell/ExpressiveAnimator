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
import type {Guide} from "@zindex/canvas-engine";
import {DefaultPen, Pen, Point, Rectangle, SolidBrush} from "@zindex/canvas-engine";
import {BaseTool} from "@zindex/canvas-engine";
import {AxisPointPosition, Cursor, invertPosition} from "@zindex/canvas-engine";
import {ProjectEvent} from "@zindex/canvas-engine";
import {
    drawBBoxWrapper,
    drawElementBoundingBox,
    drawElementOutline,
    drawSelectionRectangle,
    getElementHandle,
    getGuideLine,
    getHoverGuide
} from "./Helper";
import {KeyframeCounter} from "./KeyframeCounter";

enum Action {
    None,
    Hover,
    Move,
    Select,
    RectangleSelection,
    Pan,
    Resize,
    MoveVerticalGuide,
    MoveHorizontalGuide
}

export class SelectionTool extends BaseTool {
    private selectionStart: Point = null;
    private selectionEnd: Point = null;

    private position: Point = null;
    private hoverElement: Element | null = null;
    private resizePosition: AxisPointPosition | null = null;

    protected defaultCanvasCursor: Cursor = Cursor.Pointer;
    private action: Action = Action.None;
    private changed: boolean = false;
    private hoverGuide: Guide|null = null;
    private hoverGuidePosition: number;
    private guidePen: Pen;
    private guidePenHover: Pen;

    private keyframeCounter: KeyframeCounter = new KeyframeCounter();

    get name(): string {
        return "selection";
    }

    deactivate(engine: CanvasEngine) {
        super.deactivate(engine);
        this.selectionStart = null;
        this.selectionEnd = null;
        this.position = null;
        this.hoverElement = null;
        this.resizePosition = null;
        this.action = Action.None;
    }

    updateTheme(engine:CanvasEngine) {
        this.guidePen = new DefaultPen(SolidBrush.fromColor(engine.theme.guide));
        this.guidePenHover = new DefaultPen(SolidBrush.fromColor(engine.theme.guideHover));
    }

    draw(engine: CanvasEngine) {
        switch (this.action) {
            case Action.Hover:
                drawElementOutline(engine.context, this.hoverElement, engine.viewBox.matrix, engine.dpr);
                this.drawTool(engine);
                engine.cursor = Cursor.PointerSelectable;
                break;
            case Action.Select:
                drawElementOutline(engine.context, this.hoverElement, engine.viewBox.matrix, engine.dpr);
            // fall
            case Action.Move:
                this.drawTool(engine);
                engine.cursor = Cursor.PointerMove;
                break;
            case Action.RectangleSelection:
                drawSelectionRectangle(engine, this.selectionStart, this.selectionEnd);
                engine.cursor = Cursor.Pointer;
                break;
            case Action.Pan:
                engine.cursor = Cursor.HandHold;
                break;
            case Action.Resize:
                this.drawTool(engine);
                engine.cursor = Cursor.PointerResize;
                break;
            case Action.MoveHorizontalGuide:
                this.drawTool(engine);
                engine.cursor = Cursor.ResizeNS;
                break;
            case Action.MoveVerticalGuide:
                this.drawTool(engine);
                engine.cursor = Cursor.ResizeEW;
                break;
            default:
                drawElementOutline(engine.context, this.hoverElement, engine.viewBox.matrix, engine.dpr);
                this.drawTool(engine);
                engine.cursor = this.defaultCanvasCursor;
                break;
        }
    }

    protected drawTool(engine: CanvasEngine): void {
        if (this.hoverGuide !== null) {
            const [from, to] = getGuideLine(engine, this.hoverGuide);
            engine.context.drawLine(from, to, this.hoverGuide.isHidden ? this.guidePen : this.guidePenHover);
            return;
        }
        const selection = engine.selection;
        if (selection.isEmpty) {
            // nothing to draw
            return;
        }

        const context = engine.context;
        context.save();
        context.multiplyMatrix(engine.viewBox.matrix);

        // draw wrapper
        drawBBoxWrapper(context, selection.boundingBox, engine.dpr);

        if (selection.length === 1) {
            // draw handles on active element
            drawElementBoundingBox(context, selection.activeElement, true, true, engine.dpr);
        } else {
            // draw bbox on every element, without handles
            for (const element of selection) {
                drawElementBoundingBox(context, element, false, true, engine.dpr);
            }
        }

        context.restore();
    }

    onMouseHover(engine: CanvasEngine, event: ToolMouseEvent) {
        const guide = getHoverGuide(engine, event.position);

        if (this.hoverGuide !== guide) {
            this.hoverGuide = guide;
            this.invalidateToolDrawing();
            if (guide) {
                this.action = guide.isHorizontal ? Action.MoveHorizontalGuide : Action.MoveVerticalGuide;
                return;
            }
            this.action = Action.None;
        }

        // Handle possible resize
        if (engine.selection.length === 1) {
            // Copy this
            const handle = getElementHandle(engine.selection.activeElement, event.position, engine.viewBox.getLineWidth());
            if (handle) {
                this.resizePosition = {x: handle.x, y: handle.y};
                this.action = Action.Resize;
                this.hoverElement = null;
                this.invalidateToolDrawing();
                return;
            }
            if (this.resizePosition) {
                this.resizePosition = null
                this.restoreAction(engine, event.position);
            }
        }

        // Handle hover outline
        const prev = this.hoverElement;
        this.hoverElement = this.getHoverElement(engine, event.position);
        if (prev !== this.hoverElement) {
            this.action = this.hoverElement ? Action.Hover : Action.None;
            this.invalidateToolDrawing();
        }
    }

    onMouseLeftButtonDown(engine: CanvasEngine, event: ToolMouseEvent) {
        if (this.hoverGuide) {
            this.hoverGuidePosition = this.hoverGuide.position;
            this.hoverGuide.isHidden = true;
            this.invalidate();
            return;
        }

        this.changed = false;

        // Handle resize
        if (this.resizePosition != null) {
            this.snapping.init(engine, engine.selection);
            this.position = event.position;
            this.keyframeCounter.start(engine);
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
        // Check guides first
        if (this.hoverGuide) {
            const position = this.hoverGuide.isHorizontal ? event.position.y : event.position.x;
            this.hoverGuide.position = this.keyboardStatus.isShift ? Math.round(position) : position;
            this.invalidateToolDrawing();
            return;
        }
        // Handle rectangle selection
        if (this.selectionStart !== null) {
            this.selectionEnd = event.position;
            this.invalidateToolDrawing();
            return;
        }

        if (!this.position || this.position.equals(event.position)) {
            // not moved
            return;
        }

        const selection = engine.selection;
        const previousPosition = this.position;
        this.position = event.position;

        // Handle resize
        if (this.resizePosition != null) {
            const active = selection.activeElement;
            const {matrix, flip} = engine.project.middleware.computeResizeInfo(
                active,
                this.snapping.snapPoint(event.position),
                this.resizePosition,
                this.keyboardStatus.isAlt,
                this.keyboardStatus.isShift
            );
            if (flip.x) {
                this.resizePosition.x = invertPosition(this.resizePosition.x);
            }
            if (flip.y) {
                this.resizePosition.y = invertPosition(this.resizePosition.y);
            }
            if (engine.project.middleware.resizeElementByMatrix(active, matrix, flip)) {
                this.changed = true;
                this.invalidate();
                engine.emit(ProjectEvent.propertyChanged);
            }
            return;
        }

        if (this.action !== Action.Move) {
            this.snapping.init(engine, selection);
            this.action = Action.Move;
            this.keyframeCounter.start(engine);
        }

        let delta = event.position.sub(previousPosition);
        if (delta.isZero) {
            return;
        }

        delta = this.snapping.snapToSelectionBounds(engine, delta);

        // Handle move
        if (engine.project.middleware.moveElementsBy(selection, delta)) {
            this.changed = true;
            this.invalidate();
            engine.emit(ProjectEvent.propertyChanged);
        }
    }

    onMouseLeftButtonUp(engine: CanvasEngine, event: ToolMouseEvent) {
        this.removeSnapping();

        // Check guides first
        if (this.hoverGuide) {
            const horizontal = this.hoverGuide.isHorizontal;
            const {position, canvasPosition} = event;

            if (this.keyboardStatus.isShift) {
                this.hoverGuide.position = Math.round(this.hoverGuide.isHorizontal ? position.y : position.x);
            } else {
                this.hoverGuide.position = this.hoverGuide.isHorizontal ? position.y : position.x;
            }

            this.hoverGuide.isHidden = false;

            if ((horizontal && canvasPosition.y < 0) || (!horizontal && canvasPosition.x < 0)) {
                engine.document.guides.remove(this.hoverGuide);
            }

            if (this.hoverGuide.position !== this.hoverGuidePosition) {
                engine.project.state.snapshot();
            }

            this.restoreAction(engine, position, true);
            return;
        }

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

                switch (this.action) {
                    case Action.Move:
                    case Action.Resize:
                        save = this.position && !this.position.equals(this.startPosition);
                        break;
                }
                if (save || this.keyframeCounter.hasChanged(engine)) {
                    engine.project.state.snapshot();
                }
            }

            this.position = null;
            this.resizePosition = null;
            this.changed = false;
            this.restoreAction(engine, event.position);
            return;
        }
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

    protected restoreAction(engine: CanvasEngine, position: Point, invalidate?: boolean) {
        this.hoverGuide = getHoverGuide(engine, position);

        if (this.hoverGuide) {
            this.action = this.hoverGuide.isHorizontal ? Action.MoveHorizontalGuide : Action.MoveVerticalGuide;
        } else {
            this.hoverElement = this.getHoverElement(engine, position);
            this.action = this.hoverElement ? Action.Hover : Action.None;
        }

        if (invalidate) {
            this.invalidate();
        } else {
            this.invalidateToolDrawing();
        }
    }

    protected getHoverElement(engine: CanvasEngine, position: Point): Element | null {
        return engine.document.getElementAt(position, !this.keyboardStatus.isCtrl);
    }
}
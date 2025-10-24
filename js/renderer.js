/**
 * キャンバスレンダラー
 * 圏論の図式を描画
 */

class DiagramRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.graph = null;
        this.selectedObject = null;
        this.hoveredObject = null;
        this.selectedArrow = null;
        this.hoveredArrow = null;
        this.animationFrame = 0;
        this.highlightedPaths = [];

        // スタイル設定
        this.styles = {
            object: {
                width: 120,
                height: 60,
                radius: 10,
                fill: '#e3f2fd',
                stroke: '#1976d2',
                strokeWidth: 3,
                textColor: '#1976d2',
                fontSize: 14,
                fontFamily: 'sans-serif'
            },
            arrow: {
                stroke: '#f57c00',
                strokeWidth: 3,
                headSize: 12,
                textColor: '#f57c00',
                fontSize: 12,
                fontFamily: 'sans-serif'
            },
            selected: {
                stroke: '#4caf50',
                strokeWidth: 4,
                glow: 'rgba(76, 175, 80, 0.3)'
            },
            hovered: {
                stroke: '#ff9800',
                strokeWidth: 4,
                glow: 'rgba(255, 152, 0, 0.3)'
            },
            highlighted: {
                stroke: '#e91e63',
                strokeWidth: 5,
                glow: 'rgba(233, 30, 99, 0.4)'
            }
        };
    }

    /**
     * グラフを設定
     */
    setGraph(graph) {
        this.graph = graph;
    }

    /**
     * 描画
     */
    render() {
        if (!this.graph) return;

        // キャンバスをクリア
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 背景
        this.ctx.fillStyle = '#fafafa';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 矢印を描画（オブジェクトの下に）
        this.renderArrows();

        // オブジェクトを描画
        this.renderObjects();

        // アニメーション
        this.animationFrame++;
    }

    /**
     * オブジェクト（箱）を描画
     */
    renderObjects() {
        const objects = this.graph.getAllObjects();

        for (const obj of objects) {
            const isSelected = this.selectedObject === obj.id;
            const isHovered = this.hoveredObject === obj.id;

            this.drawObject(obj, isSelected, isHovered);
        }
    }

    /**
     * 個別のオブジェクトを描画
     */
    drawObject(obj, isSelected = false, isHovered = false) {
        const style = this.styles.object;
        const x = obj.x;
        const y = obj.y;
        const w = style.width;
        const h = style.height;
        const r = style.radius;

        this.ctx.save();

        // 選択/ホバー時のグロー
        if (isSelected || isHovered) {
            const glowStyle = isSelected ? this.styles.selected : this.styles.hovered;
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = glowStyle.glow;
        }

        // 角丸矩形を描画
        this.ctx.beginPath();
        this.ctx.roundRect(x - w/2, y - h/2, w, h, r);
        this.ctx.fillStyle = style.fill;
        this.ctx.fill();

        // 枠線
        this.ctx.strokeStyle = isSelected ? this.styles.selected.stroke :
                               isHovered ? this.styles.hovered.stroke :
                               style.stroke;
        this.ctx.lineWidth = isSelected || isHovered ? 4 : style.strokeWidth;
        this.ctx.stroke();

        this.ctx.restore();

        // ラベルを描画
        this.ctx.fillStyle = style.textColor;
        this.ctx.font = `bold ${style.fontSize}px ${style.fontFamily}`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(obj.label, x, y);
    }

    /**
     * 矢印を描画
     */
    renderArrows() {
        const arrows = this.graph.getAllArrows();

        for (const arrow of arrows) {
            const isSelected = this.selectedArrow === arrow.id;
            const isHovered = this.hoveredArrow === arrow.id;
            const isHighlighted = this.highlightedPaths.some(path => path.includes(arrow.id));

            this.drawArrow(arrow, isSelected, isHovered, isHighlighted);
        }
    }

    /**
     * 個別の矢印を描画
     */
    drawArrow(arrow, isSelected = false, isHovered = false, isHighlighted = false) {
        const from = this.graph.getObject(arrow.from);
        const to = this.graph.getObject(arrow.to);

        if (!from || !to) return;

        const style = this.styles.arrow;

        // 自己ループの場合
        if (from.id === to.id) {
            this.drawSelfLoop(arrow, from, isSelected, isHovered, isHighlighted);
            return;
        }

        // 始点と終点を計算（箱の境界から）
        const { x: x1, y: y1 } = this.getObjectBoundaryPoint(from, to);
        const { x: x2, y: y2 } = this.getObjectBoundaryPoint(to, from);

        // 曲線のコントロールポイント（複数の矢印がある場合にカーブさせる）
        const curve = this.getArrowCurve(arrow.from, arrow.to, arrow.id);
        const { cpx, cpy } = this.getCurveControlPoint(x1, y1, x2, y2, curve);

        this.ctx.save();

        // 選択/ホバー/ハイライト時のグロー
        if (isSelected || isHovered || isHighlighted) {
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = isHighlighted ? this.styles.highlighted.glow :
                                   isSelected ? this.styles.selected.glow :
                                   this.styles.hovered.glow;
        }

        // 矢印の線を描画
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.quadraticCurveTo(cpx, cpy, x2, y2);

        this.ctx.strokeStyle = isHighlighted ? this.styles.highlighted.stroke :
                               isSelected ? this.styles.selected.stroke :
                               isHovered ? this.styles.hovered.stroke :
                               arrow.color || style.stroke;
        this.ctx.lineWidth = isHighlighted ? this.styles.highlighted.strokeWidth :
                             isSelected || isHovered ? 4 :
                             style.strokeWidth;
        this.ctx.stroke();

        // 矢印の先端を描画
        this.drawArrowHead(x2, y2, cpx, cpy, isHighlighted, isSelected, isHovered, arrow.color);

        this.ctx.restore();

        // ラベルを描画
        const labelX = (x1 + x2) / 2 + (cpx - (x1 + x2) / 2) * 0.5;
        const labelY = (y1 + y2) / 2 + (cpy - (y1 + y2) / 2) * 0.5;
        this.drawArrowLabel(arrow.label, labelX, labelY, isHighlighted, isSelected, isHovered);
    }

    /**
     * 自己ループを描画
     */
    drawSelfLoop(arrow, obj, isSelected, isHovered, isHighlighted) {
        const x = obj.x;
        const y = obj.y;
        const r = 30; // ループの半径

        this.ctx.save();

        if (isSelected || isHovered || isHighlighted) {
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = isHighlighted ? this.styles.highlighted.glow :
                                   isSelected ? this.styles.selected.glow :
                                   this.styles.hovered.glow;
        }

        // 円を描画
        this.ctx.beginPath();
        this.ctx.arc(x, y - 60, r, 0, Math.PI * 2);

        this.ctx.strokeStyle = isHighlighted ? this.styles.highlighted.stroke :
                               isSelected ? this.styles.selected.stroke :
                               isHovered ? this.styles.hovered.stroke :
                               arrow.color || this.styles.arrow.stroke;
        this.ctx.lineWidth = isHighlighted ? this.styles.highlighted.strokeWidth :
                             isSelected || isHovered ? 4 :
                             this.styles.arrow.strokeWidth;
        this.ctx.stroke();

        this.ctx.restore();

        // ラベル
        this.drawArrowLabel(arrow.label, x, y - 60 - r - 10, isHighlighted, isSelected, isHovered);
    }

    /**
     * 矢印の先端を描画
     */
    drawArrowHead(x, y, cpx, cpy, isHighlighted, isSelected, isHovered, color) {
        const style = this.styles.arrow;
        const size = style.headSize;

        // 矢印の向きを計算
        const angle = Math.atan2(y - cpy, x - cpx);

        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(angle);

        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(-size, -size / 2);
        this.ctx.lineTo(-size, size / 2);
        this.ctx.closePath();

        this.ctx.fillStyle = isHighlighted ? this.styles.highlighted.stroke :
                             isSelected ? this.styles.selected.stroke :
                             isHovered ? this.styles.hovered.stroke :
                             color || style.stroke;
        this.ctx.fill();

        this.ctx.restore();
    }

    /**
     * 矢印のラベルを描画
     */
    drawArrowLabel(label, x, y, isHighlighted, isSelected, isHovered) {
        if (!label) return;

        const style = this.styles.arrow;

        // 背景
        this.ctx.fillStyle = 'white';
        this.ctx.font = `${style.fontSize}px ${style.fontFamily}`;
        const metrics = this.ctx.measureText(label);
        const padding = 4;
        this.ctx.fillRect(
            x - metrics.width / 2 - padding,
            y - style.fontSize / 2 - padding,
            metrics.width + padding * 2,
            style.fontSize + padding * 2
        );

        // テキスト
        this.ctx.fillStyle = isHighlighted ? this.styles.highlighted.stroke :
                             isSelected ? this.styles.selected.stroke :
                             isHovered ? this.styles.hovered.stroke :
                             style.textColor;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(label, x, y);
    }

    /**
     * オブジェクトの境界点を取得
     */
    getObjectBoundaryPoint(from, to) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const angle = Math.atan2(dy, dx);

        const w = this.styles.object.width / 2;
        const h = this.styles.object.height / 2;

        // 矩形の境界との交点を計算
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        let x, y;
        if (Math.abs(cos) > Math.abs(sin)) {
            // 左右の辺
            x = from.x + w * Math.sign(cos);
            y = from.y + (x - from.x) * Math.tan(angle);
        } else {
            // 上下の辺
            y = from.y + h * Math.sign(sin);
            x = from.x + (y - from.y) / Math.tan(angle);
        }

        return { x, y };
    }

    /**
     * 曲線のコントロールポイントを計算
     */
    getCurveControlPoint(x1, y1, x2, y2, curve = 0) {
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;

        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);

        const nx = -dy / len;
        const ny = dx / len;

        const offset = curve * 50; // カーブの強さ

        return {
            cpx: mx + nx * offset,
            cpy: my + ny * offset
        };
    }

    /**
     * 同じ始点・終点を持つ矢印のカーブ量を計算
     */
    getArrowCurve(from, to, arrowId) {
        const arrows = this.graph.getAllArrows().filter(a =>
            (a.from === from && a.to === to) || (a.from === to && a.to === from)
        );

        if (arrows.length === 1) return 0;

        const index = arrows.findIndex(a => a.id === arrowId);
        const total = arrows.length;

        return (index - (total - 1) / 2) * 0.3;
    }

    /**
     * マウス位置のオブジェクトを取得
     */
    getObjectAtPosition(x, y) {
        const objects = this.graph.getAllObjects();

        for (const obj of objects) {
            const dx = x - obj.x;
            const dy = y - obj.y;
            const w = this.styles.object.width / 2;
            const h = this.styles.object.height / 2;

            if (Math.abs(dx) <= w && Math.abs(dy) <= h) {
                return obj;
            }
        }

        return null;
    }

    /**
     * 経路をハイライト
     */
    highlightPaths(paths) {
        this.highlightedPaths = paths;
    }

    /**
     * ハイライトをクリア
     */
    clearHighlight() {
        this.highlightedPaths = [];
    }

    /**
     * アニメーションループ
     */
    startAnimation() {
        const animate = () => {
            this.render();
            requestAnimationFrame(animate);
        };
        animate();
    }
}

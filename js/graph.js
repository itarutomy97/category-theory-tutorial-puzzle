/**
 * グラフデータ構造
 * 圏（Category）を表現するためのグラフクラス
 */

class CategoryGraph {
    constructor() {
        this.objects = new Map(); // { id: { id, label, x, y } }
        this.arrows = new Map();  // { id: { id, from, to, label, editable, color } }
    }

    /**
     * 対象（Object）を追加
     */
    addObject(id, label, x, y) {
        this.objects.set(id, { id, label, x, y });
    }

    /**
     * 射（Arrow/Morphism）を追加
     */
    addArrow(id, from, to, label, editable = true, color = null) {
        if (!this.objects.has(from) || !this.objects.has(to)) {
            throw new Error(`Object ${from} or ${to} does not exist`);
        }
        this.arrows.set(id, { id, from, to, label, editable, color: color || '#f57c00' });
    }

    /**
     * 射を削除
     */
    removeArrow(id) {
        this.arrows.delete(id);
    }

    /**
     * 射を更新
     */
    updateArrow(id, updates) {
        if (this.arrows.has(id)) {
            const arrow = this.arrows.get(id);
            this.arrows.set(id, { ...arrow, ...updates });
        }
    }

    /**
     * 対象を取得
     */
    getObject(id) {
        return this.objects.get(id);
    }

    /**
     * 射を取得
     */
    getArrow(id) {
        return this.arrows.get(id);
    }

    /**
     * すべての対象を取得
     */
    getAllObjects() {
        return Array.from(this.objects.values());
    }

    /**
     * すべての射を取得
     */
    getAllArrows() {
        return Array.from(this.arrows.values());
    }

    /**
     * 特定の始点から出る射を取得
     */
    getArrowsFrom(objectId) {
        return this.getAllArrows().filter(arrow => arrow.from === objectId);
    }

    /**
     * 特定の終点に入る射を取得
     */
    getArrowsTo(objectId) {
        return this.getAllArrows().filter(arrow => arrow.to === objectId);
    }

    /**
     * 2つの対象間のすべての経路を探索（DFS）
     */
    findAllPaths(start, end, maxDepth = 10) {
        const paths = [];
        const visited = new Set();

        const dfs = (current, path, depth) => {
            if (depth > maxDepth) return;

            if (current === end && path.length > 0) {
                paths.push([...path]);
                return;
            }

            const outgoing = this.getArrowsFrom(current);
            for (const arrow of outgoing) {
                // 自己ループの無限再帰を防ぐ
                if (arrow.to === current && path.length > 0) continue;

                // 既に訪問した経路の重複を避ける
                const pathKey = [...path, arrow.id].join(',');
                if (visited.has(pathKey)) continue;

                visited.add(pathKey);
                path.push(arrow.id);
                dfs(arrow.to, path, depth + 1);
                path.pop();
            }
        };

        dfs(start, [], 0);
        return paths;
    }

    /**
     * 経路の合成を文字列として取得
     */
    composePath(path) {
        return path.join(' ∘ ');
    }

    /**
     * 2つの経路が同じかどうかをチェック
     * （簡易版：矢印のIDの列が同じかを確認）
     */
    arePathsEquivalent(path1, path2) {
        // 簡易実装：IDの列が同じ、または正規化した形が同じ
        return path1.join(',') === path2.join(',');
    }

    /**
     * グラフをクリア
     */
    clear() {
        this.objects.clear();
        this.arrows.clear();
    }

    /**
     * グラフを複製
     */
    clone() {
        const newGraph = new CategoryGraph();
        this.objects.forEach((obj, id) => {
            newGraph.objects.set(id, { ...obj });
        });
        this.arrows.forEach((arrow, id) => {
            newGraph.arrows.set(id, { ...arrow });
        });
        return newGraph;
    }

    /**
     * JSONからグラフを構築
     */
    fromJSON(data) {
        this.clear();
        data.objects.forEach(obj => {
            this.addObject(obj.id, obj.label, obj.x, obj.y);
        });
        data.arrows.forEach(arrow => {
            this.addArrow(
                arrow.id,
                arrow.from,
                arrow.to,
                arrow.label,
                arrow.editable !== false,
                arrow.color
            );
        });
    }

    /**
     * グラフをJSONに変換
     */
    toJSON() {
        return {
            objects: this.getAllObjects(),
            arrows: this.getAllArrows()
        };
    }
}

/**
 * 経路を正規化するヘルパー関数
 * 恒等射を除去し、合成を簡約化
 */
function normalizePath(path, graph) {
    // 恒等射（id_X）を除去
    const filtered = path.filter(arrowId => {
        const arrow = graph.getArrow(arrowId);
        return arrow && arrow.from !== arrow.to;
    });

    // 空の経路は恒等射として扱う
    if (filtered.length === 0 && path.length > 0) {
        return ['id'];
    }

    return filtered;
}

/**
 * 2つの経路が可換かどうかをチェック
 */
function arePathsCommutative(path1, path2, graph) {
    const norm1 = normalizePath(path1, graph);
    const norm2 = normalizePath(path2, graph);

    // 同じ経路なら当然可換
    if (norm1.join(',') === norm2.join(',')) {
        return true;
    }

    // 始点と終点が同じかチェック
    if (norm1.length === 0 || norm2.length === 0) {
        return norm1.length === norm2.length;
    }

    const start1 = graph.getArrow(norm1[0]);
    const end1 = graph.getArrow(norm1[norm1.length - 1]);
    const start2 = graph.getArrow(norm2[0]);
    const end2 = graph.getArrow(norm2[norm2.length - 1]);

    if (!start1 || !end1 || !start2 || !end2) {
        return false;
    }

    // 始点と終点が一致していれば可換と見なす（簡易実装）
    return start1.from === start2.from && end1.to === end2.to;
}

/**
 * 可換図式の検証エンジン
 */

class DiagramValidator {
    constructor(graph) {
        this.graph = graph;
    }

    /**
     * 問題のゴール条件を検証
     */
    validate(problem) {
        const results = {
            isValid: true,
            errors: [],
            warnings: [],
            pathComparisons: []
        };

        // 必要な矢印がすべて存在するかチェック
        const missingArrows = this.checkRequiredArrows(problem);
        if (missingArrows.length > 0) {
            results.isValid = false;
            results.errors.push({
                type: 'missing_arrows',
                message: `必要な矢印が${missingArrows.length}本足りません`,
                details: missingArrows
            });
            return results;
        }

        // ゴール経路の可換性をチェック
        if (problem.goalPaths && problem.goalPaths.length > 0) {
            for (const goalPath of problem.goalPaths) {
                const pathResult = this.validateGoalPath(goalPath);
                results.pathComparisons.push(pathResult);

                if (!pathResult.isValid) {
                    results.isValid = false;
                    results.errors.push({
                        type: 'path_mismatch',
                        message: pathResult.message,
                        details: pathResult
                    });
                }
            }
        }

        return results;
    }

    /**
     * 必要な矢印がすべて存在するかチェック
     */
    checkRequiredArrows(problem) {
        if (!problem.requiredArrows || problem.requiredArrows.length === 0) {
            return [];
        }

        const missing = [];
        const existingArrows = this.graph.getAllArrows();

        for (const required of problem.requiredArrows) {
            const exists = existingArrows.some(arrow =>
                arrow.from === required.from && arrow.to === required.to
            );

            if (!exists) {
                missing.push(required);
            }
        }

        return missing;
    }

    /**
     * ゴール経路の検証
     */
    validateGoalPath(goalPath) {
        const { start, end, paths: expectedPaths } = goalPath;

        // グラフから実際の経路を探索
        const actualPaths = this.graph.findAllPaths(start, end);

        const result = {
            isValid: false,
            start,
            end,
            expectedPaths,
            actualPaths,
            message: ''
        };

        // 経路が存在しない
        if (actualPaths.length === 0) {
            result.message = `${start} から ${end} への経路が見つかりません`;
            return result;
        }

        // 期待される経路数と実際の経路数を比較
        if (actualPaths.length < expectedPaths.length) {
            result.message = `経路が足りません（必要: ${expectedPaths.length}本、実際: ${actualPaths.length}本）`;
            return result;
        }

        // すべての経路が可換かチェック
        const commutativityResult = this.checkCommutativity(actualPaths);
        if (!commutativityResult.isCommutative) {
            result.message = commutativityResult.message;
            result.mismatchPaths = commutativityResult.mismatchPaths;
            return result;
        }

        result.isValid = true;
        result.message = '素晴らしい！すべての経路が正しくつながっています。';
        return result;
    }

    /**
     * 複数の経路が可換かチェック
     */
    checkCommutativity(paths) {
        if (paths.length <= 1) {
            return { isCommutative: true };
        }

        // すべての経路が同じ始点と終点を持つかチェック
        const firstPath = paths[0];
        const firstStart = this.graph.getArrow(firstPath[0]);
        const firstEnd = this.graph.getArrow(firstPath[firstPath.length - 1]);

        if (!firstStart || !firstEnd) {
            return {
                isCommutative: false,
                message: '経路に無効な矢印が含まれています'
            };
        }

        const startObj = firstStart.from;
        const endObj = firstEnd.to;

        // すべての経路が同じ始点・終点を持つかチェック
        for (let i = 1; i < paths.length; i++) {
            const path = paths[i];
            const pathStart = this.graph.getArrow(path[0]);
            const pathEnd = this.graph.getArrow(path[path.length - 1]);

            if (!pathStart || !pathEnd) {
                return {
                    isCommutative: false,
                    message: '経路に無効な矢印が含まれています'
                };
            }

            if (pathStart.from !== startObj || pathEnd.to !== endObj) {
                return {
                    isCommutative: false,
                    message: `経路 ${i + 1} の始点または終点が他の経路と一致しません`,
                    mismatchPaths: [0, i]
                };
            }
        }

        // 簡易実装：始点と終点が同じであれば可換と見なす
        // より厳密には、経路の合成結果が同じかをチェックする必要がある
        return { isCommutative: true };
    }

    /**
     * 図式が完全に可換かチェック
     * （すべての同じ始点・終点を持つ経路のペアをチェック）
     */
    isFullyCommutative() {
        const objects = this.graph.getAllObjects();
        const issues = [];

        for (const start of objects) {
            for (const end of objects) {
                if (start.id === end.id) continue;

                const paths = this.graph.findAllPaths(start.id, end.id);
                if (paths.length > 1) {
                    const result = this.checkCommutativity(paths);
                    if (!result.isCommutative) {
                        issues.push({
                            start: start.id,
                            end: end.id,
                            message: result.message
                        });
                    }
                }
            }
        }

        return {
            isCommutative: issues.length === 0,
            issues
        };
    }

    /**
     * 経路を人間が読める形式に変換
     */
    formatPath(path) {
        return path.map(arrowId => {
            const arrow = this.graph.getArrow(arrowId);
            return arrow ? arrow.label || arrowId : arrowId;
        }).join(' → ');
    }

    /**
     * 検証結果を人間が読める形式に変換
     */
    formatValidationResult(result) {
        if (result.isValid) {
            return {
                title: '正解です！',
                message: '素晴らしい！すべての経路が正しくつながっています。',
                type: 'success'
            };
        }

        const error = result.errors[0];
        if (!error) {
            return {
                title: 'エラー',
                message: '検証中にエラーが発生しました',
                type: 'error'
            };
        }

        if (error.type === 'missing_arrows') {
            const missing = error.details[0];
            return {
                title: '矢印が足りません',
                message: `${missing.from} から ${missing.to} への矢印を追加してみよう！`,
                type: 'error'
            };
        }

        if (error.type === 'path_mismatch') {
            return {
                title: '経路が一致しません',
                message: error.message,
                type: 'error'
            };
        }

        return {
            title: 'もう一度確認してみよう',
            message: error.message,
            type: 'error'
        };
    }
}

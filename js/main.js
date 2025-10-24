/**
 * メインエントリーポイント
 */

// グローバルゲームインスタンス
let game = null;

/**
 * DOMContentLoaded後に初期化
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('圏論パズルゲームを起動中...');

    // ゲームインスタンスを作成
    game = new CategoryGame();

    // ゲームを初期化
    game.init();

    console.log('ゲーム起動完了！');
});

/**
 * ウィンドウリサイズ時にキャンバスをリサイズ
 */
window.addEventListener('resize', () => {
    if (game && game.renderer) {
        // キャンバスのリサイズ処理
        // 必要に応じて実装
    }
});

/**
 * デバッグ用のヘルパー関数
 */
window.debugGame = () => {
    if (!game) {
        console.log('ゲームが初期化されていません');
        return;
    }

    console.log('=== ゲーム状態 ===');
    console.log('現在の問題:', game.currentProblem);
    console.log('スコア:', game.score);
    console.log('解決済み問題:', Array.from(game.solvedProblems));
    console.log('グラフ:', game.graph.toJSON());

    return {
        problem: game.currentProblem,
        score: game.score,
        solved: Array.from(game.solvedProblems),
        graph: game.graph.toJSON()
    };
};

/**
 * デバッグ用：問題をスキップ
 */
window.skipProblem = () => {
    if (game) {
        game.solvedProblems.add(game.currentProblem.id);
        game.score += game.currentProblem.difficulty * 100;
        game.nextProblem();
    }
};

/**
 * デバッグ用：特定の問題にジャンプ
 */
window.jumpToProblem = (id) => {
    if (game) {
        game.loadProblem(id);
    }
};

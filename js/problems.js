/**
 * 問題定義
 * 段0〜2の9問を定義
 */

const PROBLEMS = [
    // ===== 段0: 図で遊ぶ（結合律の体験） =====
    {
        id: 1,
        stage: 0,
        title: "問題1: まっすぐな道",
        description: "A から C まで、まっすぐ進む道を作ろう",
        hint: "箱 A、B、C を矢印でつなげてみよう。どの道を通っても同じ場所に着くかな？",
        concepts: ["矢印の合成"],
        objects: [
            { id: "A", label: "パスタ", x: 100, y: 200 },
            { id: "B", label: "茹でたパスタ", x: 300, y: 200 },
            { id: "C", label: "カルボナーラ", x: 500, y: 200 }
        ],
        initialArrows: [
            { id: "f", from: "A", to: "B", label: "茹でる", editable: false }
        ],
        requiredArrows: [
            { from: "B", to: "C", label: "ソースと和える" }
        ],
        goalPaths: [
            { start: "A", end: "C", paths: [["f", "g"]] }
        ],
        difficulty: 1
    },
    {
        id: 2,
        stage: 0,
        title: "問題2: 2つの道",
        description: "ハンバーグを作る2つの方法",
        hint: "上の道と下の道、どちらを通っても同じハンバーグができるかな？",
        concepts: ["矢印の合成", "可換性"],
        objects: [
            { id: "A", label: "肉", x: 100, y: 150 },
            { id: "B", label: "成形した肉", x: 300, y: 100 },
            { id: "C", label: "味付けした肉", x: 300, y: 200 },
            { id: "D", label: "ハンバーグ", x: 500, y: 150 }
        ],
        initialArrows: [
            { id: "f1", from: "A", to: "B", label: "成形", editable: false },
            { id: "f2", from: "A", to: "C", label: "味付け", editable: false }
        ],
        requiredArrows: [
            { from: "B", to: "D", label: "味付けして焼く" },
            { from: "C", to: "D", label: "成形して焼く" }
        ],
        goalPaths: [
            { start: "A", end: "D", paths: [["f1", "g1"], ["f2", "g2"]] }
        ],
        difficulty: 2
    },
    {
        id: 3,
        stage: 0,
        title: "問題3: 3つの箱をつなぐ",
        description: "材料から完成まで、順番につなげよう",
        hint: "A → B → C と進む道と、A → D → C と進む道が同じになるように！",
        concepts: ["結合律", "可換図式"],
        objects: [
            { id: "A", label: "材料", x: 100, y: 200 },
            { id: "B", label: "下準備", x: 250, y: 100 },
            { id: "D", label: "別の下準備", x: 250, y: 300 },
            { id: "C", label: "完成", x: 450, y: 200 }
        ],
        initialArrows: [
            { id: "f", from: "A", to: "B", label: "切る", editable: false },
            { id: "h", from: "A", to: "D", label: "混ぜる", editable: false }
        ],
        requiredArrows: [
            { from: "B", to: "C", label: "焼く" },
            { from: "D", to: "C", label: "焼く" }
        ],
        goalPaths: [
            { start: "A", end: "C", paths: [["f", "g"], ["h", "k"]] }
        ],
        difficulty: 2
    },

    // ===== 段1: 恒等と合成 =====
    {
        id: 4,
        stage: 1,
        title: "問題4: 何もしない矢印",
        description: "「何もしない」という特別な矢印を見つけよう",
        hint: "同じ場所から同じ場所へ行く矢印。これを「恒等射」と言うよ。",
        concepts: ["恒等射", "合成"],
        objects: [
            { id: "A", label: "ハンバーグ", x: 200, y: 200 },
            { id: "B", label: "チーズハンバーグ", x: 450, y: 200 }
        ],
        initialArrows: [
            { id: "f", from: "A", to: "B", label: "チーズを乗せる", editable: false },
            { id: "id_A", from: "A", to: "A", label: "何もしない", editable: false, color: "#999" }
        ],
        requiredArrows: [],
        goalPaths: [
            { start: "A", end: "B", paths: [["f"], ["id_A", "f"]] }
        ],
        difficulty: 2
    },
    {
        id: 5,
        stage: 1,
        title: "問題5: 矢印をつなげる",
        description: "2つの矢印を1つにまとめよう",
        hint: "「チーズを乗せる」と「ソースをかける」を続けると何になる？",
        concepts: ["合成の定義"],
        objects: [
            { id: "A", label: "ハンバーグ", x: 100, y: 200 },
            { id: "B", label: "チーズハンバーグ", x: 300, y: 200 },
            { id: "C", label: "チーズデミグラスハンバーグ", x: 550, y: 200 }
        ],
        initialArrows: [
            { id: "f", from: "A", to: "B", label: "チーズを乗せる", editable: false },
            { id: "g", from: "B", to: "C", label: "デミグラスをかける", editable: false }
        ],
        requiredArrows: [
            { from: "A", to: "C", label: "チーズとソース" }
        ],
        goalPaths: [
            { start: "A", end: "C", paths: [["f", "g"], ["h"]] }
        ],
        difficulty: 2
    },
    {
        id: 6,
        stage: 1,
        title: "問題6: 合成の順番",
        description: "(f・g)・h = f・(g・h) を確かめよう",
        hint: "どの順番でつなげても、結果は同じになるよ！",
        concepts: ["結合律"],
        objects: [
            { id: "A", label: "材料", x: 100, y: 200 },
            { id: "B", label: "工程1", x: 250, y: 200 },
            { id: "C", label: "工程2", x: 400, y: 200 },
            { id: "D", label: "完成", x: 550, y: 200 }
        ],
        initialArrows: [
            { id: "f", from: "A", to: "B", label: "f", editable: false },
            { id: "g", from: "B", to: "C", label: "g", editable: false },
            { id: "h", from: "C", to: "D", label: "h", editable: false }
        ],
        requiredArrows: [],
        goalPaths: [
            { start: "A", end: "D", paths: [["f", "g", "h"]] }
        ],
        difficulty: 1
    },

    // ===== 段2: 四角が合う（可換図式） =====
    {
        id: 7,
        stage: 2,
        title: "問題7: 四角形を完成させよう",
        description: "上回りと下回りが同じになるように矢印を配置",
        hint: "A→B→D と A→C→D の2つの道が同じ結果になるように！",
        concepts: ["可換図式", "四角形"],
        objects: [
            { id: "A", label: "材料", x: 100, y: 100 },
            { id: "B", label: "工程A", x: 350, y: 100 },
            { id: "C", label: "工程B", x: 100, y: 300 },
            { id: "D", label: "完成", x: 350, y: 300 }
        ],
        initialArrows: [
            { id: "f", from: "A", to: "B", label: "切る", editable: false },
            { id: "g", from: "A", to: "C", label: "茹でる", editable: false }
        ],
        requiredArrows: [
            { from: "B", to: "D", label: "茹でて和える" },
            { from: "C", to: "D", label: "切って和える" }
        ],
        goalPaths: [
            { start: "A", end: "D", paths: [["f", "h"], ["g", "k"]] }
        ],
        difficulty: 3
    },
    {
        id: 8,
        stage: 2,
        title: "問題8: 三角形の可換図式",
        description: "3つの箱で三角形を作ろう",
        hint: "A→B と A→C→B の道が同じになるように！",
        concepts: ["可換図式", "三角形"],
        objects: [
            { id: "A", label: "ハンバーグ", x: 150, y: 100 },
            { id: "B", label: "デミグラスハンバーグ", x: 400, y: 100 },
            { id: "C", label: "チーズハンバーグ", x: 275, y: 300 }
        ],
        initialArrows: [
            { id: "f", from: "A", to: "B", label: "デミグラスをかける", editable: false },
            { id: "g", from: "A", to: "C", label: "チーズを乗せる", editable: false }
        ],
        requiredArrows: [
            { from: "C", to: "B", label: "デミグラスをかける" }
        ],
        goalPaths: [
            { start: "A", end: "B", paths: [["f"], ["g", "h"]] }
        ],
        difficulty: 2
    },
    {
        id: 9,
        stage: 2,
        title: "問題9: 複雑な図式",
        description: "6つの箱で大きな可換図式を作ろう",
        hint: "どの道を通っても、同じ場所に着くように矢印をつなげよう！",
        concepts: ["可換図式", "複数経路"],
        objects: [
            { id: "A", label: "材料", x: 100, y: 200 },
            { id: "B", label: "工程1A", x: 250, y: 100 },
            { id: "C", label: "工程1B", x: 250, y: 300 },
            { id: "D", label: "工程2A", x: 450, y: 100 },
            { id: "E", label: "工程2B", x: 450, y: 300 },
            { id: "F", label: "完成", x: 600, y: 200 }
        ],
        initialArrows: [
            { id: "f1", from: "A", to: "B", label: "切る", editable: false },
            { id: "f2", from: "A", to: "C", label: "混ぜる", editable: false },
            { id: "g1", from: "B", to: "D", label: "茹でる", editable: false },
            { id: "g2", from: "C", to: "E", label: "焼く", editable: false }
        ],
        requiredArrows: [
            { from: "D", to: "F", label: "盛り付ける" },
            { from: "E", to: "F", label: "盛り付ける" }
        ],
        goalPaths: [
            { start: "A", end: "F", paths: [["f1", "g1", "h1"], ["f2", "g2", "h2"]] }
        ],
        difficulty: 3
    }
];

/**
 * ステージ情報
 */
const STAGES = [
    {
        id: 0,
        title: "段0: 図で遊ぶ",
        description: "矢印を並べて、合流の順番を変えても同じになることを体験しよう",
        concepts: ["結合律", "矢印の合成"]
    },
    {
        id: 1,
        title: "段1: 恒等と合成",
        description: "何もしない矢印と、矢印をつなげる方法を学ぼう",
        concepts: ["恒等射", "合成", "結合律"]
    },
    {
        id: 2,
        title: "段2: 四角が合う",
        description: "上回りと下回りが同じになる図を作ろう",
        concepts: ["可換図式", "経路の一致"]
    }
];

/**
 * 問題IDから問題を取得
 */
function getProblem(id) {
    return PROBLEMS.find(p => p.id === id);
}

/**
 * ステージIDからステージ情報を取得
 */
function getStage(id) {
    return STAGES.find(s => s.id === id);
}

/**
 * ステージIDから問題リストを取得
 */
function getProblemsByStage(stageId) {
    return PROBLEMS.filter(p => p.stage === stageId);
}

/**
 * 全問題数を取得
 */
function getTotalProblems() {
    return PROBLEMS.length;
}

/**
 * ゲームロジック
 */

class CategoryGame {
    constructor() {
        this.currentProblem = null;
        this.currentProblemIndex = 0;
        this.score = 0;
        this.solvedProblems = new Set();

        this.graph = new CategoryGraph();
        this.validator = new DiagramValidator(this.graph);

        // UI要素
        this.canvas = null;
        this.renderer = null;

        // インタラクション状態
        this.selectedTool = 'select';
        this.selectedObject = null;
        this.tempArrow = null;
        this.arrowIdCounter = 0;
    }

    /**
     * 初期化
     */
    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.renderer = new DiagramRenderer(this.canvas);
        this.renderer.setGraph(this.graph);

        this.setupEventListeners();
        this.renderer.startAnimation();

        // 最初の問題をロード
        this.loadProblem(1);
    }

    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // ツールボタン
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectTool(btn.dataset.tool);
            });
        });

        // キャンバスのイベント
        this.canvas.addEventListener('mousedown', (e) => this.handleCanvasMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleCanvasMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleCanvasMouseUp(e));

        // コントロールボタン
        document.getElementById('playBtn').addEventListener('click', () => this.checkAnswer());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetProblem());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextProblem());

        // チュートリアル開始ボタン
        document.getElementById('startBtn').addEventListener('click', () => {
            document.getElementById('tutorialModal').style.display = 'none';
        });
    }

    /**
     * ツールを選択
     */
    selectTool(tool) {
        this.selectedTool = tool;

        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        document.querySelector(`[data-tool="${tool}"]`).classList.add('active');
    }

    /**
     * 問題をロード
     */
    loadProblem(problemId) {
        const problem = getProblem(problemId);
        if (!problem) {
            console.error('Problem not found:', problemId);
            return;
        }

        this.currentProblem = problem;
        this.currentProblemIndex = problemId;

        // グラフをクリア
        this.graph.clear();

        // オブジェクトを追加
        problem.objects.forEach(obj => {
            this.graph.addObject(obj.id, obj.label, obj.x, obj.y);
        });

        // 初期の矢印を追加
        if (problem.initialArrows) {
            problem.initialArrows.forEach(arrow => {
                this.graph.addArrow(
                    arrow.id,
                    arrow.from,
                    arrow.to,
                    arrow.label,
                    arrow.editable !== false,
                    arrow.color
                );
            });
        }

        // UIを更新
        this.updateUI();

        // バリデーターを更新
        this.validator = new DiagramValidator(this.graph);
        this.renderer.setGraph(this.graph);

        // フィードバックを非表示
        document.getElementById('feedback').style.display = 'none';
        document.getElementById('nextBtn').style.display = 'none';
    }

    /**
     * UIを更新
     */
    updateUI() {
        const problem = this.currentProblem;
        const stage = getStage(problem.stage);

        // ヘッダー情報
        document.getElementById('currentStage').textContent = problem.stage;
        document.getElementById('currentProblem').textContent = problem.id;
        document.getElementById('score').textContent = this.score;

        // 問題情報
        document.getElementById('stageTitle').textContent = stage.title;
        document.getElementById('stageDescription').textContent = stage.description;
        document.getElementById('problemTitle').textContent = problem.title;
        document.getElementById('hint').textContent = problem.hint;

        // コンセプトリスト
        const conceptList = document.getElementById('conceptList');
        conceptList.innerHTML = '';
        problem.concepts.forEach(concept => {
            const div = document.createElement('div');
            div.className = 'concept-item';
            div.textContent = `✓ ${concept}`;
            conceptList.appendChild(div);
        });

        // 進捗
        document.getElementById('solvedCount').textContent = this.solvedProblems.size;
        document.getElementById('totalCount').textContent = getTotalProblems();
        const progress = (this.solvedProblems.size / getTotalProblems()) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
    }

    /**
     * キャンバスのマウスダウン
     */
    handleCanvasMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const obj = this.renderer.getObjectAtPosition(x, y);

        if (this.selectedTool === 'arrow' && obj) {
            // 矢印の始点を選択
            this.selectedObject = obj.id;
            this.tempArrow = { from: obj.id, x1: obj.x, y1: obj.y, x2: x, y2: y };
        }
    }

    /**
     * キャンバスのマウスムーブ
     */
    handleCanvasMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // ホバー状態を更新
        const obj = this.renderer.getObjectAtPosition(x, y);
        this.renderer.hoveredObject = obj ? obj.id : null;

        // 一時的な矢印を更新
        if (this.tempArrow) {
            this.tempArrow.x2 = x;
            this.tempArrow.y2 = y;
        }
    }

    /**
     * キャンバスのマウスアップ
     */
    handleCanvasMouseUp(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.selectedTool === 'arrow' && this.tempArrow) {
            const obj = this.renderer.getObjectAtPosition(x, y);

            if (obj && this.selectedObject) {
                // 矢印を追加
                this.addArrow(this.selectedObject, obj.id);
            }

            this.tempArrow = null;
            this.selectedObject = null;
        }
    }

    /**
     * 矢印を追加
     */
    addArrow(from, to) {
        const arrowId = `arrow_${this.arrowIdCounter++}`;
        const label = this.promptArrowLabel(from, to);

        if (label !== null) {
            this.graph.addArrow(arrowId, from, to, label, true);
            console.log(`Arrow added: ${from} -> ${to} (${label})`);
        }
    }

    /**
     * 矢印のラベルを入力
     */
    promptArrowLabel(from, to) {
        const fromObj = this.graph.getObject(from);
        const toObj = this.graph.getObject(to);

        const label = prompt(
            `${fromObj.label} から ${toObj.label} への矢印のラベルを入力してください：`,
            ''
        );

        return label;
    }

    /**
     * 答えをチェック
     */
    checkAnswer() {
        const result = this.validator.validate(this.currentProblem);
        this.showFeedback(result);

        if (result.isValid) {
            this.solvedProblems.add(this.currentProblem.id);
            this.score += this.currentProblem.difficulty * 100;
            this.updateUI();
        }
    }

    /**
     * フィードバックを表示
     */
    showFeedback(result) {
        const feedbackEl = document.getElementById('feedback');
        const formatted = this.validator.formatValidationResult(result);

        feedbackEl.style.display = 'block';
        feedbackEl.className = 'feedback-area';

        if (formatted.type === 'success') {
            feedbackEl.classList.add('success');
            document.getElementById('feedbackIcon').textContent = '✓';
            document.getElementById('nextBtn').style.display = 'inline-block';
        } else {
            feedbackEl.classList.add('error');
            document.getElementById('feedbackIcon').textContent = '✗';
            document.getElementById('nextBtn').style.display = 'none';
        }

        document.getElementById('feedbackTitle').textContent = formatted.title;
        document.getElementById('feedbackMessage').textContent = formatted.message;

        // 経路をハイライト
        if (result.pathComparisons && result.pathComparisons.length > 0) {
            const paths = result.pathComparisons[0].actualPaths || [];
            this.renderer.highlightPaths(paths);
        }
    }

    /**
     * 問題をリセット
     */
    resetProblem() {
        this.loadProblem(this.currentProblem.id);
        this.renderer.clearHighlight();
    }

    /**
     * 次の問題へ
     */
    nextProblem() {
        const nextId = this.currentProblem.id + 1;
        if (nextId <= getTotalProblems()) {
            this.loadProblem(nextId);
            this.renderer.clearHighlight();
        } else {
            this.showCompletionScreen();
        }
    }

    /**
     * 完了画面を表示
     */
    showCompletionScreen() {
        alert(`おめでとうございます！全${getTotalProblems()}問クリアしました！\nスコア: ${this.score}点`);
    }
}

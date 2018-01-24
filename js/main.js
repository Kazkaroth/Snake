window.onload = function () {
    let canvasWidth = 600;
    let canvasHeight = 600;
    let blockSize = 25;
    let ctx;
    let delay = 100;
    let snakee;
    let applee;
    let widthInBlocks = canvasWidth / blockSize;
    let heightInBlocks = canvasHeight / blockSize;
    let score;
    let timeOut;

    init();

    function init() {
        let canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.border = "5px solid black";
        canvas.style.backgroundColor = "#444";
        canvas.style.margin = "100px auto";
        canvas.style.display = "block";
        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');
        snakee = new Snake([[6, 4], [5, 4], [4, 4], [3, 4], [2, 3]], "right");
        applee = new apple([10, 10]);
        score = 0;
        refreshCanvas();
    }

    function refreshCanvas() {

        snakee.advance();
        if (snakee.checkCollision()) {
            gameOver();
        }
        else {
            if (snakee.isEatingApple(applee)) {
                score++;
                snakee.ateApple = true;
                do {
                    applee.setNewPosition();
                }
                while (applee.isOnSnake(snakee))
            }
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            snakee.draw();
            applee.draw();
            drawScore();
            timeOut = setTimeout(refreshCanvas, delay);
        }

    }

    function gameOver() {
        ctx.save();
        ctx.font = "44px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.strokeStyle = "#bae755";
        ctx.lineWidth = 1.5;
        ctx.strokeText("Game Over", canvasWidth / 2, canvasHeight / 2);
        // ctx.fillText("Game Over", canvasWidth /2, canvasHeight/2);
        ctx.font = "28px Arial";
        ctx.strokeText("Space to restart", canvasWidth / 2, canvasHeight - 250);
        // ctx.fillText("Space to restart", canvasWidth /2, canvasHeight - 250);
        ctx.restore();
    }

    function restart() {
        snakee = new Snake([[6, 4], [5, 4], [4, 4], [3, 4], [2, 3]], "right");
        applee = new apple([10, 10]);
        score = 0;
        clearTimeout(timeOut);
        refreshCanvas();
    }

    function drawScore() {
        ctx.save();
        ctx.font = "22px Arial";
        ctx.fillStyle = "#c6e2ff";
        ctx.fillText(score.toString(), canvasWidth / 2, canvasHeight - 30);
        ctx.restore();
    }

    function drawBlock(ctx, position) {
        let x = position[0] * blockSize;
        let y = position[1] * blockSize;
        ctx.fillRect(x, y, blockSize, blockSize);
    }

    function Snake(body, direction) {
            this.body = body;
            this.direction = direction;
            this.ateApple = false;
        this.draw = function () {
            ctx.save();
            ctx.fillStyle = "#C55";
            for (let i = 0; i < this.body.length; i++) {
                drawBlock(ctx, this.body[i]);
            }
            ctx.restore();
        };
        this.advance = function () {
            let nextPosition = this.body[0].slice();
            switch (this.direction) {
                case "left":
                    nextPosition[0] -= 1;
                    break;
                case "right":
                    nextPosition[0] += 1;
                    break;
                case "down":
                    nextPosition[1] += 1;
                    break;
                case "up":
                    nextPosition[1] -= 1;
                    break;
                default:
                    throw("Invalid Direction")
            }
            this.body.unshift(nextPosition);
            if (!this.ateApple)
                this.body.pop();
            else
                this.ateApple = false;
        };
        this.setDirection = function (newDirection) {
            let allowedDirection;
            switch (this.direction) {
                case "left":
                case "right":
                    allowedDirection = ["up", "down"];
                    break;
                case "down":
                case "up":
                    allowedDirection = ["left", "right"];
                    break;
                default:
                    throw("Invalid Direction")
            }
            if (allowedDirection.indexOf(newDirection) > -1) {
                this.direction = newDirection;
            }
        };
        this.checkCollision = function () {
            let wallCollision = false;
            let snakeCollision = false;
            let head = this.body[0];
            let rest = this.body.slice(1);
            let snakeX = head[0];
            let snakeY = head[1];
            let minX = 0;
            let minY = 0;
            let maxX = widthInBlocks - 1;
            let maxY = heightInBlocks - 1;
            let isNotBetweenHorzWalls = snakeX < minX || snakeX > maxX;
            let isNotBetweenVertWalls = snakeY < minY || snakeY > maxY;

            if (isNotBetweenHorzWalls || isNotBetweenVertWalls) {
                wallCollision = true;
            }
            for (let i = 0; i < rest.length; i++) {
                if (snakeX === rest[i][0] && snakeY === rest[i][1]) {
                    snakeCollision = true;
                }
            }
            return wallCollision || snakeCollision;
        };
        this.isEatingApple = function (appleToEat) {
            let head = this.body[0];
            return head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1];
        }
    }

    function apple(position) {
        this.position = position;
        this.draw = function () {
            ctx.save();
            ctx.fillStyle = "#bae755";
            ctx.beginPath();
            let radius = blockSize / 2;
            let x = this.position[0] * blockSize + radius;
            let y = this.position[1] * blockSize + radius;
            ctx.arc(x, y, radius, 0, Math.PI * 2, true);
            ctx.fill();
            ctx.restore();
        };
        this.setNewPosition = function () {
            let newX = Math.round(Math.random() * (widthInBlocks - 1));
            let newY = Math.round(Math.random() * (heightInBlocks - 1));
            this.position = [newX, newY];
        };
        this.isOnSnake = function (snakeToCheck) {
            let isOnSnake = false;
            for (let i = 0; i < snakeToCheck.body.length; i++) {
                if (this.position[0] === snakeToCheck.body[i][0] && this.position[1] === snakeToCheck.body[i][1]) {
                    isOnSnake = true;
                }
            }
            return isOnSnake;
        }
    }

    document.onkeydown = function handleKeyDown(e) {
        let key = e.keyCode;
        let newDirection;
        switch (key) {
            case 37:
                newDirection = "left";
                break;
            case 38:
                newDirection = "up";
                break;
            case 39:
                newDirection = "right";
                break;
            case 40:
                newDirection = "down";
                break;
            case 32:
                restart();
                return;
            default:
                return;
        }
        snakee.setDirection(newDirection);
    }
};




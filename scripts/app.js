//@ts-check
/** @type {HTMLCanvasElement} */
//@ts-ignore
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
canvas.width = 1200;
canvas.height = 700;

class bal {
    constructor() {
        this.X = canvas.width * .15;
        this.yLastBounce=0;
        this.Y = -400;
        this.speed = 20;
        this.radius = 20;
        this.maxBounceHeight=canvas.height/2;
    }


    update() {
        const isMovingDown = this.speed > 0;

        this.Y = this.Y + this.speed;

        if(this.Y+this.radius >= canvas.height) {
            this.speed *= -1;
            this.yLastBounce = this.Y;
        }

        if(!isMovingDown && 
            this.Y <= this.yLastBounce+this.maxBounceHeight) {
            this.speed *= -1;
        }
    }

    render() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.X, this.Y, this.radius, 0, Math.PI * 2, true);
        ctx.fill();

        ctx.restore();
    }
};

let player = new bal();

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.update();
    player.render();

    requestAnimationFrame(gameLoop)
};

requestAnimationFrame(gameLoop)
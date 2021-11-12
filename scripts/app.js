/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
canvas.width = 1200;
canvas.height = 700;

class bal {
    constructor() {
        this.X=canvas.width*.15;
        this.Y=-400;
        this.speed=20;
        this.radius=20;
    }


    update() {
        this.Y = this.Y + this.speed;
        
    }

    render() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.X, this.Y, this.radius, 0, Math.PI*2, true);
        ctx.fill();

        ctx.restore();
    }
};

let player=new bal();

function gameLoop() {
    ctx.clearRect(0,0, canvas.width, canvas.height);
    player.update();
    player.render();

    requestAnimationFrame(gameLoop)
};

requestAnimationFrame(gameLoop) 
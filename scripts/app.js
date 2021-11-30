//@ts-check
/** @type {HTMLCanvasElement} */
//@ts-ignore
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
canvas.width = 1200;
canvas.height = 700;

function parabollicEasing(pt) {
    let x = pt * 4 - 2;
    let y= x * x*-1 +4; //((x^2)*-1) +4
    return y/4;
}

class KeyboardState {
    constructor() {
        this.isAccelerating =false;
        this.isBraking = false;
        this.registerEventHandlers();
    }

    registerEventHandlers() {
        window.addEventListener("keydown", (e) => {
            switch (e.key) {
                case "a":
                case "ArrowLeft":
                    this.isBraking = true;
                    break;
                case "d":
                case "ArrowRight":
                    this.isAccelerating=true;
                    break;
            }
        });
        window.addEventListener("keyup", (e) => {
            switch (e.key) {
                case "a":
                case "ArrowLeft":
                    this.isBraking = false;
                    break;
                case "d":
                case "ArrowRight":
                    this.isAccelerating=  false;
                    break;
            
            }   
        })
    }
};  

class Bal {
    /**
     * @param {Array<SafePlatform>} [platforms]
     */
    constructor(platforms) {
        this.platforms= platforms;
        this.X = canvas.width * .15;
        this.yLastBounce=0;
        this.Y = -10;
        //this.speed = 10;
        this.bounceTime = 1750;
        this.timeSinceLastBounce= 0;
        this.radius = 20;
        this.maxBounceHeight=canvas.height/2;
        
    }


    update(timeElapsed) {
        this.timeSinceLastBounce+=timeElapsed;
        const isMovingDown = this.timeSinceLastBounce > this.bounceTime/2;


        let ef = parabollicEasing(this.timeSinceLastBounce/this.bounceTime)
        this.Y = this.yLastBounce - this.maxBounceHeight * ef;

        this.platforms.forEach((platforms) => {
            let isPlatformBelow = this.X >= platforms.x && this.X <= platforms.x + platforms.width
       
            if(isMovingDown && isPlatformBelow && this.Y+this.radius >= platforms.y) {
                this.timeSinceLastBounce=0;
                this.yLastBounce = this.Y;
            }
            
        });

        /*if(this.Y >= 700) {
            this.Y -= 700
        } else if(this.Y != 700) {

        }*/
        
    }

    render() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.X, this.Y, this.radius, 0, Math.PI * 2, true);
        ctx.fill();

        ctx.restore();
    }
};

class Game {
    /**
     * @param {KeyboardState} kb
     */
    constructor(kb) {
        this.kb=kb;
        this.speed= 0;
        this.maxSpeed= 100;
        this.accelerationRate = 5;
        this.accelerationInterval = 100;
        this.timeSinceLastAcceleration = 0;
    }
    update(timeElapsed) {
        this.timeSinceLastAcceleration += timeElapsed;

        if(this.kb.isAccelerating && this.speed < this.maxSpeed &&
            this.timeSinceLastAcceleration >= this.accelerationInterval
            ) {
                this.speed += this.accelerationRate;
                this.timeSinceLastAcceleration = 0;

        }

        if(this.kb.isBraking) {
            this.speed = 0;
            this.timeSinceLastAcceleration = 0;
        }

        if(!this.kb.isAccelerating && !this.kb.isBraking &&
            this.timeSinceLastAcceleration >= this.accelerationInterval
            && this.speed > 0) {
            //decelerate
            this.speed -= this.accelerationRate;
            this.timeSinceLastAcceleration = 0;
        }

    }

    render() {}
};

class Tracer {
    /**
     * @param {Bal} b
     * @param {Game} g
    */
    constructor(b, g){
        this.b = b;
        this.g = g;

        this.x = b.X;
        this.y = b.Y;
        
        this.isVisible= true;
        this.opacity= 1;

        this.fadeRate = .1;
        this.fadeInterval = 100;
        this.timeSincLastFade = 0;
    }
        update(timeElapsed) {
        this.timeSincLastFade += timeElapsed;
        this.x -= this.g.speed;
        
        if(this.timeSincLastFade >= this.fadeInterval) {
            this.opacity -=this.fadeRate;
            this.timeSincLastFade = 0;
        }

        this.isVisible = this.opacity > 0;
    }

    render() {
        ctx.save();
        ctx.fillStyle = `hsla(0, 0%, 50%, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.b.radius/2, 0, Math.PI*2, true) 
        ctx.fill();

        ctx.restore();
    }
    
}

class SafePlatform {
    /**
     * @param {Game} g
     */
    constructor(g) {
        this.game = g;
        this.width = 450;
        this.height = 32;
    
        this.x = 0;
        this.y = canvas.height - this.height * 1.5;

        this.isVisible = true;
    }



/**
     * @param {number} timeElapsed
     */
update(timeElapsed) {
    this.x -= this.game.speed;
    this.isVisible = this.x + this.width > 0;
}

render() {
    ctx.save();
    ctx.fillStyle = "hsl(0, 10%, 10%)";
    ctx.fillRect(this.x, this.y, this.width, this.height) 
    ctx.restore();
}

}

class ScorePlatform {
    /**
     * @param {Game} g
     */
    constructor(g) {
        this. game = g;
        this.height = canvas.height;
        this.width = 32;

        this.x = 2;
        this.y = canvas.height /2;

        this.isVisible = true;

        this.isScored = false;
    }
    /**
     * @param {number} timeElapsed
     */
update(timeElapsed) {
    this.x -= this.game.speed;
    this.isVisible = this.x + this.width > 0;
}

render() {
    ctx.save();
    ctx.fillStyle = "hsl(120, 100%, 50%)";
    ctx.fillRect(this.x, this.y, this.width, this.height) 
    ctx.restore();
    }
}

let kb= new KeyboardState();
let game= new Game(kb);

let p1 = new ScorePlatform(game);
let p2 = new ScorePlatform(game);
let p3 = new ScorePlatform(game);

p1.x = 400 + 75;
p2.x = p1.x + 120
p3.x = p2.x + 135

let platforms = [new SafePlatform(game), p1, p2, p3]
let player = new Bal(platforms); 
let tracers = [new Tracer(player, game)]


let currentTime = 0;


function gameLoop(timestamp) {
    let timeElapsed = timestamp - currentTime;
    currentTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    

    game.update(timeElapsed);
    game.render();

    tracers.push(new Tracer(player, game));

    tracers.forEach((t) => {
        t.update(timeElapsed);
        t.render();
    })

    platforms.forEach((p) => {
        p.update(timeElapsed);
        p.render();
    })

    player.update(timeElapsed);
    player.render();

    tracers = tracers.filter(t => t.isVisible);

    requestAnimationFrame(gameLoop)
};


    requestAnimationFrame(gameLoop)
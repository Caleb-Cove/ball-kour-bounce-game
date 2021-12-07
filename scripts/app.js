//@ts-check
/** @type {HTMLCanvasElement} */
//@ts-ignore
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
canvas.width = 1200;
canvas.height = 700;

/**
 * @param {number} pt
 */
function parabollicEasing(pt) {
    let x = pt * 2.5 - 2;
    let y= x * x*-1 +4; 
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
                case "ArrowDown":
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
                case "ArrowDown":
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
        this.preY = 0;
        this.radius = 20;

        this.leftSide = this.X - this.radius / 2;
        this.rightSide = this.X + this.radius /2

        this.bounceTime = 1750;
        this.timeSinceLastBounce= 0;
        this.maxBounceHeight=canvas.height/2;
        
    }


    /**
     * @param {number} timeElapsed
     */
    update(timeElapsed) {
        this.timeSinceLastBounce+=timeElapsed;
        const isMovingDown = this.timeSinceLastBounce > this.bounceTime/2;


        let ef = parabollicEasing(this.timeSinceLastBounce/this.bounceTime)
        this.Y = this.yLastBounce - this.maxBounceHeight * ef;

        this.platforms.forEach((platforms) => {
            let inside = this.rightSide >= platforms.x && this.leftSide <= platforms.x + platforms.width
            let platformBelow = inside && (this.Y < platforms.x || this.preY < platforms.y)

            if(isMovingDown && platformBelow && this.Y+this.radius >= platforms.y) {
                this.timeSinceLastBounce=0;
                this.yLastBounce = platforms.y;


            // @ts-ignore
                let event = new CustomEvent("bkb-bounce", {detail: platforms}); 
            document.dispatchEvent(event);
            
            }
        });

        this.preY = this.Y

        if(this.Y >= 700) {
            
        } 
    }

    render() {
        ctx.save();
        ctx.fillStyle = "black"
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
        this.maxSpeed= 5.25;
        this.accelerationRate = 5;
        this.accelerationInterval = 100;
        this.timeSinceLastAcceleration = 0;
   
        this.score = 0;
        this.scoreX= canvas.width - 130
        this.scoreY = 80;


        this.wireUpListeners();

        this.bgImage = new Image();
        this.bgImage.src = "/images/squares_glow.png";

        // w / 600 = 2048 / 1152

        this.imageHeight = canvas.height;
        this.imageWidth = (canvas.height * this.bgImage.width / this.bgImage.height)
        this.imageX = 0;
    }
    

    /**
     * @param {number} timeElapsed
     */
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
            this.speed -= this.accelerationRate;
            this.timeSinceLastAcceleration = 0;
       
        }

        this.imageX -= this.speed * .08;
        if(this.imageX + this.imageWidth <= 0) {
            this.imageX = 0;
        }
    }

    render() {
        ctx.save();
        ctx.drawImage(this.bgImage, this.imageX, 0, this.imageWidth, this.imageHeight)
        ctx.drawImage(this.bgImage, this.imageX + this.imageWidth, 0, this.imageWidth, this.imageHeight)

        ctx.fillStyle = "hsla(120, 100%, 10%, 0.2";
        ctx.fillRect(0, 0, canvas.width,  canvas.height)
        
        ctx.restore();

        ctx.save();
		ctx.fillStyle = "white";
		ctx.strokeStyle = "black";
		ctx.font = "90px serif";

		ctx.fillText(`${this.score}`, this.scoreX, this.scoreY);
		ctx.strokeText(`${this.score}`, this.scoreX, this.scoreY);
		ctx.restore();
    }

    wireUpListeners() {
        document.addEventListener("bkb-bounce", (e) =>  {
            //@ts-ignore
            let p = e.detail;


            if(p.isScorable && !p.isScored) {
                this.score += 1;
                p.isScored = true;
            }
             
        })
    }
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
        /**
     * @param {number} timeElapsed
     */
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
        ctx.fillStyle = `hsla(0, 100%, 50%, ${this.opacity})`;
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
    if(!this.isVisible) return;
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

        this.x = 0;
        this.y = canvas.height /1.5;

        this.isVisible = true;

        this.isScored = false;
        this.isScorable = true;
    }
    /**
     * @param {number} timeElapsed
     */
update(timeElapsed) {
    this.x -= this.game.speed;
    this.isVisible = this.x + this.width > 0;
}

render() {
    if(!this.isVisible) return;
    ctx.save();
    ctx.fillStyle = "hsl(120, 100%, 50%)";
    ctx.fillRect(this.x, this.y, this.width, this.height) 
    ctx.restore();
    }
}

class Manager {
    constructor(platforms, game) {
        this.platforms = platforms;
        this.game = game;

    }

    update() {
        let lastPlatform = platforms[platforms.length - 1]
        let furthestX = lastPlatform.x + lastPlatform.width;
    
        while(furthestX <= canvas.width * 2) {
            let spacer = Math.random() * 168 + 32
            
            let nextPlatformType = Math.random();

            let p;

            if(nextPlatformType <= 0.1) {
                p= new SafePlatform(this.game);
            } else { 
                p= new ScorePlatform(this.game);
            }

            p.x = furthestX + spacer;
            this.platforms.push(p);
            furthestX += spacer + p.width;
        }
    }
}



let kb= new KeyboardState();
let game= new Game(kb);

let platforms = [new SafePlatform(game)]
let pm = new Manager(platforms, game)
let player = new Bal(platforms); 
let tracers = [new Tracer(player, game)]


let currentTime = 0;


/**
 * @param {number} timestamp
 */
function gameLoop(timestamp) {
    let timeElapsed = timestamp - currentTime;
    currentTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    tracers.push(new Tracer(player, game));

    pm.update();

    let gameObjects = [game, ...tracers, player, ...platforms]

    gameObjects.forEach((o) => {
        o.update(timeElapsed)
        o.render();
    })


     game.update(timeElapsed);
     game.render();

    

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
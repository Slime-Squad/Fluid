/**
 * Class representation of a playable Slime entity
 * @author Xavier Hines, Nathan Brown, Jasper Newkirk
 */
class Slime extends AnimatedEntity {
    /**
     * Creates a new instance of a playable slime entity.
     * @param {string} tag The name of the current animation of the slime
     * @param {number} x The x-coordinate associated with the top-left corner of the slime's sprite on the canvas.
     * @param {number} y The y-coordinate associated with the top-left corner of the slime's sprite on the canvas.
     */
    constructor(tag, x, y) {
        super("./assets/graphics/characters/slimeBounce", tag, x, y);
        Object.assign(this, {tag, x, y});
        this.topPadding = PARAMS.SCALE * 5;
        this.rightPadding = PARAMS.SCALE * 3;
        this.leftPadding = this.rightPadding;
        this.hitbox = new HitBox(x + this.leftPadding, y + this.topPadding, 10*PARAMS.SCALE, 10*PARAMS.SCALE);
        
        this.spawnX = this.x;
        this.spawnY = this.y;
        // Movement
        this.speed = 2 * PARAMS.SCALE;
        this.dashSpeed = 16;
        this.momentum = 0;
        this.acceleration = this.speed / 45;
        this.decceleration = this.speed / 30;
        this.direction = 1;
        this.rise = -1;
        this.MINRISE = -6 * PARAMS.SCALE;
        this.bounce = 4 * PARAMS.SCALE;
        this.gravity = .685;

        // Conditions
        this.isAlive = true;
        this.canJump = true;
        this.canDash = true;
        this.isAirborne = true;
        this.isAnitgrav = false;
        this.lastX = this.x;
        this.lastY = this.y;

        // Charges
        this.charges = {
            "Electric" : 0,
            "Fire" : 0,
            "Ice" : 0,
            "Earth" : 0
        }

        // Timers
        this.jumpTimer = 0;
        this.dashTimer = 0;
        this.currentDashTime = 0;
    
    };

    /**
     * Function called on every clock tick.
     */
    update() {
        
        // CONTROLS
        
        // Up and Down
        // if(GAME.keys["w"] || GAME.up) {
        //     this.y -= this.speed * GAME.tickMod;
        // }
        // if(GAME.keys["s"] || GAME.down) {
        //     this.y += this.speed * GAME.tickMod;
        // }

        // const TICKMOD = GAME.clockTick * 60;
        const MAXMOM = this.speed / 1.5;
        
        // Left and Right
        if(GAME.keys["a"] || GAME.left) {
            if (this.momentum > 0) this.momentum /= 2;
            this.x += (this.speed * -1 + this.momentum) * GAME.tickMod;
            this.tag = "move_left";
            this.direction = -1;
            this.momentum = clamp(
                this.momentum - this.acceleration * GAME.tickMod,
                MAXMOM * -1,
                MAXMOM
            );
        }
        else if(GAME.keys["d"] || GAME.right) {
            if (this.momentum < 0) this.momentum /= 2;
            this.x += (this.speed + this.momentum) * GAME.tickMod;
            this.tag = "move";
            this.direction = 1;
            this.momentum = clamp(
                this.momentum + this.acceleration * GAME.tickMod,
                MAXMOM * -1,
                MAXMOM
            );
        } else {
            this.x += this.momentum * GAME.tickMod;
            this.tag = this.direction > 0 ? "idle" : "idle_left";
            this.momentum = this.direction > 0 ?
                clamp(this.momentum - this.decceleration * GAME.tickMod, 0, MAXMOM) :
                clamp(this.momentum + this.decceleration * GAME.tickMod, MAXMOM * -1, 0);
        }

        // Jump
        //this.canJump = true; // Allow Midair for Debugging
        if((GAME.keys[" "] || GAME.A) && this.canJump) {
            this.canJump = false;
            // console.log("jump");
            this.jumpTimer = 0;
            this.rise = this.bounce + (this.momentum / 2) * this.direction;
            this.isAirborne = true;
        }
        this.jumpTimer += GAME.clockTick;

        // Dash
        if((GAME.keys["j"] || GAME.B) && this.canDash) {
            this.canDash = false;
            console.log("smash");
            this.dashTimer = 120;
            this.currentDashTime = 0;
        }
        if (!this.canDash) this.currentDashTime += GAME.tickMod; 
        if (!this.canDash && (this.currentDashTime>= this.dashTimer - 1)) this.canDash = true;
        if (!this.canDash && this.currentDashTime < 15 ) {
            if(GAME.keys["a"]) this.x -= this.dashSpeed * GAME.tickMod;
            if(GAME.keys["d"]) this.x += this.dashSpeed * GAME.tickMod;
        }

        // Rise
        this.y -= this.rise * GAME.tickMod;
        if (this.rise < -1.5 * PARAMS.SCALE){
            this.canJump = false;
        }

        // Gravity
        if (this.rise > this.MINRISE){
            let hangtime = this.jumpTimer < 0.52 ? this.jumpTimer > 0.44 ? 0.1 : 1 : 1;
            this.rise -= this.gravity * GAME.tickMod * hangtime;
        }

        // HANDLE COLLISIONS
        this.hitbox.updatePos(this.x+this.leftPadding, this.y+this.topPadding);
        let totalCollisions = 0;
        // let tileCollisions = [];
        GAME.entities.forEach(entity => {
            if (!entity.hitbox || !this.isAlive) return;
            if (entity instanceof Slime) return;
            let collision = this.hitbox.collide2(entity.hitbox);
            if (!collision) return;
            totalCollisions++;
            switch (entity.constructor.name){
                case 'Charge':
                    if (entity.tag != "Disabled") { // charge collected
                        entity.tag = "Disabled";
                    }
                    break;
                case 'Tile':
                    let lastHitboxLeft = this.lastX + this.leftPadding;
                    let lastHitboxRight = this.lastX + this.leftPadding + this.hitbox.width;
                    let lastHitboxBottom = this.lastY + this.hitbox.height + this.topPadding;
                    // let lastHitboxCenter = {x: lastHitboxLeft + this.hitbox.width / 2, y: lastHitboxBottom - this.hitbox.height / 2 };
                    if (collision.direction !== 'bottom'){
                        if ( 
                            linePlaneIntersect(
                                lastHitboxLeft, lastHitboxBottom, this.hitbox.left, this.hitbox.bottom, 
                                entity.hitbox.left, entity.hitbox.right, entity.hitbox.top
                                ) ||
                            linePlaneIntersect(
                                lastHitboxRight, lastHitboxBottom, this.hitbox.right, this.hitbox.bottom, 
                                entity.hitbox.left, entity.hitbox.right, entity.hitbox.top
                                )
                        ){
                            collision.direction = 'bottom';
                            console.log("collision reset to bottom")
                        }
                    }
                    /*tileCollisions.push({
                        direction: collision.direction,
                        hitbox: entity.hitbox,
                        distance: Math.sqrt(
                                (entity.hitbox.center.x - lastHitboxCenter.x) * (entity.hitbox.center.x - lastHitboxCenter.x) + 
                                (entity.hitbox.center.y - lastHitboxCenter.y) * (entity.hitbox.center.y - lastHitboxCenter.y)
                            )
                    });*/
                    if (collision.direction === 'left'){
                        this.x = entity.hitbox.right - this.leftPadding;
                    } else if (collision.direction === 'right'){
                        this.x = entity.hitbox.left - this.hitbox.width - this.rightPadding;
                    } else if (collision.direction ==='top'){
                        this.y = entity.hitbox.bottom - this.topPadding;
                    } else {
                        this.y = entity.hitbox.top - this.hitbox.height - this.topPadding;
                        if (GAME.currentFrame - this.jumpTimer > 15) this.canJump = true;
                    }
                    this.hitbox.updatePos(this.x+this.leftPadding, this.y+this.topPadding);
                    break;
                case 'Checkpoint':
                    if (entity.tag == "Idle") {
                        entity.swapTag("Collected");
                        entity.hitbox = null;
                        this.spawnX = entity.x;
                        this.spawnY = entity.y;
                    }
                    break;
                case 'KillBox':
                    if (this.isAlive) this.kill();
                    break;
            }
        });

        // Apply Collisions in descending order of distance
        /*if (tileCollisions.length > 0){
            tileCollisions.sort((a, b) => {return b.distance - a.distance});
            tileCollisions.forEach((collision) => {
                if (collision.direction === "bottom") {
                    this.y = collision.hitbox.top - this.hitbox.height - this.topPadding;
                    if (GAME.currentFrame - this.jumpTimer > 15) this.canJump = true;
                } else if (collision.direction === 'left'){
                    this.x = collision.hitbox.right - this.leftPadding;
                } else if (collision.direction === 'right'){
                    this.x = collision.hitbox.left - this.hitbox.width - this.rightPadding;
                } else {
                    this.y = collision.hitbox.bottom - this.topPadding;
                }
            });
        }
        this.hitbox.updatePos(this.x+this.leftPadding, this.y+this.topPadding);*/


        if (totalCollisions > 5){
            console.log("collisions: " + totalCollisions);
            this.x = this.lastX;
            this.y = this.lastY;
        }

        // Reset momentum on stop
        if (this.x == this.lastX){
            this.momentum = 0;
        }

        // Reset rise on stop
        if (this.y == this.lastY){
            this.rise = -1;
        }

        // Update previous pos markers
        this.lastX = this.x;
        this.lastY = this.y;

    }

    /**
     * Draws the current slime's {@link Slime.tag} animation. Called on every clock tick.
     * @param {CanvasRenderingContext2D} ctx The canvas which the slime will be drawn on.
     */
    draw(ctx) {
        super.draw(ctx);
        if (PARAMS.DEBUG) {
            ctx.font = "30px segoe ui";
            ctx.fillStyle = "red";
            if (this.rise <= this.MINRISE){
                ctx.fillText("!", this.hitbox.center.x - GAME.camera.x, this.hitbox.top - 3 * PARAMS.SCALE - GAME.camera.y);
            };
            // ctx.fillText("Jump Timer:" + this.jumpTimer.toFixed(2), this.x - GAME.camera.x, this.y - GAME.camera.y - 150);
            // ctx.fillText("Rise:" + Math.round(this.rise), this.x - GAME.camera.x, this.y - GAME.camera.y - 50);
            // ctx.fillText("Momentum:" + Math.round(this.momentum), this.x - GAME.camera.x, this.y - GAME.camera.y);
            // ctx.fillText("Spawn: x=" + this.spawnX + " y=" + this.spawnY, this.x - GAME.camera.x, this.y - GAME.camera.y - 50);
        }
    }

    /**
     * Function responsible for killing the current Slime entity and playing a camera animation as the slime is respawned.
     * @author Jasper Newkirk
     */
    kill() {
        this.isAlive = false;
        GAME.camera.deathScreen.swapTag("Died");
        const animationTime = 1;
        const deltaX = Math.round((this.spawnX - PARAMS.WIDTH/2 - GAME.camera.x)/animationTime*GAME.clockTick);
        const deltaY = Math.round((this.spawnY - PARAMS.HEIGHT/2 - GAME.camera.y)/animationTime*GAME.clockTick);
        GAME.camera.freeze(animationTime, 
            (ctx, camera) => {
                camera.x += deltaX;
                camera.y += deltaY;
            }, 
            () => {
                GAME.camera.deathScreen.swapTag("Respawn");
                this.momentum = 0;
                this.x = this.spawnX;
                this.y = this.spawnY;
                this.isAlive = true;
            }
        );

    }
    
}

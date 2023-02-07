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
        this.hitbox = new HitBox(x, y, PARAMS.SCALE * 3, PARAMS.SCALE * 5, 10*PARAMS.SCALE, 10*PARAMS.SCALE);

        this.spawnX = this.x;
        this.spawnY = this.y;

        // Movement
        this.maxSpeed = 1.75 * PARAMS.SCALE;
        this.speed = this.maxSpeed;
        this.dashSpeed = 7 * PARAMS.SCALE;
        this.momentum = 0;
        this.maxMom = (this.speed * 0.66).toFixed(2);
        this.acceleration = this.speed / 30;
        this.decceleration = this.speed / 45;
        this.direction = 1;
        this.rise = -1;
        this.MINRISE = -6 * PARAMS.SCALE;
        this.bounce = 3.5 * PARAMS.SCALE;
        this.gravity = 1;
        this.lastX = this.x;
        this.lastY = this.y;

        // Flags
        this.isAlive = true;
        this.isJumping = false;
        this.isAirborne = false;
        this.canJump = true;
        this.canDash = true;

        // Charges
        this.charges = {
            "Electric" : 0,
            "Fire" : 0,
            "Ice" : 0,
            "Earth" : 0
        }

        // Timers
        this.timers = {
            jumpTimer: 0,
            landTimer : 0,
            dashTimer : 0
        }
    };

    update() {
        
        this.moveX();

        this.jump();

        this.dash();

        this.moveY();

        this.hitbox.updatePos(this.x, this.y);

        ///////////////
        // COLLISION //
        ///////////////

        this.hitbox.getCollisions().forEach((entity) => { if (entity.collideWithPlayer) entity.collideWithPlayer(); });

        // Reset momentum on stop
        if (this.x == this.lastX) this.momentum = 0;

        // Reset landTimer while in the air
        if (this.isAirborne) this.timers.landTimer = 0;

        // Reset rise on stop
        if (this.y == this.lastY){
            this.rise = -1;
            this.canJump = GAME.A || this.timers.landTimer < 0.01 ? false : true;
            this.isAirborne = false;
        }

        this.endOfCycleUpdates();

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
            // ctx.fillText("Jump Timer:" + this.timers.jumpTimer.toFixed(2), this.x - GAME.camera.x, this.y - GAME.camera.y - 150);
            ctx.fillText("Dash Timer:" + this.timers.dashTimer.toFixed(2), this.x - GAME.camera.x, this.y - GAME.camera.y + 150);
            ctx.fillText("Charges: " + Object.values(this.charges), this.x - GAME.camera.x, this.y - GAME.camera.y - 100);
            ctx.fillText("Rise:" + this.rise, this.x - GAME.camera.x, this.y - GAME.camera.y - 50);
            ctx.fillText("Momentum:" + this.momentum, this.x - GAME.camera.x, this.y - GAME.camera.y);
        }
    }

    /////////////////////
    /* State Functions */
    /////////////////////

    /**
     * Horizontal Movement - calculates Slime's position with speed and momentum.
     * Depends on speed, momentum, direction and maxMom to calculate new x position.
     * @author Nathan Brown
     */
    moveX() {
        if(GAME.left) {
            if (this.momentum > 0) this.momentum /= 2;
            this.x += (this.speed * -1 + this.momentum) * GAME.tickMod;
            this.tag = "move_left";
            this.direction = -1;
            this.momentum = clamp(
                this.momentum - this.acceleration * GAME.tickMod,
                this.maxMom * -1,
                this.maxMom
            );
        } else if(GAME.right) {
            if (this.momentum < 0) this.momentum /= 2;
            this.x += (this.speed + this.momentum) * GAME.tickMod;
            this.tag = "move";
            this.direction = 1;
            this.momentum = clamp(
                this.momentum + this.acceleration * GAME.tickMod,
                this.maxMom * -1,
                this.maxMom
            );
        } else {
            this.x += this.momentum * GAME.tickMod;
            this.tag = this.direction > 0 ? "idle" : "idle_left";
            this.momentum = this.direction > 0 ?
                clamp(this.momentum - this.decceleration * GAME.tickMod, 0, this.maxMom) :
                clamp(this.momentum + this.decceleration * GAME.tickMod, this.maxMom * -1, 0);
        }
    }

    /**
     * Gets the slime into the air when A is pressed. Hold A for a longer jump. Uses a variety of state 
     * flags to determine when the slime can jump. 
     * @author Nathan Brown
     */
    jump() {
        //this.canJump = true; // Allow Midair for Debugging
        if (!GAME.A) this.isJumping = false;
        if(GAME.A && !(this.isAirborne) && this.canJump){
            this.isJumping = true;
            this.canJump = false;
            this.isAirborne = true;
            this.timers.jumpTimer = 0;
            this.rise = this.bounce + Math.abs(this.momentum / 2);
        }
        if(this.isJumping) {
        } else {
            this.rise = Math.min(this.rise, 1 * PARAMS.SCALE);
        }
    }

    /**
     * Slime dashes forward rapidly. 
     * Plans: 
     *          Kill enemies when colliding with the dashing slime. 
     *          Set momentum to 0. 
     *          Implement line-line checking for right side tile collision.
     * @author Nathan Brown
     */
    dash(){
        if (!this.canDash){
            if (this.timers.dashTimer > 1) {
                this.canDash = true;
            }
            if (this.timers.dashTimer < 0.15) {
                this.x += this.dashSpeed * GAME.tickMod * this.direction;
                this.rise = 0;
                this.speed = 0;
            } else {
                this.speed = this.maxSpeed;
            }
        } else if (GAME.B) {
            this.canDash = false;
            this.timers.dashTimer = 0;
            this.speed = 0;
            this.momentum = this.maxMom * this.direction;
        }
    }

    /**
     * Moves the slime along the y axis by subtracting its rise value from its y 
     * position. Mostly this is caused by gravity and states like jumping that allows 
     * the player to give the slime a positive rise.
     * 
     * @author Nathan Brown
     */
    moveY(){
        this.y -= this.rise * GAME.tickMod;
        if (this.rise < -1.5 * PARAMS.SCALE){
            this.canJump = false;
        }

        // Gravity
        if (this.rise > this.MINRISE){
            let hangtime = this.rise > 0 ? 0.7 : 1;
            this.rise -= this.gravity * GAME.tickMod * hangtime;
        }
    }

    /**
     * Function responsible for killing the current Slime entity and playing a camera animation as the slime is respawned.
     * @author Jasper Newkirk
     */
    kill() {
        this.isAlive = false;
        GAME.camera.deathScreen.swapTag("Died");
        const targetX = this.spawnX - PARAMS.WIDTH/2  + 8*PARAMS.SCALE;
        const targetY = this.spawnY - PARAMS.HEIGHT/2 - 16*PARAMS.SCALE;
        GAME.camera.freeze(1,
            (ctx, camera) => {
                camera.x = Math.round(lerp(camera.x, targetX, GAME.tickMod/30));
                camera.y = Math.round(lerp(camera.y, targetY, GAME.tickMod/30));
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

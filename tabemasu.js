/**
 * Two-legged running enemy that tries to eat Slime.
 * @author Nathan Brown
 */
class Tabemasu extends AnimatedEntity {
    /**
     * Creates a new instance of a tabemasu.
     * @param {number} x The x-coordinate associated with the top-left corner of the sprite on the canvas.
     * @param {number} y The y-coordinate associated with the top-left corner of the sprite on the canvas.
     * @param {boolean} loop Whether the sprite's animation loops over again, after having finished playing once.
     */
    constructor(tag, x, y, loop = true) {
        super("./assets/graphics/characters/tabemasu", tag, x, y, loop);
        Object.assign(this, { tag, x, y, loop });
        this.hitbox = new HitBox(x, y, 3*PARAMS.SCALE, 3*PARAMS.SCALE, 30*PARAMS.SCALE, 30*PARAMS.SCALE);

        //Movement
        this.speed = 1;
        this.momentum = 0;
        this.maxMom = this.speed * 0.4;
        this.acceleration = this.maxMom / 120;
        this.decceleration = this.maxMom / 60;
        this.xDirection = 1;
        this.yVelocity = 0;
        this.maxYVelocity = 6;
        this.trackDistance = 64 * PARAMS.SCALE;
    }

    /**
     * Function called on every clock tick.
     */
    update() {
        if (!this.isInFrame(36*PARAMS.SCALE, 36*PARAMS.SCALE)) return;

        if (Math.abs(this.hitbox.center.x - GAME.slime.hitbox.center.x) < 32 * PARAMS.SCALE && Math.abs(this.hitbox.center.y - GAME.slime.hitbox.center.y) > 64 * PARAMS.SCALE) {
            this.xDirection > 0 ? this.tag = "Idle" : this.tag = "IdleLeft";
            this.moveX(0);
        } else {
            this.moveX(this.speed * this.xDirection, this.acceleration * this.xDirection);
        }
        this.moveY();

        this.hitbox.updatePos(this.x, this.y);
        this.hitbox.getCollisions().forEach((entity) => {
            if (entity.collideWithEntity) entity.collideWithEntity(this);
        });
        this.endOfCycleUpdates();
    }

    /**
     * Draws the currenty entity's {@link AnimatedEntity.tag} animation.
     * @param {CanvasRenderingContext2D} ctx The canvas which the Batterflea will be drawn on
     */
    draw(ctx) {
        super.draw(ctx)
    }

    endOfCycleUpdates(){
        if (this.x == this.lastX) this.momentum = 0; // Reset momentum on stop
        if (this.y == this.lastY) this.yVelocity = 1 / PARAMS.SCALE; // Reset yVelocity on stop
        super.endOfCycleUpdates();
    }

    /**
     * Horizontal Movement - called by update().
     * @author Nathan Brown
     */
    moveX(moveSpeed, moveAcceleration = 0) {

        if (this.hitbox.center.x - GAME.slime.hitbox.center.x > this.trackDistance) {
            this.xDirection = -1;
            this.tag = "RunningLeft";
        } else if (this.hitbox.center.x - GAME.slime.hitbox.center.x < -this.trackDistance) {
            this.xDirection = 1;
            this.tag = "Running";
        }

        this.x += (moveSpeed + this.momentum) * PARAMS.SCALE * GAME.tickMod;
        if (moveSpeed == 0){
            this.momentum = this.xDirection > 0 ?
                clamp(this.momentum - this.decceleration * GAME.tickMod, 0, this.maxMom) :
                clamp(this.momentum + this.decceleration * GAME.tickMod, -this.maxMom, 0);
            return;
        }
        this.momentum = clamp(
            this.momentum + moveAcceleration * GAME.tickMod,
            this.maxMom * -1,
            this.maxMom
        );

    }

    /**
     * Moves the slime along the y axis by adding its yVelocity value to its y 
     * position. Mostly this is caused by gravity and states like jumping that allow 
     * the player to change yVelocity.
     * @author Nathan Brown
     */
    moveY(moveSpeed = this.yVelocity){

        this.y += moveSpeed * PARAMS.SCALE * GAME.tickMod;

        // Gravity
        if (this.yVelocity <= this.maxYVelocity){
            this.yVelocity = moveSpeed + PARAMS.GRAVITY * GAME.tickMod;
        }

    }


    /**
     * Called when this Batterflea collides with the player. Returns Batterlea
     * to spawn and {@link GAME.slime.kill()} the slime
     */
    collideWithPlayer() {
        if (GAME.slime.isAlive) GAME.slime.kill();
    }

    /**
     * Kills this entity
     */
    kill() {
        this.isAlive = false;
    }
}
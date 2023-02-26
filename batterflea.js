/**
 * Class representation of a Batterflea enemy.
 * @author Xavier Hines
 */
class Batterflea extends AnimatedEntity {
    /**
     * Creates a new instance of a charge item.
     * @param {String} tag The type of charge to be placed. One of "Earth", "Fire", "Ice", "Electric", or "Disabled".
     * @param {number} x The x-coordinate associated with the top-left corner of the charge's sprite on the canvas.
     * @param {number} y The y-coordinate associated with the top-left corner of the charge's sprite on the canvas.
     * @param {boolean} loop Whether the charge's animation loops over again, after having finished playing once.
     */
    constructor(tag, x, y, loop = true) {
        super("./assets/graphics/characters/batterflea", tag, x, y, loop);
        Object.assign(this, { tag, x, y, loop });
        this.hitbox = new HitBox(x, y, 0, 0, 8*PARAMS.SCALE, 8*PARAMS.SCALE);

        //Movement
        this.speed = PARAMS.SCALE/1.9;
        this.lastX = x;
        this.lastY = y;
        this.xMove = 0;
        this.direction = 1;
        this.rise = -1;
        this.MINRISE = -6 * PARAMS.SCALE;
        this.bounce = 3.5 * PARAMS.SCALE;
        this.gravity = 1;

        //Flags
        this.isAirborne = false;
        this.canJump = true;

        //Timers
        this.timers = {
            landTimer: 0
        }
    }

    /**
     * Function called on every clock tick.
     */
    update() {
        if (!this.isInFrame()) return;
        this.hop();
        this.moveY();

        this.hitbox.updatePos(this.x, this.y);
        this.hitbox.getCollisions().forEach((entity) => {
            if (entity.collideWithEntity) entity.collideWithEntity(this);
        });

        if (this.y == this.lastY){
            this.rise = -1;
            this.isAirborne = false;
        }
        this.endOfCycleUpdates();
    }


    /**
     * Called when this Batterflea collides with the player. Returns Batterlea
     * to spawn and {@link GAME.slime.kill()} the slime
     */
    collideWithPlayer() {
        if (GAME.slime.isAlive) GAME.slime.kill();
    }

    /**
     * Function called every clock tick that controls how the Batterflea will hop
     */
    hop() {
        //deterines if Batterflea can jump and which direction
        if(this.timers.landTimer > .5) {
            this.canJump = true;
            this.xMove = this.x > GAME.slime.x ? -this.speed: this.speed;
            this.x > GAME.slime.x ? this.tag = "JumpL": this.tag = "JumpR";
        }

        //Moves the batterflea on x-axis
        if(this.isAirborne) {
            this.timers.landTimer = 0;
            this.x += this.xMove * GAME.tickMod;
        }

        const x = this.x - GAME.camera.x;
        const y = this.y - GAME.camera.y;
        //THIS CHECKS IF SOMETHING IS IN THE VIEW OF THE CAMERA
        if ((x > -8*PARAMS.SCALE && x < PARAMS.WIDTH && y > -8*PARAMS.SCALE && y < PARAMS.HEIGHT)&& this.canJump) {
            this.canJump = false;
            this.timers.landTimer = 0;
            this.rise = this.bounce +  1 * this.direction;
            this.isAirborne = true;
        }

    }

    /**
     * Controls the Batterflea's movement on the y-axis.
     */
    moveY() {
        // Rise
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
     * Kills this entity
     */
    kill() {
        this.isAlive = false;
    }

    /**
     * Draws the currenty entity's {@link AnimatedEntity.tag} animation. 
     * @param {CanvasRenderingContext2D} ctx The canvas which the Batterflea will be drawn on
     */
    draw(ctx) {
        super.draw(ctx)
    }
}
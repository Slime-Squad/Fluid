/**
 * Class that will handle projectiles.
 * @author Xavier Hines
 */
class Projectile extends AnimatedEntity {
    /**
     * Creates a new instance of a charge item.
     * @param {String} tag The type of charge to be placed. One of "Earth", "Fire", "Ice", "Electric", or "Disabled".
     * @param {number} x The x-coordinate associated with the top-left corner of the charge's sprite on the canvas.
     * @param {number} y The y-coordinate associated with the top-left corner of the charge's sprite on the canvas.
     * @param {boolean} loop Whether the charge's animation loops over again, after having finished playing once.
     */
    constructor(tag, x, y, loop = true) {
        super("./assets/graphics/characters/projectile", tag, x, y, loop);
        Object.assign(this, {tag, x, y, loop});
        this.hitbox = new HitBox(x, y, 0, 0, 8*PARAMS.SCALE, 8*PARAMS.SCALE);

        //Movement
        this.speed = PARAMS.SCALE;
        this.direction = 1

        //Timers
        this.timers = {
            duration: 0
        }
    }

    /**
     * Function called on every clock tick.
     */
    update() {
        this.hitbox.updatePos(this.x, this.y);
        this.hitbox.getCollisions().forEach((entity) => {
            if (entity.collideWithEntity) entity.collideWithEntity(this);
        });
        if(this.x == this.lastX) {
            this.reset();
        }
        this.endOfCycleUpdates();
    }

    /**
     * Changes the animations and is responsible for moving the projectile.
     */
    shoot() {
        this.tag = "Fireball";
        if(this.timers.duration > 3) {
            this.reset();
        }
        
        this.x += this.speed * this.direction * GAME.tickMod;
    }

    /**
     * Resets the the projectiles properties
     */
    reset() {
        this.respawn();
        this.tag = "Invisible";
        this.timers.duration = 0;
        this.direction = this.x > GAME.slime.x ? -1: 1;
    }

    /**
     * Called when this Skiwi collides with the player. Returns Batterlea
     * to spawn and {@link GAME.slime.kill()} the slime
     */
    collideWithPlayer() {
        GAME.slime.kill();
        this.reset();
    }

    /**
     * Draws the currenty entity's {@link AnimatedEntity.tag} animation. 
     * @param {CanvasRenderingContext2D} ctx The canvas which the Batterflea will be drawn on
     */
    draw(ctx) {
        super.draw(ctx);
    }
}
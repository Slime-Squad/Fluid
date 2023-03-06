/**
 * Class representation of a Magmasquito item.
 * @author Xavier Hines
 */
class Magmasquito extends AnimatedEntity {
    /**
     * Creates a new instance of a charge item.
     * @param {String} tag The type of charge to be placed. One of "Earth", "Fire", "Ice", "Electric", or "Disabled".
     * @param {number} x The x-coordinate associated with the top-left corner of the charge's sprite on the canvas.
     * @param {number} y The y-coordinate associated with the top-left corner of the charge's sprite on the canvas.
     * @param {boolean} loop Whether the charge's animation loops over again, after having finished playing once.
     */
    constructor(tag, x, y, loop = true) {
        super("./assets/graphics/characters/magmasquito", tag, x, y, loop);
        Object.assign(this, { tag, x, y, loop });
        this.hitbox = new HitBox(x, y, 0, 0, 20*PARAMS.SCALE, 20*PARAMS.SCALE);
        this.projectile = new Projectile("Invisible", x, y);
        this.speed = PARAMS.SCALE;
        this.shootTimer = 2;
        this.shootTimeout = 3;
    }

    /**
     * Function called on every clock tick.
     */
    update() {
        if (!this.isInFrame(16*PARAMS.SCALE, 16*PARAMS.SCALE)) return;
        if (GAME.slime.hitbox.center.x > this.hitbox.center.x){
            this.tag = "SuckR";
            this.direction = 1;
        } else {
            this.tag = "SuckL";
            this.direction = -1;
        }
        this.shoot();
        this.shootTimer += GAME.clockTick;
    }

    /**
     * Called when this Skiwi collides with the player. Returns Batterlea
     * to spawn and {@link GAME.slime.kill()} the slime
     */
    collideWithPlayer() {
        if (GAME.slime.isAlive) GAME.slime.kill();
    }

    /**
     * This makes a call to the shoot function.
     */
    shoot() {
        if (this.shootTimer > this.shootTimeout){
            this.shootTimer = 0;
            this.projectile.shoot(this.direction);
        }
    }

    /**
     * Draws the currenty entity's {@link AnimatedEntity.tag} animation. 
     * @param {CanvasRenderingContext2D} ctx The canvas which the Batterflea will be drawn on
     */
    draw(ctx) {
        if (this.isInFrame(16*PARAMS.SCALE, 16*PARAMS.SCALE)) super.draw(ctx);
    }
}
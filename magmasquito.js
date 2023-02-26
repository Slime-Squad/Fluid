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
     * @param {Projectile} proj The projectile that this Magmasquito owns.
     * @param {boolean} loop Whether the charge's animation loops over again, after having finished playing once.
     */
    constructor(tag, x, y, proj, loop = true) {
        super("./assets/graphics/characters/magmasquito", tag, x, y, loop);
        Object.assign(this, { tag, x, y, proj, loop });
        this.hitbox = new HitBox(x, y, 0, 0, 20*PARAMS.SCALE, 20*PARAMS.SCALE);

        this.speed = PARAMS.SCALE;
        this.directionTimer = 0;
    }

    /**
     * Function called on every clock tick.
     */
    update() {
        if (!this.isInFrame(16*PARAMS.SCALE, 16*PARAMS.SCALE)) return;
        this.shoot();
        this.hitbox.updatePos(this.x, this.y);
        this.hitbox.getCollisions().forEach((entity) => {
            if (entity.collideWithEntity) entity.collideWithEntity(this);
        });

        this.endOfCycleUpdates();
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
        this.proj.shoot();
    }

    /**
     * Draws the currenty entity's {@link AnimatedEntity.tag} animation. 
     * @param {CanvasRenderingContext2D} ctx The canvas which the Batterflea will be drawn on
     */
    draw(ctx) {
        if (this.isInFrame(16*PARAMS.SCALE, 16*PARAMS.SCALE)) super.draw(ctx);
    }
}
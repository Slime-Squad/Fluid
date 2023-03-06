/**
 * Class representation of a Skiwi enemy.
 * @author Xavier Hines
 */
class Skiwi extends AnimatedEntity {
    /**
     * Creates a new instance of a charge item.
     * @param {String} tag The type of charge to be placed. One of "Earth", "Fire", "Ice", "Electric", or "Disabled".
     * @param {number} x The x-coordinate associated with the top-left corner of the charge's sprite on the canvas.
     * @param {number} y The y-coordinate associated with the top-left corner of the charge's sprite on the canvas.
     * @param {boolean} loop Whether the charge's animation loops over again, after having finished playing once.
     */
    constructor(tag, x, y, loop = true) {
        super("./assets/graphics/characters/skiwi", tag, x, y, loop);
        Object.assign(this, { tag, x, y, loop });
        this.hitbox = new HitBox(x, y, 1*PARAMS.SCALE, 2*PARAMS.SCALE, 14*PARAMS.SCALE, 20*PARAMS.SCALE);

        //Movement
        this.direction = 1;
        this.speed = PARAMS.SCALE;
        this.lastX = x;
        this.lastY = y;
    }

    /**
     * Function called on every clock tick.
     */
    update() {
        if (!this.isInFrame()) return;
        this.ski();
        this.hitbox.updatePos(this.x, this.y);
        // this.hitbox.getCollisions().forEach((entity) => {
        //     if (entity.collideWithEntity) entity.collideWithEntity(this);
        // });

        if (this.hitbox.getCollisions().length > 1) this.x = this.lastX;

        if(this.x == this.lastX) {
           this.direction = this.direction * -1;
        }

        this.endOfCycleUpdates();
    }

    /**
     * Moves the skiwi in the same direction on the X-axis until it hits a wall
     * then it will change direction.
     */
    ski() {
        this.direction > 0 ? this.tag = "WalkR" : this.tag = "WalkL";
        this.x += this.speed * this.direction * GAME.tickMod;
    }

    /**
     * Called when this Skiwi collides with the player. Returns Batterlea
     * to spawn and {@link GAME.slime.kill()} the slime
     */
    collideWithPlayer() {
        if (GAME.slime.isAlive) GAME.slime.kill();
    }

    draw(ctx) {
        super.draw(ctx)
    }
}
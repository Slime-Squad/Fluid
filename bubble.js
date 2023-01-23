/**
 * Class representation of a charge item.
 * @author Xavier Hines
 */
class Bubble extends AnimatedEntity {
    /**
     * Creates a new instance of a charge item.
     * @param {String} tag The type of charge to be placed. One of "Earth", "Fire", "Ice", "Electric", or "Disabled".
     * @param {number} x The x-coordinate associated with the top-left corner of the charge's sprite on the canvas.
     * @param {number} y The y-coordinate associated with the top-left corner of the charge's sprite on the canvas.
     * @param {boolean} loop Whether the charge's animation loops over again, after having finished playing once.
     */
    constructor(tag, x, y, loop = true) {
        super("./assets/graphics/characters/bubble", tag, x, y, loop);
        Object.assign(this, { tag, x, y, loop });
        this.hitbox = new HitBox(x, y, 24*PARAMS.SCALE, 24*PARAMS.SCALE);
        this.originalTag = tag;
        this.elapsedTime = 0;
    }

    /**
     * Function called on every clock tick.
     */
    update() {
    }

    draw(ctx) {
        super.draw(ctx)
    }
}
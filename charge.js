/**
 * Class representation of a charge item.
 * @author Jasper Newkirk
 */
class Charge extends AnimatedEntity {
    /**
     * Creates a new instance of a charge item.
     * @param {String} tag The type of charge to be placed. One of "Earth", "Fire", "Ice", "Electric", or "Disabled".
     * @param {number} x The x-coordinate associated with the top-left corner of the charge's sprite in the current {@link GameEngine.ctx} context.
     * @param {number} y The y-coordinate associated with the top-left corner of the charge's sprite in the current {@link GameEngine.ctx} context.
     * @param {boolean} loop Whether the charge's animation loops over again, after having finished playing once.
     */
    constructor(tag, x, y, loop = true) {
        super("./assets/graphics/item/charge", tag, x, y, loop);
        Object.assign(this, { tag, x, y, loop });
        this.hitbox = new HitBox(x, y, 8*PARAMS.SCALE, 8*PARAMS.SCALE);
        this.originalTag = tag;
        this.elapsedTime = 0;
    }

    update() {
        if (this.originalTag == "Disabled") return;
        if (this.tag == "Disabled") {
            this.elapsedTime += PARAMS.GAME.clockTick;
        }

        if (this.elapsedTime >= 5) {
            this.tag = this.originalTag;
            this.elapsedTime = 0;
        }
    }
}
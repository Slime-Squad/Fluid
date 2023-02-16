/**
 * Class representation of a charge item.
 * @author Jasper Newkirk
 */
class Charge extends AnimatedEntity {
    /**
     * Creates a new instance of a charge item.
     * @param {String} tag The type of charge to be placed. One of "Earth", "Fire", "Ice", "Electric", or "Disabled".
     * @param {number} x The x-coordinate associated with the top-left corner of the charge's sprite on the canvas.
     * @param {number} y The y-coordinate associated with the top-left corner of the charge's sprite on the canvas.
     * @param {boolean} loop Whether the charge's animation loops over again, after having finished playing once.
     */
    constructor(tag, x, y, loop = true) {
        super("./assets/graphics/item/charge", tag, x, y, loop);
        Object.assign(this, { tag, x, y, loop });
        this.hitbox = new HitBox(x, y, 0, 0, 8*PARAMS.SCALE, 8*PARAMS.SCALE);
        this.originalTag = tag;
        this.elapsedTime = 0;
    }

    /**
     * Function called on every clock tick.
     */
    update() {
        if (this.originalTag == "Disabled") return;
        if (this.tag == "Disabled") {
            this.elapsedTime += GAME.clockTick;
        }

        if (this.elapsedTime >= 5) {
            this.tag = this.originalTag;
            this.elapsedTime = 0;
        }
    }

    /**
     * Response to colliding with player.
     */
    collideWithPlayer(){
        if (this.tag != "Disabled") { // charge collected
            GAME.slime.charges[this.tag] = Math.min(GAME.slime.charges[this.tag] + 1, 1);
            this.tag = "Disabled";
        }
    }
}
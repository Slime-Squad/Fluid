/**
 * Class representation of a checkpoint, which updates the player's spawn coordinates.
 * @author Jasper Newkirk
 */
class Checkpoint extends AnimatedEntity {
    /**
     * Constructs a new checkpoint, responsible for updating the player's spawn coordinates.
     * @param {string} tag The type of animation to be played. One of "Idle", or "Collected".
     * @param {*} x The x-coordinate associated with the top-left corner of the checkpoint's sprite on the canvas.
     * @param {*} y The y-coordinate associated with the top-left corner of the checkpoint's sprite on the canvas.
     * @param {*} loop Whether the checkpoint's animation loops over again, after having finished playing once.
     */
    constructor(tag, x, y, loop = true) {
        super("./assets/graphics/item/checkpoint", tag, x, y, loop);
        Object.assign(this, { tag, x, y, loop });
        this.width = 16*PARAMS.SCALE;
        this.height = 16*PARAMS.SCALE;
        this.hitbox = new HitBox(this.x, this.y, this.width, this.height);
    }
}
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
        this.hitbox = new HitBox(this.x, this.y, 0, 0, this.width, this.height);
    }

    /**
     * Response to colliding with player.
     */
    collideWithPlayer(){
        if (this.tag == "Idle") {
            ASSET_MANAGER.playAudio("./assets/audio/effect/checkpoint" + Math.floor(Math.random()*4) + ".wav");
            this.swapTag("Collected");
            this.hitbox = undefined;
            GAME.slime.spawnX = this.x;
            GAME.slime.spawnY = this.y;
        }
        GAME.entities.forEach(entity =>{
            if (this === entity) return;
            if (entity.constructor.name != "Checkpoint") return;
            if (entity.tag == "Collected") {
                entity.swapTag("Idle", true);
                entity.hitbox = new HitBox(entity.x, entity.y, 0, 0, entity.width, entity.height)
            }
        });
    }

    draw(ctx) {
        if (this.isInFrame() || this.tag == "Collected" && !this.frames.isFrozen) super.draw(ctx);
    }

}
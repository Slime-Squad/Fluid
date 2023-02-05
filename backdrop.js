/**
 * Class representation of the backdrop displayed in the absolute background of the game.
 * @author Jasper Newkirk
 */
class BackDrop extends AnimatedEntity {
    /**
     * Constructs a new entity responsible for the backdrop displayed in the background.
     * @param {string} tag The type of animation to be played. One of "dirt", "cave", "ice", or "lava".
     */
    constructor(tag) {
        super("./assets/graphics/camera/backdrop", tag, 0, 0, false);
        this.tag = tag;
        this.w = this.frames.animations[tag][0].w;
        this.h = this.frames.animations[tag][0].h;
    }
    /**
     * Function called every clock tick.
     */
    update() {
        this.x = GAME.camera.x - PARAMS.SCALE*this.w/2 - GAME.slime.x/18*PARAMS.SCALE;
        this.y = GAME.camera.y - PARAMS.SCALE*this.h/2 - GAME.slime.y/32*PARAMS.SCALE;
    }
}

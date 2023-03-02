/**
 * Class representation of the backdrop displayed in the absolute background of the game.
 * @author Jasper Newkirk
 */
class Backdrop extends AnimatedEntity {
    /**
     * Constructs a new entity responsible for the backdrop displayed in the background.
     * @param {string} tag The type of animation to be played. One of "stone", "dirt", "fire", or "ice".
     */
    constructor(tag="default") {
        super("./assets/graphics/camera/backdrop", tag, 0, 0, false);
        this.tag = tag;
        this.w = this.frames.animations[tag][0].w;
        this.h = this.frames.animations[tag][0].h;
        this.xOffset = 0;
        this.yOffset = 0;
    }

    /**
     * Function called every clock tick.
     */
    update() {

    }

    /**
     * Draws the backdrop on the given canvas. Called on every clock tick.
     * @param {CanvasRenderingContext2D} ctx The canvas to be displayed upon.
     */
    draw(ctx) {
        this.x = this.xOffset + GAME.camera.x - PARAMS.SCALE*this.w/2 - GAME.slime.x/(PARAMS.SCALE*2);
        this.y = this.yOffset + GAME.camera.y - PARAMS.SCALE*this.h/2 - GAME.slime.y/(PARAMS.SCALE*2);
        super.draw(ctx);
    }
}

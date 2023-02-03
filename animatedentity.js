/**
 * Class to extend for the creation of an Animated Entity.
 * @author Jasper Newkirk, Nathan Brown
 */
class AnimatedEntity {
    /**
     * Creates a new instance of an animated entity.
     * @param {String} path The relative path to the entity. Where the image and json files for this object are located, including the name without a file extension.
     * @param {String} tag The name of the current animation of the entity. 
     * @param {number} x The x-coordinate associated with the top-left corner of the entity's sprite on the canvas.
     * @param {number} y The y-coordinate associated with the top-left corner of the entity's sprite on the canvas.
     * @param {boolean} loop Whether the entity's animation loops over again, after having finished playing once.
     */
    constructor(path, tag, x, y, loop) {
        Object.assign(this, { path, tag, x, y, loop });
        this.spritesheet = ASSET_MANAGER.getAsset(this.path + ".png");
        this.frames = ASSET_MANAGER.getAsset(this.path + ".json");
        this.frameTimer = {frameIndex:0, elapsedTime:0}; // handles frame timing
    }
    /**
     * Draws the current entity's {@link AnimatedEntity.tag} animation. Called on every clock tick.
     * @param {CanvasRenderingContext2D} ctx The canvas to which the animation will be displayed upon.
     */
    draw(ctx) {
        this.frames.animateTag(ctx, this.x - GAME.camera.x, this.y - GAME.camera.y, this.frameTimer, this.spritesheet, this.tag, this.loop);
        if (this.hitbox && PARAMS.DEBUG) {
            ctx.strokeStyle = "red";
            ctx.beginPath();
            ctx.rect(this.hitbox.left - GAME.camera.x, this.hitbox.top - GAME.camera.y, this.hitbox.width, this.hitbox.height);   
            ctx.stroke();
            ctx.font = "12px segoe ui";
            ctx.fillStyle = "white";
            ctx.fillText(this.constructor.name.toUpperCase() + ": x=" + this.x + " y=" + this.y, this.hitbox.left - GAME.camera.x, this.hitbox.bottom - GAME.camera.y + 4*PARAMS.SCALE);
        }
    }

    /**
     * Function called on every clock tick.
     */
    update() {
        
    }

    /**
     * Swaps the current entity's animation for another, starting from the first frame.
     * @param {string} tag The name of the new animation of the entity.
     * @param {boolean} loop Whether the entity's new animation loops over again, after having finished playing once.
     */
    swapTag(tag, loop = false) {
        this.tag = tag;
        this.loop = loop;
        this.frameTimer.frameIndex = 0;
        this.frameTimer.elapsedTime = 0;
    }
}
/**
 * Class to extend for the creation of an Animated Entity.
 * @author Jasper Newkirk
 */
class AnimatedEntity {
    /**
     * Creates a new instance of an animated entity.
     * @param {GameEngine} game The {@link GameEngine} instance to be associated with this entity.
     * @param {String} path The relative path to the entity. Where the image and json files for this object are located, including the name without a file extension.
     * @param {String} tag The name of the current animation of the entity. 
     * @param {number} x The x-coordinate associated with the top-left corner of the entity's sprite in the current {@link GameEngine.ctx} context.
     * @param {number} y The y-coordinate associated with the top-left corner of the entity's sprite in the current {@link GameEngine.ctx} context.
     * @param {boolean} loop Whether the entity's animation loops over again, after having finished playing once.
     */
    constructor(game, path, tag, x, y, loop) {
        Object.assign(this, { game, path, tag, x, y, loop });
        this.spritesheet = ASSET_MANAGER.getAsset(this.path + ".png");
        this.frames = ASSET_MANAGER.getAsset(this.path + ".json");
        this.timer = {frameIndex:0, elapsedTime:0}; // handles frame timing
    }
    /**
     * Draws the current entity's {@link AnimatedEntity.tag} animation. Called on every {@link AnimatedEntity.game.clockTick}.
     * @param {CanvasRenderingContext2D} ctx The canvas to which the animation will be displayed upon.
     */
    draw(ctx) {
        this.frames.animateTag(this.game, ctx, this.x, this.y, this.timer, this.spritesheet, this.tag, this.loop);
        if (this.hitbox && PARAMS.DEBUG) {
            ctx.strokeStyle = "red";
            ctx.beginPath();
            ctx.rect(this.hitbox.left, this.hitbox.top, this.hitbox.width, this.hitbox.height);   
            ctx.stroke();
        }
    }

    /**
     * Function called on every {@link AnimatedEntity.game.clockTick}.
     */
    update() {
        
    }
}
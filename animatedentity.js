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
     * @param {number} width The width of the entity's sprite in the current {@link GameEngine.ctx} context.
     * @param {number} height The height of the entity's sprite in the current {@link GameEngine.ctx} context.
     * @param {boolean} loop Whether the entity's animation loops over again, after having finished playing once.
     */
    constructor(game, path, tag, x, y, width, height, loop) {
        Object.assign(this, { game, path, tag, x, y, width, height, loop });
        this.spritesheet = ASSET_MANAGER.getAsset(this.path + ".png");
        this.frames = ASSET_MANAGER.getAsset(this.path + ".json");
        this.hitBox = new HitBox(this.x, this.y, this.width, this.height);
        /**
         * Class to handle frame timing for the current {@link AnimatedEntity}.
         * @author Jasper Newkirk
         * @param {number} frameIndex The index associated with the current frame being displayed on the entity's {@link GameEngine.ctx} context.
         * @param {number} elapsedTime The time elapsed since the frame began being displayed.
         */
        const Timer = class Timer {
            constructor(frameIndex = 0, elapsedTime = 0) {
                Object.assign(this, { frameIndex, elapsedTime });
            }
        }
        this.timer = new Timer();
    }
    /**
     * Draws the current entity's {@link AnimatedEntity.tag} animation. Called on every {@link AnimatedEntity.game.clockTick}.
     * @param {CanvasRenderingContext2D} ctx The canvas to which the animation will be displayed upon.
     */
    draw(ctx) {
        this.frames.animateTag(this.game, ctx, this.x, this.y, this.timer, this.spritesheet, this.tag, this.loop);
    }

    /**
     * Function called on every {@link AnimatedEntity.game.clockTick}.
     */
    update() {
        
    }
}
/**
 * Class that will handle projectiles.
 * @author Nathan Brown
 */
class Ornament extends AnimatedEntity {
    constructor(namespace, tag, x, y, loop = true) {
        super(namespace, tag, x, y, loop);
        Object.assign(this, {tag, x, y, loop});
    }

    /**
     * Draws the currenty entity's {@link AnimatedEntity.tag} animation. 
     * @param {CanvasRenderingContext2D} ctx The canvas which the Batterflea will be drawn on
     */
    draw(ctx) {
        if (this.isInFrame()) super.draw(ctx);
    }
}
/**
 * Class that will handle entity's auxillary graphics.
 * @author Nathan Brown
 */
class Ornament extends AnimatedEntity {
    constructor(namespace, tag, x, y, loop = true) {
        super(namespace, tag, x, y, loop);
        Object.assign(this, {tag, x, y, loop});
        this.originalTag = tag;
    }

    update(){}

    /**
     * Draws the currenty entity's {@link AnimatedEntity.tag} animation. 
     * @param {CanvasRenderingContext2D} ctx The canvas which the Batterflea will be drawn on
     */
    draw(ctx) {
        if (this.isInFrame()) super.draw(ctx);
    }
}
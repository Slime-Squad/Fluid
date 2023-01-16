/**
 * Class to create a hitbox around an entity to handle collisions.
 * @author Jasper Newkirk, Chris Marriott
 */
class HitBox {
    /**
     * Constructs a new hitbox to handle entity collision.
     * @param {number} x The x-coordinate associated with the top-left corner of the hitbox as it will be interpretted in a {@link GameEngine.ctx} context.
     * @param {*} y The y-coordinate associated with the top-left corner of the hitbox as it will be interpretted in a {@link GameEngine.ctx} context.
     * @param {*} width The width of the hitbox as it will be interpretted in a {@link GameEngine.ctx} context.
     * @param {*} height The height of the hitbox as it will be interpretted in a {@link GameEngine.ctx} context.
     */
    constructor(x, y, width, height) {
        Object.assign(this, { x, y, width, height });
        this.left = x;
        this.top = y;
        this.right = this.left + this.width;
        this.bottom = this.top + this.height;
    }

    /**
     * Returns whether the current hitbox and the given hitbox exist within the same space as one another.
     * @param {HitBox} o The other hitbox.
     * @returns Whether the current hitbox and the given hitbox exist within the same space as one another.
     */
    collide(o) {
        if (this.right > o.left && this.left < o.right && this.top < o.bottom && this.bottom > o.top) return true;
        return false;
    }

    /**
     * Updates the current hitbox's position to reflect the given x and y coordinates.
     * @param {number} x The x-coordinate associated with the top-left corner of the hitbox as it will be interpretted in a {@link GameEngine.ctx} context.
     * @param {number} y The y-coordinate associated with the top-left corner of the hitbox as it will be interpretted in a {@link GameEngine.ctx} context.
     */
    updatePos(x, y) {
        this.left = x;
        this.top = y;
        this.right = this.left + this.width;
        this.bottom = this.top + this.height;
    }
    
}
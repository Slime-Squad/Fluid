/**
 * Class to create a hitbox around an entity to handle collisions.
 * @author Jasper Newkirk, Chris Marriott
 */
class HitBox {
    /**
     * Constructs a new hitbox to handle entity collision.
     * @param {number} x The x-coordinate associated with the top-left corner of the hitbox on the canvas.
     * @param {number} y The y-coordinate associated with the top-left corner of the hitbox  on the canvas.
     * @param {number} width The width of the hitbox on the canvas.
     * @param {number} height The height of the hitbox on the canvas.
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
    // collide(o) {
    //     if (this.right > o.left && this.left < o.right && this.top < o.bottom && this.bottom > o.top) return true;
    //     return false;
    // }

    collide(o) {
        if (this.right > o.left && this.left < o.right && this.top < o.bottom && this.bottom > o.top){
            this.direction = 'bottom';
            this.leftIntersect = o.right - this.left;
            this.rightIntersect = o.left - this.right;
            this.topIntersect = o.bottom - this.top;
            this.bottomIntersect = o.top - this.bottom;
            if (this.left < o.left){
                if (Math.abs(this.rightIntersect) < Math.abs(this.topIntersect) && Math.abs(this.rightIntersect) < Math.abs(this.bottomIntersect)){
                    this.direction = 'right';
                } else if (this.bottom > o.bottom){
                    this.direction = 'top';
                }
            } else if (this.right > o.right){
                if (Math.abs(this.leftIntersect) < Math.abs(this.topIntersect) && Math.abs(this.leftIntersect) < Math.abs(this.bottomIntersect)){
                    this.direction = 'left';
                } else if (this.bottom > o.bottom){
                    this.direction = 'top';
                }
            } else if (this.bottom > o.bottom){
                this.direction = 'top';
            }
            // console.log(this.direction);
            return this;
        }
        return false;
    }

    /**
     * Updates the current hitbox's position to reflect the given x and y coordinates.
     * @param {number} x The x-coordinate associated with the top-left corner of the hitbox on the canvas.
     * @param {number} y The y-coordinate associated with the top-left corner of the hitbox on the canvas.
     */
    updatePos(x, y) {
        this.left = x;
        this.top = y;
        this.right = this.left + this.width;
        this.bottom = this.top + this.height;
    }
    
}
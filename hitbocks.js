/**
 * Class to create a hitbox around an entity to handle collisions.
 * @author Jasper Newkirk, Nathan Brown, Chris Marriott
 */
class HitBox {
    /**
     * Constructs a new hitbox to handle entity collision.
     * @param {number} x The x-coordinate associated with the top-left corner of the hitbox on the canvas.
     * @param {number} y The y-coordinate associated with the top-left corner of the hitbox  on the canvas.
     * @param {number} leftPad The padding between the left of the sprite and the left of its hitbox.
     * @param {number} topPad The padding between the top of the sprite and the top of its hitbox.
     * @param {number} width The width of the hitbox on the canvas.
     * @param {number} height The height of the hitbox on the canvas.
     */
    constructor(x, y, leftPad, topPad, width, height) {
        Object.assign(this, { x, y, leftPad, topPad, width, height });
        this.left = x + leftPad;
        this.top = y + topPad;
        this.center = { x: x + width / 2, y: y + height / 2 };
        this.right = this.left + this.width;
        this.bottom = this.top + this.height;
    }

    /**
     * Retrieve a list of valid collisions between this hitbox and all other entities.
     * @returns list of entities collided.
     */
    getCollisions(){
        // const collisions = [];
        // collisions.push(GAME.slime);
        // const world = ASSET_MANAGER.getAsset("./assets/world/world/world.world");
        // Object.values(world.rooms).forEach((room) => {
        //     //console.log(room.x, room.y);
        //     if (GAME.camera.x - 10*PARAMS.WIDTH < room.x && GAME.camera.x + 10*PARAMS.WIDTH > room.x && GAME.camera.y - 10*PARAMS.HEIGHT < room.y && GAME.camera.y + 10*PARAMS.HEIGHT > room.y) {
        //         room.entities.forEach(entity => {
        //             if (!entity.hitbox || !entity.isAlive) return;
        //             // if (entity.hitbox instanceof this.constructor) return;
        //             if (!this.collide3(entity.hitbox)) return;
        //             collisions.push(entity);
        //         });
        //     }
        // });
        // GAME.entities.forEach(entity => {
        //     if (!entity.hitbox || !entity.isAlive) return;
        //     // if (entity.hitbox instanceof this.constructor) return;
        //     if (!this.collide(entity.hitbox)) return;
        //     collisions.push(entity);
        // });
        return GAME.collidableEntities.filter((entity) => entity.hitbox && entity.isAlive && this.collide(entity.hitbox));
    }

    /**
     * Returns whether the current hitbox and the given hitbox exist within the same space as one another.
     * @param {HitBox} o The other hitbox.
     * @returns Whether the current hitbox and the given hitbox exist within the same space as one another.
     */
    collide(o) {
        // if (o.left > this.left + this.width || this.left > o.left + o.width || o.top > this.top + this.height || this.top > o.top + o.height){
        //     return false;
        // } else {
        //     return true;
        // }
        return !(o.left > this.left + this.width || this.left > o.left + o.width || o.top > this.top + this.height || this.top > o.top + o.height);
    }

    /**
     * Uses a vector to return the side this hitbox colliding with the other hitbox. Intended for use with square / square collisions.
     * @param {*} o the other hitbox this is colliding with
     * @returns String direction
     */
    getCollisionDirection(o){
        let direction = 'bottom';
        this.leftIntersect = o.right - this.left;
        this.rightIntersect = o.left - this.right;
        this.topIntersect = o.bottom - this.top;
        this.bottomIntersect = o.top - this.bottom;
        if (this.left < o.left){
            if (Math.abs(this.rightIntersect) < Math.abs(this.topIntersect) && Math.abs(this.rightIntersect) < Math.abs(this.bottomIntersect)){
                direction = 'right';
            } else if (this.bottom > o.bottom){
                direction = 'top';
            }
        } else if (this.right > o.right){
            if (Math.abs(this.leftIntersect) < Math.abs(this.topIntersect) && Math.abs(this.leftIntersect) < Math.abs(this.bottomIntersect)){
                direction = 'left';
            } else if (this.bottom > o.bottom){
                direction = 'top';
            }
        } else if (this.bottom > o.bottom){
            direction = 'top';
        }
        return direction;
    }

    /**
     * Updates the current hitbox's position to reflect the given x and y coordinates.
     * @param {number} x The x-coordinate associated with the top-left corner of the hitbox on the canvas.
     * @param {number} y The y-coordinate associated with the top-left corner of the hitbox on the canvas.
     */
    updatePos(x, y) {
        this.left = x + this.leftPad;
        this.top = y + this.topPad;
        this.center = {x: x + this.width / 2, y: y + this.height / 2};
        this.right = this.left + this.width;
        this.bottom = this.top + this.height;
    }
    
}
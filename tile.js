const ENTITY_DIRECTIONS_STRINGS = {
    0 : "bottom",
    1 : "left",
    2 : "top",
    3 : "right"
}
const ENTITY_DIRECTIONS_IDS = {
    "bottom" : 0,
    "left" : 1,
    "top" : 2,
    "right" : 3
}

/**
 * Class representation of a map tile within a {@link Room}.
 * @author Jasper Newkirk, Nathan Brown
 */
class Tile {
    /**
     * Constructs a new tile instance.
     * @param {HTMLImageElement} img The image the tile exists within.
     * @param {number} x The x-coordinate associated with the top-left corner of the tile's sprite on the canvas.
     * @param {number} y The y-coordinate associated with the top-left corner of the tile's sprite on the canvas.
     * @param {number} imgX The x-coordinate associated with the top-left corner of the tile's sprite on the given image.
     * @param {number} imgY The y-coordinate associated with the top-left corner of the tile's sprite on the given image.
     * @param {number} w The width of the tile's sprite on the given image. (default 8)
     * @param {number} h The height of the tile's sprite on the given image. (default 8)
     * @param {boolean} collidableDirections Directions with air adjacent to tile. (default [])
     */
    constructor(img, x, y, imgX, imgY, w=8, h=8, collidableDirections=[]) {
        Object.assign(this, { img, x, y, imgX, imgY, w, h, collidableDirections });
        if (this.collidableDirections.length > 0) this.hitbox = new HitBox(this.x, this.y, 0, 0, this.w*PARAMS.SCALE, this.h*PARAMS.SCALE);
    }

    /**
     * Draws the tile on the given canvas. Called on every clock tick.
     * @param {CanvasRenderingContext2D} ctx The canvas to be displayed upon.
     */
    draw(ctx) { 
        if (this.isInFrame()) {
            ctx.drawImage(this.img, this.imgX, this.imgY, this.w, this.h, this.x - GAME.camera.x, this.y - GAME.camera.y, this.w*PARAMS.SCALE, this.h*PARAMS.SCALE);
            if (this.collidableDirections.length > 0 && PARAMS.DEBUG) {
                ctx.strokeStyle = "red";
                ctx.beginPath();
                ctx.rect(this.hitbox.left - GAME.camera.x, this.hitbox.top - GAME.camera.y, this.hitbox.width, this.hitbox.height);   
                ctx.stroke();
            }
        }
    }

    /**
     * Function called on every clock tick.
     */
    update() {
    }

    isInFrame(){
        const x = this.x - GAME.camera.x;
        const y = this.y - GAME.camera.y;
        return x > -this.w*PARAMS.SCALE && x < PARAMS.WIDTH && y > -this.h*PARAMS.SCALE && y < PARAMS.HEIGHT;
    }

    /**
     * Function responsible for handling the collision behavior of the tile (this) and player
     * @returns Entity
     */
    collideWithPlayer() {
        return this.collideWithEntity(GAME.slime);
    }

    /**
     * Function responsible for handling the collision behavior of the tile (this) and another entity.
     * @param {AnimatedEntity} entity - the entity colliding with the tile (this)
     */
    collideWithEntity(entity) {
        if (entity instanceof Projectile) entity.reset();
        // if (!this.isInFrame()) return;
        const directionOfEntity = this.collidableDirections.length == 1 ? 
            ENTITY_DIRECTIONS_STRINGS[this.collidableDirections[0]] :
            entity.hitbox.getCollisionDirection(this.hitbox);

        // let directionOfEntity = entity.hitbox.getCollisionDirection(this.hitbox);
            
        // if (!directionOfEntity || !this.collidableDirections.includes(ENTITY_DIRECTIONS_IDS[directionOfEntity])){
        //     directionOfEntity = ENTITY_DIRECTIONS_STRINGS[this.collidableDirections[0]];
        // }
        

        // Adjust entity x and y value
        switch(directionOfEntity) {
            case "left":
                entity.x = Math.max(this.hitbox.right - entity.hitbox.leftPad + 1, entity.x);
                break;
            case "right":
                entity.x = Math.min(this.hitbox.left - entity.hitbox.width - entity.hitbox.leftPad - 1, entity.x);
                break;
            case "top":
                entity.y = Math.max(this.hitbox.bottom - entity.hitbox.topPad + 1, entity.y);
                break;
            case "bottom":
                entity.y = Math.min(this.hitbox.top - entity.hitbox.height - entity.hitbox.topPad, entity.y);
                break;
        }
        // if (directionOfEntity === "left") entity.x = Math.max(this.hitbox.right - entity.hitbox.leftPad + 1, entity.x);
        // else if (directionOfEntity === "right") entity.x = Math.min(this.hitbox.left - entity.hitbox.width - entity.hitbox.leftPad - 1, entity.x);
        // else if (directionOfEntity ==="top") entity.y = Math.max(this.hitbox.bottom - entity.hitbox.topPad + 1, entity.y);
        // else if (directionOfEntity ==="bottom") entity.y = Math.min(this.hitbox.top - entity.hitbox.height - entity.hitbox.topPad, entity.y);
        entity.hitbox.updatePos(entity.x, entity.y);
        return directionOfEntity;
    }
}


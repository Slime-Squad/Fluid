const DIRECTIONS = {
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
     * @param {boolean} directionsAirAdjacent Directions with air adjacent to tile. (default [])
     */
    constructor(img, x, y, imgX, imgY, w=8, h=8, directionsAirAdjacent=[]) {
        Object.assign(this, { img, x, y, imgX, imgY, w, h, directionsAirAdjacent });
        if (this.directionsAirAdjacent.length > 0) this.hitbox = new HitBox(this.x, this.y, 0, 0, this.w*PARAMS.SCALE, this.h*PARAMS.SCALE);
    }

    /**
     * Draws the tile on the given canvas. Called on every clock tick.
     * @param {CanvasRenderingContext2D} ctx The canvas to be displayed upon.
     */
    draw(ctx) { 
        const x = this.x - GAME.camera.x;
        const y = this.y - GAME.camera.y;
        if (x > -this.w*PARAMS.SCALE && x < PARAMS.WIDTH && y > -this.h*PARAMS.SCALE && y < PARAMS.HEIGHT) {
            ctx.drawImage(this.img, this.imgX, this.imgY, this.w, this.h, x, y, this.w*PARAMS.SCALE, this.h*PARAMS.SCALE);
            if (this.directionsAirAdjacent.length > 0 && PARAMS.DEBUG) {
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

    /**
     * Function responsible for handling the collision behavior of the tile (this) and player
     */
    collideWithPlayer(){
        return this.collideWithEntity(GAME.slime);
    }

    /**
     * Function responsible for handling the collision behavior of the tile (this) and another entity.
     * @param {AnimatedEntity} entity - the entity colliding with the tile (this)
     */
    collideWithEntity(entity){
        
        let directionOfEntity = entity.hitbox.getCollisionDirection(this.hitbox);

        // if (entity.constructor.name == "Slime") console.log(this.directionsAirAdjacent + ", direction of entity: " + DIRECTIONS[directionOfEntity]);
        
        // const lastHitboxLeft = entity.lastX + entity.hitbox.leftPad;
        // const lastHitboxRight = entity.lastX + entity.hitbox.leftPad + entity.hitbox.width;
        // const lastHitboxBottom = entity.lastY + entity.hitbox.height + entity.hitbox.topPad;
        
        // // Intercede with line - plane collision
        // if (directionOfEntity !== "bottom" && linePlaneIntersect(lastHitboxLeft, lastHitboxBottom, entity.hitbox.left, entity.hitbox.bottom, 
        //         this.hitbox.left, this.hitbox.right, this.hitbox.top ) ||
        //     linePlaneIntersect(lastHitboxRight, lastHitboxBottom, entity.hitbox.right, entity.hitbox.bottom, 
        //         this.hitbox.left, this.hitbox.right, this.hitbox.top )
        //     ) directionOfEntity = "bottom";
            
        if (!this.directionsAirAdjacent.includes(DIRECTIONS[directionOfEntity])) directionOfEntity = DIRECTIONS[this.directionsAirAdjacent[0]];

        // Adjust entity x and y value
        if (directionOfEntity === "left") entity.x = this.hitbox.right - entity.hitbox.leftPad + 1 / PARAMS.SCALE;
        else if (directionOfEntity === "right") entity.x = this.hitbox.left - entity.hitbox.width - entity.hitbox.leftPad - 1 / PARAMS.SCALE;
        else if (directionOfEntity ==="top") entity.y = this.hitbox.bottom - entity.hitbox.topPad;
        else if (directionOfEntity ==="bottom") entity.y = this.hitbox.top - entity.hitbox.height - entity.hitbox.topPad;
        entity.hitbox.updatePos(entity.x, entity.y);
        return directionOfEntity;
    }
}


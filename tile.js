/**
 * Class representation of a map tile within a {@link Room}.
 * @author Jasper Newkirk
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
     * @param {boolean} hasHitbox Whether the tile has a hitbox. (default true)
     */
    constructor(img, x, y, imgX, imgY, w=8, h=8, hasHitbox=true) {
        Object.assign(this, { img, x, y, imgX, imgY, w, h, hasHitbox });
        if (this.hasHitbox) this.hitbox = new HitBox(this.x, this.y, this.w*PARAMS.SCALE, this.h*PARAMS.SCALE);
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
            if (this.hasHitbox && PARAMS.DEBUG) {
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

    collideWithPlayer(){
        this.collideWithEntity(GAME.slime);
        console.log(GAME.slime.constructor.name);
    }

    /**
     * Response to colliding with entity.
     */
    collideWithEntity(entity){
        let directionOfEntity = entity.hitbox.getCollisionDirection(this.hitbox);
        let lastEntityLeft = entity.lastX + entity.leftPadding;
        let lastEntityRight = entity.lastX + entity.leftPadding + entity.hitbox.width;
        let lastEntityBottom = entity.lastY + entity.hitbox.height + entity.topPadding;
        if (directionOfEntity !== 'bottom'){
            if ( 
                linePlaneIntersect(
                    lastEntityLeft, lastEntityBottom, entity.hitbox.left, entity.hitbox.bottom, 
                    this.hitbox.left, this.hitbox.right, this.hitbox.top
                    ) ||
                linePlaneIntersect(
                    lastEntityRight, lastEntityBottom, entity.hitbox.right, entity.hitbox.bottom, 
                    this.hitbox.left, this.hitbox.right, this.hitbox.top
                    )
            ){
                directionOfEntity = 'bottom';
            }
        }
        if (directionOfEntity === 'left'){
            entity.x = this.hitbox.right - entity.leftPadding;
        } else if (directionOfEntity === 'right'){
            entity.x = this.hitbox.left - entity.hitbox.width - entity.rightPadding;
        } else if (directionOfEntity ==='top'){
            entity.y = this.hitbox.bottom - entity.topPadding;
        } else {
            entity.y = this.hitbox.top - entity.hitbox.height - entity.topPadding;
            if (GAME.currentFrame - entity.timers.jumpTimer > 15) entity.canJump = true;
        }
        entity.hitbox.updatePos(entity.x+entity.leftPadding, entity.y+entity.topPadding);
    }
}


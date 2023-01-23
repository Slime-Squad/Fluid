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
        const x = this.x - Math.round(PARAMS.GAME.camera.x);
        const y = this.y - Math.round(PARAMS.GAME.camera.y);
        if (x > -this.w*PARAMS.SCALE && x < PARAMS.WIDTH && y > -this.h*PARAMS.SCALE && y < PARAMS.HEIGHT) {
            ctx.drawImage(this.img, this.imgX, this.imgY, this.w, this.h, x, y, this.w*PARAMS.SCALE, this.h*PARAMS.SCALE);
            if (this.hasHitbox && PARAMS.DEBUG) {
                ctx.strokeStyle = "red";
                ctx.beginPath();
                ctx.rect(this.hitbox.left - PARAMS.GAME.camera.x, this.hitbox.top - PARAMS.GAME.camera.y, this.hitbox.width, this.hitbox.height);   
                ctx.stroke();
            }
        }
    }

    /**
     * Function called on every clock tick.
     */
    update() {
        
    }
}


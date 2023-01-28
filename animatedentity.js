/**
 * Class to extend for the creation of an Animated Entity.
 * @author Jasper Newkirk, Nathan Brown
 */
class AnimatedEntity {
    /**
     * Creates a new instance of an animated entity.
     * @param {String} path The relative path to the entity. Where the image and json files for this object are located, including the name without a file extension.
     * @param {String} tag The name of the current animation of the entity. 
     * @param {number} x The x-coordinate associated with the top-left corner of the entity's sprite on the canvas.
     * @param {number} y The y-coordinate associated with the top-left corner of the entity's sprite on the canvas.
     * @param {boolean} loop Whether the entity's animation loops over again, after having finished playing once.
     */
    constructor(path, tag, x, y, loop) {
        Object.assign(this, { path, tag, x, y, loop });
        this.spritesheet = ASSET_MANAGER.getAsset(this.path + ".png");
        this.frames = ASSET_MANAGER.getAsset(this.path + ".json");
        this.timer = {frameIndex:0, elapsedTime:0}; // handles frame timing
    }
    /**
     * Draws the current entity's {@link AnimatedEntity.tag} animation. Called on every clock tick.
     * @param {CanvasRenderingContext2D} ctx The canvas to which the animation will be displayed upon.
     */
    draw(ctx) {
        this.frames.animateTag(ctx, this.x - PARAMS.GAME.camera.x, this.y - PARAMS.GAME.camera.y, this.timer, this.spritesheet, this.tag, this.loop);
        if (this.hitbox && PARAMS.DEBUG) {
            ctx.strokeStyle = "red";
            ctx.beginPath();
            ctx.rect(this.hitbox.left - PARAMS.GAME.camera.x, this.hitbox.top - PARAMS.GAME.camera.y, this.hitbox.width, this.hitbox.height);
            ctx.stroke();
            ctx.font = "12px segoe ui";
            ctx.fillStyle = "white";
            ctx.fillText(this.constructor.name.toUpperCase() + ": x=" + this.x + " y=" + this.y, this.hitbox.left - PARAMS.GAME.camera.x, this.hitbox.bottom - PARAMS.GAME.camera.y + 4*PARAMS.SCALE);
        }
    }

    /**
     * Function called on every clock tick.
     */
    update() {
        
    }

    /*tileCollision(collision){
        if (collision.direction === 'left'){
            this.x = this.x + (collision.leftIntersect);
        } else if (collision.direction === 'right'){
            this.x = this.x + (collision.rightIntersect);
        } else if (collision.direction ==='top'){
            this.y = this.y + (collision.topIntersect);
        } else {
            this.y = this.y + (collision.bottomIntersect);
        }
        this.hitbox.updatePos(this.x+(2*PARAMS.SCALE), this.y+(5*PARAMS.SCALE));
    }*/
}
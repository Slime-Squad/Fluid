/**
 * Class representation of a "bottomless pit" hitbox, which kills the player on contact.
 * @author Jasper Newkirk
 */
class KillBox {
    /**
     * Constructs a new entity responsible for killing the player on contact.
     * @param {number} x The x-coordinate associated with the top-left corner of the killbox's hitbox on the canvas.
     * @param {number} y The y-coordinate associated with the top-left corner of the killbox's hitbox on the canvas.
     */
    constructor(x, y) {
        Object.assign(this, { x, y });
        this.width = 8*PARAMS.SCALE;
        this.height = 8*PARAMS.SCALE;
        this.hitbox = new HitBox(this.x, this.y, this.width, this.height);
    }
    
    /**
     * Function called on every clock tick.
     */
    update() {
            
    }

    /**
     * Draws the debug information for the current killbox. Called on every clock tick.
     * @param {CanvasRenderingContext2D} ctx The canvas to which the information will be displayed upon.
     */
    draw(ctx) {
        if (PARAMS.DEBUG) {
            ctx.fillText("KILL", this.x - GAME.camera.x, this.y - GAME.camera.y);
        }
    }

    /**
     * Response to colliding with player.
     */
    collideWithPlayer(){
        if (GAME.slime.isAlive) GAME.slime.kill();
    }
}
/**
 * Class representation of the HUD animation played upon a change to the health of the player.
 * @author Jasper Newkirk
 */
class Health extends AnimatedEntity {
    /**
     * Constructs a new entity responsible for the HUD animation played upon a change to the health of the player.
     */
    constructor() {
        super("./assets/graphics/camera/health", "8", 0, 0, false);
        this.width = 4*PARAMS.SCALE;
        this.height = 4*PARAMS.SCALE;
        this.MAX_HEALTH = 8;
        this.health = 8;
        this.delta = '';
    }
    
    /**
     * Applies a fixed amount of damage to the player. Intended to be called upon every clock tick.
     */
    damage() {
        this.health -= GAME.tickMod/60;
        this.delta = '-';
    }

    /**
     * Function called on every clock tick.
     */
    update() {
        this.health = Math.min(8, this.health + GAME.tickMod/120)
        if (this.tag != Math.floor(this.health) + this.delta) this.swapTag(Math.max(0, Math.floor(this.health)) + this.delta);
        if (this.health <= 0) {
            GAME.slime.kill();
            this.health = this.MAX_HEALTH;
        }
        this.x = lerp(this.x, GAME.slime.x + 8*PARAMS.SCALE, GAME.tickMod/2);
        this.y = lerp(this.y, GAME.slime.y, GAME.tickMod/2);
        this.delta = this.health == 0 || this.health == 8 ? '' : '+';
    }

    /**
     * Draws the current player's health value. Called on every clock tick.
     * @param {CanvasRenderingContext2D} ctx The canvas to which the debug information will be displayed upon.
     */
    draw(ctx) {
        super.draw(ctx);
        if (PARAMS.DEBUG) {
            ctx.font = "30px segoe ui";
            ctx.fillStyle = "green";
            ctx.fillText(this.health, this.x - GAME.camera.x, this.y - GAME.camera.y);
        }
    }

}
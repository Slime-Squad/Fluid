/**
 * Class representation of a charge item.
 * @author Jasper Newkirk
 */
class Charge extends AnimatedEntity {
    /**
     * Creates a new instance of a charge item.
     * @param {GameEngine} game The {@link GameEngine} instance to be associated with this charge.
     * @param {String} tag The type of charge to be placed. One of "Earth", "Fire", "Ice", "Electric", or "Disabled".
     * @param {number} speed The amount of pixels that the object moves in a tick if moved.
     * @param {number} x The x-coordinate associated with the top-left corner of the charge's sprite in the current {@link GameEngine.ctx} context.
     * @param {number} y The y-coordinate associated with the top-left corner of the charge's sprite in the current {@link GameEngine.ctx} context.
     * @param {boolean} loop Whether the charge's animation loops over again, after having finished playing once.
     */
    constructor(game, tag, speed, x, y, loop = true) {
        super(game, "./assets/graphics/item/charge", tag, x, y, 8*PARAMS.SCALE, 8*PARAMS.SCALE, loop);
        Object.assign(this, {game, tag, speed, x, y, loop});
    }

    /**
     * Code necessary to move entity with WASD or a Xbox controller.
     */
    update() {
        if(this.x > PARAMS.WIDTH || this.x < 0) this.x = 0;
        if(this.y > PARAMS.HEIGHT || this.y < 0) this.y = 0;
        
        //Controls work with keyboard and a gamepad
        if(this.game.keys["w"] || this.game.up) {
            this.y -= this.speed * this.game.clockTick;
        }
        if(this.game.keys["a"] || this.game.left) {
            this.x -= this.speed * this.game.clockTick;
        }
        if(this.game.keys["s"] || this.game.down) {
            this.y += this.speed * this.game.clockTick;
        }
        if(this.game.keys["d"] || this.game.right) {
            this.x += this.speed * this.game.clockTick;
        }
        if(this.game.keys[" "] || this.game.A) {
            console.log("jump");
        }
        if(this.game.keys["j"] || this.game.B) {
            console.log("smash")
        }
    }
}
/**
 * Currently creates a slime entity with the ability to move with WASD or a xbox controller
 * @author Xavier Hines
 */
class Slime extends AnimatedEntity {
    constructor(game, tag, speed, x, y, loop = true) {
       
 //       this.animatedentity = new AnimatedEntity(game, "./assets/graphics/characters/Slime-sheet4.png", tag, x, y, 8*PARAMS.SCALE, 8*PARAMS.SCALE, loop)
        
        super(game, "./assets/graphics/characters/SlimeSlide", tag, x, y, 4*PARAMS.SCALE, 4*PARAMS.SCALE, loop);
        Object.assign(this, {game, tag, speed, x, y, loop});
        // this.x = 448;
        // this.y = 320;
        // this.speed = 150;
    };

    /**
     * Will update the position of the slime and whether or not it is 
     * actively being given any input every tick.
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

    /**
     * Draws the slime every tick at the appropriate position.
     * @param {CanvasRenderingContext2D} ctx The canvas which the slime will be drawn on.
     */
    draw(ctx) {
        super.draw(ctx);
    }
}
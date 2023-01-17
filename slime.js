/**
 * Currently creates a slime entity with the ability to move with WASD or a xbox controller
 * 1/15/2023: Added Momentum based movement and WIP 'bounce' animation
 * @author Xavier Hines
 * @author Nathan Brown
 */
class Slime extends AnimatedEntity {

    constructor(game, tag, x, y, loop = true) {
        
        super(game, "./assets/graphics/characters/slimeBounce", tag, x, y, loop);
        Object.assign(this, {game, tag, x, y, loop});
        this.hitbox = new HitBox(x, y, 12*PARAMS.SCALE, 10*PARAMS.SCALE);

        // Movement
        this.speed = 250;
        this.momentum = 0;
        this.acceleration = this.speed / 45;
        this.direction = 1;

        // Conditions
        this.canJump = true;
        this.canDash = true;

        // Charges
        this.charges = {
            "Electric" : 0,
            "Fire" : 0,
            "Ice" : 0,
            "Earth" : 0
        }

        // Timers
        this.jumpTimer = 0;
        this.dashTimer = 0;
    
    };

    /**
     * Function called on every {@link AnimatedEntity.game.clockTick}.
     */
    update() {
        
        // CONTROLS
        if(this.game.keys["w"] || this.game.up) {
            this.y -= this.speed * this.game.clockTick;
        }
        if(this.game.keys["s"] || this.game.down) {
            this.y += this.speed * this.game.clockTick;
        }
        
        if(this.game.keys["a"] || this.game.left) {
            if (this.momentum > 0) this.momentum / 3;
            this.x += (this.speed * -1 + this.momentum) * this.game.clockTick;
            this.tag = "move_left";
            this.direction = -1;
            this.momentum = this.game.clamp(
                this.momentum - this.acceleration, 
                this.speed * -1, 
                this.speed
            );
        }
        else if(this.game.keys["d"] || this.game.right) {
            if (this.momentum < 0) this.momentum / 3;
            this.x += (this.speed + this.momentum) * this.game.clockTick;
            this.tag = "move";
            this.direction = 1;
            this.momentum = this.game.clamp(
                this.momentum + this.acceleration, 
                this.speed * -1, 
                this.speed
            );
        }
        else {
            this.x += this.momentum * this.game.clockTick;
            this.tag = this.direction > 0 ? "idle" : "idle_left";
            this.momentum = this.direction > 0 ?
                this.game.clamp(this.momentum - this.acceleration, 0, this.speed) :
                this.game.clamp(this.momentum + this.acceleration, this.speed * -1, 0);
        }
        // console.log(this.canJump)
        if((this.game.keys[" "] || this.game.A) && this.canJump) {
            this.canJump = false;
            console.log("jump");
            this.jumpTimer = this.game.currentFrame;
        }
        if((this.game.keys["j"] || this.game.B) && this.canDash) {
            this.canDash = false;
            console.log("smash");
            this.dashTimer = this.game.currentFrame;
        }
        if (!this.canJump && this.game.currentFrame - this.jumpTimer > 45) this.canJump = true;
        if (!this.canDash && this.game.currentFrame - this.dashTimer > 30) this.canDash = true;

        // HANDLE COLLISIONS
        this.hitbox.updatePos(this.x+(2*PARAMS.SCALE), this.y+(6*PARAMS.SCALE));
        this.game.entities.forEach(entity => {
            if (entity.hitbox && this.hitbox.collide(entity.hitbox)) {
                if (entity instanceof Charge) {
                    if (entity.tag != "Disabled") { // charge collected
                        entity.tag = "Disabled";
                    }
                }
            }
        });

    }

    /**
     * Draws the slime every tick at the appropriate position.
     * @param {CanvasRenderingContext2D} ctx The canvas which the slime will be drawn on.
     */
    draw(ctx) {
        super.draw(ctx);
        if (PARAMS.DEBUG) {
            ctx.font = "12px segoe ui";
            ctx.fillStyle = "white";
            ctx.fillText("SLIME: x=" + this.x + " y=" + this.y, this.x + 6*PARAMS.SCALE - this.game.camera.x, this.y + 20*PARAMS.SCALE - this.game.camera.y);
        }
    }
    
}

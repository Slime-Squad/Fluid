/**
 * Currently creates a slime entity with the ability to move with WASD or a xbox controller
 * 1/15/2023: Added Momentum based movement and WIP 'bounce' animation
 * @author Xavier Hines
 * @author Nathan Brown
 */
class Slime extends AnimatedEntity {

    constructor(tag, x, y, loop = true) {
        
        super("./assets/graphics/characters/slimeBounce", tag, x, y, loop);
        Object.assign(this, {tag, x, y, loop});
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

        // Up and Down
        if(PARAMS.GAME.keys["w"] || PARAMS.GAME.up) {
            this.y -= this.speed * PARAMS.GAME.clockTick;
        }
        if(PARAMS.GAME.keys["s"] || PARAMS.GAME.down) {
            this.y += this.speed * PARAMS.GAME.clockTick;
        }
        
        // Left and Right
        if(PARAMS.GAME.keys["a"] || PARAMS.GAME.left) {
            if (this.momentum > 0) this.momentum / 3;
            this.x += (this.speed * -1 + this.momentum) * PARAMS.GAME.clockTick;
            this.tag = "move_left";
            this.direction = -1;
            this.momentum = PARAMS.GAME.clamp(
                this.momentum - this.acceleration, 
                this.speed * -1, 
                this.speed
            );
        }
        else if(PARAMS.GAME.keys["d"] || PARAMS.GAME.right) {
            if (this.momentum < 0) this.momentum / 3;
            this.x += (this.speed + this.momentum) * PARAMS.GAME.clockTick;
            this.tag = "move";
            this.direction = 1;
            this.momentum = PARAMS.GAME.clamp(
                this.momentum + this.acceleration, 
                this.speed * -1, 
                this.speed
            );
        }
        else {
            this.x += this.momentum * PARAMS.GAME.clockTick;
            this.tag = this.direction > 0 ? "idle" : "idle_left";
            this.momentum = this.direction > 0 ?
                PARAMS.GAME.clamp(this.momentum - this.acceleration, 0, this.speed) :
                PARAMS.GAME.clamp(this.momentum + this.acceleration, this.speed * -1, 0);
        }

        // Jump
        // console.log(this.canJump)
        if((PARAMS.GAME.keys[" "] || PARAMS.GAME.A) && this.canJump) {
            this.canJump = false;
            console.log("jump");
            this.jumpTimer = PARAMS.GAME.currentFrame;
        }

        // Dash
        if((PARAMS.GAME.keys["j"] || PARAMS.GAME.B) && this.canDash) {
            this.canDash = false;
            console.log("smash");
            this.dashTimer = PARAMS.GAME.currentFrame;
        }
        if (!this.canJump && PARAMS.GAME.currentFrame - this.jumpTimer > 45) this.canJump = true;
        if (!this.canDash && PARAMS.GAME.currentFrame - this.dashTimer > 30) this.canDash = true;

        // HANDLE COLLISIONS
        this.hitbox.updatePos(this.x+(2*PARAMS.SCALE), this.y+(6*PARAMS.SCALE));
        PARAMS.GAME.entities.forEach(entity => {
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
            ctx.fillText("SLIME: x=" + this.x + " y=" + this.y, this.x + 6*PARAMS.SCALE - PARAMS.GAME.camera.x, this.y + 20*PARAMS.SCALE - PARAMS.GAME.camera.y);
        }
    }
    
}

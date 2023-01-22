/**
 * Class representation of a playable Slime entity
 * @author Xavier Hines
 * @author Nathan Brown
 * @author Jasper Newkirk
 */
class Slime extends AnimatedEntity {
    /**
     * Creates a new instance of a playable slime entity.
     * @param {string} tag The name of the current animation of the slime
     * @param {number} x The x-coordinate associated with the top-left corner of the slime's sprite on the canvas.
     * @param {number} y The y-coordinate associated with the top-left corner of the slime's sprite on the canvas.
     */
    constructor(tag, x, y) {
        super("./assets/graphics/characters/slimeBounce", tag, x, y);
        Object.assign(this, {tag, x, y});
        this.hitbox = new HitBox(x, y, 12*PARAMS.SCALE, 10*PARAMS.SCALE);

        // Movement
        this.speed = 350;
        this.momentum = 0;
        this.acceleration = this.speed / 30;
        this.decceleration = this.speed / 45;
        this.direction = 1;
        this.rise = -1;
        this.bounce = 8;
        this.gravity = .1;

        // Conditions
        this.canJump = true;
        this.canDash = true;
        this.isAirborne = true;

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
     * Function called on every clock tick.
     */
    update() {
        
        // CONTROLS

        // Up and Down
        // if(PARAMS.GAME.keys["w"] || PARAMS.GAME.up) {
        //     this.y -= this.speed * PARAMS.GAME.clockTick;
        // }
        // if(PARAMS.GAME.keys["s"] || PARAMS.GAME.down) {
        //     this.y += this.speed * PARAMS.GAME.clockTick;
        // }
        
        // Left and Right
        if(PARAMS.GAME.keys["a"] || PARAMS.GAME.left) {
            if (this.momentum > 0) this.momentum / 5;
            this.x += (this.speed * -1 + this.momentum) * PARAMS.GAME.clockTick;
            this.tag = "move_left";
            this.direction = -1;
            this.momentum = clamp(
                this.momentum - this.acceleration, 
                this.speed * -1, 
                this.speed
            );
        }
        else if(PARAMS.GAME.keys["d"] || PARAMS.GAME.right) {
            if (this.momentum < 0) this.momentum / 5;
            this.x += (this.speed + this.momentum) * PARAMS.GAME.clockTick;
            this.tag = "move";
            this.direction = 1;
            this.momentum = clamp(
                this.momentum + this.acceleration, 
                this.speed * -1, 
                this.speed
            );
        } else {
            this.x += this.momentum * PARAMS.GAME.clockTick;
            this.tag = this.direction > 0 ? "idle" : "idle_left";
            this.momentum = this.direction > 0 ?
                clamp(this.momentum - this.acceleration, 0, this.speed) :
                clamp(this.momentum + this.acceleration, this.speed * -1, 0);
        }

        // Jump
        // console.log(this.canJump)
        if((PARAMS.GAME.keys[" "] || PARAMS.GAME.A) && this.canJump) {
            this.canJump = false;
            console.log("jump");
            // this.jumpTimer = PARAMS.GAME.currentFrame;
            this.rise = this.bounce;
            this.isAirborne = true;
        }

        // Dash
        if((PARAMS.GAME.keys["j"] || PARAMS.GAME.B) && this.canDash) {
            this.canDash = false;
            console.log("smash");
            this.dashTimer = PARAMS.GAME.currentFrame;
        }
        // if (!this.canJump && PARAMS.GAME.currentFrame - this.jumpTimer > 45) this.canJump = true;
        if (!this.canDash && PARAMS.GAME.currentFrame - this.dashTimer > 30) this.canDash = true;

        // Rise
        this.y -= this.rise;

        // Gravity
        if (this.rise > -100){
            this.rise -= this.gravity;
        }

        // HANDLE COLLISIONS
        this.hitbox.updatePos(this.x+(2*PARAMS.SCALE), this.y+(6*PARAMS.SCALE));
        PARAMS.GAME.entities.forEach(entity => {
            if (!entity.hitbox) return;
            if (entity instanceof Slime) return;
            let collisions = this.hitbox.collide(entity.hitbox);
            if (!collisions) return;
            // console.log(collisions);
            // console.log(entity.constructor.name);
            switch (entity.constructor.name){
                case 'Charge':
                    if (entity.tag != "Disabled") { // charge collected
                        entity.tag = "Disabled";
                    }
                    break;
                case 'Tile':
                    if (collisions.direction === 'left'){
                        this.x = this.x + (collisions.leftIntersect);
                    } else if (collisions.direction === 'right'){
                        this.x = this.x + (collisions.rightIntersect);
                    } else if (collisions.direction ==='top'){
                        this.y = this.y + (collisions.topIntersect);
                    } else {
                        this.y = this.y + (collisions.bottomIntersect);
                        this.rise = -1;
                        this.isAirborne = true;
                        this.canJump = true;
                    }
                    this.hitbox.updatePos(this.x+(2*PARAMS.SCALE), this.y+(6*PARAMS.SCALE));
                    break;
            }
        });

    }

    /**
     * Draws the current slime's {@link Slime.tag} animation. Called on every clock tick.
     * @param {CanvasRenderingContext2D} ctx The canvas which the slime will be drawn on.
     */
    draw(ctx) {
        super.draw(ctx);
    }
    
}

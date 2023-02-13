/**
 * Class representation of a playable Slime entity
 * @author Xavier Hines, Nathan Brown, Jasper Newkirk
 */
class Slime extends AnimatedEntity {
    /**
     * Creates a new instance of a playable slime entity.
     * @param {string} tag The name of the current animation of the slime
     * @param {number} x The x-coordinate associated with the top-left corner of the slime's sprite on the canvas.
     * @param {number} y The y-coordinate associated with the top-left corner of the slime's sprite on the canvas.
     */
    constructor(tag, x, y) {
        super("./assets/graphics/characters/slimedrop", tag, x, y);
        Object.assign(this, {tag, x, y});
        this.hitbox = new HitBox(x, y, PARAMS.SCALE * 3, PARAMS.SCALE * 5, 10*PARAMS.SCALE, 10*PARAMS.SCALE);

        this.spawnX = this.x;
        this.spawnY = this.y;

        // States
        this.states = [
            this.idle, 
            this.running, 
            this.jumping, 
            this.falling, 
            this.dashing, 
            this.climbing
        ];
        this.state = this.idle; // active state
        this.changeStateCheck = this.idleStateCheck;
        this.entityCollisions = [];
        this.tileCollisions = [];

        // Movement
        this.speed = 1.75;
        this.dashSpeed = 7;
        this.momentum = 0;
        this.maxMom = (this.speed * 0.66).toFixed(2);
        this.acceleration = this.maxMom / 30;
        this.decceleration = this.maxMom / 40;
        this.xDirection = 1;
        this.yVelocity = 1 / PARAMS.SCALE;
        this.maxYVelocity = 6;
        this.slideSpeed = 0;
        this.wallJumpTimeout = 0.2;
        this.yFallThreshold = (1 / PARAMS.SCALE) * 10;
        this.jumpVelocity = -3.4;
        this.jumpMomentum = this.momentum / 2;
        this.lastX = this.x;
        this.lastY = this.y;
        
        // Flags
        this.isAlive = true;
        this.isJumping = false;
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
        this.timers = {
            jumpTimer : 0,
            // landTimer : 0,
            climbTimer : 0,
            dashTimer : 0
        }
    };

    update() {

        this.changeStateCheck();
        this.state();

        this.hitbox.updatePos(this.x, this.y);

        this.tileCollisions.length = 0;
        this.entityCollisions = this.hitbox.getCollisions();

        this.entityCollisions.forEach(entity => { 
            if (entity.collideWithPlayer) this.tileCollisions.push(entity.collideWithPlayer()); 
        });
        // Sorted Collision
        // this.entityCollisions.forEach(entity => { 
        //     entity.distanceFromPlayer = Math.abs(entity.hitbox.center - this.hitbox.center);
        // });
        // this.entityCollisions.sort((a,b) => {return a.distanceFromPlayer - b.distanceFromPlayer}).forEach(entity => { 
        //     if (entity.collideWithPlayer) this.tileCollisions.push(entity.collideWithPlayer()); 
        // });

        this.endOfCycleUpdates();

    }

    /**
     * Draws the current slime's {@link Slime.tag} animation. Called on every clock tick.
     * @param {CanvasRenderingContext2D} ctx The canvas which the slime will be drawn on.
     */
    draw(ctx) {
        super.draw(ctx);
        if (PARAMS.DEBUG) {
            ctx.font = "30px segoe ui";
            ctx.fillStyle = "red";
            if (this.yVelocity >= this.maxYVelocity){
                ctx.fillText("!", this.hitbox.center.x - GAME.camera.x, this.hitbox.top - 3 * PARAMS.SCALE - GAME.camera.y);
            };
            // ctx.fillText("Jump Timer:" + this.timers.jumpTimer.toFixed(2), this.x - GAME.camera.x, this.y - GAME.camera.y - 150);
            ctx.fillText("Dash Timer:" + this.timers.dashTimer.toFixed(2), this.x - GAME.camera.x - 45 * PARAMS.SCALE, this.y - GAME.camera.y + 12 * PARAMS.SCALE);
            ctx.fillText("Climb Timer:" + this.timers.climbTimer.toFixed(2), this.x - GAME.camera.x - 45 * PARAMS.SCALE, this.y - GAME.camera.y + 6 * PARAMS.SCALE);
            ctx.fillText("Charges: " + Object.values(this.charges), this.x - GAME.camera.x, this.y - GAME.camera.y - 100);
            ctx.fillText("Y Velocity:" + this.yVelocity.toFixed(2), this.x - GAME.camera.x, this.y - GAME.camera.y - 50);
            ctx.fillText("Momentum:" + this.momentum, this.x - GAME.camera.x, this.y - GAME.camera.y);
            ctx.fillText("State: " + this.state.name, this.x - GAME.camera.x, this.y - GAME.camera.y - 200);
        }
    }

    endOfCycleUpdates(){
        if (this.x == this.lastX) this.momentum = 0; // Reset momentum on stop
        if (this.y == this.lastY) this.yVelocity = 1 / PARAMS.SCALE; // Reset yVelocity on stop
        if (this.timers.dashTimer > 1) this.canDash = true;
        super.endOfCycleUpdates();
    }

    ////////////////////////
    // Movement Fucntions //
    ////////////////////////

    /**
     * Horizontal Movement - called by state functions.
     * @author Nathan Brown
     */
    moveX(moveSpeed, moveAcceleration = 0) {

        if (this.momentum * moveSpeed < 0) this.momentum /= 1.1;
        this.x += (moveSpeed + this.momentum) * PARAMS.SCALE * GAME.tickMod;
        this.momentum = clamp(
            this.momentum + moveAcceleration * GAME.tickMod, 
            this.maxMom * -1, 
            this.maxMom
        );

    }

    /**
     * Moves the slime along the y axis by adding its yVelocity value to its y 
     * position. Mostly this is caused by gravity and states like jumping that allow 
     * the player to change yVelocity.
     * 
     * @author Nathan Brown
     */
    moveY(moveSpeed = this.yVelocity){

        this.y += moveSpeed * PARAMS.SCALE * GAME.tickMod;

        // Gravity
        if (this.yVelocity <= this.maxYVelocity){
            let hangtime = this.yVelocity < 0 ? 0.7 : 1;
            this.yVelocity = moveSpeed + PARAMS.GRAVITY * GAME.tickMod * hangtime;
        }

    }

    /**
     * Called by state behaviors to test controller inputs and determine the slime's x movement.
     */
    controlX(){

        if(CONTROLLER.LEFT) {
            this.moveX(-this.speed, -this.acceleration);
            this.xDirection = -1; // moveX not dependent on this.direction
        } else if(CONTROLLER.RIGHT) {
            this.moveX(this.speed, this.acceleration);
            this.xDirection = 1; // moveX not dependent on this.direction
        } else{
            this.moveX(0);
            this.momentum = this.xDirection > 0 ? 
                clamp(this.momentum - this.decceleration * GAME.tickMod, 0, this.maxMom) : 
                clamp(this.momentum + this.decceleration * GAME.tickMod, -this.maxMom, 0);
        }

    }

    idleStateCheck(){
        // Check dashing
        if (CONTROLLER.B && this.canDash) {
            this.canDash = false;
            this.yVelocity = 0;
            this.timers.dashTimer = 0;
            this.state = this.dashing;
            this.state(true);
            return;
        } 

        // Check running
        if (CONTROLLER.RIGHT || CONTROLLER.LEFT){
            this.state = this.running;
            this.state(true);
            return;
        }
        
        // Check jumping
        if (CONTROLLER.A && this.canJump){ 
            this.canJump = false;
            this.state = this.jumping;
            this.state(true);
            return;
        }

        // Check falling
        if (this.yVelocity > this.yFallThreshold){
            // this.canJump = false;
            this.state = this.falling;
            this.state(true);
            return;
        }
    }

    /////////////////////
    // State Behaviors //
    /////////////////////

    /**
     * Slime makes itself move on the x axis.
     * @author Nathan Brown
     */
    idle (changingState = false){

        if (changingState) this.changeStateCheck = this.idleStateCheck;

        // Perform 'idle' behavior
        this.xDirection > 0 ? this.swapTag("Idle", true) : this.swapTag("IdleLeft", true);
        this.controlX();
        this.moveY();
        if (!CONTROLLER.A) this.canJump = true;

    }

    /**
     * Slime is on the ground, moving and accelerating
     * @author Nathan Brown
     */
    running (changingState = false){

        if (changingState) this.changeStateCheck = () => {

            // Check dashing
            if (CONTROLLER.B && this.canDash) {
                this.canDash = false;
                this.yVelocity = 0;
                this.timers.dashTimer = 0;
                this.state = this.dashing;
                this.state(true);
                return;
            } 

            // Check jumping
            if (CONTROLLER.A && this.canJump){ 
                this.canJump = false;
                this.state = this.jumping;
                this.state(true);
                return;
            }

            // Check falling
            if (this.yVelocity > this.yFallThreshold){
                // this.canJump = false;
                this.state = this.falling;
                this.state(true);
                return;
            }
            
            // Check idle
            if (!(CONTROLLER.RIGHT || CONTROLLER.LEFT)){
                this.state = this.idle;
                this.state(true);
                return;
            }

        };

        // Perform 'running' behavior
        this.xDirection > 0 ? this.tag = "Move" : this.tag = "MoveLeft";
        this.controlX();
        this.moveY();
        if (!CONTROLLER.A) this.canJump = true;

    }

    /**
     * Gets the slime into the air when A is pressed. Hold A for a longer jump. Uses a variety of state 
     * flags to determine when the slime can jump. 
     * @author Nathan Brown
     */
    jumping (changingState = false){

        if (changingState) this.changeStateCheck = () => {

            // Check dashing
            if (CONTROLLER.B && this.canDash) {
                this.canDash = false;
                this.yVelocity = 0;
                this.timers.dashTimer = 0;
                this.state = this.dashing;
                this.state(true);
                return;
            }
            
            // Check first jumping
            if(CONTROLLER.A && !this.isJumping){
                this.isJumping = true;
                this.yVelocity = this.jumpVelocity - Math.abs(this.momentum / 2.5);
            }
            
            // Check falling
            if (!CONTROLLER.A || this.yVelocity > 0){
                this.isJumping = false;
                this.yVelocity = Math.max(this.yVelocity, -2 / PARAMS.SCALE);
                this.state = this.falling;
                this.state(true);
                return;
            }

        };
        
        // Perform 'jumping' behaviors
        this.xDirection > 0 ? this.tag = "Idle" : this.tag = "IdleLeft";
        this.controlX();
        this.moveY();
    
    }

    /**
     * Slime falls downward until it collides with a tile.
     * @author Nathan Brown
     */
    falling (changingState = false){

        if (changingState) this.changeStateCheck = () => {

            // Check dashing
            if (CONTROLLER.B && this.canDash) {
                this.canDash = false;
                this.yVelocity = 0;
                this.timers.dashTimer = 0;
                this.state = this.dashing;
                this.state(true);
                return;
            }

            let landed = this.tileCollisions.includes("bottom");

            // Check running
            if (landed && (CONTROLLER.RIGHT || CONTROLLER.LEFT)){
                this.yVelocity = 1 / PARAMS.SCALE;
                this.state = this.running;
                this.state(true);
                return;
            }
            
            // Check idle
            if (landed){
                this.yVelocity = 1 / PARAMS.SCALE;
                this.state = this.idle;
                this.state(true);
                return;
            }

            // Check climbing
            if (this.tileCollisions.includes("right") || this.tileCollisions.includes("left")){
                this.yVelocity = 0;
                this.timers.climbTimer = 0;
                this.slideSpeed = 0;
                this.state = this.climbing;
                this.state(true);
                return;
            }

        };

        // Perform 'falling' behaviors
        this.xDirection > 0 ? this.tag = "Idle" : this.tag = "IdleLeft";
        this.controlX();
        this.moveY();

    }

    /**
     * Slime dashes forward rapidly. 
     * Plans: 
     *          Kill enemies when colliding with the dashing slime. 
     *          Set momentum to 0. 
     *          Implement line-line checking for right side tile collision.
     * @author Nathan Brown
     */
    dashing (changingState = false){

        if (changingState) this.changeStateCheck = () => {

            if (this.timers.dashTimer > 0.15){

                if (this.tileCollisions.includes("bottom")){
                    if (CONTROLLER.RIGHT || CONTROLLER.LEFT) this.state = this.running;
                    else this.state = this.idle;
                    this.state(true);
                    return;
                }

                this.state = this.falling;
                this.state(true);
                return;

            }

        }
        
        /*
        if (linePlaneIntersect(lastHitboxTop, lastHitboxLeft, entity.hitbox.top, entity.hitbox.left, 
                this.hitbox.top, this.hitbox.bottom, this.hitbox.right) ||
            linePlaneIntersect(lastHitboxBottom, lastHitboxLeft, entity.hitbox.bottom, entity.hitbox.left, 
                this.hitbox.top, this.hitbox.bottom, this.hitbox.right)
            ) directionOfEntity = 'left';
        else if (linePlaneIntersect(lastHitboxTop, lastHitboxRight, entity.hitbox.top, entity.hitbox.right, 
                this.hitbox.top, this.hitbox.bottom, this.hitbox.left) ||
            linePlaneIntersect(lastHitboxBottom, lastHitboxRight, entity.hitbox.bottom, entity.hitbox.right, 
                this.hitbox.top, this.hitbox.bottom, this.hitbox.left)
            ) directionOfEntity = 'right';
        */
        this.xDirection > 0 ? this.tag = "Idle" : this.tag = "IdleLeft";
        if (this.timers.dashTimer <= 0.15) this.moveX(this.dashSpeed * this.xDirection);
    }

    /**
     * Slime sticks and slides on the wall and can jump off of it
     * @author Nathan Brown
     */
    climbing (changingState = false){

        if (changingState) this.changeStateCheck = () => {

            let landed = this.tileCollisions.includes("bottom");

            // Check wallJumping
            if (CONTROLLER.A && this.canJump){
                this.xDirection = this.xDirection > 0 ? -1 : 1;
                this.momentum = this.maxMom * this.xDirection;
                this.timers.jumpTimer = 0;
                this.canJump = false;
                this.state = this.wallJumping;
                this.state(true);
                return;
            }

            // Check falling
            if (!((this.xDirection > 0 && CONTROLLER.RIGHT) || (this.xDirection <= 0 && CONTROLLER.LEFT)) || 
                    !(this.tileCollisions.includes("left") || this.tileCollisions.includes("right"))){
                this.state = this.falling;
                this.state(true);
                return;
            }

        }

        // Perform 'climbing' behaviors
        this.xDirection > 0 ? this.tag = "Idle" : this.tag = "IdleLeft";
        this.moveX(this.xDirection);
        this.moveY(this.slideSpeed);
        if (this.timers.climbTimer > 0.1 && this.slideSpeed < this.maxYVelocity) this.slideSpeed = this.slideSpeed + (PARAMS.GRAVITY / 2) * GAME.tickMod;
        if (!CONTROLLER.A) this.canJump = true;

    }

    /**
     * Slime jumps off the wall
     * @author Nathan Brown
     */
    wallJumping (changingState = false){

        if (changingState) this.changeStateCheck = () => {

            // Check jumping
            if (this.timers.jumpTimer > this.wallJumpTimeout * 2 && CONTROLLER.A){
                this.state = this.jumping;
                this.state(true);
                return;
            }


            // Check falling
            if ((this.timers.jumpTimer > this.wallJumpTimeout && !CONTROLLER.A) || 
                    (this.direction > 0 && this.tileCollisions.includes("right")) || 
                    (this.direction <= 0 && this.tileCollisions.includes("left"))){
                this.isJumping = false;
                this.yVelocity = Math.max(this.yVelocity, -2 / PARAMS.SCALE);
                this.state = this.falling;
                this.state(true);
                return;
            }
            
            // Check starting of wallJumping
            if(!this.isJumping){
                this.isJumping = true;
                this.yVelocity = this.jumpVelocity * 0.6;
            }

        };

        // Perform 'wallJumping' behaviors
        this.xDirection > 0 ? this.tag = "Idle" : this.tag = "IdleLeft";
        this.moveX(this.speed * 0.75 * this.xDirection);
        this.moveY();

    }

    /**
     * Function responsible for killing the current Slime entity and playing a camera animation as the slime is respawned.
     * @author Jasper Newkirk
     */
    kill() {
        this.isAlive = false;
        GAME.camera.deathScreen.swapTag("Died");
        const targetX = this.spawnX - PARAMS.WIDTH/2  + 8*PARAMS.SCALE;
        const targetY = this.spawnY - PARAMS.HEIGHT/2 - 16*PARAMS.SCALE;
        GAME.camera.freeze(1,
            (ctx, camera) => {
                camera.x = Math.round(lerp(camera.x, targetX, GAME.tickMod/30));
                camera.y = Math.round(lerp(camera.y, targetY, GAME.tickMod/30));
            },
            () => {
                GAME.camera.deathScreen.swapTag("Respawn");
                this.momentum = 0;
                this.x = this.spawnX;
                this.y = this.spawnY;
                this.isAlive = true;
            }
        );

    }

}

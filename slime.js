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
        this.hitbox = new HitBox(x, y, 3*PARAMS.SCALE, 5*PARAMS.SCALE, 10*PARAMS.SCALE, 10*PARAMS.SCALE);

        this.spawnX = this.x;
        this.spawnY = this.y;

        this.initializeStates();
        
        this.currentState = this.states.idle;
        this.behavior = this.states.idle.behavior; // active state
        this.changeStateCheck = this.idleStateCheck;
        this.entityCollisions = [];
        this.tileCollisions = [];

        // Movement
        this.speed = 1.25;
        this.momentum = 0;
        this.maxMom = (this.speed * 0.66).toFixed(2);
        this.acceleration = this.maxMom / 30;
        this.decceleration = this.maxMom / 40;
        this.xDirection = 1;
        this.yVelocity = 1 / PARAMS.SCALE;
        this.maxYVelocity = 6;
        this.boostSpeed = -6;
        this.boostTimeout = 0.15;
        this.dashSpeed = 5;
        this.dashTimeout = 0.2;
        this.slideSpeed = 0;
        this.wallJumpTimeout = 0.2;
        this.yFallThreshold = (1 / PARAMS.SCALE) * 10;
        this.jumpVelocity = -3.4;
        this.jumpMomentumMod = 1.8;
        this.lastX = this.x;
        this.lastY = this.y;
        
        // Flags
        this.isAlive = true;
        this.isJumping = false;
        this.isInvincible = false;
        this.canJump = true;
        this.canDash = false;
        this.canBoost = false;
        this.canPressHome = true;

        // Powers
        this.dashbeam = new AnimatedEntity("./assets/graphics/characters/dashbeam", "Default", 0, 0, false);
        // this.dashbeam.draw(ctx) = super.draw(ctx);
        
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
            boostTimer : 0,
            // landTimer : 0,
            climbTimer : 0,
            dashTimer : 0
        }
    };

    update() {

        if (this.y > 12000 || CONTROLLER.BACK) this.kill();
        if (PARAMS.DEBUG && CONTROLLER.RTRIG) Object.keys(this.charges).forEach(charge => this.charges[charge] = 1);
        if (this.canPressHome && CONTROLLER.HOME){
            this.canPressHome = false;
            PARAMS.DEBUG = !PARAMS.DEBUG;
        } else if (!this.canPressHome && !CONTROLLER.HOME) this.canPressHome = true;

        let oldX = this.hitbox.left;
        let oldY = this.hitbox.top;
        this.changeState();
        this.currentState.behavior();
        // this.changeStateCheck();
        // this.behavior();
        
        this.collision(oldX, oldY);

        this.endOfCycleUpdates();

    }

    /**
     * Draws the current slime's {@link Slime.tag} animation. Called on every clock tick.
     * @param {CanvasRenderingContext2D} ctx The canvas which the slime will be drawn on.
     */
    draw(ctx) {
        super.draw(ctx);
        if (PARAMS.DEBUG) {
            GAME.CTX.font = "30px segoe ui";
            GAME.CTX.fillStyle = "khaki";
            if (this.yVelocity >= this.maxYVelocity){
                GAME.CTX.fillText("!", this.hitbox.center.x - GAME.camera.x, this.hitbox.top - 3 * PARAMS.SCALE - GAME.camera.y);
            };
            // GAME.CTX.fillText("Jump Timer:" + this.timers.jumpTimer.toFixed(2), this.x - GAME.camera.x, this.y - GAME.camera.y - 150);
            // GAME.CTX.fillText("Dash Timer:" + this.timers.dashTimer.toFixed(2), this.x - GAME.camera.x - 45 * PARAMS.SCALE, this.y - GAME.camera.y + 12 * PARAMS.SCALE);
            // GAME.CTX.fillText("Climb Timer:" + this.timers.climbTimer.toFixed(2), this.x - GAME.camera.x - 45 * PARAMS.SCALE, this.y - GAME.camera.y + 6 * PARAMS.SCALE);
            GAME.CTX.fillText("Charges: " + Object.values(this.charges), this.x - GAME.camera.x + 14 * PARAMS.SCALE, this.y - GAME.camera.y - 16 * PARAMS.SCALE);
            GAME.CTX.fillText("Y Velocity:" + this.yVelocity.toFixed(2), this.x - GAME.camera.x + 18 * PARAMS.SCALE, this.y - GAME.camera.y - 9 * PARAMS.SCALE);
            GAME.CTX.fillText("Momentum:" + this.momentum, this.x - GAME.camera.x + 22 * PARAMS.SCALE, this.y - GAME.camera.y - 2 * PARAMS.SCALE);
            GAME.CTX.fillText("State: " + this.currentState.name, this.x - GAME.camera.x + 24 * PARAMS.SCALE, this.y - GAME.camera.y + 5 * PARAMS.SCALE);
            
            GAME.CTX.fillStyle = "aqua";
            GAME.CTX.fillText("Tile Collisions: " + this.tileCollisions, this.x - GAME.camera.x - 24 * PARAMS.SCALE, this.y - GAME.camera.y + -24 * PARAMS.SCALE);
            if (this.dashHitBox){
                GAME.CTX.strokeStyle = "green";
                GAME.CTX.strokeRect(this.dashHitBox.left - GAME.camera.x, this.dashHitBox.top - GAME.camera.y, this.dashHitBox.width, this.dashHitBox.height);
                GAME.CTX.font = "12px segoe ui";
                GAME.CTX.fillStyle = "white";
                GAME.CTX.fillText(this.constructor.name.toUpperCase() + ": x=" + this.x + " y=" + this.y, this.dashHitBox.left - GAME.camera.x, this.dashHitBox.bottom - GAME.camera.y + 4*PARAMS.SCALE);
            }
            if (this.posHitBox){
                GAME.CTX.strokeStyle = "blue";
                GAME.CTX.strokeRect(this.posHitBox.left - GAME.camera.x, this.posHitBox.top - GAME.camera.y, this.posHitBox.width, this.posHitBox.height);
                GAME.CTX.font = "12px segoe ui";
                GAME.CTX.fillStyle = "white";
                GAME.CTX.fillText(this.constructor.name.toUpperCase() + ": x=" + this.x + " y=" + this.y, this.posHitBox.left - GAME.camera.x, this.posHitBox.bottom - GAME.camera.y + 4*PARAMS.SCALE);
            }
        }
    }

    endOfCycleUpdates(){
        if (this.x == this.lastX) this.momentum = 0; // Reset momentum on stop
        if (this.y == this.lastY) this.yVelocity = 1 / PARAMS.SCALE; // Reset yVelocity on stop
        // if (this.timers.dashTimer > 1) this.canDash = true;
        super.endOfCycleUpdates();
    }

    collision(oldX, oldY){
        this.posHitBox = this.drawPositioningHitBox(
            oldX, oldY, this.x + this.hitbox.leftPad, this.y + this.hitbox.topPad, this.hitbox.width, this.hitbox.height
            );
        this.hitbox.updatePos(this.x, this.y);
        this.tileCollisions.length = 0; // empty array
        this.entityCollisions = this.posHitBox.getCollisions();

        this.entityCollisions.forEach(entity => { 
            if (entity.collideWithPlayer) {
                let direction = entity.collideWithPlayer();
                if (!direction) return;
                this.tileCollisions.push(direction)
            }
        });

        // this.tileCollisions = this.tileCollisions.filter(entity => {return entity instanceof Tile})
        // this.hitbox.updatePos(this.x, this.y);
        // Sorted Collision
        // this.entityCollisions.forEach(entity => { 
        //     entity.distanceFromPlayer = Math.abs(entity.hitbox.center - this.hitbox.center);
        // });
        // this.entityCollisions.sort((a,b) => {return a.distanceFromPlayer - b.distanceFromPlayer}).forEach(entity => { 
        //     if (entity.collideWithPlayer) this.tileCollisions.push(entity.collideWithPlayer()); 
        // });
    }

    /**
     * Function responsible for killing the current Slime entity and playing a camera animation as the slime is respawned.
     * @author Jasper Newkirk
     */
    kill() {
        if (this.isInvincible || !this.isAlive) return;
        this.isAlive = false;
        GAME.camera.deathScreen.swapTag("Died");
        GAME.entities.forEach((entity) => {if(entity.respawn) entity.respawn(); });
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
                this.yVelocity = 0;
                this.x = this.spawnX;
                this.y = this.spawnY;
                this.hitbox.updatePos(this.x, this.y);
                this.isAlive = true;
            }
        );

    }

    ////////////////////////
    // Movement Fucntions //
    ////////////////////////

    /**
     * Horizontal Movement - called by state functions.
     * @author Nathan Brown
     */
    moveX(moveSpeed, moveAcceleration = 0) {

        if (this.momentum * moveSpeed < 0) this.momentum /= 1.05;
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

    /**
     * Used to draw a hitbox containing all the space between the entity's old position and new one.
     * Help flag collision when moving at higher speeds so clipping doesn't occur.
     * @param {number} oldX - entity hitbox's old x position
     * @param {number} oldY - entity hitbox's old y position
     * @param {number} newX - entity hitbox's new x position
     * @param {number} newY - entity hitbox's new y position
     */
    drawPositioningHitBox(oldX, oldY, newX, newY, width, height){
        return new HitBox(
                Math.min(oldX, newX), Math.min(oldY, newY), 0, 0, 
                width + Math.abs(newX - oldX), height + Math.abs(newY - oldY)
            );
    }

    changeState(){
        let checkState = this.currentState.checkState();
        if (checkState) {
            this.currentState.end();
            this.currentState = checkState;
            this.currentState.start();
            this.currentState.behavior();
        }
    }
    
    initializeStates(){
        this.states = {
            idle : new State("Idle"),
            running: new State("Running"),
            jumping: new State("Jumping"),
            falling: new State("Falling"),
            dashing: new State("Dashing"),
            boosting: new State("Boosting"),
            climbing: new State("Climbing"),
            wallJumping: new State("Wall Jumping")
        };

        // IDLE //
        this.states.idle.start = () => {
            this.yVelocity = 1 / PARAMS.SCALE;
        };
        this.states.idle.behavior = () => {
            this.xDirection > 0 ? this.swapTag("Idle", true) : this.swapTag("IdleLeft", true);
            this.controlX();
            this.moveY();
            if (!CONTROLLER.A) this.canJump = true;
            if (!CONTROLLER.B && this.charges["Electric"] >= 1) this.canDash = true;
        };
        this.states.idle.setCheckState([
            {state: this.states.dashing, predicate: () => { return CONTROLLER.B && this.canDash }},
            {state: this.states.jumping, predicate: () => { return CONTROLLER.A && this.canJump }},
            {state: this.states.running, predicate: () => { return CONTROLLER.RIGHT || CONTROLLER.LEFT }},
            {state: this.states.falling, predicate: () => { return this.yVelocity > this.yFallThreshold }},
        ]);
        
        // RUNNING //
        this.states.running.start = () => {
            this.yVelocity = 1 / PARAMS.SCALE;
        };
        this.states.running.behavior = () => {
            this.xDirection > 0 ? this.tag = "Move" : this.tag = "MoveLeft";
            this.controlX();
            this.moveY();
            if (!CONTROLLER.A) this.canJump = true;
            if (!CONTROLLER.B && this.charges["Electric"] >= 1) this.canDash = true;
        }
        this.states.running.setCheckState([
            {state: this.states.dashing, predicate: () => { return CONTROLLER.B && this.canDash }},
            {state: this.states.jumping, predicate: () => { return CONTROLLER.A && this.canJump }},
            {state: this.states.idle, predicate: () => { return !(CONTROLLER.RIGHT || CONTROLLER.LEFT) }},
            {state: this.states.falling, predicate: () => { return this.yVelocity > this.yFallThreshold }},
        ])
        
        // JUMPING //
        this.states.jumping.start = () => {
            this.isJumping = true;
            this.yVelocity = this.jumpVelocity - Math.abs(this.momentum / this.jumpMomentumMod);
            this.canJump = false;
        };
        this.states.jumping.behavior = () => {
            this.xDirection > 0 ? this.tag = "JumpingAir" : this.tag = "JumpingAirLeft";
            this.controlX();
            this.moveY();
            if (!CONTROLLER.B && this.charges["Electric"] >= 1) this.canDash = true;
        }
        this.states.jumping.setCheckState([
            {state: this.states.dashing, predicate: () => { return CONTROLLER.B && this.canDash }},
            {state: this.states.falling, predicate: () => { return !CONTROLLER.A || this.yVelocity > 0 }},
        ]);
        
        // FALLING //
        this.states.falling.start = () => {
            this.yVelocity = 1 / PARAMS.SCALE;
        };
        this.states.falling.behavior = () => {
            this.xDirection > 0 ? this.tag = "Idle" : this.tag = "IdleLeft";
            this.controlX();
            this.moveY();
            if (!CONTROLLER.B && this.charges["Electric"] >= 1) this.canDash = true;
            if (!CONTROLLER.A && this.charges["Fire"] >= 1) this.canBoost = true;
        }
        this.states.falling.setCheckState([
            {state: this.states.dashing, predicate: () => { return CONTROLLER.B && this.canDash }},
            {state: this.states.boosting, predicate: () => { return CONTROLLER.A && this.canBoost }},
            {state: this.states.running, predicate: () => { return this.tileCollisions.includes("bottom") && (CONTROLLER.RIGHT || CONTROLLER.LEFT) }},
            {state: this.states.idle, predicate: () => { return this.tileCollisions.includes("bottom") }},
            {state: this.states.climbing, predicate: () => { return this.tileCollisions.includes("right") || this.tileCollisions.includes("left") }},
        ]);
        
        // DASHING //
        this.states.dashing.start = () => {
            ASSET_MANAGER.playAudio("./assets/audio/effect/dash" + Math.floor(Math.random()*4) + ".wav");
            this.charges["Electric"] = 0;
            this.canDash = false;
            this.yVelocity = 0;
            this.timers.dashTimer = 0;
            this.isInvincible = true;
            this.dashbeam.x = this.x;
            this.dashbeam.y = this.y;
            this.dashbeam.swapTag("Default", false);
        };
        this.states.dashing.behavior = () => {
            this.xDirection > 0 ? this.tag = "Dashing" : this.tag = "DashingLeft";
            if (this.timers.dashTimer <= this.dashTimeout) {
                if (this.xDirection > 0){
                    this.dashHitBox = new HitBox(this.hitbox.right, this.hitbox.top, 0, 1 * PARAMS.SCALE, this.dashSpeed * PARAMS.SCALE * GAME.tickMod, this.hitbox.height - 2 * PARAMS.SCALE);
                    let dashCollisions = this.dashHitBox.getCollisions();
                    dashCollisions = dashCollisions.filter((entity) => {return entity.constructor.name == "Tile"});
                    if (dashCollisions.length > 0) {
                        this.x = dashCollisions.reduce((a,b) => {return a.hitbox.left < b.hitbox.left ? a : b}).hitbox.left - this.hitbox.width - this.hitbox.leftPad - 1;
                        this.hitbox.updatePos(this.x,this.y);
                        return;
                    }
                } else {
                    this.dashHitBox = new HitBox(this.hitbox.left - this.dashSpeed * PARAMS.SCALE * GAME.tickMod, this.hitbox.top, 0, 1 * PARAMS.SCALE, this.dashSpeed * PARAMS.SCALE * GAME.tickMod, this.hitbox.height - 2 * PARAMS.SCALE);
                    let dashCollisions = this.dashHitBox.getCollisions();
                    dashCollisions = dashCollisions.filter((entity) => {return entity.constructor.name == "Tile"});
                    if (dashCollisions.length > 0) {
                        this.x = dashCollisions.reduce((a,b) => {return a.hitbox.left > b.hitbox.left ? a : b}).hitbox.right - this.hitbox.leftPad + 1;
                        this.hitbox.updatePos(this.x,this.y);
                        return;
                    }
                }
                this.moveX(this.dashSpeed * this.xDirection);
            }
        }
        this.states.dashing.setCheckState([
            {state: this.states.running, predicate: () => { 
                return this.timers.dashTimer > this.dashTimeout && this.tileCollisions.includes("bottom") && (CONTROLLER.RIGHT || CONTROLLER.LEFT)
            }},
            {state: this.states.idle, predicate: () => { return this.timers.dashTimer > this.dashTimeout && this.tileCollisions.includes("bottom") }},
            {state: this.states.falling, predicate: () => { return this.timers.dashTimer > this.dashTimeout }},
            {state: this.states.climbing, predicate: () => { return this.tileCollisions.includes("left") || this.tileCollisions.includes("right") }},
        ]);
        this.states.dashing.end = () =>{
            this.isInvincible = false;
        }

        // BOOSTING //
        this.states.boosting.start = () =>{
            ASSET_MANAGER.playAudio("./assets/audio/effect/boost" + Math.floor(Math.random()*4) + ".wav");
            this.charges["Fire"] = 0;
            this.canBoost = false;
            this.timers.boostTimer = 0;
            // this.isInvincible = true;
            this.yVelocity = this.jumpVelocity - Math.abs(this.momentum / this.jumpMomentumMod);
        };
        this.states.boosting.behavior = () =>{
            this.xDirection > 0 ? this.tag = "JumpingAir" : this.tag = "JumpingAirLeft";
            this.controlX();
            this.moveY(this.yVelocity);
        };
        this.states.boosting.setCheckState([
            {state: this.states.dashing, predicate: () => { return CONTROLLER.B && this.canDash }},
            {state: this.states.falling, predicate: () => { return !CONTROLLER.A || this.yVelocity > 0 }},
        ]);
        this.states.boosting.end = () =>{
            // this.isInvincible = false;
        }

        // CLIMBING //
        this.states.climbing.start = () =>{
            this.yVelocity = 0;
            this.timers.climbTimer = 0;
            this.slideSpeed = 0;
        };
        this.states.climbing.behavior = () =>{
            this.xDirection > 0 ? this.tag = "Climbing" : this.tag = "ClimbingLeft";
            this.moveX(this.xDirection);
            this.moveY(this.slideSpeed);
            if (this.timers.climbTimer > 0.1 && this.slideSpeed < this.maxYVelocity) this.slideSpeed = this.slideSpeed + (PARAMS.GRAVITY / 2) * GAME.tickMod;
            if (!CONTROLLER.A) this.canJump = true;
            if (!CONTROLLER.B && this.charges["Electric"] >= 1) this.canDash = true;
        };
        this.states.climbing.setCheckState([
            {state: this.states.running, predicate: () => { return this.tileCollisions.includes("bottom") && (CONTROLLER.RIGHT || CONTROLLER.LEFT) }},
            {state: this.states.idle, predicate: () => { return this.tileCollisions.includes("bottom") }},
            {state: this.states.wallJumping, predicate: () => { return CONTROLLER.A && this.canJump }},
            {state: this.states.falling, predicate: () => { 
                return !((this.xDirection > 0 && CONTROLLER.RIGHT) || (this.xDirection <= 0 && CONTROLLER.LEFT)) || 
                    !(this.tileCollisions.includes("left") || this.tileCollisions.includes("right"))
            }},
        ]);

        // WALL JUMPING //
        this.states.wallJumping.start = () =>{
            this.xDirection = this.xDirection > 0 ? -1 : 1;
            this.momentum = this.maxMom * this.xDirection;
            this.timers.jumpTimer = 0;
            this.canJump = false;
            this.isJumping = true;
            this.yVelocity = this.jumpVelocity * 0.6;
        };
        this.states.wallJumping.behavior = () =>{
            this.xDirection > 0 ? this.tag = "JumpingAir" : this.tag = "JumpingAirLeft";
            this.moveX(this.speed * 0.75 * this.xDirection);
            this.moveY();
            if (!CONTROLLER.B && this.charges["Electric"] >= 1) this.canDash = true;
        };
        this.states.wallJumping.setCheckState([
            // {state: this.states.jumping, predicate: () => { return this.timers.jumpTimer > this.wallJumpTimeout * 2 && CONTROLLER.A }},
            {state: this.states.falling, predicate: () => { return (!CONTROLLER.A && this.timers.jumpTimer > this.wallJumpTimeout) || this.timers.jumpTimer > this.wallJumpTimeout * 1.5}},
            {state: this.states.climbing, predicate: () => { return (this.direction <= 0 && this.tileCollisions.includes("left")) || (this.direction > 0 && this.tileCollisions.includes("right")) }},
        ]);
    }

    // idleStateCheck(){
    //     let checkState = this.currentState.checkState();
    //     if (checkState) {
    //         this.currentState = checkState;
    //         this.behavior = this.currentState.behavior;
    //         this.currentState.start();
    //         this.behavior(true);
    //     }
    //     // console.log(this.state);
    // }

    /////////////////////
    // State Behaviors //
    /////////////////////

    // /**
    //  * Slime makes itself move on the x axis.
    //  * @author Nathan Brown
    //  */
    // idleBehavior (changingState = false){

    //     if (changingState) this.changeStateCheck = this.idleStateCheck;

    //     // Perform 'idle' behavior
    //     this.states.idle.behavior();

    // }

    // startIdle(){
    //     // this.yVelocity = 1 / PARAMS.SCALE;
    //     this.states.idle.start();
    // }

    // /**
    //  * Slime is on the ground, moving and accelerating
    //  * @author Nathan Brown
    //  */
    // runningBehavior (changingState = false){

    //     if (changingState) this.changeStateCheck = () => {

    //         let checkState = this.currentState.checkState();
    //         if (checkState) {
    //             this.currentState = checkState;
    //             this.behavior = this.currentState.behavior;
    //             this.currentState.start();
    //             this.behavior(true);
    //         }
    //         // console.log(this.state);

    //     };

    //     // Perform 'running' behavior
    //     this.xDirection > 0 ? this.tag = "Move" : this.tag = "MoveLeft";
    //     this.controlX();
    //     this.moveY();
    //     if (!CONTROLLER.A) this.canJump = true;
    //     if (!CONTROLLER.B && this.charges["Electric"] >= 1) this.canDash = true;

    // }

    // /**
    //  * Gets the slime into the air when A is pressed. Hold A for a longer jump. Uses a variety of state 
    //  * flags to determine when the slime can jump. 
    //  * @author Nathan Brown
    //  */
    // jumpingBehavior (changingState = false){

    //     if (changingState) this.changeStateCheck = () => {

    //         let checkState = this.currentState.checkState();
    //         if (checkState) {
    //             this.currentState = checkState;
    //             this.behavior = this.currentState.behavior;
    //             this.currentState.start();
    //             this.behavior(true);
    //         }
    //         // console.log(this.state);

    //     };
        
    //     // Perform 'jumping' behaviors
    //     this.xDirection > 0 ? this.tag = "JumpingAir" : this.tag = "JumpingAirLeft";
    //     this.controlX();
    //     this.moveY();
    //     if (!CONTROLLER.B && this.charges["Electric"] >= 1) this.canDash = true;
    
    // }

    // /**
    //  * Slime falls downward until it collides with a tile.
    //  * @author Nathan Brown
    //  */
    // fallingBehavior (changingState = false){

    //     if (changingState) this.changeStateCheck = () => {

    //         // Check dashing
    //         if (CONTROLLER.B && this.canDash) {
    //             this.startDashing();
    //             this.behavior(true);
    //             return;
    //         }

    //         // Check boosting
    //         if(CONTROLLER.A && this.canBoost) {
    //             this.charges["Fire"] = 0;
    //             this.canBoost = false;
    //             this.timers.boostTimer = 0;
    //             this.isInvincible = true;
    //             this.yVelocity = this.jumpVelocity - Math.abs(this.momentum / this.jumpMomentumMod);
    //             this.behavior = this.boostingBehavior;
    //             this.behavior(true);
    //             return;
    //         }

    //         let landed = this.tileCollisions.includes("bottom");

    //         // Check running
    //         if (landed && (CONTROLLER.RIGHT || CONTROLLER.LEFT)){
    //             this.yVelocity = 1 / PARAMS.SCALE;
    //             this.behavior = this.runningBehavior;
    //             this.behavior(true);
    //             return;
    //         }
            
    //         // Check idle
    //         if (landed){
    //             this.startIdle();
    //             this.behavior = this.idleBehavior;
    //             this.behavior(true);
    //             return;
    //         }

    //         // Check climbing
    //         if (this.tileCollisions.includes("right") || this.tileCollisions.includes("left")){
    //             this.yVelocity = 0;
    //             this.timers.climbTimer = 0;
    //             this.slideSpeed = 0;
    //             this.behavior = this.climbingBehavior;
    //             this.behavior(true);
    //             return;
    //         }

    //     };

    //     // Perform 'falling' behaviors
    //     this.xDirection > 0 ? this.tag = "Idle" : this.tag = "IdleLeft";
    //     this.controlX();
    //     this.moveY();
    //     if (!CONTROLLER.B && this.charges["Electric"] >= 1) this.canDash = true;
    //     if (!CONTROLLER.A && this.charges["Fire"] >= 1) this.canBoost = true;

    // }

    // /**
    //  * Slime dashes forward rapidly. 
    //  * Plans: 
    //  *          Kill enemies when colliding with the dashing slime. 
    //  *          Set momentum to 0. 
    //  *          Implement line-line checking for right side tile collision.
    //  * @author Nathan Brown
    //  */
    // dashingBehavior (changingState = false){

    //     if (changingState) this.changeStateCheck = () => {

    //         if (this.timers.dashTimer > this.dashTimeout){
    //             this.isInvincible = false;
    //             if (this.tileCollisions.includes("bottom")){
    //                 // Check running
    //                 if (CONTROLLER.RIGHT || CONTROLLER.LEFT) this.behavior = this.runningBehavior;
    //                 // Check idle
    //                 else this.behavior = this.idleBehavior;
    //                 this.startIdle();
    //                 this.behavior(true);
    //                 return;
    //             }
    //             // Check falling
    //             this.behavior = this.fallingBehavior;
    //             this.behavior(true);
    //             return;

    //         }

    //         // Check climbing
    //         if (this.tileCollisions.includes("left") || this.tileCollisions.includes("right")){
    //             this.isInvincible = false;
    //             this.yVelocity = 0;
    //             this.timers.climbTimer = 0;
    //             this.slideSpeed = 0;
    //             this.behavior = this.climbingBehavior;
    //             this.behavior(true);
    //             return;
    //         }

    //     }
        
    //     // Perform behavior for dashing
    //     this.xDirection > 0 ? this.tag = "Dashing" : this.tag = "DashingLeft";
    //     if (this.timers.dashTimer <= this.dashTimeout) {
    //         if (this.xDirection > 0){
    //             this.dashHitBox = new HitBox(this.hitbox.right, this.hitbox.top, 0, 1 * PARAMS.SCALE, this.dashSpeed * PARAMS.SCALE * GAME.tickMod, this.hitbox.height - 2 * PARAMS.SCALE);
    //             let dashCollisions = this.dashHitBox.getCollisions();
    //             dashCollisions = dashCollisions.filter((entity) => {return entity.constructor.name == "Tile"});
    //             if (dashCollisions.length > 0) {
    //                 this.x = dashCollisions.reduce((a,b) => {return a.hitbox.left < b.hitbox.left ? a : b}).hitbox.left - this.hitbox.width - this.hitbox.leftPad - 1;
    //                 this.hitbox.updatePos(this.x,this.y);
    //                 return;
    //             }
    //         } else {
    //             this.dashHitBox = new HitBox(this.hitbox.left - this.dashSpeed * PARAMS.SCALE * GAME.tickMod, this.hitbox.top, 0, 1 * PARAMS.SCALE, this.dashSpeed * PARAMS.SCALE * GAME.tickMod, this.hitbox.height - 2 * PARAMS.SCALE);
    //             let dashCollisions = this.dashHitBox.getCollisions();
    //             dashCollisions = dashCollisions.filter((entity) => {return entity.constructor.name == "Tile"});
    //             if (dashCollisions.length > 0) {
    //                 this.x = dashCollisions.reduce((a,b) => {return a.hitbox.left > b.hitbox.left ? a : b}).hitbox.right - this.hitbox.leftPad + 1;
    //                 this.hitbox.updatePos(this.x,this.y);
    //                 return;
    //             }
    //         }
    //         this.moveX(this.dashSpeed * this.xDirection);
    //     }

    // }

    // /**
    //  * Call once at the start of a state
    //  */
    // startDashing(){
    //     this.charges["Electric"] = 0;
    //     this.canDash = false;
    //     this.yVelocity = 0;
    //     this.timers.dashTimer = 0;
    //     this.isInvincible = true;
    //     this.behavior = this.dashingBehavior;
    //     this.dashbeam.x = this.x;
    //     this.dashbeam.y = this.y;
    //     this.dashbeam.swapTag("Default", false);
    // }

    // boostingBehavior (changingState = false) {
        
    //     if (changingState) this.changeStateCheck = () => {

    //         // Check falling
    //         if (this.yVelocity > 0){
    //             this.isJumping = false;
    //             this.isInvincible = false;
    //             this.yVelocity = Math.max(this.yVelocity, -2 / PARAMS.SCALE);
    //             this.behavior = this.fallingBehavior;
    //             this.behavior(true);
    //             return;
    //         }

    //         //check climbing
    //         if (this.tileCollisions.includes("left") || this.tileCollisions.includes("right")){
    //             this.isInvincible = false;
    //             this.yVelocity = 0;
    //             this.timers.climbTimer = 0;
    //             this.slideSpeed = 0;
    //             this.behavior = this.climbingBehavior;
    //             this.behavior(true);
    //             return;
    //         }
    //     };

    //     // Perform behavior for boosting
    //     this.xDirection > 0 ? this.tag = "JumpingAir" : this.tag = "JumpingAirLeft";
    //     this.controlX();
    //     this.moveY(this.yVelocity);
        
    // }

    // /**
    //  * Slime sticks and slides on the wall and can jump off of it
    //  * @author Nathan Brown
    //  */
    // climbingBehavior (changingState = false){

    //     if (changingState) this.changeStateCheck = () => {

    //         let landed = this.tileCollisions.includes("bottom");

    //         // Check running
    //         if (landed && (CONTROLLER.RIGHT || CONTROLLER.LEFT)){
    //             this.yVelocity = 1 / PARAMS.SCALE;
    //             this.behavior = this.runningBehavior;
    //             this.behavior(true);
    //             return;
    //         }
            
    //         // Check idle
    //         if (landed){
    //             this.startIdle();
    //             this.behavior = this.idleBehavior;
    //             this.behavior(true);
    //             return;
    //         }
            
    //         // Check wallJumping
    //         if (CONTROLLER.A && this.canJump){
    //             this.xDirection = this.xDirection > 0 ? -1 : 1;
    //             this.momentum = this.maxMom * this.xDirection;
    //             this.timers.jumpTimer = 0;
    //             this.canJump = false;
    //             this.behavior = this.wallJumpingBehavior;
    //             this.behavior(true);
    //             return;
    //         }
            
    //         // Check falling
    //         if (!((this.xDirection > 0 && CONTROLLER.RIGHT) || (this.xDirection <= 0 && CONTROLLER.LEFT)) || 
    //                 !(this.tileCollisions.includes("left") || this.tileCollisions.includes("right"))){
    //             this.behavior = this.fallingBehavior;
    //             this.behavior(true);
    //             return;
    //         }

    //     };

    //     // Perform 'climbing' behaviors
    //     this.xDirection > 0 ? this.tag = "Climbing" : this.tag = "ClimbingLeft";
    //     this.moveX(this.xDirection);
    //     this.moveY(this.slideSpeed);
    //     if (this.timers.climbTimer > 0.1 && this.slideSpeed < this.maxYVelocity) this.slideSpeed = this.slideSpeed + (PARAMS.GRAVITY / 2) * GAME.tickMod;
    //     if (!CONTROLLER.A) this.canJump = true;
    //     if (!CONTROLLER.B && this.charges["Electric"] >= 1) this.canDash = true;

    // }

    // /**
    //  * Slime jumps off the wall
    //  * @author Nathan Brown
    //  */
    // wallJumpingBehavior (changingState = false){

    //     if (changingState) this.changeStateCheck = () => {

    //         // Check jumping
    //         if (this.timers.jumpTimer > this.wallJumpTimeout * 2 && CONTROLLER.A){
    //             this.behavior = this.jumpingBehavior;
    //             this.behavior(true);
    //             return;
    //         }


    //         // Check falling
    //         if ((this.timers.jumpTimer > this.wallJumpTimeout && !CONTROLLER.A) || 
    //                 (this.direction > 0 && this.tileCollisions.includes("right")) || 
    //                 (this.direction <= 0 && this.tileCollisions.includes("left"))){
    //             this.isJumping = false;
    //             this.yVelocity = Math.max(this.yVelocity, -2 / PARAMS.SCALE);
    //             this.behavior = this.fallingBehavior;
    //             this.behavior(true);
    //             return;
    //         }
            
    //         // Check starting of wallJumping
    //         if(!this.isJumping){
    //             this.isJumping = true;
    //             this.yVelocity = this.jumpVelocity * 0.6;
    //         }

    //     };

    //     // Perform 'wallJumping' behaviors
    //     this.xDirection > 0 ? this.tag = "JumpingAir" : this.tag = "JumpingAirLeft";
    //     this.moveX(this.speed * 0.75 * this.xDirection);
    //     this.moveY();
    //     if (!CONTROLLER.B && this.charges["Electric"] >= 1) this.canDash = true;

    // }

}

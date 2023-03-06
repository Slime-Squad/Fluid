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
        this.boostTimeout = 0.15;
        this.dashSpeed = 5;
        this.dashTimeout = 0.2;
        this.floatTimeout = 0.15;
        this.slideSpeed = 0;
        this.wallJumpTimeout = 0.2;
        this.yFallThreshold = (1 / PARAMS.SCALE) * 12;
        this.jumpVelocity = -3.4;
        this.jumpMomentumMod = 1.8;
        this.lastX = this.x;
        this.lastY = this.y;
        
        // Flags
        this.isAlive = true;
        this.isInvincible = false;
        this.canJump = true;
        this.canDash = false;
        this.canBoost = false;
        this.canPressHome = true;
        this.canPressLTrig = true;

        // Powers
        // this.dashbeam = new Ornament("./assets/graphics/characters/dashbeam", "Invisible", this.x + 5 * PARAMS.SCALE, this.y, false);
        this.boostBlast = new Ornament("./assets/graphics/characters/boost", "Invisible", this.x, this.y, false);
        this.boostBlast.hitbox = new HitBox(-10000, -10000, 2*PARAMS.SCALE, 18*PARAMS.SCALE, 12*PARAMS.SCALE, 35*PARAMS.SCALE);

        this.indicatorElectric = new Ornament("./assets/graphics/characters/indicator", "Electric", this.x, this.y, true);
        this.indicatorFire = new Ornament("./assets/graphics/characters/indicator", "Fire", this.x, this.y, true);
        this.indicatorIce = new Ornament("./assets/graphics/item/charge", "Ice", this.x, this.y, true);
        this.indicatorEarth = new Ornament("./assets/graphics/item/charge", "Earth", this.x, this.y, true);
        this.indicators = [this.indicatorElectric, this.indicatorFire, this.indicatorIce, this.indicatorEarth];
        this.indicators.forEach(indicator => { indicator.tag = "Invisible" });

        // Charges
        this.charges = {
            "Electric" : 0,
            "Fire" : 0,
            "Ice" : 0,
            "Earth" : 0,
        }

        // Timers
        this.timers = {
            climbTimer : 0,
            dashTimer : 0,
            floatTimer : 0,
            wallJumpTimer : 0,
        }
    };

    update() {

        this.startOfCycleUpdates();

        let oldX = this.hitbox.left;
        let oldY = this.hitbox.top;
        this.changeState();
        this.currentState.behavior();
        
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

    startOfCycleUpdates(){
        if (this.y > 12000 || CONTROLLER.BACK) this.kill();
        
        // Set BGM
        if (this.canPressLTrig && CONTROLLER.LTRIG){
            this.canPressLTrig = false;
            ASSET_MANAGER.toggleBackgroundMusic();
        } else if (!this.canPressLTrig && !CONTROLLER.LTRIG) this.canPressLTrig = true;

        // Refresh Charges (debug)
        if (PARAMS.DEBUG && CONTROLLER.RTRIG) Object.keys(this.charges).forEach(charge => this.pickUpCharge(charge));

        // Set Debug
        if (this.canPressHome && CONTROLLER.HOME){
            this.canPressHome = false;
            PARAMS.DEBUG = !PARAMS.DEBUG;
        } else if (!this.canPressHome && !CONTROLLER.HOME) this.canPressHome = true;
    }
    
    endOfCycleUpdates(){
        if (this.x == this.lastX) this.momentum = 0; // Reset momentum on stop
        if (this.y == this.lastY) this.yVelocity = 1 / PARAMS.SCALE; // Reset yVelocity on stop
        // if (this.timers.dashTimer > 1) this.canDash = true;
        this.updateIndicators();
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
                this.tileCollisions.push(direction);
            }
        });
    }

    /**
     * Function responsible for killing the current Slime entity and playing a camera animation as the slime is respawned.
     * @author Jasper Newkirk, Nathan Brown
     */
    kill() {
        if (this.isInvincible || !this.isAlive) return;
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
                this.yVelocity = 0;
                this.x = this.spawnX;
                this.y = this.spawnY;
                this.hitbox.updatePos(this.x, this.y);
                this.isAlive = true;
                Object.keys(this.charges).forEach(tag => { this.useUpCharge(tag) });
                this.canDash = false;
                this.canBoost = false;
            }
        );
        GAME.entities.forEach((entity) => {if(entity.respawn) entity.respawn(); });

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
    moveY(moveSpeed = this.yVelocity, gravityMod = 1){

        this.y += moveSpeed * PARAMS.SCALE * GAME.tickMod;

        // Gravity
        if (this.yVelocity <= this.maxYVelocity){
            let hangtime = this.yVelocity < 0 ? 0.7 : 1;
            this.yVelocity = moveSpeed + PARAMS.GRAVITY * gravityMod * GAME.tickMod * hangtime;
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
            this.deccelerate();
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

    pickUpCharge(tag){
        if (this.charges[tag] == 1) return;
        this.charges[tag] = 1;
        //this.charges[tag] = Math.min(this.charges[tag] + 1, 1);
        switch(tag){
            case "Electric" :
                this.indicatorElectric.swapTag("Electric", true);
                break;
            case "Fire" :
                this.indicatorFire.swapTag("Fire", true);
                break;
            case "Ice" :
                this.indicatorIce.swapTag("Ice", false);
                break;
            case "Earth" :
                this.indicatorEarth.swapTag("Earth", false);
                break;                
        }
    }

    useUpCharge(tag){
        this.charges[tag] = 0; // Math.max(this.charges[tag] - 1, 0);
        switch(tag){
            case "Electric" :
                this.indicatorElectric.swapTag("Invisible", false);
                break;
            case "Fire" :
                this.indicatorFire.swapTag("Invisible", false);
                break;
            case "Ice" :
                this.indicatorIce.swapTag("Invisible", false);
                break;
            case "Earth" :
                this.indicatorEarth.swapTag("Invisible", false);
                break;
        }
    }

    updateIndicators(){
        this.indicators.forEach(indicator => {
            if (indicator.tag == "Invisible" || indicator.tag == "Earth" || indicator.tag == "Ice") return;
            indicator.x = this.x;
            indicator.y = this.y;
            indicator.tag = this.xDirection > 0 ? indicator.originalTag : indicator.originalTag + "Left";
        })
        this.indicatorIce.x = this.x + PARAMS.SCALE * 8;
        this.indicatorIce.y = this.y + PARAMS.SCALE * 2;
        this.indicatorEarth.x = this.x + PARAMS.SCALE * 12;
        this.indicatorEarth.y = this.y + PARAMS.SCALE * 8;
    }

    ///////////////////
    // STATE MACHINE //
    ///////////////////
    
    initializeStates(){
        this.states = {
            idle : new State("Idle"),
            running: new State("Running"),
            jumping: new State("Jumping"),
            falling: new State("Falling"),
            dashing: new State("Dashing"),
            floating: new State("Floating"),
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
            if (!CONTROLLER.X && this.charges["Electric"] >= 1) this.canDash = true;
        };
        this.states.idle.setTransitions([
            {state: this.states.dashing, predicate: () => { return CONTROLLER.X && this.canDash }},
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
            if (!CONTROLLER.X && this.charges["Electric"] >= 1) this.canDash = true;
        };
        this.states.running.setTransitions([
            {state: this.states.dashing, predicate: () => { return CONTROLLER.X && this.canDash }},
            {state: this.states.jumping, predicate: () => { return CONTROLLER.A && this.canJump }},
            {state: this.states.idle, predicate: () => { return !(CONTROLLER.RIGHT || CONTROLLER.LEFT) }},
            {state: this.states.falling, predicate: () => { return this.yVelocity > this.yFallThreshold }},
        ]);
        
        // JUMPING //
        this.states.jumping.start = () => {
            this.yVelocity = this.jumpVelocity - Math.abs(this.momentum / this.jumpMomentumMod);
            this.canJump = false;
            this.canBoost = false;
        };
        this.states.jumping.behavior = () => {
            this.xDirection > 0 ? this.tag = "JumpingAir" : this.tag = "JumpingAirLeft";
            this.controlX();
            this.moveY();
            if (!CONTROLLER.X && this.charges["Electric"] >= 1) this.canDash = true;
        };
        this.states.jumping.end = () => {
            this.yVelocity = 0;
        }
        this.states.jumping.setTransitions([
            {state: this.states.dashing, predicate: () => { return CONTROLLER.X && this.canDash }},
            {state: this.states.falling, predicate: () => { return !CONTROLLER.A || this.yVelocity >= 0 }},
        ]);
        
        // FALLING //
        this.states.falling.behavior = () => {
            this.xDirection > 0 ? this.tag = "Falling" : this.tag = "FallingLeft";
            this.controlX();
            this.moveY();
            if (!CONTROLLER.X && this.charges["Electric"] >= 1) this.canDash = true;
            if (!CONTROLLER.A && this.charges["Fire"] >= 1) this.canBoost = true;
        };
        this.states.falling.setTransitions([
            {state: this.states.dashing, predicate: () => { return CONTROLLER.X && this.canDash }},
            {state: this.states.boosting, predicate: () => { return CONTROLLER.A && this.canBoost }},
            {state: this.states.running, predicate: () => { return this.tileCollisions.includes("bottom") && (CONTROLLER.RIGHT || CONTROLLER.LEFT) }},
            {state: this.states.idle, predicate: () => { return this.tileCollisions.includes("bottom") }},
            {state: this.states.climbing, predicate: () => { return this.tileCollisions.includes("right") || this.tileCollisions.includes("left") }},
        ]);
        
        // DASHING //
        this.states.dashing.start = () => {
            ASSET_MANAGER.playAudio("./assets/audio/effect/dash" + Math.floor(Math.random()*4) + ".wav");
            this.useUpCharge("Electric");
            this.canDash = false;
            this.yVelocity = 0;
            this.timers.dashTimer = 0;
            this.isInvincible = true;
            // this.dashbeam.x = this.hitbox.right;
            // this.dashbeam.y = this.y;
            // this.dashbeam.swapTag("Default", false);
        };
        this.states.dashing.behavior = () => {
            this.xDirection > 0 ? this.tag = "Dashing" : this.tag = "DashingLeft";
            if (this.timers.dashTimer <= this.dashTimeout) {
                if (this.xDirection > 0) {
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
        };
        this.states.dashing.end = () =>{
            this.isInvincible = false;
        };
        this.states.dashing.setTransitions([
            {state: this.states.running, predicate: () => { 
                return this.timers.dashTimer > this.dashTimeout && this.tileCollisions.includes("bottom") && (CONTROLLER.RIGHT || CONTROLLER.LEFT)
            }},
            {state: this.states.idle, predicate: () => { return this.timers.dashTimer > this.dashTimeout && this.tileCollisions.includes("bottom") }},
            {state: this.states.climbing, predicate: () => { return this.tileCollisions.includes("left") || this.tileCollisions.includes("right") }},
            {state: this.states.floating, predicate: () => { return this.timers.dashTimer > this.dashTimeout }},
        ]);
        
        // FLOATING //
        this.states.floating.start = () => {
            this.yVelocity = 0;
            this.timers.floatTimer = 0;
        };
        this.states.floating.behavior = () => {
            this.xDirection > 0 ? this.tag = "Floating" : this.tag = "FloatingLeft";
            this.controlX();
            this.moveY(0, 0);
            if (!CONTROLLER.X && this.charges["Electric"] >= 1) this.canDash = true;
            if (!CONTROLLER.A && this.charges["Fire"] >= 1) this.canBoost = true;
        };
        this.states.floating.setTransitions([
            {state: this.states.dashing, predicate: () => { return CONTROLLER.X && this.canDash }},
            {state: this.states.boosting, predicate: () => { return CONTROLLER.A && this.canBoost }},
            {state: this.states.running, predicate: () => { return this.tileCollisions.includes("bottom") && (CONTROLLER.RIGHT || CONTROLLER.LEFT) }},
            {state: this.states.idle, predicate: () => { return this.tileCollisions.includes("bottom") }},
            {state: this.states.climbing, predicate: () => { return this.tileCollisions.includes("right") || this.tileCollisions.includes("left") }},
            {state: this.states.falling, predicate: () => { return this.timers.floatTimer > this.floatTimeout }},
        ]);

        // BOOSTING //
        this.states.boosting.start = () =>{
            ASSET_MANAGER.playAudio("./assets/audio/effect/boost" + Math.floor(Math.random()*4) + ".wav");
            this.useUpCharge("Fire");
            this.yVelocity = this.jumpVelocity - Math.abs(this.momentum / this.jumpMomentumMod);
            this.canBoost = false;
            this.canJump = false;
            this.boostBlast.x = this.x;
            this.boostBlast.y = this.hitbox.bottom - PARAMS.SCALE * 18;
            this.boostBlast.hitbox.updatePos(this.boostBlast.x, this.boostBlast.y)
            this.xDirection > 0 ? this.boostBlast.swapTag("Default", false) : this.boostBlast.swapTag("DefaultLeft", false);
            this.boostBlast.hitbox.getCollisions().filter(entity => { 
                return GAME.killableEntities.includes(entity.constructor.name) 
            }).forEach(killableEntity => {killableEntity.kill()});
        };
        this.states.boosting.behavior = () =>{
            this.xDirection > 0 ? this.tag = "JumpingAir" : this.tag = "JumpingAirLeft";
            this.controlX();
            this.moveY();
            // this.boostBlast.x = this.x;
            // this.boostBlast.y = this.hitbox.bottom; - 2 * PARAMS.SCALE;
            if (!CONTROLLER.X && this.charges["Electric"] >= 1) this.canDash = true;
        };
        this.states.boosting.end = () =>{
            this.yVelocity = 0;
            // this.boostBlast.swapTag("Invisible", false);
        };
        this.states.boosting.setTransitions([
            {state: this.states.dashing, predicate: () => { return CONTROLLER.X && this.canDash }},
            {state: this.states.falling, predicate: () => { return !CONTROLLER.A || this.yVelocity > 0 }},
        ]);

        // CLIMBING //
        this.states.climbing.start = () =>{
            this.yVelocity = 0;
            this.timers.climbTimer = 0;
            this.slideSpeed = 0;
        };
        this.states.climbing.behavior = () =>{
            this.xDirection > 0 ? this.tag = "Climbing" : this.tag = "ClimbingLeft";
            this.moveX(this.xDirection);
            this.moveY(this.slideSpeed, 0);
            if (this.timers.climbTimer > 0.1 && this.slideSpeed < this.maxYVelocity) this.slideSpeed = this.slideSpeed + (PARAMS.GRAVITY / 2) * GAME.tickMod;
            if (!CONTROLLER.A) this.canJump = true;
            if (!CONTROLLER.X && this.charges["Electric"] >= 1) this.canDash = true;
        };
        this.states.climbing.setTransitions([
            {state: this.states.running, predicate: () => { return this.tileCollisions.includes("bottom") && (CONTROLLER.RIGHT || CONTROLLER.LEFT) }},
            {state: this.states.idle, predicate: () => { return this.tileCollisions.includes("bottom") }},
            {state: this.states.wallJumping, predicate: () => { return CONTROLLER.A && this.canJump }},
            {state: this.states.falling, predicate: () => { 
                return !((this.xDirection > 0 && CONTROLLER.RIGHT) || (this.xDirection <= 0 && CONTROLLER.LEFT)) || 
                    !(this.tileCollisions.includes("left") || this.tileCollisions.includes("right"))
            }},
        ]);

        // WALL JUMPING //
        this.states.wallJumping.start = () => {
            this.xDirection = this.xDirection > 0 ? -1 : 1;
            this.momentum = this.maxMom * this.xDirection;
            this.timers.wallJumpTimer = 0;
            this.canJump = false;
            this.canBoost = false;
            this.yVelocity = this.jumpVelocity * 0.6;
        };
        this.states.wallJumping.behavior = () => {
            this.xDirection > 0 ? this.tag = "JumpingAir" : this.tag = "JumpingAirLeft";
            this.moveX(this.speed * 0.75 * this.xDirection);
            this.moveY();
            if (!CONTROLLER.X && this.charges["Electric"] >= 1) this.canDash = true;
        };
        this.states.wallJumping.setTransitions([
            // {state: this.states.jumping, predicate: () => { return this.timers.jumpTimer > this.wallJumpTimeout * 2 && CONTROLLER.A }},
            {state: this.states.falling, predicate: () => { return (!CONTROLLER.A && this.timers.wallJumpTimer > this.wallJumpTimeout) || this.timers.wallJumpTimer > this.wallJumpTimeout * 1.5}},
            {state: this.states.climbing, predicate: () => { return (this.direction <= 0 && this.tileCollisions.includes("left")) || (this.direction > 0 && this.tileCollisions.includes("right")) }},
        ]);
    }

}

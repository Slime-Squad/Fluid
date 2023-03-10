/**
 * Two-legged running enemy that tries to eat Slime.
 * @author Nathan Brown
 */
class Tabemasu extends AnimatedEntity {
    /**
     * Creates a new instance of a tabemasu.
     * @param {number} x The x-coordinate associated with the top-left corner of the sprite on the canvas.
     * @param {number} y The y-coordinate associated with the top-left corner of the sprite on the canvas.
     * @param {boolean} loop Whether the sprite's animation loops over again, after having finished playing once.
     * @param {number} xDirection 1 for facing right, -1 for left
     */
    constructor(tag, x, y, loop = true) {
        super("./assets/graphics/characters/tabemasu", tag, x, y, loop);
        this.hitbox = new HitBox(x, y, 3*PARAMS.SCALE, 7 * PARAMS.SCALE , 28*PARAMS.SCALE, 28*PARAMS.SCALE);

        // Movement
        this.speed = 1.1;
        this.momentum = 0;
        this.maxMom = this.speed * 0.8;
        this.acceleration = this.maxMom / 20;
        this.decceleration = this.maxMom / 60;
        this.yVelocity = 0;
        this.maxYVelocity = 6;
        this.xDirection = this.tag == "Idle" ? 1 : -1;
        this.xDirectionDefault = this.xDirection;
        this.distanceFromSlime = {x: 1000, y: 1000}
        this.trackDistance = 32 * PARAMS.SCALE;
        
        this.tileCollisions = [];

        // States
        this.initializeStates();
        this.currentState = this.states.idle;

        // Timers   
        this.stateTimer = 0;
        this.stunnedTimeout = 5;
        this.searchingTimeout = 1;
        this.roamingTimeout = 1;
    }

    /**
     * Function called on every clock tick.
     */
    update() {
        if (!this.isAlive || (!this.isInFrame(128 * PARAMS.SCALE, 36 * PARAMS.SCALE) && this.currentState != this.states.stunned)) {
            return;
        }

        this.distanceFromSlime.x = Math.abs(this.hitbox.center.x - GAME.slime.hitbox.center.x);
        this.distanceFromSlime.y = Math.abs(this.hitbox.center.y - GAME.slime.hitbox.center.y + 11 * PARAMS.SCALE);
        this.directionToSlime = this.hitbox.center.x > GAME.slime.hitbox.center.x ? -1 : 
            this.hitbox.center.x == GAME.slime.hitbox.center.x ? 0 : 1;
        
        this.changeState();
        this.currentState.behavior();
        
        this.hitbox.updatePos(this.x, this.y);
        this.tileCollisions.length = 0; // empty array
        this.hitbox.getCollisions().forEach(entity => { 
            if (entity.collideWithEntity) {
                let direction = entity.collideWithEntity(this);
                if (!direction) return;
                this.tileCollisions.push(direction)
            }
        });

        this.endOfCycleUpdates();
    }

    /**
     * Draws the currenty entity's {@link AnimatedEntity.tag} animation.
     * @param {CanvasRenderingContext2D} ctx The canvas which the Batterflea will be drawn on
     */
    draw(ctx) {
        super.draw(ctx);
        if (PARAMS.DEBUG) {
            GAME.CTX.strokeStyle = "yellow";
            GAME.CTX.strokeRect(
                this.xDirection > 0 ? 
                    this.hitbox.center.x - this.trackDistance * 2 - GAME.camera.x  : 
                    this.hitbox.center.x - PARAMS.WIDTH / 2 - GAME.camera.x,
                this.hitbox.center.y - this.trackDistance - GAME.camera.y + PARAMS.SCALE * 11, 
                PARAMS.WIDTH / 2 + this.trackDistance * 2,
                this.trackDistance * 2);
            GAME.CTX.font = "30px segoe ui";
            GAME.CTX.fillStyle = "khaki";
            GAME.CTX.fillText("State: " + this.currentState.name, this.x - GAME.camera.x - 24 * PARAMS.SCALE, this.y - GAME.camera.y + 12 * PARAMS.SCALE);
            GAME.CTX.fillText("X Distance: " + this.distanceFromSlime.x, this.x - GAME.camera.x - 20 * PARAMS.SCALE, this.y - GAME.camera.y + 19 * PARAMS.SCALE);
            GAME.CTX.fillText("Y Distance: " + this.distanceFromSlime.y, this.x - GAME.camera.x - 16 * PARAMS.SCALE, this.y - GAME.camera.y +26 * PARAMS.SCALE);
            GAME.CTX.fillText("Dir To Slime: " + this.directionToSlime, this.x - GAME.camera.x - 12 * PARAMS.SCALE, this.y - GAME.camera.y + 33 * PARAMS.SCALE);
            GAME.CTX.fillText("X Direction: " + this.xDirection, this.x - GAME.camera.x - 8 * PARAMS.SCALE, this.y - GAME.camera.y + 40 * PARAMS.SCALE);
            
            // GAME.CTX.fillStyle = "aqua";
            // GAME.CTX.fillText("Tile Collisions: " + this.tileCollisions, this.x - GAME.camera.x - 24 * PARAMS.SCALE, this.y - GAME.camera.y + -24 * PARAMS.SCALE);
        }
    }

    endOfCycleUpdates(){
        if (this.x == this.lastX) this.momentum = 0; // Reset momentum on stop
        if (this.y == this.lastY) this.yVelocity = 1 / PARAMS.SCALE; // Reset yVelocity on stop
        super.endOfCycleUpdates();
    }

    /**
     * Horizontal Movement - called by states().
     * @author Nathan Brown
     */
    moveX(moveSpeed, moveAcceleration = 0) {

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
     * @author Nathan Brown
     */
    moveY(moveSpeed = this.yVelocity){

        this.y += moveSpeed * PARAMS.SCALE * GAME.tickMod;

        // Gravity
        if (this.yVelocity <= this.maxYVelocity){
            this.yVelocity = moveSpeed + PARAMS.GRAVITY * GAME.tickMod;
        }

    }

    /**
     * Called when this Batterflea collides with the player. Returns Batterlea
     * to spawn and {@link GAME.slime.kill()} the slime
     */
    collideWithPlayer() {
        if (!this.isAlive) return;
        this.killMeWithPowers([GAME.slime.states.slamming]);
        if (GAME.slime.currentState == GAME.slime.states.dashing){
            this.changeState(this.states.stunned);
        } else if (this.currentState != this.states.stunned) GAME.slime.kill();
    }

    /**
     * Respawns, adds in default x direction
     */
    respawn() {
        super.respawn();
        this.xDirection = this.xDirectionDefault;
        this.momentum = 0;
        this.changeState(this.states.idle);
    }

    /**
     * Kills this entity
     */
    kill() {
        if (this.currentState == this.states.stunned) super.kill();
    }

    ///////////////////
    // STATE MACHINE //
    ///////////////////

    initializeStates(){
        this.states = {
            idle: new State("Idle"),
            stunned: new State("Stunned"),
            alert: new State("Alert"),
            falling: new State("Falling"),
            running: new State("Running"),
            searching: new State("Searching"),
            roaming: new State("Roaming"),
            hunting: new State("Hunting"),
            dead: new State("Dead"),
        };

        // IDLE //
        this.states.idle.start = () => {
            // this.yVelocity = 1 / PARAMS.SCALE;
            this.xDirection > 0 ? this.swapTag("Idle", true) : this.swapTag("IdleLeft", true);
        };
        this.states.idle.behavior = () => {
            this.moveX(0);
            this.moveY();
            this.deccelerate();
        };
        this.states.idle.setTransitions([
            {state: this.states.alert, predicate: () => {
                return  this.distanceFromSlime.x < this.trackDistance 
                ||      (this.distanceFromSlime.y < this.trackDistance && this.distanceFromSlime.x < this.trackDistance * 2)
                // ||      (this.directionToSlime == this.xDirection && this.distanceFromSlime.y < this.trackDistance)
                ||      (this.directionToSlime == this.xDirection && this.distanceFromSlime.y < this.trackDistance && this.distanceFromSlime.x < PARAMS.WIDTH / 2)
            }},
        ]);

        // STUNNED //
        this.states.stunned.start = () => {
            // this.yVelocity = 1 / PARAMS.SCALE;
            this.xDirection > 0 ? this.swapTag("Stunned", true) : this.swapTag("StunnedLeft", true);
            this.stateTimer = 0;
        };
        this.states.stunned.behavior = () => {
            this.moveX(0);
            this.moveY();
            this.deccelerate();
            this.stateTimer += GAME.clockTick;
        };
        this.states.stunned.end = () => {
            this.stateTimer = 0;
        }
        this.states.stunned.setTransitions([
            {state: this.states.searching, predicate: () => { return this.stateTimer > this.stunnedTimeout }},
        ]);

        // ALERT //
        this.states.alert.start = () => {
            // this.yVelocity = 1 / PARAMS.SCALE;
            this.xDirection > 0 ? this.swapTag("Idle", true) : this.swapTag("IdleLeft", true);
        };
        this.states.alert.behavior = () => {
            this.moveX(0);
            this.moveY();
            this.deccelerate();
        };
        this.states.alert.setTransitions([
            {state: this.states.running, predicate: () => { return this.distanceFromSlime.y > this.trackDistance }},
            {state: this.states.hunting, predicate: () => { return true }},
        ]);

        // FALLING //
        this.states.falling.start = () => {
            this.xDirection > 0 ? this.swapTag("Idle", true) : this.swapTag("IdleLeft", true);
        };
        this.states.falling.behavior = () => {
            this.moveX(0);
            this.moveY();
        };
        this.states.falling.setTransitions([
            {state: this.states.searching, predicate: () => { return this.tileCollisions.includes("bottom") }},
        ]);
        
        // RUNNING //
        this.states.running.start = () => {
            // this.yVelocity = 1 / PARAMS.SCALE;
            this.xDirection > 0 ? this.tag = "Running" : this.tag = "RunningLeft";
        };
        this.states.running.behavior = () => {
            this.moveX(this.speed * this.xDirection, this.acceleration * this.xDirection);
            this.moveY();
            // if (this.tileCollisions.includes("left")) this.xDirection = 1;
            // else if (this.tileCollisions.includes("right")) this.xDirection = -1;
        };
        this.states.running.setTransitions([
            {state: this.states.falling, predicate: () => { return !this.tileCollisions.includes("bottom") }},
            // {state: this.states.searching, predicate: () => { return this.tileCollisions.includes("left") || this.tileCollisions.includes("right") }},
            {state: this.states.hunting, predicate: () => { return this.distanceFromSlime.y < this.trackDistance }},
        ]);
        
        // SEARCHING //
        this.states.searching.start = () => {
            // this.yVelocity = 1 / PARAMS.SCALE;
            this.stateTimer = 0;
            this.xDirection > 0 ? this.swapTag("Idle", true) : this.swapTag("IdleLeft", true);
        };
        this.states.searching.behavior = () => {
            this.moveX(0);
            this.moveY();
            this.deccelerate();
            this.stateTimer += GAME.clockTick;
        };
        this.states.searching.end = () => {
            this.xDirection = this.xDirection > 0 ? -1 : 1;
            this.stateTimer = 0;
        };
        this.states.searching.setTransitions([
            {state: this.states.roaming, predicate: () => { return this.stateTimer > this.searchingTimeout }},
            {state: this.states.hunting, predicate: () => {
                return  (this.distanceFromSlime.y < this.trackDistance && this.distanceFromSlime.x < this.trackDistance * 2)
                ||      (this.directionToSlime == this.xDirection && this.distanceFromSlime.y < this.trackDistance)
            }},

        ]);
        
        // ROAMING //
        this.states.roaming.start = () => {
            // this.yVelocity = 1 / PARAMS.SCALE;
            this.stateTimer = 0;
            this.xDirection > 0 ? this.swapTag("Running", true) : this.swapTag("RunningLeft", true);
        };
        this.states.roaming.behavior = () => {
            this.moveX((this.speed / 4) * this.xDirection, (this.acceleration / 4) * this.xDirection);
            this.moveY();
            this.stateTimer += GAME.clockTick;
        };
        this.states.roaming.end = () => {
            this.stateTimer = 0;
        };
        this.states.roaming.setTransitions([
            {state: this.states.searching, predicate: () => { return this.stateTimer > this.roamingTimeout}},
            {state: this.states.falling, predicate: () => { return this.yVelocity > 1 * PARAMS.SCALE }},
            {state: this.states.hunting, predicate: () => {
                return  (this.distanceFromSlime.y < this.trackDistance && this.distanceFromSlime.x < this.trackDistance * 2)
                ||      (this.directionToSlime == this.xDirection && this.distanceFromSlime.y < this.trackDistance)
            }},
        ]);
        
        // HUNTING //
        this.states.hunting.start = () => {
            // this.yVelocity = 1 / PARAMS.SCALE;
        };
        this.states.hunting.behavior = () => {
            if(this.directionToSlime < 0) {
                this.tag = "RunningLeft"
                this.moveX(-this.speed, -this.acceleration);
                this.xDirection = -1; // moveX not dependent on this.direction
            } else {
                this.tag = "Running"
                this.moveX(this.speed, this.acceleration);
                this.xDirection = 1; // moveX not dependent on this.direction
            }
            this.moveY();
        };
        this.states.hunting.setTransitions([
            {state: this.states.roaming, predicate: () => { 
                return this.distanceFromSlime.y > this.trackDistance
                // || this.tileCollisions.includes("left") || this.tileCollisions.includes("right")
            }},
            {state: this.states.falling, predicate: () => { return this.yVelocity > 1 * PARAMS.SCALE }},
        ]);
        
        // DEAD //
        this.states.dead.start = () => {
            this.swapTag("Dead", false);
        };
    }
}
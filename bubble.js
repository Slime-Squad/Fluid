/**
 * Class representation of a charge item.
 * @author Xavier Hines, Jasper Newkirk
 */
class Bubble extends AnimatedEntity {
    /**
     * Creates a new instance of a charge item.
     * @param {String} tag The type of charge to be placed. One of "Earth", "Fire", "Ice", "Electric", or "Disabled".
     * @param {number} x The x-coordinate associated with the top-left corner of the charge's sprite on the canvas.
     * @param {number} y The y-coordinate associated with the top-left corner of the charge's sprite on the canvas.
     * @param {boolean} loop Whether the charge's animation loops over again, after having finished playing once.
     */
    constructor(tag, x, y, loop = true) {
        super("./assets/graphics/characters/bubble", tag, x, y, loop);
        Object.assign(this, { tag, x, y, loop });
        this.hitbox = new HitBox(x, y, 0, 0, 24*PARAMS.SCALE, 24*PARAMS.SCALE);
        this.originalTag = tag;
        this.elapsedTime = 0;

        // Behavior
        this.initializeStates();
        this.currentState = this.states.idle;
        this.ySpeed = 0.65;
        this.xSpeed = 0.5;
        this.momentum = 0;
        this.maxMom = 1.5;
        this.acceleration = this.maxMom / 60;
        this.decceleration = this.maxMom / 120;
    }

    /**
     * Function called on every clock tick.
     */
    update() {
        if (!this.isInFrame() && this.currentState == this.currentState.idle) return;
        this.changeState();
        this.currentState.behavior();
        // console.log("Bubble State: " + this.currentState.name);
        this.hitbox.updatePos(this.x, this.y);

        this.endOfCycleUpdates();

    }

    draw(ctx) {
        super.draw(ctx);
    }

    collideWithPlayer() {
        if (this.currentState == this.states.idle && GAME.slime.currentState != GAME.slime.states.breedable) {
            this.changeState(this.states.abducting);
        }
    }

    /**
     * Horizontal Movement - called by state functions.
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
     * 
     * @author Nathan Brown
     */
    moveY(moveSpeed = this.yVelocity){
        this.y += moveSpeed * PARAMS.SCALE * GAME.tickMod;
    }
    
    /**
     * Called by state behaviors to test controller inputs and determine the slime's x movement.
     */
    controlX(){

        if(CONTROLLER.LEFT) {
            this.moveX(-this.xSpeed, -this.acceleration);
            this.xDirection = -1; // moveX not dependent on this.direction
        } else if(CONTROLLER.RIGHT) {
            this.moveX(this.xSpeed, this.acceleration);
            this.xDirection = 1; // moveX not dependent on this.direction
        } else{
            this.moveX(0);
            this.deccelerate();
        }

    }

    /**
     * Manages whether bubble is idle or holding the player
     * Contains a state to enforce upoon the player.
     */
    initializeStates(){

        this.states = {
            idle: new State("Idle"),
            abducting: new State("Abducting"),
            popping: new State("Popping"),
            inflating: new State("Inflating"),
        };
        
        // IDLE //
        this.states.idle.start = () => {
            this.swapTag("Idle", true);
        }
        // this.states.idle.setTransitions([
        //     {state: this.states.abducting, predicate: () => { return this.hitbox.getCollisions().some(entity => entity instanceof Slime)}},
        // ]);

        // ABDUCTING //
        this.states.abducting.start = () => {
            GAME.slime.yVelocity = 1 / PARAMS.SCALE;
            GAME.slime.changeState(GAME.slime.states.breedable);
            GAME.slime.x = this.x + 4 * PARAMS.SCALE;
            GAME.slime.y = this.y + 2 * PARAMS.SCALE;
            GAME.slime.hitbox.updatePos(GAME.slime.x, GAME.slime.y);
        };
        this.states.abducting.behavior = () => {
            const tileCollisions = [];
            this.hitbox.getCollisions().forEach(entity => { 
                if (entity.collideWithEntity) {
                    let direction = entity.collideWithEntity(this);
                    if (!direction) return;
                    tileCollisions.push(direction);
                }
            });
            if (tileCollisions.includes("left") || tileCollisions.includes("right")) this.momentum = this.momentum * -1;
            // this.hitbox.getCollisions().forEach((entity) => {
            //     if (entity.collideWithEntity) entity.collideWithEntity(this);
            // });
            this.controlX();
            this.moveY(-this.ySpeed);
            GAME.camera.slimeHealth.damage();
            GAME.slime.x = this.x + 4 * PARAMS.SCALE;
            GAME.slime.y = this.y + 2 * PARAMS.SCALE;
            GAME.slime.hitbox.updatePos(GAME.slime.x, GAME.slime.y);
        };
        this.states.abducting.end = () => {
            this.momentum = 0;
        };
        this.states.abducting.setTransitions([
            {state: this.states.popping, predicate: () => { return GAME.slime.currentState != GAME.slime.states.breedable }},
        ]);

        // POPPING //
        this.states.popping.start = () => {
            this.stateTimer = 0;
            this.swapTag("Popping", false);
        }
        this.states.popping.behavior = () => {
            this.stateTimer += GAME.clockTick;
        }
        this.states.popping.end = () => {
            this.respawn();
        }
        this.states.popping.setTransitions([
            {state: this.states.inflating, predicate: () => { return this.stateTimer > 1 }},
        ]);

        // INFLATING //
        this.states.inflating.start = () => {
            this.stateTimer = 0;
            this.swapTag("Inflating", false);
        }
        this.states.inflating.behavior = () => {
            this.stateTimer += GAME.clockTick;
        }
        this.states.inflating.setTransitions([
            {state: this.states.idle, predicate: () => { return this.stateTimer > this.frames.animations["Inflating"][0].duration * this.frames.animations["Inflating"].length  }},
        ]);
    }
}
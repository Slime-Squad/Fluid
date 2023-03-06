/**
 * Class representation of a charge item.
 * @author Jasper Newkirk, Nathan Brown
 */
class Charge extends AnimatedEntity {
    /**
     * Creates a new instance of a charge item.
     * @param {String} tag The type of charge to be placed. One of "Earth", "Fire", "Ice", "Electric", or "Disabled".
     * @param {number} x The x-coordinate associated with the top-left corner of the charge's sprite on the canvas.
     * @param {number} y The y-coordinate associated with the top-left corner of the charge's sprite on the canvas.
     * @param {boolean} loop Whether the charge's animation loops over again, after having finished playing once.
     */
    constructor(tag, x, y, loop = true) {
        super("./assets/graphics/item/charge", tag, x, y, loop);
        Object.assign(this, { tag, x, y, loop });
        this.hitbox = new HitBox(x, y, 0, 0, 8*PARAMS.SCALE, 8*PARAMS.SCALE);
        this.originalTag = tag;
        this.stateTimer = 0;
        this.initializeStates();
        this.currentState = this.states.invisible;
        this.currentState.start();
    }

    /**
     * Function called on every clock tick.
     */
    update() {
        if (!this.isInFrame() && this.currentState == this.states.active) return;
        this.changeState();
        this.currentState.behavior();
    }

    draw(ctx) {
        if (this.isInFrame() || this.currentState != this.states.active) super.draw(ctx);
    }

    respawn() {
        if (GAME.UNLOCKED_CHARGES[this.originalTag]) this.changeState(this.states.active);
    }

    /**
     * Employs states to help control when the charges are generated, 
     * and switch into other animations when they're collected
     */
    initializeStates(){

        this.states = {
            invisible: new State("Invisible"),
            collected: new State("Collected"),
            disabled: new State("Disabled"),
            active: new State("Active"),
        };
        
        // INVISIBLE //
        this.states.invisible.start = () => {
            this.swapTag("Invisible", true);
        }
        this.states.invisible.setTransitions([
            {state: this.states.active, predicate: () => { return GAME.UNLOCKED_CHARGES[this.originalTag] }}
        ]);

        // COLLECTED //
        this.states.collected.start = () => {
            this.swapTag("Collected", false);
        }
        this.states.collected.behavior = () => {
            this.stateTimer += GAME.clockTick;
        }
        this.states.collected.setTransitions([
            {state: this.states.disabled, predicate: () => { 
                return this.stateTimer > this.frames.animations["Collected"][0].duration * this.frames.animations["Collected"].length 
                // all frames for charge animation are the same duration
            }},
        ]);

        // DISABLED //
        this.states.disabled.start = () => {
            this.swapTag("Disabled", true);
        }
        this.states.disabled.behavior = () => {
            this.stateTimer += GAME.clockTick;
        }
        this.states.disabled.end = () => {
            this.stateTimer = 0;
        }
        this.states.disabled.setTransitions([
            {state: this.states.active, predicate: () => { return this.stateTimer >= 5 }}
        ]);

        // ACTIVE //
        this.states.active.start = () => {
            this.swapTag(this.originalTag, true);
        }
    }

    /**
     * Response to colliding with player.
     */
    collideWithPlayer(){
        if (this.currentState == this.states.active) {
            GAME.slime.pickUpCharge(this.originalTag);
            ASSET_MANAGER.playAudio("./assets/audio/effect/charge" + Math.floor(Math.random()*4) + ".wav");
            this.changeState(this.states.collected);
        }
        console.log(this.currentState.name);
    }
}
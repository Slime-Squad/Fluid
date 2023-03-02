/**
 * Works as a zone that can flag another entity's state.
 * @author Nathan Brown
 */
class Sentry extends AnimatedEntity {
    /**
     * Creates a new instance of a sentry.
     * @param {number} x The x-coordinate associated with the top-left corner of the sprite on the canvas.
     * @param {number} y The y-coordinate associated with the top-left corner of the sprite on the canvas.
     * @param {String} targetEntity The type of entity that utilizes this sentry.
     * @param {String} targetState The state that this sentry triggers in the entity.
     * @param {number} width Pass if you want to specify a hitbox width.
     * @param {number} height Pass if you want to specify a hitbox height.
     */
    constructor(x, y, targetEntity, targetState, width= 8 * PARAMS.SCALE, height= 8 * PARAMS.SCALE) {
        super("./assets/graphics/item/charge", "Invisible", x, y, false);
        this.targetEntity = targetEntity;
        this.targetState = targetState;
        this.hitbox = new HitBox(x, y, 0, 0, width, height);
    }

    collideWithPlayer(){
        if (this.isTriggered) return;
        GAME.entities.forEach(entity => {
            if (!entity.states || !entity.isInFrame() || entity.constructor.name != this.targetEntity) return;
            Object.keys(entity.states).forEach(state => {
                if (entity.states[state].name == this.targetState) entity.changeToState(entity.states[state]);
            });
            this.isTriggered = true;
        });
    }

    respawn(){
        this.isTriggered = false;
    }
}
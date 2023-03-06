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
    }

    /**
     * Function called on every clock tick.
     */
    update() {
        if (!this.isInFrame()) return;
        this.hitbox.updatePos(this.x, this.y);
        this.hitbox.getCollisions().forEach((entity) => {
            if (entity.collideWithEntity) entity.collideWithEntity(this);
        });

        this.endOfCycleUpdates();

    }

    draw(ctx) {
        super.draw(ctx);
    }

    collideWithPlayer() {
        GAME.camera.slimeHealth.damage();
        if (GAME.slime.currentState != GAME.slime.states.slamming) {
            GAME.slime.x = this.x + 4*PARAMS.SCALE;
            GAME.slime.y = this.y + 2*PARAMS.SCALE;
            this.y--;
            GAME.slime.yVelocity = -2 * PARAMS.SCALE;
        };
        
        if (CONTROLLER.LEFT) {
            this.x = lerp(this.x, this.x - 1, GAME.tickMod);
        }
        if (CONTROLLER.RIGHT) {
            this.x = lerp(this.x, this.x + 1, GAME.tickMod);
        }
        this.hitbox.updatePos(this.x, this.y);
    }
}
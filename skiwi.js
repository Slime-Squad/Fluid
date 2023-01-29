/**
 * Class representation of a Skiwi enemy.
 * @author Xavier Hines
 */
class Skiwi extends AnimatedEntity {
    /**
     * Creates a new instance of a charge item.
     * @param {String} tag The type of charge to be placed. One of "Earth", "Fire", "Ice", "Electric", or "Disabled".
     * @param {number} x The x-coordinate associated with the top-left corner of the charge's sprite on the canvas.
     * @param {number} y The y-coordinate associated with the top-left corner of the charge's sprite on the canvas.
     * @param {boolean} loop Whether the charge's animation loops over again, after having finished playing once.
     */
    constructor(tag, x, y, loop = true) {
        super("./assets/graphics/characters/skiwi", tag, x, y, loop);
        Object.assign(this, { tag, x, y, loop });
        this.hitbox = new HitBox(x, y, 20*PARAMS.SCALE, 20*PARAMS.SCALE);
        this.originalTag = tag;
        this.elapsedTime = 0;

        this.speed = PARAMS.SCALE;
        this.directionTimer = 0;
    }

    /**
     * Function called on every clock tick.
     */
    update() {
        const TICKMOD = GAME.clockTick * 60;

        //Back and forth movement
        if (this.directionTimer > 60) {
            this.x += this.speed * TICKMOD;
            if (this.directionTimer > 120) this.directionTimer =0;
            this.directionTimer += TICKMOD;
        } else {
            this.x -= this.speed * TICKMOD;
            this.directionTimer += TICKMOD;
        }

        //Handle collision
        this.hitbox.updatePos(this.x+(PARAMS.SCALE), this.y+(PARAMS.SCALE));
        GAME.entities.forEach(entity => {
            if (!entity.hitbox) return;
            if (entity instanceof Skiwi) return;
            let collisions = this.hitbox.collide(entity.hitbox);
            if (!collisions) return;
            // console.log(collisions);
            // console.log(entity.constructor.name);
            switch (entity.constructor.name){
                case 'Slime':
                    entity.kill();
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
        }
                    this.hitbox.updatePos(this.x+(PARAMS.SCALE), this.y+(PARAMS.SCALE));
                    break;
            }
        });
    }

    draw(ctx) {
        super.draw(ctx)
    }
}
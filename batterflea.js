/**
 * Class representation of a Batterflea enemy.
 * @author Xavier Hines
 */
class Batterflea extends AnimatedEntity {
    /**
     * Creates a new instance of a charge item.
     * @param {String} tag The type of charge to be placed. One of "Earth", "Fire", "Ice", "Electric", or "Disabled".
     * @param {number} x The x-coordinate associated with the top-left corner of the charge's sprite on the canvas.
     * @param {number} y The y-coordinate associated with the top-left corner of the charge's sprite on the canvas.
     * @param {boolean} loop Whether the charge's animation loops over again, after having finished playing once.
     */
    constructor(tag, x, y, loop = true) {
        super("./assets/graphics/characters/batterflea", tag, x, y, loop);
        Object.assign(this, { tag, x, y, loop });
        this.hitbox = new HitBox(x, y, 0, 0, 8*PARAMS.SCALE, 8*PARAMS.SCALE);

        this.spawnX = x;
        this.spawnY = y;

        //Movement
        this.lastX = x;
        this.lastY = y;
        this.xMove = 0;
        this.direction = 1;
        this.rise = -1;
        this.MINRISE = -6 * PARAMS.SCALE;
        this.bounce = 3.5 * PARAMS.SCALE;
        this.gravity = 1;

        //Flags
        this.isAlive = true;
        this.isAirborne = false;
        this.canJump = true;

        //Timers
        this.timers = {
            jumpTimer: 0
        }
    }

    /**
     * Function called on every clock tick.
     */
    update() {
        this.hop();
        this.moveY();

        this.hitbox.updatePos(this.x, this.y);
        this.hitbox.getCollisions().forEach((entity) => {
            if (entity.collideWithEntity) entity.collideWithEntity(this);
        });

        if (this.y == this.lastY){
            this.rise = -1;
            this.isAirborne = false;
        }
        this.endOfCycleUpdates();
    }


    /**
     * Called when this Batterflea collides with the player. Returns Batterlea
     * to spawn and {@link GAME.slime.kill} the slime
     */
    collideWithPlayer() {
        this.setToSpawn();
        GAME.slime.kill();
    }

    /**
     * Function called every clock tick that controls how the Batterflea will hop
     */
    hop() {
        //deterines if Batterflea can jump and which direction
        if(this.timers.jumpTimer > 3) {
            this.canJump = true;
            this.xMove = this.x > GAME.slime.x ? -(PARAMS.SCALE/3): (PARAMS.SCALE/3);
        }
        
        //Moves the batterlfea on x axis
        if(this.isAirborne) this.x += this.xMove;


        if(this.canJump) {
            this.canJump = false;
            this.timers.jumpTimer = 0;
            this.rise = this.bounce +  1 * this.direction;
            this.isAirborne = true;
        }
    }

    /**
     * Controls Batterleas movement on the y axis.
     */
    moveY() {
        // Rise
        this.y -= this.rise * GAME.tickMod;
        if (this.rise < -1.5 * PARAMS.SCALE){
            this.canJump = false;
        }

        // Gravity
        if (this.rise > this.MINRISE){
            let hangtime = this.rise > 0 ? 0.7 : 1;
            this.rise -= this.gravity * GAME.tickMod * hangtime;
        }
    }

    /**
     * Returns the Batterflea to its spawn position.
     */
    setToSpawn() {
        this.x = this.spawnX;
        this.y = this.spawnY;
    }

    //TODO: UPDATE COLLISION
    // checkCollision() {
    //     this.hitbox.updatePos(this.x+(PARAMS.SCALE), this.y+(PARAMS.SCALE));
    //     let totalCollisions = 0;
    //     GAME.entities.forEach(entity => {
    //         if (!entity.hitbox) return;
    //         if (entity instanceof Batterflea) return;
    //         let collision = this.hitbox.collide2(entity.hitbox);
    //         if (!collision) return;
    //         totalCollisions++;
    //         // console.log(collisions);
    //         // console.log(entity.constructor.name);
    //         switch (entity.constructor.name){
    //             case 'Slime':
    //                 entity.kill();
    //                 //TODO set batterfleas actual spawn
    //                 this.x = this.spawnX;
    //                 this.y = this.spawnY;
    //                 break;
    //             case 'Tile':
    //                 let lastHitboxLeft = this.lastX;
    //                 let lastHitboxRight = this.lastX + this.hitbox.width;
    //                 let lastHitboxBottom = this.lastY + this.topPadding;
    //                 // let lastHitboxCenter = {x: lastHitboxLeft + this.hitbox.width / 2, y: lastHitboxBottom - this.hitbox.height / 2 };
    //                 if (collision.direction !== 'bottom'){
    //                     if ( 
    //                         linePlaneIntersect(
    //                             lastHitboxLeft, lastHitboxBottom, this.hitbox.left, this.hitbox.bottom, 
    //                             entity.hitbox.left, entity.hitbox.right, entity.hitbox.top
    //                             ) ||
    //                         linePlaneIntersect(
    //                             lastHitboxRight, lastHitboxBottom, this.hitbox.right, this.hitbox.bottom, 
    //                             entity.hitbox.left, entity.hitbox.right, entity.hitbox.top
    //                             )
    //                     ) {
    //                         collision.direction = 'bottom';
    //                         // console.log("collision reset to bottom");
    //                     }
    //                 }
    //                 if (collision.direction === 'left'){
    //                     this.x = entity.hitbox.right;
    //                 } else if (collision.direction === 'right'){
    //                     this.x = entity.hitbox.left - this.hitbox.width;
    //                 } else if (collision.direction ==='top'){
    //                     this.y = entity.hitbox.bottom;
    //                 } else {
    //                     this.y = entity.hitbox.top - this.hitbox.height;
    //                     this.isAirborne = false;
    //                 }
    //                 this.hitbox.updatePos(this.x, this.y);
    //                 break;
    //             case 'KillBox':
    //                 if (this.isAlive) this.kill();
    //                 break;
    //         }
    //     });

    //     if (totalCollisions > 5){
    //         // console.log("collisions: " + totalCollisions);
    //         this.x = this.lastX;
    //         this.y = this.lastY;
    //     }
    // }

    kill() {
        this.isAlive = false;
    }

    draw(ctx) {
        super.draw(ctx)
    }
}
/**
 * Class responsible for drawing debug information, adding entities, and handling {@Link GameEngine.camera} movement.
 * @author Jasper Newkirk
 */
class SceneManager {
    /**
     * Constructs a new camera and scene manager for the given game context.
     */
    constructor() {
        this.x = 0;
        this.y = 0;
        this.deathScreen = new DeathScreen();
        this.slimeHealth = new Health();
        this.backdrop = new Backdrop();
        this.start = Date.now();
        this.isFrozen = false;
        this.frames = 0;
        this.fps = 0;
        this.seconds = 0;
        this.loadWorld();
    }

    /**
     * Initializes the world.
     */
    loadWorld() {
        const world = ASSET_MANAGER.getAsset("./assets/world/world/world.world");
        // Camera entities (always visible)
        GAME.addEntity(this.deathScreen);
        GAME.addEntity(this.slimeHealth);

        const layerCache = {"fg": [], "entity": [], "map": [], "bg": []};
        Object.keys(world.rooms).forEach((roomName) => {
            const room = world.rooms[roomName];
            Object.keys(room.tiles).forEach((layer) => {
                if (layerCache[layer]) {
                    room.tiles[layer].forEach((entity) => {
                        Object.values(entity).forEach(field => {
                            if (field instanceof AnimatedEntity){
                                console.log(field.constructor.name, "is an animated entity");
                                layerCache[layer].push(field);
                            }
                        });
                        layerCache[layer].push(entity);
                    });
                }
            });
        });
        // enforce entity loading order (first means will be on top of other entities)
        layerCache["entity"].sort((a, b) => {
            const entityLoadOrder = ['Slime', 'Bubble'];
            return entityLoadOrder.indexOf(b.constructor.name) - entityLoadOrder.indexOf(a.constructor.name);
        });
        layerCache["entity"].forEach((entity) => console.log(entity.constructor.name));
        const order = ["fg", "entity", "map", "bg"];
        order.forEach((layer) => {
            console.log("adding", layer);
            layerCache[layer].forEach((entity) => GAME.addEntity(entity))
        });

        GAME.addEntity(this.backdrop);

        this.x = GAME.slime.x - PARAMS.WIDTH/2 + 8*PARAMS.SCALE;
        this.y = GAME.slime.y - PARAMS.HEIGHT/2 - 16*PARAMS.SCALE;
    }

    /**
     * Function called on every clock tick.
     */
    update() {
        if (this.isFrozen) {
            this.elapsedFreezeTime += GAME.clockTick;
            if (this.elapsedFreezeTime >= this.freezeTimer) this.unfreeze();
        } else {
            this.x = Math.round(lerp(this.x, GAME.slime.x + GAME.slime.hitbox.width / 2 - PARAMS.WIDTH/2 + PARAMS.SCALE*56*GAME.slime.momentum, GAME.tickMod/15));
            this.y = GAME.slime.yVelocity < 0 ? 
                Math.round(lerp(this.y, GAME.slime.y - PARAMS.HEIGHT/2 - 4*PARAMS.SCALE, GAME.tickMod/15)) :
                Math.round(lerp(this.y, GAME.slime.y - PARAMS.HEIGHT/2 - 16*PARAMS.SCALE - PARAMS.SCALE*24*-GAME.slime.yVelocity, GAME.tickMod/15));
            // this.y = Math.round(lerp(this.y, GAME.slime.y - PARAMS.HEIGHT/2 - 16*PARAMS.SCALE - Math.min(0,PARAMS.SCALE*24*-GAME.slime.yVelocity), GAME.tickMod/15));
        }
        this.deathScreen.x = this.x - 3*PARAMS.SCALE;
        this.deathScreen.y = this.y - 3*PARAMS.SCALE;
        // Update fps
        this.frames++;
        if (Math.floor((Date.now()-this.start)/1000) > 0) {
            this.start = Date.now();
            this.fps = this.frames;
            this.frames = 0;
            this.seconds++;
        }
        if (this.seconds >= 1) {
            GAME.updateCollidableEntities();
            this.seconds = 0;
        }
    }

    /**
     * Function responsible for drawing on the given canvas. Called on every clock tick.
     * @param {CanvasRenderingContext2D} ctx The canvas to display upon.
     */
    draw(ctx) {
        // DEBUG INFO
        if (this.isFrozen) this.freezeAnimation(ctx, this);
        ctx.font = "30px segoe ui";
        ctx.fillStyle = "white";
        ctx.fillText("FPS:" + this.fps, PARAMS.WIDTH-120, 30);
        if (PARAMS.DEBUG) {
            ctx.strokeRect(0,0,PARAMS.WIDTH/2,PARAMS.HEIGHT/2)
            ctx.fillText("CAM: x=" + this.x + " y=" + this.y, 10, 30);
            ctx.fillText("GAMEPAD BTNS PRESSED: " + GAME.gamepad.buttons.forEach((button, index) => { if (button.pressed) return index}), 10, PARAMS.HEIGHT - 20);
        }
    }

    /**
     * Freezes the camera and allows for movement independent of the player.
     * @param {number} time The amount of time to freeze the camera (in seconds).
     * @param {function} animation A function passed the canvas and current camera instance. Will be called on this camera's {@link SceneManager.update} function during the freeze.
     * @param {function} callback A function to be executed upon the end of the animation, when the camera is no longer frozen.
     */
    freeze(time, animation, callback) {
        this.isFrozen = true;
        this.freezeTimer = time;
        this.elapsedFreezeTime = 0;
        this.freezeCallback = callback;
        this.freezeAnimation = animation;
    }

    /**
     * Places the camera's focus back to the player, and calls the callback function from {@link SceneManager.freeze}.
     */
    unfreeze() {
        this.isFrozen = false;
        this.freezeCallback();
    }
}
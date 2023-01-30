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
        this.start = Date.now();
        this.isFrozen = false;
        this.frames = 0;
        this.loadTest();
    }

    /**
     * Initializes the testing level.
     */
    loadTest() {
        const world = ASSET_MANAGER.getAsset("./assets/world/world/level.world");
        GAME.addEntity(this.deathScreen);

        const order = ["fg", "entity", "map", "bg"];
        order.forEach((layer) => {
            Object.keys(world.rooms).forEach((roomName) => {
                const room = world.rooms[roomName];
                console.log("loading", layer)
                if (room.tiles[layer]) { // layer exists
                    room.tiles[layer].forEach((tile) => {
                        GAME.addEntity(tile);
                    });
                }
            });
        });
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
            // this.x = Math.round(lerp(this.x, GAME.slime.x - PARAMS.WIDTH/2 + 8*PARAMS.SCALE + PARAMS.SCALE*45*GAME.slime.momentum, GAME.clockTick));
            this.x = Math.round(lerp(this.x, GAME.slime.x - PARAMS.WIDTH/2 + 8*PARAMS.SCALE + PARAMS.SCALE*8*GAME.slime.momentum, GAME.clockTick*60/10));
            this.y = Math.round(lerp(this.y, GAME.slime.y - PARAMS.HEIGHT/2 - 16*PARAMS.SCALE - Math.min(0,PARAMS.SCALE*4*GAME.slime.rise), GAME.clockTick*60/10));
        }
        this.deathScreen.x = this.x - 3*PARAMS.SCALE;
        this.deathScreen.y = this.y - 3*PARAMS.SCALE;
        // Update fps
        this.frames++;
        if (Math.floor((Date.now()-this.start)/1000) > 0) {
            this.start = Date.now();
            this.fps = this.frames;
            this.frames = 0;
        }
        
    }

    /**
     * Function responsible for drawing on the given canvas. Called on every clock tick.
     * @param {CanvasRenderingContext2D} ctx The canvas to display upon.
     */
    draw(ctx) {
        // DEBUG INFO
        if (this.isFrozen) this.freezeAnimation(ctx, this);
        if (PARAMS.DEBUG) {
            ctx.strokeRect(0,0,PARAMS.WIDTH/2,PARAMS.HEIGHT/2)
            ctx.font = "30px segoe ui";
            ctx.fillStyle = "white";
            ctx.fillText("CAM: x=" + this.x + " y=" + this.y, 10, 30);
            ctx.fillText("FPS:" + this.fps, PARAMS.WIDTH-120, 30);
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
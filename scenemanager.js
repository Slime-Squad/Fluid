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
        this.start = Date.now();
        this.frames = 0;
        this.loadTest();
    }

    /**
     * Initializes the testing level.
     */
    loadTest() {
        const world = ASSET_MANAGER.getAsset("./assets/world/world/level.world");
        PARAMS.GAME.addEntity(new Slime("Idle", PARAMS.WIDTH/2, PARAMS.HEIGHT/2));
        Object.keys(world.rooms).forEach((roomName) => {
            const room = world.rooms[roomName];
            //PARAMS.GAME.addEntity(room);
            
            const order = ["bg", "map", "fg"]; // TODO: add entity special case
            order.forEach((layer) => {
                if (room.tiles[layer]) { // layer exists
                    room.tiles[layer].forEach((tile) => {
                        PARAMS.GAME.addEntity(tile);
                    });
                }
            });
        });
        PARAMS.GAME.addEntity(new Charge("Disabled", 50, 50));
        PARAMS.GAME.addEntity(new Charge("Fire", 100, 100));
        PARAMS.GAME.addEntity(new Charge("Ice", 150, 150));
        PARAMS.GAME.addEntity(new Charge("Electric", 200, 200));
        PARAMS.GAME.addEntity(new Charge("Earth", 250, 250));
    }

    /**
     * Function called on every clock tick.
     */
    update() {
        this.x = PARAMS.GAME.slime.x - PARAMS.WIDTH/2;
        this.y = PARAMS.GAME.slime.y - PARAMS.HEIGHT/2;
        this.frames++;
    }

    /**
     * Function responsible for drawing on the given canvas. Called on every clock tick.
     * @param {CanvasRenderingContext2D} ctx The canvas to display upon.
     */
    draw(ctx) {
        
        // DEBUG CAMERA INFO
        if (PARAMS.DEBUG) {
            if (Math.floor((Date.now()-this.start)/1000) > 0) {
                this.start = Date.now();
                this.fps = this.frames;
                this.frames = 0;
            }
            
            ctx.font = "30px segoe ui";
            ctx.fillStyle = "white";
            ctx.fillText("CAM: x=" + this.x + " y=" + this.y, 10, 30);
            ctx.fillText("FPS:" + this.fps, PARAMS.WIDTH-120, 30);
        }
    }
}
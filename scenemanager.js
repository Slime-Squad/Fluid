/**
 * Class responsible for drawing scene and handling {@Link GameEngine.camera} movement.
 * @author Jasper Newkirk
 */
class SceneManager {
    /**
     * Constructs a new camera and scene manager for the given game context.
     */
    constructor() {
        this.x = 0;
        this.y = 0;
        this.loadTest();
    }

    /**
     * Initializes the testing level.
     */
    loadTest() {
        PARAMS.GAME.addEntity(new Slime("Idle", PARAMS.WIDTH/2, PARAMS.HEIGHT/2));

        PARAMS.GAME.addEntity(new Charge("Disabled", 50, 50));
        PARAMS.GAME.addEntity(new Charge("Fire", 100, 100));
        PARAMS.GAME.addEntity(new Charge("Ice", 150, 150));
        PARAMS.GAME.addEntity(new Charge("Electric", 200, 200));
        PARAMS.GAME.addEntity(new Charge("Earth", 250, 250));
    }

    /**
     * Function called on every {@link AnimatedEntity.game.clockTick}.
     */
    update() {
        this.x = PARAMS.GAME.slime.x - PARAMS.WIDTH/2;
        this.y = PARAMS.GAME.slime.y - PARAMS.HEIGHT/2;
    }

    /**
     * Function responsible for drawing on the given canvas. Called on every clock tick.
     * @param {CanvasRenderingContext2D} ctx The canvas to display upon.
     */
    draw(ctx) {

        // DEBUG CAMERA INFO
        if (PARAMS.DEBUG) {
            ctx.font = "30px segoe ui";
            ctx.fillStyle = "white";
            ctx.fillText("CAM: x=" + this.x + " y=" + this.y, 10, 30);
        }
    }
}
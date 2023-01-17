/**
 * Class responsible for drawing scene and handling {@Link GameEngine.camera} movement.
 * @author Jasper Newkirk
 */
class SceneManager {
    /**
     * Constructs a new camera and scene manager for the given game context.
     * @param {GameEngine} game The current game engine context.
     */
    constructor(game) {
        this.game = game;
        this.x = 0;
        this.y = 0;
        this.loadTest();
    }

    /**
     * Initializes the testing level.
     */
    loadTest() {
        this.game.addEntity(new Slime(this.game, "Idle", PARAMS.WIDTH/2, PARAMS.HEIGHT/2));

        this.game.addEntity(new Charge(this.game, "Disabled", 50, 50));
        this.game.addEntity(new Charge(this.game, "Fire", 100, 50));
        this.game.addEntity(new Charge(this.game, "Ice", 150, 50));
        this.game.addEntity(new Charge(this.game, "Electric", 200, 50));
        this.game.addEntity(new Charge(this.game, "Earth", 250, 50));
    }

    /**
     * Function called on every {@link AnimatedEntity.game.clockTick}.
     */
    update() {
        this.x = this.game.slime.x - PARAMS.WIDTH/2;
        this.y = this.game.slime.y - PARAMS.HEIGHT/2;
    }

    /**
     * Function responsible for drawing on the given canvas. Called on every {@link AnimatedEntity.game.clockTick}.
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
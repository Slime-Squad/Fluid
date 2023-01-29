/**
 * Class representation of the HUD animation played upon the creation and death of the player.
 * @author Jasper Newkirk
 */
class DeathScreen extends AnimatedEntity {
    /**
     * Constructs a new entity responsible for the HUD animation played upon the creation and death of the player.
     * @param {string} tag The type of animation to be played. One of "Died", or "Respawn".
     */
    constructor(tag = "Respawn") {
        super("./assets/graphics/camera/dead_screen", tag, 0, 0, false);
        this.tag = tag;
    }
}
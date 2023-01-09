/**
 * Class representation of a charge item.
 * @author Jasper Newkirk
 */
class Charge extends AnimatedEntity {
    /**
     * Creates a new instance of a charge item.
     * @param {GameEngine} game The {@link GameEngine} instance to be associated with this charge.
     * @param {*} tag The type of charge to be placed. One of "Earth", "Fire", "Ice", "Electric", or "Disabled".
     * @param {*} x The x-coordinate associated with the top-left corner of the charge's sprite in the current {@link GameEngine.ctx} context.
     * @param {*} y The y-coordinate associated with the top-left corner of the charge's sprite in the current {@link GameEngine.ctx} context.
     * @param {*} loop Whether the charge's animation loops over again, after having finished playing once.
     */
    constructor(game, tag, x, y, loop = true) {
        super(game, "./assets/graphics/item/charge", tag, x, y, 8*PARAMS.SCALE, 8*PARAMS.SCALE, loop);
    }

    update() {
        
    }
}
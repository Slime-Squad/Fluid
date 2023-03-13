/**
 * Class representation of tooltip displaying controls and instruction via HUD element.
 * @author Jasper Newkirk
 */
class ToolTip extends AnimatedEntity {
    constructor(type, x, y) {
        super("./assets/graphics/camera/tooltip", "Invisible", x, y, true);
        Object.assign(this, {type, x, y});
    }

    update() {
    }

    /**
     * Draws the currenty entity's {@link AnimatedEntity.tag} animation. 
     * @param {CanvasRenderingContext2D} ctx The canvas which the tooltip will be drawn on
     */
    draw(ctx) {
        if (this.isInFrame()) super.draw(ctx);
    }

    collideWithPlayer(){
        // console.log("touching", this.type, this.type + (GAME.gamepad ? "_gamepad" : "_keyboard"));
        if (this.tag == "Invisible") {
            this.swapTag(this.type + (GAME.gamepad ? "_gamepad" : "_keyboard"), false);
        } else if (this.frames.isFrozen) {
            if (this.tag.split("_")[1] == "preview") this.swapTag("Invisible", false);
            else this.swapTag(this.type + "_preview", false);
        }
    }
}
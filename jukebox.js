/**
 * Class representation of a context switching trigger/hitbox, which changes the backdrop/music on contact.
 * @author Jasper Newkirk
 */
class JukeBox {
    /**
     * Constructs a new entity responsible for killing the player on contact.
     * @param {number} x The x-coordinate associated with the top-left corner of the jukebox's hitbox on the canvas.
     * @param {number} y The y-coordinate associated with the top-left corner of the jukebox's hitbox on the canvas.
     * @param {string} backdrop The tag name of the backdrop to be switched to.
     * @param {string} music The name of the audio file to be switched to, as it exists in the {@link AssetManager.cache}.
     */
    constructor(x, y, backdrop="default", music=undefined) {
        Object.assign(this, { x, y, backdrop, music });
        this.width = 8*PARAMS.SCALE;
        this.height = 8*PARAMS.SCALE;
        this.hitbox = new HitBox(this.x, this.y, 0, 0, this.width, this.height);
        this.track = ASSET_MANAGER.getAsset("./assets/audio/music/" + this.music);
        this.volume = PARAMS.MAX_VOLUME;
    }

    /**
     * Function called on every clock tick.
     */
    update() {
        if (this.fadeOut) {
            this.volume = Math.max(0, this.volume - 0.005*GAME.tickMod);
            ASSET_MANAGER.setBackgroundMusicVolume(this.volume);
        }
        if (this.volume == 0) {
            this.fadeOut = false;
            this.volume = PARAMS.MAX_VOLUME;
        }
    }

    /**
     * Draws the debug information for the current killbox. Called on every clock tick.
     * @param {CanvasRenderingContext2D} ctx The canvas to which the information will be displayed upon.
     */
    draw(ctx) {
        const x = this.x - GAME.camera.x;
        const y = this.y - GAME.camera.y;
        if (x > -this.width*PARAMS.SCALE && x < PARAMS.WIDTH && y > -this.height*PARAMS.SCALE && y < PARAMS.HEIGHT && PARAMS.DEBUG) {
            GAME.CTX.font = "16px segoe ui";
            GAME.CTX.fillStyle = "white";
            ctx.fillText(this.backdrop + " JUKE", this.x - GAME.camera.x, this.y - GAME.camera.y);
            if (this.hitbox) {
                ctx.beginPath();
                ctx.rect(this.hitbox.left - GAME.camera.x, this.hitbox.top - GAME.camera.y, this.hitbox.width, this.hitbox.height);
                ctx.stroke();
            }
        }
    }

    /**
     * Response to colliding with player.
     */
    collideWithPlayer(){
        GAME.entities.forEach(entity => {
            if (entity.constructor.name == this.constructor.name) {
                if (entity.backdrop == this.backdrop && entity.music == this.music) { // remove hitboxes of all like jukeboxes
                    entity.hitbox = undefined;
                } else if (!entity.hitbox) {
                    entity.hitbox = new HitBox(entity.x, entity.y, 0, 0, this.width, this.height);
                }
            }
        });
        
        if (GAME.camera.backdrop.tag.includes("_in") && this.backdrop == "default") { // is currently in a juke context
            this.fadeOut = true;
            GAME.camera.backdrop.swapTag(GAME.camera.backdrop.tag.split("_")[0] + "_out", false);
        } else if (GAME.camera.backdrop.tag.includes("_out") && this.backdrop == "default") return;
        else {
            // console.log("Swapping out", GAME.camera.backdrop.tag, "with", this.backdrop + (this.backdrop == "default" ? "" : "_in"))
            GAME.camera.backdrop.xOffset = this.x - GAME.camera.x;
            GAME.camera.backdrop.yOffset = this.y - GAME.camera.y;
            GAME.camera.backdrop.swapTag(this.backdrop + (this.backdrop == "default" ? "" : "_in"), false);
            if (this.music && !PARAMS.BGM_MUTE) {
                ASSET_MANAGER.killBackgroundMusic();
                ASSET_MANAGER.playAudio("./assets/audio/music/" + this.music);
                // console.log("now playing:", "./assets/audio/music/" + this.music);
            }
        }
        //GAME.camera.backdrop.swapTag(this.backdrop, false);
        // if (this.music) ASSET_MANAGER.playAudio("./assets/audio/music/" + this.music);
    }
}
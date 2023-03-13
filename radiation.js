class Radiation extends AnimatedEntity {
    /**
     * Creates a new instance of radiation.
     * @param {number} x The x-coordinate associated with the top-left corner of the radiation's sprite on the canvas.
     * @param {number} y The y-coordinate associated with the top-left corner of the radiation's sprite on the canvas.
     */
    constructor(x, y) {
        super("./assets/graphics/characters/radiation", "pour" + Math.ceil(Math.random()*4), x, y, false);
        Object.assign(this, { x, y });
        this.hitbox = new HitBox(x, y, 0, 0, 8*PARAMS.SCALE, 8*PARAMS.SCALE);
    }

    update() {
        if (!this.isInFrame()) return;
        if (this.frames.isFrozen) this.swapTag("pour" + Math.ceil(Math.random()*4), false);
    }

    draw(ctx) {
        if (!this.isInFrame()) return;
        super.draw(ctx);
    }

    collideWithPlayer() {
        GAME.camera.slimeHealth.damage();
        ASSET_MANAGER.playAudio("./assets/audio/effect/rad" + Math.floor(Math.random()*4) + ".wav");
        
    }

}
/**
 * Charge generator unlocks charges.
 * @author Nathan Brown
 */
class ChargeGenerator extends Charge {
    
    constructor(tag, x, y, loop = true) {
        super(tag, x, y, loop);
        this.changeState(this.states.active);
        this.tooltip = new ToolTip(this.tag.toLowerCase(), this.x + 16*PARAMS.SCALE, this.y - 32*PARAMS.SCALE);
    }

    update(){
        super.update();
    }
    
    /**
     * Response to colliding with player.
     */
    collideWithPlayer(){
        super.collideWithPlayer();
        GAME.UNLOCKED_CHARGES[this.originalTag] = true;
        this.tooltip.collideWithPlayer();
    }

}

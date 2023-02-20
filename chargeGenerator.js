/**
 * Charge generator unlocks charges.
 * @author Nathan Brown
 */
class ChargeGenerator extends Charge {
    
    constructor(tag, x, y, loop = true) {
        super(tag, x, y, loop);
        this.tag = this.originalTag;
    }

    update(){
        super.update();
    }
    
    /**
     * Response to colliding with player.
     */
    collideWithPlayer(){
        super.collideWithPlayer();

        GAME.UNLOCKED_CHARGES[this.tag] = true;
    }

}
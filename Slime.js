class Slime{
    constructor(game) {
        this.game = game;
        //ISSUE: this was built to animate with Marriots code. Change to work with ours.
        //this.animator = new animator(ASSET_MANAGER.getAsset("./assests/graphics/characters/Slime-sheet4.png"), 0, 0, 24, 16, 6, .3);
        
        // add way to see slime that works with animate identity or import animator from Marriot

        this.x = 448;
        this.y = 320;
        this.speed = 150;
    };

    update() {
        
        if(this.x > 1024 || this.x < 0) this.x = 0;
        if(this.y > 768 || this.y < 0) this.y = 0;
        
        //Controls work with keyboard and a gamepad
        if(this.game.keys["w"] || this.game.up) {
            this.y -= this.speed * this.game.clockTick;
        }
        if(this.game.keys["a"] || this.game.left) {
            this.x -= this.speed * this.game.clockTick;
        }
        if(this.game.keys["s"] || this.game.down) {
            this.y += this.speed * this.game.clockTick;
        }
        if(this.game.keys["d"] || this.game.right) {
            this.x += this.speed * this.game.clockTick;
        }
        if(this.game.keys[" "] || this.game.A) {
            console.log("jump");
        }
        if(this.game.keys["j"] || this.game.B) {
            console.log("smash")
        }


    };

    draw(ctx) {
        this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
}
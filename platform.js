class Platform {
    
    constructor(){
        this.hitbox = new HitBox(0, 450, 1500, 100);
    }

    draw(ctx) {
        if (this.hitbox && PARAMS.DEBUG) {
            ctx.strokeStyle = "red";
            ctx.beginPath();
            ctx.rect(this.hitbox.left - PARAMS.GAME.camera.x, this.hitbox.top - PARAMS.GAME.camera.y, this.hitbox.width, this.hitbox.height);   
            ctx.stroke();
        }
    }
    update(){
        
    }
}
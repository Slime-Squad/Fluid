// This game shell was happily modified from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

class GameEngine {
    constructor() {
        this.ctx = null;
        this.camera = null;
        /** Used to track time globablly */
        this.currentFrame = 0;

        // Everything that will be updated and drawn each frame
        this.entities = [];
        this.collidableEntities = [];
        this.killableEntities = ["Batterflea", "Tabemasu", "Magmasquito", "Skiwi"]

         //for Gamepad
        this.gamepad = null;

        // Information on the input
        this.click = null;
        this.mouse = null;
        this.wheel = null;
        this.keys = {};
        
        this.UNLOCKED_CHARGES = PARAMS.CHARGES_UNLOCKED ? {
            "Electric" : true,
            "Fire" : true,
            "Ice" : true,
            "Earth" : true
        } : {
            "Electric" : false,
            "Fire" : false,
            "Ice" : false,
            "Earth" : false
        }
    };

    init(ctx) {
        this.ctx = ctx;
        this.startInput();
        this.timer = new Timer();
        this.camera = new SceneManager();
        this.addEntity(this.camera);
        this.updateCollidableEntities();
        //this.collidableEntities = this.entities.filter((entity) => entity.hitbox);
    };

    start() {
        this.running = true;
        const gameLoop = () => {
            this.loop();
            requestAnimFrame(gameLoop, this.ctx.canvas);
        };
        gameLoop();
    };

    startInput() {
        const getXandY = e => ({
            x: e.clientX - this.ctx.canvas.getBoundingClientRect().left,
            y: e.clientY - this.ctx.canvas.getBoundingClientRect().top
        });

        this.ctx.canvas.addEventListener("mousemove", e => {
            // if (PARAMS.DEBUG) {
            //     console.log("MOUSE_MOVE", getXandY(e));
            // }
            this.mouse = getXandY(e);
        });

        this.ctx.canvas.addEventListener("click", e => {
            // if (PARAMS.DEBUG) {
            //     console.log("CLICK", getXandY(e));
            // }
            this.click = getXandY(e);
        });

        this.ctx.canvas.addEventListener("wheel", e => {
            // if (PARAMS.DEBUG) {
            //     console.log("WHEEL", getXandY(e), e.wheelDelta);
            // }
            e.preventDefault(); // Prevent Scrolling
            this.wheel = e;
        });

        this.ctx.canvas.addEventListener("contextmenu", e => {
            // if (PARAMS.DEBUG) {
            //     console.log("RIGHT_CLICK", getXandY(e));
            // }
            e.preventDefault(); // Prevent Context Menu
            this.rightclick = getXandY(e);
        });

       //declares keyboard active and listens for keyboard events
       this.ctx.canvas.addEventListener("keydown", event => {
            this.keyboardActive = true;
            this.keys[event.key] = true;
            event.preventDefault();
        });
       this.ctx.canvas.addEventListener("keyup", event => {
            this.keyboardActive = false;
            this.keys[event.key] = false
        });
    };

    addEntity(entity, alive=true) {
        if (entity instanceof Slime) this.slime = entity;
        entity.isAlive = alive;
        this.entities.push(entity);
    };

    draw() {
        this.ctx.clearRect(0, 0, PARAMS.WIDTH, PARAMS.HEIGHT); // Clear canvas

        for (let i = this.entities.length - 1; i >= 0; i--) {
            this.entities[i].draw(this.ctx);
        }

        this.camera.draw(this.ctx);
    };

    /**
     * Tracks the current state of the gamepad every tick.
     */
    gamepadUpdate() {
        this.gamepad = navigator.getGamepads()[0];
        if (this.gamepad != null) {
            if (!this.gamepad.buttons[14]) { // WiiMote
                CONTROLLER.A = this.gamepad.buttons[0].pressed || this.keys[" "];
                CONTROLLER.X = this.gamepad.buttons[1].pressed || this.keys["j"] || this.keys["J"];
                //CONTROLLER.B = this.gamepad.buttons[2].pressed || this.keys["k"] || this.keys["K"];
                CONTROLLER.LEFT = this.gamepad.axes[0] < -0.3 || this.keys["a"] || this.keys["A"];
                CONTROLLER.RIGHT = this.gamepad.axes[0] > 0.3 || this.keys["d"] || this.keys["D"];
                CONTROLLER.UP = this.gamepad.axes[1] < -0.3 || this.keys["w"] || this.keys["W"];
                CONTROLLER.DOWN = this.gamepad.axes [1] > 0.3 || this.keys["s"] || this.keys["S"];
                CONTROLLER.BACK = this.gamepad.buttons[4].pressed || this.keys["r"] || this.keys["R"];
                CONTROLLER.RTRIG = this.gamepad.buttons[3].pressed || this.keys["l"] || this.keys["L"];
                CONTROLLER.HOME = this.gamepad.buttons[2].pressed || this.keys["\`"] || this.keys["\~"];
            } else {
            CONTROLLER.A = this.gamepad.buttons[0].pressed || this.keys[" "];
            CONTROLLER.X = this.gamepad.buttons[2].pressed || this.keys["j"] || this.keys["J"];
            CONTROLLER.B = this.gamepad.buttons[1].pressed || this.keys["k"] || this.keys["K"];
            //checks if d-pad is used or joysticks meet a certain threshold
            CONTROLLER.LEFT = this.gamepad.buttons[14].pressed || this.gamepad.axes[0] < -0.3 || this.keys["a"] || this.keys["A"];
            CONTROLLER.RIGHT = this.gamepad.buttons[15].pressed || this.gamepad.axes[0] > 0.3 || this.keys["d"] || this.keys["D"];
            CONTROLLER.UP = this.gamepad.buttons[12].pressed || this.gamepad.axes[1] < -0.3 || this.keys["w"] || this.keys["W"];
            CONTROLLER.DOWN = this.gamepad.buttons[13].pressed || this.gamepad.axes [1] > 0.3 || this.keys["s"] || this.keys["S"];
            CONTROLLER.BACK = this.gamepad.buttons[8].pressed || this.keys["r"] || this.keys["R"];
            CONTROLLER.LTRIG = this.gamepad.buttons[6].pressed || this.keys["m"] || this.keys["M"];
            CONTROLLER.RTRIG = this.gamepad.buttons[7].pressed || this.keys["l"] || this.keys["L"];
            CONTROLLER.HOME = this.gamepad.buttons[16].pressed || this.keys["\`"] || this.keys["\~"];
            }
            // if (PARAMS.DEBUG) this.gamepad.buttons.forEach((button, index) => { if (button.pressed) console.log("GamepadButton: " + index)});
        } else {
            CONTROLLER.A = this.keys[" "];
            CONTROLLER.X = this.keys["j"] || this.keys["J"];
            CONTROLLER.B = this.keys["k"] || this.keys["K"];
            CONTROLLER.LEFT = this.keys["a"] || this.keys["A"];
            CONTROLLER.RIGHT = this.keys["d"] || this.keys["D"];
            CONTROLLER.UP = this.keys["w"] || this.keys["W"];
            CONTROLLER.DOWN = this.keys["s"] || this.keys["S"];
            CONTROLLER.BACK = this.keys["r"] || this.keys["R"];
            CONTROLLER.LTRIG = this.keys["m"] || this.keys["M"];
            CONTROLLER.RTRIG = this.keys["l"] || this.keys["L"];
            CONTROLLER.HOME = this.keys["\`"] || this.keys["\~"];
        }
    }

    update() {
        // for (let i = this.entities.length - 1; i >= 0; --i) {
        //     this.entities[i].update();
        // }
        this.entities.forEach(entity => entity.update());
    };

    loop() {
        this.clockTick = this.timer.tick();
        this.tickMod = this.clockTick * 60;
        this.update();
        this.gamepadUpdate();
        this.draw();
        this.currentFrame++;
    };

    /**
     * Updates the {@link GameEngine.collidableEntities} array to contain only entities within a reasonable range of the {@link GameEngine.slime}.
     */
    updateCollidableEntities() {
        this.collidableEntities = Object.values(ASSET_MANAGER.world.rooms).filter((room) =>
            (room.x + room.w)*PARAMS.SCALE > this.camera.x - PARAMS.WIDTH*PARAMS.SCALE &&
            (room.x + room.w)*PARAMS.SCALE < this.camera.x + PARAMS.WIDTH*PARAMS.SCALE &&
            (room.y + room.h)*PARAMS.SCALE > this.camera.y - PARAMS.WIDTH*PARAMS.SCALE &&
            (room.y + room.h)*PARAMS.SCALE < this.camera.y + PARAMS.WIDTH*PARAMS.SCALE);
    }
};
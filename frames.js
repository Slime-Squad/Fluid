/**
 * Class representation of an animation.
 * @author Jasper Newkirk
 */
class Frames {
    /**
     * Constructs a new animation with the given src.
     * @param {String} src The path to the JSON file containing relevant information about the animation.
     */
    constructor(src) {
        this.src = src;
    }

    /**
     * Class representation of an animation frame.
     */
    Frame = class Frame {
        /**
         * Constructs an animation frame.
         * @param {number} x The x-coordinate associated with the top-left corner of the frame's sprite on the canvas.
         * @param {number} y The y-coordinate associated with the top-left corner of the frame's sprite on the canvas.
         * @param {number} w The width of the frame's sprite on the canvas.
         * @param {number} h The height of the frame's sprite on the canvas.
         * @param {number} duration The duration in seconds that the frame's sprite is intended to be displayed on the canvas.
         */
        constructor(x, y, w, h, duration) {
            Object.assign(this, { x, y, w, h, duration });
        }
    }

    /**
     * Initializes the {@link Frames.animations} dictionary, based upon the data located within the given JSON file.
     * @param {JSON} json The JSON object resulting from the file containing relevant information about the animation.
     */
    init(json) {
        this.animations = {};
        this.tags = [];
        Object.keys(json["frames"]).forEach((index) => {
            
            const frame = json["frames"][index];
            const tag = frame["filename"].split("#")[1];
            if (this.tags.indexOf(tag) === -1) this.tags.push(tag);
            if (this.animations[tag] === undefined) this.animations[tag] = []; // fencepost
            const x = frame["frame"]["x"];
            const y = frame["frame"]["y"];
            const w = frame["frame"]["w"];
            const h = frame["frame"]["h"];
            const duration = frame["duration"]/1000;
            this.animations[tag].push(new this.Frame(x, y, w, h, duration));
        });
    }

    /**
     * Animates the animation located in the given spritesheet with the given tag name on the given canvas. 
     * @param {CanvasRenderingContext2D} ctx The canvas to which the animation will be displayed upon.
     * @param {number} x The x-coordinate associated with the top-left corner of the animation's sprite on the canvas.
     * @param {number} y The y-coordinate associated with the top-left corner of the animation's sprite on the canvas.
     * @param {AnimatedEntity.Timer} Timer The {@link AnimatedEntity.timer} instance used to handle frame timing for the animation.
     * @param {HTMLImageElement} spritesheet The spritesheet image associated with the animation.
     * @param {String} tag The name of the animation to be animated, as it is defined in the JSON file used to initialize this {@link Frames} instance.
     * @param {boolean} loop Whether the entity's animation loops over again, after having finished playing once.
     */
    animateTag(ctx, x, y, Timer, spritesheet, tag, loop = true, direction = 1) {
        
        Timer.elapsedTime += PARAMS.GAME.clockTick;
        if (this.animations[tag].length <= Timer.frameIndex) {
            if (!loop) {
                // dereference function if not a looping animation (saves unneccessary computation)
                this.isDone(ctx, spritesheet, tag, x, y);
                return;
            }
            Timer.frameIndex = 0;
        }

        const frame = this.animations[tag][Timer.frameIndex];

        if (Timer.elapsedTime >= frame.duration) {
            Timer.elapsedTime = 0;
            Timer.frameIndex++;
        }

        // REMOVE FOR GLOW
        // ctx.shadowColor = PARAMS.COLORS.DARKGREEN;
        // ctx.shadowOffsetX = 0;
        // ctx.shadowOffsetY = 0;
        // ctx.shadowBlur = 15;

        ctx.drawImage(spritesheet, frame.x, frame.y, frame.w, frame.h, x, y,
            frame.w*PARAMS.SCALE, frame.h*PARAMS.SCALE);
    }

    /**
     * Freezes the current animation being displayed on the first frame. Intended for use on animations not meant to loop indefinitely.
     * @param {CanvasRenderingContext2D} ctx The canvas to which the frame will be displayed upon.
     * @param {HTMLImageElement} spritesheet The spritesheet image associated with the animation the frame exists in.
     * @param {String} tag The name of the animation in which the frame exists in, as it is defined in the JSON file used to initialize this {@link Frames} instance.
     * @param {number} x The x-coordinate associated with the top-left corner of the frame's sprite on the canvas.
     * @param {number} y The y-coordinate associated with the top-left corner of the frame's sprite on the canvas.
     */
    isDone(ctx, spritesheet, tag, x, y) {
            ctx.drawImage(spritesheet, this.animations[tag][0].x, 
                this.animations[tag][0].y, 
                this.animations[tag][0].w, 
                this.animations[tag][0].h, 
                x, y, 
                this.animations[tag][0].w*PARAMS.SCALE, 
                this.animations[tag][0].h*PARAMS.SCALE);
    }
}
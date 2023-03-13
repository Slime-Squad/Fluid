/**
 * Class representation of a room within a {@link World} made up of {@link Tile}s.
 * @author Jasper Newkirk
 */
class Room {
    /**
     * Constructs a new room, responsible for containing a collection of {@link Tile}s.
     * @param {object} layers A dictionary of lists where every key is a layer and every value is a {@link Tile} index array.
     * @param {*} x The x-coordinate associated with the top-left corner of the room.
     * @param {*} y The y-coordinate associated with the top-left corner of the room.
     * @param {*} w The width of the room measured in unscaled pixels.
     * @param {*} h The width of the room measured in unscaled pixels.
     */
    constructor(layers, x, y, w, h) {
        Object.assign(this, { layers, x, y, w, h });
    }
    /**
     * Initializes the room instance according to the given json specifications
     * @param {JSON} json the json data of the room file
     */
    init(json) {
        const firstgids = {};
        // https://doc.mapeditor.org/en/stable/reference/global-tile-ids/
        json["tilesets"].forEach((tileset) => firstgids[tileset["firstgid"]] = "./assets/graphics/map/" + tileset["source"].split("/").slice(-1).toString().split(".")[0] + ".png");

        json["layers"].forEach((layer) => {
            if (!layer["name"].includes("draft")) {
                let tiles = [...layer["data"]];
                const maxGid = Math.max(...tiles);
                let gid = 0;
                Object.keys(firstgids).forEach((firstgid) => {
                    if (firstgid <= maxGid && firstgid > gid) {
                        gid = firstgid;
                    }
                });
                tiles = [...tiles.map((elem) => elem - Math.max(gid,1))];

                console.log(layer["name"], gid, tiles)
                this.layers[layer["name"]] = [firstgids[gid], tiles]; // tileset path, tile indices array
            }
        });
        this.entities = [];
        // init tile
        this.tiles = {};
        Object.keys(this.layers).forEach((layer) => {
            if (this.layers[layer][1] !== undefined) {
                this.tiles[layer] = [];
                const img = ASSET_MANAGER.getAsset(this.layers[layer][0]);
                this.layers[layer][1].forEach((elem, index) => {
                    if (elem >= 0) {
                        const x = this.x*PARAMS.SCALE + ((index)%(this.w/8))*8*PARAMS.SCALE;
                        const y = this.y*PARAMS.SCALE + Math.floor((index)/(this.w/8))*8*PARAMS.SCALE;
                        if (layer.includes("draft")) return;
                        if (layer == "entity") { // TODO: ADD ENTITIES HERE
                            let entity;
                            switch(elem) {
                                case 0:
                                    entity = new Slime("Idle", x, y)
                                    break;
                                case 1:
                                    break;
                                case 2:
                                    entity = new Charge("Electric", x, y);
                                    break;
                                case 3:
                                    entity = new Charge("Fire", x, y);
                                    break;
                                case 4:
                                    entity = new Charge("Earth", x, y);
                                    break;
                                case 5:
                                    entity = new Charge("Ice", x, y);
                                    break;
                                case 6:
                                    entity = new Batterflea("JumpL", x, y);
                                    break;
                                case 7:
                                    entity = new Bubble("Idle", x, y);
                                    break;
                                case 8:
                                    entity = new Magmasquito("SuckL", x, y);
                                    break;
                                case 9:
                                    entity = new Skiwi("WalkL", x, y);
                                    break;
                                case 10:
                                    entity = new Tabemasu("IdleLeft", x, y);
                                    break;
                                case 11:
                                    entity = new ChargeGenerator("Electric", x, y);
                                    break;
                                case 12:
                                    entity = new ChargeGenerator("Fire", x, y);
                                    break;
                                case 13:
                                    entity = new ChargeGenerator("Earth", x, y);
                                    break;
                                case 14:
                                    entity = new ChargeGenerator("Ice", x, y);
                                    break;
                                case 15:
                                    entity = new Sentry(x, y, "Tabemasu", "Alert", 64 * PARAMS.SCALE, 64 * PARAMS.SCALE);
                                    break;
                                case 16:
                                    entity = new Tabemasu("Idle", x, y);
                                    break;
                                case 18:
                                    entity = new KillBox(x, y);
                                    break;
                                case 19:
                                    entity = new Checkpoint("Idle", x, y);
                                    break;
                                case 21:
                                    entity = new Radiation(x, y);
                                    break;
                                case 36:
                                    entity = new JukeBox(x, y);
                                    break;
                                case 37:
                                    entity = new JukeBox(x, y, "stone", "pacifica.mp3");
                                    break;
                                case 38:
                                    entity = new JukeBox(x, y, "dirt", "aerial.mp3");
                                    break;
                                case 39:
                                    entity = new JukeBox(x, y, "fire", "metrodrome.mp3");
                                    break;
                                case 40:
                                    entity = new JukeBox(x, y, "ice", "meeting.mp3");
                                    break;
                                case 41:
                                    entity = new JukeBox(x, y, "dirt", "bowser.mp3");
                                    break;
                            }
                            if (entity && entity.hitbox) {
                                this.tiles[layer].push(entity);
                                if (entity.constructor.name != "Slime") this.entities.push(entity);
                                Object.values(entity).forEach(field => {
                                    if (field instanceof AnimatedEntity && field.hitbox) this.entities.push(field);
                                });
                            }
                        } else {
                            const directionsAirAdjacent = layer == "map" && this.isAirAdjacent(index);
                            const tile = new Tile(
                                img,
                                this.x*PARAMS.SCALE + ((index)%(this.w/8))*8*PARAMS.SCALE,
                                this.y*PARAMS.SCALE + Math.floor((index)/(this.w/8))*8*PARAMS.SCALE,
                                (elem%13)*8,
                                Math.floor(elem/13)*8,
                                8,
                                8,
                                directionsAirAdjacent
                            );
                            this.tiles[layer].push(tile);
                            this.entities.push(tile);
                        }
                    }
                });
            }
        });
        
    }

    /**
     * Returns a list of indexes of the directions where the {@link Tile} object is adjacent to a null tile. 
     * Used to determine whether the tile should recieve a {@link HitBox} and which directions it should check collision for.
     * @param {number} index The index of the current {@link Tile} object to be placed.
     * @returns The indexes of the directions from the {@link Tile} object adjacent to a null tile.
     * @description [0]: top, [1]: right, [2]: bottom, [3]: left 
     */
    isAirAdjacent(index) {
        const w = this.w/8;
        const directionsOfSpaces = [];
        if (this.layers["map"][1][index] >= 0) {
            let dirs = [-w,1,w,-1];
            if ((index+1)%w == 0) { // on right edge
                dirs = [-w,undefined,w,-1];
            } else if (index%w == 0) { // on left edge
                dirs = [-w,1,w,undefined];
            }
            for (let i = 0; i < dirs.length; i++) {
                if (this.layers["map"][1][index+dirs[i]] !== undefined) {
                    if (this.layers["map"][1][index+dirs[i]] < 0) directionsOfSpaces.push(i);
                }
            }
        }
        // if (this.layers["map"][1][index] >= 0) {
        //     let dirs = [-w,1,w,-1,w+1,w-1,-w+1,-w-1];
        //     if ((index+1)%w == 0) { // on right edge
        //         dirs = [-w,undefined,w,-1,undefined,w-1,undefined,-w-1];
        //     } else if (index%w == 0) { // on left edge
        //         dirs = [-w,1,w,undefined,w+1,undefined,-w+1,undefined];
        //     }
        //     for (let i = 0; i < dirs.length; i++) {
        //         if (this.layers["map"][1][index+dirs[i]] !== undefined) {
        //             if (this.layers["map"][1][index+dirs[i]] < 0) directionsOfSpaces.push(i);
        //         }
        //     }
        // }
        return directionsOfSpaces;
    }
}
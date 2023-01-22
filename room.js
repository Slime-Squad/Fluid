/**
 * Class representation of a room within a {@link World} made up of {@link Tile}s.
 * @author Jasper Newkirk
 */
class Room {
    /**
     * 
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
            if (layer["name"] != "draft") {
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
        console.log(this)
        // init tiles
        this.tiles = {};
        Object.keys(this.layers).forEach((layer) => {
            if (this.layers[layer][1] !== undefined) {
                this.tiles[layer] = [];
                console.log(layer, this.layers[layer][0])
                const img = ASSET_MANAGER.getAsset(this.layers[layer][0]);
                this.layers[layer][1].forEach((elem, index) => {
                    
                    if (elem >= 0) {
                        const x = this.x*PARAMS.SCALE + ((index)%(this.w/8))*8*PARAMS.SCALE;
                        const y = this.y*PARAMS.SCALE + Math.floor((index)/(this.w/8))*8*PARAMS.SCALE;
                        if (layer == "entity") { // TODO: ADD ENTITIES HERE
                            switch(elem) {
                                case 0:
                                    this.tiles[layer].push(new Slime("Idle", x, y))
                                    break;
                                case 1:
                                    break;
                                case 2:
                                    this.tiles[layer].push(new Charge("Electric", x, y));
                                    break;
                                case 3:
                                    this.tiles[layer].push(new Charge("Fire", x, y));
                                    break;
                                case 4:
                                    this.tiles[layer].push(new Charge("Earth", x, y));
                                    break;
                                case 5:
                                    this.tiles[layer].push(new Charge("Ice", x, y));
                                    break;
                            }
                        } else {
                            this.tiles[layer].push(
                                new Tile(
                                    img,
                                    this.x*PARAMS.SCALE + ((index)%(this.w/8))*8*PARAMS.SCALE,
                                    this.y*PARAMS.SCALE + Math.floor((index)/(this.w/8))*8*PARAMS.SCALE,
                                    (elem%13)*8,
                                    Math.floor(elem/13)*8
                                )
                            );
                        }
                        //console.log(this.tiles[layer][index])
                    }
                });
               
            }
        });
    }
}
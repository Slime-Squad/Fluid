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
            const tiles = [...layer["data"]];
            const maxGid = Math.max(...tiles);
            let gid = 0;
            Object.keys(firstgids).forEach((firstgid) => {
                if (firstgid <= maxGid && firstgid > gid) {
                    gid = firstgid;
                }
            });
            tiles.map((elem) => elem -= gid);
            this.layers[layer["name"]] = [firstgids[gid], tiles]; // tileset path, tile indices array
        });
        // init tiles
        this.tiles = {};
        Object.keys(this.layers).forEach((layer) => {
            if (this.layers[layer][1] !== undefined) {
                this.tiles[layer] = [];
                this.layers[layer][1].forEach((elem, index) => {
                    elem--;
                    if (elem >= 0) {
                        this.tiles[layer].push(
                            new Tile(
                                ASSET_MANAGER.getAsset(this.layers[layer][0]),
                                this.x*PARAMS.SCALE + ((index)%(this.w/8))*8*PARAMS.SCALE,
                                this.y*PARAMS.SCALE + Math.floor((index)/(this.w/8))*8*PARAMS.SCALE,
                                (elem%13)*8,
                                Math.floor(elem/13)*8
                            )
                        );
                    }
                });
               
            }
        });
    }
}
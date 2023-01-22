/**
 * Class representation of the game world.
 * @author Jasper Newkirk
 */
class World {
    /**
     * Constructs a new game world from the given file path.
     * @param {string} src The path of the *.world file to be associated with this world.
     */
    constructor(src) {
        this.src = src;
        this.rooms = {};
    }

    /**
     * Initializes the game world instance according to the given json specifications.
     * @param {JSON} json The json data of the {@link World.src} world file.
     */
    init(json) {
        json["maps"].forEach((room) => {
            const roomName = room["fileName"].split(".")[0];
            const x = room["x"];
            const y = room["y"];
            const w = room["width"];
            const h = room["height"];
            const layers = {
                "bg": [],
                "map": [],
                "entity": [],
                "fg": []
            };
            this.rooms[roomName] = new Room(layers, x, y, w, h);
            ASSET_MANAGER.queueDownload("./assets/world/room/" + roomName + ".json");
        });
    }
}
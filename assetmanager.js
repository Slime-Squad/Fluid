/**
 * Class responsible for handling the loading and caching of game files and assets.
 * @author Jasper Newkirk
 * @author Chris Marriott
 */
class AssetManager {
    /**
     * Constructs the asset manager.
     */
    constructor() {
        this.successCount = 0;
        this.errorCount = 0;
        this.cache = [];
        this.downloadQueue = [];
    }
    /**
     * Adds the file of given path to the {@link AssetManager.downloadQueue}.
     * @param {String} path The path of the file to be queued for download.
     */
    queueDownload(path) {
        console.log("Queueing " + path);
        this.downloadQueue.push(path);
    }
    /**
     * Returns whether the {@link AssetManager.downloadQueue} has finished downloading and caching all files. 
     * @returns whether the {@link AssetManager.downloadQueue} has finished downloading and caching all files. 
     */
    isDone() {
        return this.downloadQueue.length === this.successCount + this.errorCount;
    }
    /**
     * Attempts to download and cache all files present in the {@link AssetManager.downloadQueue}.
     * @param {function} callback The function to be called once the {@link AssetManager.downloadQueue} has finished downloading and caching all files. 
     */
    downloadAll(callback) {
        if (this.downloadQueue.length === 0) setTimeout(callback, 10);
        for (let i = 0; i < this.downloadQueue.length; i++) {

            const path = this.downloadQueue[i];
            
            const ext = path.split(".").slice(-1).toString(); // obtain string after last "."
            
            switch(ext) {
                case 'png':
                    const img = new Image;
                    this.handleEventListeners(img, callback);
                    img.src = path;
                    this.cache[path] = img;
                    break;
                case 'wav':
                case 'mp3':
                    const aud = new Audio();
                    this.handleEventListeners(aud, callback, () => {
                        aud.addEventListener("loadeddata", () => {
                            console.log("Loaded " + aud.src);
                            this.successCount++;
                            if (this.isDone()) callback(this.requests);
                        });
                        aud.addEventListener("ended", () => {
                            if (path.split("/").slice(-2)[0] == "music") {
                                aud.play();
                            } else {
                                aud.pause();
                                aud.currentTime = 0;
                            }
                        });
                    });
                    aud.src = path;
                    aud.load();
                    this.cache[path] = aud;
                    break;
                case 'world':
                case 'json':
                    let json = new XMLHttpRequest();
                    this.handleEventListeners(json, callback, () => {
                        json.onreadystatechange = () => {
                            if (json.readyState == 4 && json.status == 200) {
                                json = JSON.parse(json.responseText);
                                if (json["frames"] !== undefined) { // is an animation
                                    const anim = new Frames(path);
                                    anim.init(json);
                                    this.cache[path] = anim;
                                    return anim;
                                } else if (json["maps"] !== undefined) { // is a world
                                    this.world = new World(path);
                                    this.world.init(json);
                                    this.cache[path] = this.world;
                                    return this.world;
                                } else if (json["layers"] !== undefined) { // is a room
                                    if (this.world.rooms[path.split(".")[1].split("/").slice(-1).toString()])
                                        this.world.rooms[path.split(".")[1].split("/").slice(-1).toString()].init(json);
                                }
                            }
                        }
                    });
                    json.src = path;
                    json.open("GET", path, false);
                    json.send();
                    break;
            }
        }
    }
    /**
     * Adds necessary event listeners to the given asset.
     * @param {Object} asset The Object resulted from a file without any event listeners.
     * @param {function} callback The function to be called once the {@link AssetManager.downloadQueue} has finished downloading and caching all files.
     * @param {function} optionalListeners Function containing additional listeners to be added to the given Object.
     */
    handleEventListeners(asset, callback, optionalListeners = () => {}) {
        
        asset.addEventListener("load", () => {
            console.log("Loaded " + asset.src);
            this.successCount++;
            if (this.isDone()) callback(this.requests);
        });

        asset.addEventListener("error", () => {
            console.log("Error loading " + asset.src);
            this.errorCount++;
            if (this.isDone()) callback(this.requests);
        });

        optionalListeners();
    }

    /**
     * Returns the asset retrieved from the given path as it exists in the {@link AssetManager.cache}.
     * @param {String} path The path of an asset previously downloaded and cached to this {@link AssetManager}.
     * @returns The asset retrieved from the given path as it exists in the {@link AssetManager.cache}.
     */
    getAsset(path) {
        return this.cache[path];
    }

    /**
     * Plays the audio asset retrieved from the given path as it exists in the {@link AssetManager.cache}.
     * @param {String} path The path of an audio asset previously downloaded and cached to this {@link AssetManager}.
     */
    playAudio(path) {
        const aud = this.cache[path];
        aud.volume = path.split("/")[3] == "music" ? PARAMS.MAX_VOLUME : PARAMS.MAX_VOLUME / 2;
        // aud.volume = PARAMS.MAX_VOLUME;
        aud.currentTime = 0;
        aud.play();
    }

    /**
     * Stops the playing of all current background music.
     */
    killBackgroundMusic() {
        Object.keys(this.cache).forEach(path => {
            if (this.cache[path] instanceof Audio && path.split("/").slice(-2)[0] == "music") {
                this.cache[path].pause();
                this.cache[path].currentTime = 0;
            }
        });
    }

    setBackgroundMusicVolume(volume) {
        if (volume == 0) {
            this.killBackgroundMusic();
            return;
        }
        Object.keys(this.cache).forEach(path => {
            if (this.cache[path] instanceof Audio && path.split("/").slice(-2)[0] == "music") {
                this.cache[path].volume = volume;
            }
        });
    }

    /**
     * Mutes or unmutes all audio assets that currently exist in the {@link AssetManager.cache}.
     * @param {boolean} mute Whether to mute or unmute all audio assets.
     */
    muteAudio(mute) {
        Object.keys(this.cache).forEach(path => {
            if (this.cache[path] instanceof Audio)
            this.cache[path].muted = mute;
        });
    }
};


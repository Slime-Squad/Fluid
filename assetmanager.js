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
    async downloadAll(callback) {
        if (this.downloadQueue.length === 0) setTimeout(callback, 10);
        for (let i = 0; i < this.downloadQueue.length; i++) {

            const path = this.downloadQueue[i];
            
            const ext = path.split(".").slice(-1).toString(); // obtain string after last "."
            
            switch(ext) {
                case 'png':
                    let img = new Image;
                    this.handleEventListeners(img, callback);
                    img.src = path;
                    this.cache[path] = img;
                    break;
                case 'wav':
                case 'mp3':
                    let aud = new Audio();
                    this.handleEventListeners(aud, callback, () => {
                        aud.addEventListener("ended", function () {
                            aud.pause();
                            aud.currentTime = 0;
                        });
                    });
                    aud.src = path;
                    aud.load();
                    this.cache[path] = aud;
                    break;
                case 'json':
                    await fetch(path)
                        .then((response) => response.json())
                        .then((json) => {
                            if (json["frames"] !== undefined) { // is an animation
                                let anim = new Frames(path);
                                anim.init(json);
                                this.cache[path] = anim;
                                return anim;
                            }
                        })
                        .then((asset) => {
                            console.log("Loaded " + asset.src);
                            this.successCount++;
                            if (this.isDone()) callback();
                        })
                        .catch(() => {
                            console.log("Error loading " + path);
                            this.errorCount++;
                            if (this.isDone()) callback();
                        });
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
            if (this.isDone()) callback();
        });

        asset.addEventListener("error", () => {
            console.log("Error loading " + asset.src);
            this.errorCount++;
            if (this.isDone()) callback();
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
};


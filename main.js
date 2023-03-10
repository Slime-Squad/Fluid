/**
 * The Asset Manager for the game responsible for downloading and caching all game assets and files.
 */
const ASSET_MANAGER = new AssetManager();
/**
 * The path to the JSON file "assets.json", which contains all the filepaths of the assets needed to be loaded in the {@link ASSET_MANAGER} upon initialization.
 */
const ASSET_PATHS = "./assets/assets.json";
/**
 * Queues all of the assets for download and cache in the {@link ASSET_MANAGER}.
 * @param {Object} json The JSON object resulting from the file located at {@link ASSET_PATHS}.
 */
function queueAssetDownload(json) {
	Object.keys(json).forEach((type) => {
		Object.keys(json[type]).forEach((category) => {
			Array.from(json[type][category]).forEach((asset) => {
				ASSET_MANAGER.queueDownload("./assets/" + type + "/" + category + "/" + asset);
			});
		});
	});
}

fetch(ASSET_PATHS)
	.then((response) => response.json())
	.then(json => queueAssetDownload(json))
	.then(() => 
		ASSET_MANAGER.downloadAll(() => {
		
			ASSET_MANAGER.muteAudio(PARAMS.MUTE);

			GAME = new GameEngine();
			const canvas = document.getElementById("gameWorld");

			const ctx = canvas.getContext("2d", { alpha: false });

			ctx.imageSmoothingEnabled = false; // disable antialiasing

			PARAMS.TICK = GAME.clockTick;
			PARAMS.BLOCKSIZE = PARAMS.BITWIDTH*PARAMS.SCALE;
			PARAMS.WIDTH = Number(canvas.getAttribute("width"));
			PARAMS.HEIGHT = Number(canvas.getAttribute("height"));
			PARAMS.GRAVITY = 1 / PARAMS.SCALE;
			
			
			GAME.init(ctx);
			GAME.CTX = ctx;
			GAME.start();
		
		})
	);


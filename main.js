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
		
			const gameEngine = new GameEngine();
			const canvas = document.getElementById("gameWorld");
			const ctx = canvas.getContext("2d");

			ctx.imageSmoothingEnabled = false; // disable antialiasing

			PARAMS.TICK = gameEngine.clockTick;
			PARAMS.BLOCKWIDTH = PARAMS.BITWIDTH*PARAMS.SCALE;
			PARAMS.WIDTH = canvas.getAttribute("width");
			PARAMS.HEIGHT = canvas.getAttribute("height");
			
			gameEngine.init(ctx);

			const c1 = new Charge(gameEngine, "Disabled", 50, 50);
			const c2 = new Charge(gameEngine, "Fire", 100, 50);
			const c3 = new Charge(gameEngine, "Ice", 150, 50);
			const c4 = new Charge(gameEngine, "Electric", 200, 50);
			const c5 = new Charge(gameEngine, "Earth", 250, 50);

			const slime1 = new Slime(gameEngine, "Idle", PARAMS.WIDTH/2, PARAMS.HEIGHT/2);
			gameEngine.addEntity(slime1);
			
			gameEngine.addEntity(c1);
			gameEngine.addEntity(c2);
			gameEngine.addEntity(c3);
			gameEngine.addEntity(c4);
			gameEngine.addEntity(c5);
		
			gameEngine.start();
		
		})
	);


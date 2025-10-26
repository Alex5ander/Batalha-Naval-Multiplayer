const MarkerTile = new Image();
MarkerTile.src = '../images/markertile.png';

const Crosshair = new Image();
Crosshair.src = '../images/crosshair.png';

const loadAssets = async (callback) => {
  await Promise.all([MarkerTile, Crosshair].map(e => new Promise(resolve => e.onload = resolve)));
  try {
    await window.CrazyGames.SDK.init();
    await window.CrazyGames.SDK.game.loadingStart();
    await window.CrazyGames.SDK.game.loadingStop();
  } catch (e) {
    console.log("CrazyGames SDK init error", e);
  }
  callback();
}

export { MarkerTile, Crosshair, loadAssets };

const WaterTile = new Image();
WaterTile.src = '../images/watertilespritesheet.png';

const MarkerTile = new Image();
MarkerTile.src = '../images/markertile.png';

const Crosshair = new Image();
Crosshair.src = '../images/crosshair.png';

const onLoadAssets = async (callback) => {
  await Promise.all([WaterTile, MarkerTile, Crosshair].map(e => new Promise(resolve => e.onload = resolve)))
  callback();
}

export { WaterTile, MarkerTile, Crosshair, onLoadAssets };

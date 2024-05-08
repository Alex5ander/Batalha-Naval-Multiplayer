const MarkerTile = new Image();
MarkerTile.src = '../images/markertile.png';

const Crosshair = new Image();
Crosshair.src = '../images/crosshair.png';

const onLoadAssets = async (callback) => {
  await Promise.all([MarkerTile, Crosshair].map(e => new Promise(resolve => e.onload = resolve)))
  callback();
}

export { MarkerTile, Crosshair, onLoadAssets };

import Piece from "./Piece.js";
import { gameArea } from "./canvas.js";
import { battle, cancel, editor, play, resetGame, setPlayerName, setLastPiece, lastPiece, listener } from "./game.js";

/** @type {HTMLButtonElement} */
const btnBattle = document.getElementById('btn-battle');
/** @type {HTMLButtonElement} */
const btnPlay = document.getElementById('btn-play');
/** @type {HTMLButtonElement} */
const btnCancel = document.getElementById('btn-cancelar');
/** @type {HTMLButtonElement} */
const btnBack = document.getElementById('btn-back');
/** @type {HTMLButtonElement} */
const btnRotatePiece = document.getElementById('btn-rotate');
/** @type {HTMLButtonElement} */
const btnShuffle = document.getElementById('btn-shuffle');

/** @type {HTMLDivElement} */
const loading = document.getElementById("loading");
/** @type {HTMLDivElement} */
const awaitcontainer = document.getElementById('awaitcontainer');
/** @type {HTMLDivElement} */
const formBattle = document.getElementById('form-battle');
/** @type {HTMLDivElement} */
const boardEditorControls = document.getElementById('board-editor');
/** @type {HTMLInputElement} */
const inputPlayerName = document.getElementById('input-player-name');

/** @param {MouseEvent} e */
const rotatePiece = (e) => {
  e.preventDefault();
  if (lastPiece) {
    editor.rotatePieceInBoard(lastPiece);
    setLastPiece(lastPiece.inBoard ? lastPiece : null);
    btnRotatePiece.disabled = lastPiece == null;
  }
}

/** @param {Piece} piece */
const onPointerUp = (piece) => {
  editor.drop(piece);
  setLastPiece(piece.inBoard ? piece : null);
  btnRotatePiece.disabled = !lastPiece;
}

const onPointerDown = (_) => {
  setLastPiece(null);
  btnRotatePiece.disabled = true;
}

/** @param {MouseEvent} e */
const cancelBattle = (e) => {
  cancel(e);
  formBattle.classList.remove('hidden');
  awaitcontainer.classList.add('hidden');
  boardEditorControls.classList.remove('hidden');
}

/** @param {MouseEvent} e */
const playGame = (e) => {
  try {
    window.CrazyGames.SDK.banner.clearBanner("banner-container");
  } catch (error) {
    console.log("Clear banner error", error);
  }
  play(e);
  editor.onDrop = (allInBoard) => {
    if (allInBoard === true) {
      formBattle.classList.remove('hidden');
    } else if (allInBoard === false) {
      formBattle.classList.add('hidden');
    }
  }
  btnPlay.classList.add('hidden');
  boardEditorControls.classList.remove('hidden');

  editor.pieces.forEach(piece => {
    piece.onPointerDown = onPointerDown;
    piece.onPointerUp = onPointerUp;
  })
}

/** @param {MouseEvent} e */
const shuffle = (e) => {
  e.preventDefault();
  editor.shuffle();
  setLastPiece(null);
  btnRotatePiece.disabled = true;
}

const onJoin = () => {
  formBattle.classList.add('hidden');
  boardEditorControls.classList.add('hidden');
  awaitcontainer.classList.remove('hidden');
}

const reseteUI = () => {
  btnPlay.classList.remove('hidden');
  btnBack.classList.add('hidden');
  formBattle.classList.add('hidden');
  awaitcontainer.classList.add('hidden');
  boardEditorControls.classList.add('hidden');
}

/** @param {Event} e */
const onInputName = (e) => {
  setPlayerName(e.target.value);
  btnBattle.disabled = e.target.value.length < 3;
}

const onLoadAssets = () => {
  loading.classList.add('hidden');
  gameArea.classList.remove('hidden');
}

btnCancel.addEventListener('click', cancelBattle);
btnPlay.addEventListener('click', playGame);
btnShuffle.addEventListener('click', shuffle);
btnBack.addEventListener('click', resetGame);
btnBattle.addEventListener('click', battle);
btnRotatePiece.addEventListener('click', rotatePiece);
inputPlayerName.addEventListener('input', onInputName);

listener.onJoin = onJoin;
listener.onEnd = () => btnBack.classList.remove('hidden');
listener.onStart = () => {
  awaitcontainer.classList.add('hidden');
  try {
    window.CrazyGames.SDK.game.gameplayStart();
  } catch (e) {
    console.log("CrazyGames SDK gameplayStart error", e);
  }
}
listener.onResetGame = reseteUI;
listener.onLoadAssets = onLoadAssets;
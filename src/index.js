import './style.css';

import audioSrc from './audio.mp3';

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

const audioElement = document.querySelector('audio');
audioElement.src = audioSrc;
const track = audioCtx.createMediaElementSource(audioElement);
const analyser = audioCtx.createAnalyser();

const playButton = document.getElementById("playButton");

track.connect(audioCtx.destination);
track.connect(analyser);

// Play Button
playButton.addEventListener('click', function() {

  // check if context is in suspended state (autoplay policy)
  if (audioCtx.state === 'suspended') {
      audioCtx.resume();
  }

  // play or pause track depending on state
  if (this.dataset.playing === 'false') {
      audioElement.play();
      this.dataset.playing = 'true';
  } else if (this.dataset.playing === 'true') {
      audioElement.pause();
      this.dataset.playing = 'false';
  }

}, false);


// Viz stuff
const canvas = document.getElementById("visualization");
const size = {
  WIDTH: canvas.offsetWidth,
  HEIGHT: canvas.offsetHeight,
  RADIUS: 175
}
analyser.fftSize = 128;
var bufferLength = analyser.frequencyBinCount;
var dataArray = new Uint8Array(bufferLength);
// var dataArray = new Float32Array(bufferLength);

canvas.setAttribute('width', size.WIDTH)
canvas.setAttribute('height', size.HEIGHT);
var canvasCtx = canvas.getContext("2d");


canvasCtx.clearRect(0, 0, size.WIDTH, size.HEIGHT);

function draw() {
  requestAnimationFrame(draw);

  analyser.getByteFrequencyData(dataArray);

  // build data
  const lowFreqArray = dataArray.slice(8, 33);
  const reversedArray = lowFreqArray.slice().reverse();
  const fullArray = [...new Array(8)].reduce((acc, n, i) => {
    return [...acc, ...(i % 2 ? lowFreqArray : reversedArray)]
  }, []);
  // const fullArray = [...new Array(8)].reduce(acc => [...acc, ...lowFreqArray], []);
  const fullLength = fullArray.length;
  const avg = fullArray.reduce((acc, n) => acc+n, 0) / fullLength;

  // gradient background
  // var grd = canvasCtx.createLinearGradient(size.WIDTH/2, 0, size.WIDTH/2, size.HEIGHT);
  // grd.addColorStop(0.00, 'rgba(0, 0, 0, 1.000)');
  // grd.addColorStop(1.000, 'rgba(255, 100, 100, 1.000)');
  canvasCtx.fillStyle = `rgb(0, 0, 0)`;

  // draw canvas
  canvasCtx.fillRect(0, 0, size.WIDTH, size.HEIGHT);
  canvasCtx.translate(size.WIDTH/2, size.HEIGHT/2);

  // draw frequency bars
  fullArray.map((n, i) => {
    canvasCtx.rotate((360/fullLength*1) * Math.PI / 180);
    canvasCtx.fillStyle = `rgb(${n}, ${255 - n}, ${255 - n})`;
    canvasCtx.fillRect(0, size.RADIUS - (avg/3), 2, n && n+50);
  })

  canvasCtx.setTransform(1, 0, 0, 1, 0, 0);

}

draw();

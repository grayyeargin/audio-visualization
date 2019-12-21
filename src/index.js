import './style.css';

import audioSrc from './audio.mp3';

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

const audioElement = document.querySelector('audio');
audioElement.src = audioSrc;
const track = audioCtx.createMediaElementSource(audioElement);
const analyser = audioCtx.createAnalyser();
analyser.fftSize = 128;

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

});

// reset button state when track ends
audioElement.addEventListener('ended', function(){
  playButton.setAttribute('data-playing', 'false');
});

// Vizualization
const canvas = document.getElementById("visualization");
const size = {
  WIDTH: canvas.offsetWidth,
  HEIGHT: canvas.offsetHeight,
  RADIUS: 175
};
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);
const canvasCtx = canvas.getContext("2d");

canvas.setAttribute('width', size.WIDTH);
canvas.setAttribute('height', size.HEIGHT);
canvasCtx.clearRect(0, 0, size.WIDTH, size.HEIGHT);

var soundBooms = [],
prevAvg;

// draws canvas animations from audio analyser data
const draw = () => {
  // performs animations and passes draw() as callback for next repaint
  requestAnimationFrame(draw);

  //
  analyser.getByteFrequencyData(dataArray);

  // build data
  const lowFreqArray = dataArray.slice(6, 35);
  const reversedArray = lowFreqArray.slice().reverse();
  const fullArray = [...new Array(8)].reduce((acc, n, i) => {
    return [...acc, ...(i % 2 ? lowFreqArray : reversedArray)]
  }, []);

  const fullLength = fullArray.length;
  const avg = fullArray.reduce((acc, n) => acc+n, 0) / fullLength;

  canvasCtx.fillStyle = 'rgb(0,0,0)';

  // draw canvas
  canvasCtx.fillRect(0, 0, size.WIDTH, size.HEIGHT);
  canvasCtx.translate(size.WIDTH/2, size.HEIGHT/2);

  // create sounds boom ring
  avg > 100 && avg > (prevAvg + 5) && soundBooms.push(size.RADIUS - (avg/3));
  // animate sound booms
  soundBooms = soundBooms.map((boomRadius) => {
    canvasCtx.strokeStyle = `rgba(51, 51, 51, ${1-(boomRadius/500)}`;
    canvasCtx.lineWidth = 8;
    canvasCtx.beginPath();
    canvasCtx.arc(0, 0, boomRadius, 0, Math.PI*2);
    canvasCtx.fill();
    canvasCtx.stroke();
    return boomRadius < 500 && boomRadius + 2
  }).filter(r => !!r);

  prevAvg = avg;

  // draw frequency bars
  fullArray.map((n, i) => {
    canvasCtx.rotate((360/fullLength*1) * Math.PI / 180);
    canvasCtx.fillStyle = `rgb(${n*1.5}, ${n/2}, ${255 - n})`;
    canvasCtx.fillRect(0, size.RADIUS - (avg/3), 2, n && n+50);
  })

  canvasCtx.setTransform(1, 0, 0, 1, 0, 0);
}

// initial draw
draw();

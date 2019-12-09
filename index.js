const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

const audioElement = document.querySelector('audio');
const track = audioCtx.createMediaElementSource(audioElement);
const analyser = audioCtx.createAnalyser();

const playButton = document.getElementById("playButton");

track.connect(audioCtx.destination);
track.connect(analyser);

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


// Vizualization
var frequencyData = new Uint8Array(200);

var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 460 - margin.left - margin.right,
    height = 460 - margin.top - margin.bottom,
    innerRadius = 80,
    outerRadius = Math.min(width, height) / 2;

// append the svg object to the body of the page
var svg = d3.select("#visualization")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + ( height/2+100 )+ ")");

  // X scale
  var x = d3.scaleBand()
      .range([0, 2 * Math.PI])
      .align(0)
      .domain([0, analyser.fftSize]);

  // Y scale
  var y = d3.scaleRadial()
      .range([innerRadius, outerRadius])
      .domain([0, 255]);

  // Add bars

  function renderChart() {
    requestAnimationFrame(renderChart);
    analyser.getByteFrequencyData(frequencyData);
    svg.append("g")
        .selectAll("path")
        .data(data)
        .enter()
        .append("path")
        .attr("fill", "#69b3a2")
        .attr("d", d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(function(d) { return y(d); })
            .startAngle(function(d, i) { return x.bandwidth() + x(i); })
            .endAngle(function(d) { return x(i) + x.bandwidth() + 1; })
            .padAngle(0.01)
            .padRadius(innerRadius))
  }

  renderChart();
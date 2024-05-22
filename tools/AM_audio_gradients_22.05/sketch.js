let soundFile;
let fft;
let amplitude;
let fileInput;
let slider;
let gradData = [];
const numGradients = 20;
let ctx;
let colors = [
  [239, 59, 36],
  [68, 0, 255],
  [255, 234, 0],
  [0, 255, 166],
  [192, 179, 48],
  [170, 78, 57],
  [87, 57, 170],
  [57, 170, 131],
  [128, 122, 64],
  [85, 62, 57]
];
let spectrum;

function preload() {
  // Create a file input element for the user to upload an audio file
  fileInput = createFileInput(handleFile);
  fileInput.position(0, 0);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  ctx = drawingContext;
  
  // Create FFT and amplitude objects
  fft = new p5.FFT();
  amplitude = new p5.Amplitude();
  
  // Create a slider for seeking through the audio
  slider = createSlider(0, 1, 0, 0.01);
  slider.position(0, 30);
  slider.style('width', '800px');
  slider.input(seekAudio);
}

function handleFile(file) {
  if (file.type === 'audio') {
    soundFile = loadSound(file.data, () => {
      // Play the sound file
      soundFile.play();
      
      // Get and log the attributes
      getAudioAttributes(soundFile);
    });
  } else {
    console.log('Not an audio file!');
  }
}

function getAudioAttributes(file) {
  let attributes = [];

  // Get duration of the audio file
  let duration = file.duration();
  attributes.push({ name: 'Duration', value: duration });

  // Get sample rate from the p5.soundOut context
  let sampleRate = getSampleRate();
  attributes.push({ name: 'Sample Rate', value: sampleRate });

  // Get amplitude levels
  let level = amplitude.getLevel();
  attributes.push({ name: 'Amplitude Level', value: level });

  // Get FFT spectrum
  let spectrum = fft.analyze();
  attributes.push({ name: 'FFT Spectrum', value: spectrum });

  console.log(attributes);
}

function getSampleRate() {
  return getAudioContext().sampleRate;
}

function seekAudio() {
  if (soundFile && soundFile.isPlaying()) {
    let duration = soundFile.duration();
    let seekTime = slider.value() * duration;
    soundFile.jump(seekTime);
  }
}

function draw() {
  background(230);

  if (soundFile && soundFile.isPlaying()) {
    // Update slider position based on current playback time
    let currentTime = soundFile.currentTime();
    let duration = soundFile.duration();
    slider.value(currentTime / duration);

    // Get FFT spectrum
    spectrum = fft.analyze();

    // Draw gradients
    for (let i = 0; i < numGradients; i++) {
      if (gradData[i] === undefined) {
        let pos1 = [random(width), random(height)];
        let pos2 = pos1;
        let r1 = random(1, 5);
        let r2 = random(width / 3, width / 2); // Ensure gradients are large enough

        // Select random colors from the colors array
        let c1 = color(colors[floor(random(colors.length))]);
        let c2 = color(colors[floor(random(colors.length))]);

        // Set opacity for c1 and c2
        c1.setAlpha(random(80, 160));
        c2.setAlpha(0);

        gradData[i] = { pos1, r1, c1, pos2, r2, c2 };
      }

      let grad = ctx.createRadialGradient(
        gradData[i].pos1[0], gradData[i].pos1[1],
        gradData[i].r1,
        gradData[i].pos2[0], gradData[i].pos2[1],
        gradData[i].r2
      );

      // Map spectrum values to gradient colors
      let color1 = map(spectrum[i % spectrum.length], 0, 255, 0, 255);
      let color2 = map(spectrum[(i + 1) % spectrum.length], 0, 255, 0, 255);

      // Set gradient colors
      grad.addColorStop(0, `rgba(${color1}, ${color1}, ${color1}, 0.5)`);
      grad.addColorStop(1, `rgba(${color2}, ${color2}, ${color2}, 0)`);

      // Draw the gradient
      push();
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      pop();
    }

    filter(BLUR);
  }
}

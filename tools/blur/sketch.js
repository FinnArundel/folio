let inputImage;
let outputCanvas;
let blurIntensity;
let exportCanvas;

function setup() {
  createCanvas(400, 400).id('outputCanvas');
  outputCanvas = select('#outputCanvas');
  exportCanvas = createGraphics(1, 1); // Initialize an off-screen canvas with a small size
  noLoop();
}

function draw() {
  background(255);

  if (inputImage) {
    const aspectRatio = inputImage.width / inputImage.height;
    let displayWidth = 400;
    let displayHeight = 400 / aspectRatio;

    if (displayHeight > height) {
      displayWidth = height * aspectRatio;
      displayHeight = height;
    }

    const x = (width - displayWidth) / 2;
    const y = (height - displayHeight) / 2;

    //image(inputImage, x, y, displayWidth, displayHeight);
  }

  if (exportCanvas.image) {
    const resizedImage = exportCanvas.get(); // Create a copy of the export canvas
    resizedImage.resize(400, 0);
    
    image(resizedImage, 0, 0); // Display the resized image
  }
}

function applyBlur() {
  const imageInput = select('#imageInput');
  const file = imageInput.elt.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      loadImage(e.target.result, function (img) {
        inputImage = img;
        redraw();
        blurIntensity = select('#blurIntensity').value();
        applyCustomBlur();
      });
    };
    reader.readAsDataURL(file);
  } else {
    alert('Please select an image file.');
  }
}

function applyCustomBlur() {
  if (inputImage) {
    // Adjust the size of the export canvas dynamically based on the size of the blurred image
    const aspectRatio = inputImage.width / inputImage.height;
    let exportWidth = 1500;
    let exportHeight = 1500 / aspectRatio;

    let displayWidth = 400;
    let displayHeight = 400 / aspectRatio;

    exportCanvas.resizeCanvas(exportWidth, exportHeight);

    // Clear the export canvas
    exportCanvas.clear();

    // Apply blur to the export canvas
    inputImage.resize(1500,0);
    exportCanvas.image(inputImage, 0, 0);
    exportCanvas.filter(BLUR, blurIntensity);

  
    resizeCanvas(displayWidth, displayHeight)

  }
}

function downloadImage() {
  // Create a data URL for the export canvas
  const url = exportCanvas.canvas.toDataURL('image/png');

  // Create an invisible link element
  const link = document.createElement('a');
  link.href = url;
  link.download = 'blurred_image.png';

  // Trigger a click event to start the download
  link.click();
}

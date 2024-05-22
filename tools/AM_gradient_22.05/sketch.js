const gradData = [];
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
let baseColor1, baseColor2;

function setup() {
  createCanvas(windowWidth, windowHeight);
  ctx = drawingContext;

  background (20);

  // Select two different base colors from the colors array
  baseColor1 = color(colors[floor(random(colors.length))]);
  baseColor2 = color(colors[floor(random(colors.length))]);
  
  // Ensure the two base colors are different
  while (baseColor2.toString() === baseColor1.toString()) {
    baseColor2 = color(colors[floor(random(colors.length))]);
  }

  // Ensure gradients are variations between the two base colors
  for (let i = 0; i < numGradients; i++) {
    let pos1 = [random(50, width-50), random(50, height-50)];
    let pos2 = pos1;
    let r1 = random(5, 200);
    let r2 = random(width / 4, width); // Ensure gradients are large enough

    // Create variations of the base colors with more contrast
    let c1 = color(red(baseColor1), green(baseColor1), blue(baseColor1), random(200,250));
    let c2 = color(0, 0, 0, random(0,50));


    gradData.push({ pos1, r1, c1, pos2, r2, c2 });
  }

  console.log(gradData);

  drawGradients();
}

function drawGradients() {
  for (let i = 0; i < numGradients; i++) {
    let grad = ctx.createRadialGradient(
      gradData[i].pos1[0], gradData[i].pos1[1],
      gradData[i].r1,
      gradData[i].pos2[0], gradData[i].pos2[1],
      gradData[i].r2
    );

    // Convert p5.js color objects to strings
    grad.addColorStop(0, gradData[i].c1.toString());
    grad.addColorStop(1, gradData[i].c2.toString());

    // Draw the gradient
    push();
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    pop();
  }
  
  filter(DILATE)
  filter(BLUR, 15);

  applyMonochromaticGrain(5);
  
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setup()
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('gradient', 'png');
  }
}
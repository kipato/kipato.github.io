function setup() {
  createCanvas(window.innerWidth, window.innerHeight, WEBGL);
  noStroke();
  camera(0, 0, 1200, 0, 0, 0, 0, 1, 0);
  pointLight(200, 150, 200, 0, 0, 500);
  pointLight(200, 150, 200, 500, 0, 500);
  pointLight(100, 100, 100, 500, 0, 300);
  pointLight(100, 100, 100, -500, 0, 300);
}

function draw() {
  background(0);
  orbitControl();
  var sceneRotation = frameCount * 0.0015;
  rotateY(sceneRotation);
  for (let a = 0; a < 360; a += 5) {
    let ringAngle = radians(a);
    push();
    rotateY(ringAngle);
    push();
    translate(0, 0, 150);
    rotateY(Math.PI / 2);
    rotateX(Math.PI / 3.5);
    let rVal = a % 2 == 0 ? 255 : 0;
    let n = noise(frameCount * 0.01, ringAngle * 0.01, a * 0.01);
    specularMaterial(rVal, 50, 255 * n);
    torus(350, 6, 60, 32);
    pop();
    pop();
  }
}
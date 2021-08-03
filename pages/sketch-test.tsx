import Main from "components/main";
import P5Sketch, { SketchClosure } from "components/p5-sketch";
import type p5 from "p5";
import profileImage from "../images/mike-hadley-profile.jpg";

interface SketchTestProps {}

const sketch: SketchClosure = (p, container) => {
  let img: p5.Image;

  p.preload = () => {
    img = p.loadImage(profileImage.src);
  };

  p.setup = () => {
    const canvas = p.createCanvas(800, 800);
    canvas.parent(container);
    p.background(255);
    // p.image(img, 0, 0, 600, 600);
    img.loadPixels();
  };

  p.draw = () => {
    p.background(255);

    const sampleStep = 5;
    const imageScale = 10;
    for (let px = 0; px < img.width; px += sampleStep) {
      for (let py = 0; py < img.height; py += sampleStep) {
        const x = (px / sampleStep) * imageScale;
        const y = (py / sampleStep) * imageScale;

        const d = p.dist(x, y, p.mouseX, p.mouseY);
        const rectSize = p.map(d, 0, 200, imageScale * 2, 2, true);

        const color = img.get(px, py);
        const pixelBrightness = p.brightness(color);
        // const pixelHue = p.hue(color);
        // const pixelSaturation = p.saturation(color);

        // p.fill(color[0], color[1], color[2], 50);
        p.fill(color);
        p.noStroke();
        p.strokeWeight(1);
        p.stroke(p.lerpColor(p.color(color), p.color(0, 0, 0), 0.4));

        p.push();
        p.translate(x, y);
        p.rectMode(p.CENTER);
        p.rotate(pixelBrightness);
        p.rect(0, 0, rectSize, rectSize);
        p.pop();
        // const pixelSaturation = p.saturation(color);
        // const pixelHue = p.hue(color);
        // const pixelBrightness = p.brightness(color);
        // const rectWidth = p.map(pixelSaturation, 0, 100, 0, step * 2);
        // const rectHeight = p.map(pixelBrightness, 0, 100, 0, step * 2);
      }
    }
  };
};

function SketchTest({}: SketchTestProps) {
  return (
    <Main>
      <P5Sketch sketch={sketch} />
    </Main>
  );
}

export default SketchTest;
export type { SketchTestProps };

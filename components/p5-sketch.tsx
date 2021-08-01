import React, { useEffect, useRef } from "react";
import type p5 from "p5";

function P5Sketch() {
  const sketchContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let sketch: p5 | null = null;

    async function main() {
      const pConstructor = (await import("p5")).default;

      new pConstructor((p: p5) => {
        sketch = p;

        p.setup = () => {
          console.log("setup");
          p.createCanvas(300, 300);
        };

        p.draw = () => {
          console.log("draw");
          p.background(0);
          p.fill(255);
          p.rect(p.mouseX, p.mouseY, 50, 50);
        };
      });
    }

    main().catch((e) => {
      console.log("Something went wrong with loading a p5.js sketch.");
      console.error(e);
    });

    return () => sketch?.remove();
  }, []);

  return <div ref={sketchContainer} />;
}

export default P5Sketch;

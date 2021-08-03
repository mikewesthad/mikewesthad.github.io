import React, { useEffect, useRef, HTMLProps } from "react";
import cn from "classnames";
import type p5 from "p5";
import css from "./index.module.scss";

interface SketchClosure {
  (p: p5, container: HTMLDivElement): void;
}

interface P5SketchProps {
  sketch: SketchClosure;
  containerProps?: HTMLProps<HTMLDivElement>;
}

function P5Sketch({ sketch, containerProps = {} }: P5SketchProps) {
  const sketchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let sketchReference: p5 | null = null;

    async function main() {
      const pConstructor = (await import("p5")).default;

      const container = sketchContainerRef.current;
      if (!container) {
        throw Error("No container for p5 sketch found.");
      }

      new pConstructor((p: p5) => {
        sketch(p, container);
        sketchReference = p;
      });
    }

    main().catch((e) => {
      console.log("Something went wrong with loading a p5.js sketch.");
      console.error(e);
    });

    return () => sketchReference?.remove();
  }, [sketch]);

  return (
    <div
      ref={sketchContainerRef}
      className={cn(css.sketchContainer, containerProps.className)}
      {...containerProps}
    />
  );
}

export default P5Sketch;
export type { P5SketchProps, SketchClosure };

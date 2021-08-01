import { HTMLProps, useState } from "react";
import { useEffect } from "react";

interface AnimatedEmojiProps extends HTMLProps<HTMLSpanElement> {
  emoji: string[];
  frameMs?: number;
}

function useAnimatedIndex(start: number, max: number, frameMs: number) {
  const [index, setIndex] = useState(start);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev === max ? 0 : prev + 1));
    }, frameMs);

    return () => clearInterval(id);
  }, []);

  return index;
}

function AnimatedEmoji({ emoji, frameMs = 1000, ...props }: AnimatedEmojiProps) {
  const index = useAnimatedIndex(0, emoji.length - 1, frameMs);
  return <span {...props}>{emoji[index]}</span>;
}

export default AnimatedEmoji;
export type { AnimatedEmojiProps };

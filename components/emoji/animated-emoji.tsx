import { HTMLProps, useState } from "react";
import { useEffect } from "react";
import Emoji from ".";

interface AnimatedEmojiProps extends HTMLProps<HTMLSpanElement> {
  emoji: string[];
  ariaLabel: string;
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
  return <Emoji {...props}>{emoji[index]}</Emoji>;
}

export default AnimatedEmoji;
export type { AnimatedEmojiProps };

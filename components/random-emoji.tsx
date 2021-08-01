import { useState } from "react";
import { useEffect } from "react";
import { randInt } from "utils/random";

interface RandomEmojiProps extends React.HTMLProps<HTMLSpanElement> {
  emoji: string[];
}

function RandomEmoji({ emoji, ...props }: RandomEmojiProps) {
  const [randEmoji, setRandEmoji] = useState<string>("");

  useEffect(() => {
    const index = randInt(0, emoji.length - 1);
    setRandEmoji(emoji[index]);
  }, []);

  return <span {...props}>{randEmoji}</span>;
}

export default RandomEmoji;
export type { RandomEmojiProps };

import { useState } from "react";
import { useEffect } from "react";
import { randInt } from "utils/random";
import Emoji from ".";

interface RandomEmojiProps extends React.HTMLProps<HTMLSpanElement> {
  emoji: string[];
  ariaLabel: string;
}

function RandomEmoji({ emoji, ...props }: RandomEmojiProps) {
  const [randEmoji, setRandEmoji] = useState<string>("");

  useEffect(() => {
    const index = randInt(0, emoji.length - 1);
    setRandEmoji(emoji[index]);
  }, [emoji]);

  return <Emoji {...props}>{randEmoji}</Emoji>;
}

export default RandomEmoji;
export type { RandomEmojiProps };

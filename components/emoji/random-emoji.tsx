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
    // Picked after mount (not during render) so SSR and hydration markup match.
    const index = randInt(0, emoji.length - 1);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRandEmoji(emoji[index]);
  }, [emoji]);

  return <Emoji {...props}>{randEmoji}</Emoji>;
}

export default RandomEmoji;
export type { RandomEmojiProps };

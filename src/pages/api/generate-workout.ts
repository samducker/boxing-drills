import { NextApiRequest, NextApiResponse } from "next";

const commands = ["1", "2", "left", "right"];

type Command = {
  command: string;
  delay: number;
};

const getRandomCommand = (): string => {
  const commandIndex = Math.floor(Math.random() * commands.length);
  return commands[commandIndex];
};

const getRandomDelay = (): number => {
  return 2 + Math.random() * 1.5;
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  let sequence: Command[] = [];
  let totalDuration = 0;

  while (totalDuration < 178) {
    const command = getRandomCommand();
    const delay = getRandomDelay();
    totalDuration += delay;
    sequence.push({ command, delay });
  }

  if (totalDuration > 180) {
    const excess = totalDuration - 180;
    sequence[sequence.length - 1].delay -= excess;
    totalDuration = 180;
  }

  res.status(200).json({ sequence, sequenceDuration: totalDuration });
}

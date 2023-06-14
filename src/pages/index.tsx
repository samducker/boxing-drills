import { useState, useEffect } from "react";

type Command = {
  command: string;
  delay: number;
};

const Workout = () => {
  const [sequence, setSequence] = useState<Command[]>([]);
  const [sequenceDuration, setSequenceDuration] = useState<number>(0);
  const [currentCommand, setCurrentCommand] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [currentSeconds, setCurrentSeconds] = useState<number>(0);

  const fetchSequence = () => {
    fetch("/api/generate-workout")
      .then((res) => res.json())
      .then((data: { sequence: Command[]; sequenceDuration: number }) => {
        setSequence(data.sequence);
        setSequenceDuration(data.sequenceDuration);
        setCurrentSeconds(0);
      });
  };

  useEffect(() => {
    fetchSequence();
  }, []);

  useEffect(() => {
    if (!isPlaying || isPaused || sequence.length === 0) {
      return;
    }

    const audio = new Audio(`/audio/${sequence[currentCommand].command}.mp3`);
    audio.play();

    const id = setTimeout(() => {
      setCurrentCommand((current) => (current + 1) % sequence.length);
    }, sequence[currentCommand].delay * 1000);

    setTimeoutId(id);

    return () => {
      clearTimeout(id);
    };
  }, [isPlaying, isPaused, sequence, currentCommand]);

  useEffect(() => {
    if (!isPlaying || isPaused) {
      return;
    }

    const id = setInterval(() => {
      setCurrentSeconds((sec) => sec + 1);
    }, 1000);

    return () => {
      clearInterval(id);
    };
  }, [isPlaying, isPaused]);

  const handleStart = () => {
    setIsPaused(false);
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPaused(true);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    setIsPaused(false);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    fetchSequence();
  };

  const formatTime = (seconds: number) => {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);

    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col justify-center items-center gap-8">
      <h1 className="text-4xl">Footwork drills</h1>
      <div className="text-9xl leading-normal">{sequence[currentCommand]?.command}</div>
      <div className="text-3xl">
        {formatTime(currentSeconds)} / {formatTime(sequenceDuration)}
      </div>
      <div className="flex gap-3 py-2">
        <button className={styles.button} onClick={handleStart}>
          Start
        </button>
        <button className={styles.button} onClick={handlePause}>
          Pause
        </button>
        <button className={styles.button} onClick={handleStop}>
          Stop/Restart
        </button>
      </div>
    </div>
  );
};

export default Workout;

const styles = {
  button: "bg-red-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded",
};

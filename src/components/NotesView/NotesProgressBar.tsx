import { useAppSelector } from '../../store/hooks';
import { ProgressBar } from '../MemorizerView/ProgressBar';

interface NotesProgressBarProps {
  scrollProgressIndex: number;
  onJump: (dialogueIndex: number) => void;
}

export function NotesProgressBar({
  scrollProgressIndex,
  onJump,
}: NotesProgressBarProps) {
  const screenplay = useAppSelector(state => state.app.screenplay);
  const scenes = useAppSelector(state => state.app.scenes);

  const totalLines = screenplay.length;
  if (totalLines === 0) return null;

  const progress =
    totalLines > 0
      ? ((Math.min(scrollProgressIndex, totalLines - 1) + 1) / totalLines) * 100
      : 0;

  return (
    <ProgressBar
      totalLines={totalLines}
      progress={progress}
      labelCurrent={Math.min(scrollProgressIndex + 1, totalLines)}
      labelTotal={totalLines}
      scenes={scenes}
      onJump={onJump}
      currentSegmentIndex={scrollProgressIndex}
    />
  );
}

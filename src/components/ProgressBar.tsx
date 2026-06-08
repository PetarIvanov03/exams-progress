interface ProgressBarProps {
  value: number;
  color?: string;
}

export function ProgressBar({ value, color = '#6366f1' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className="progress-bar">
      <div
        className="progress-bar__fill"
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </div>
  );
}

import { scoreBgColor } from "@/lib/utils";

type Props = {
  label: string;
  score: number;
};

export default function ScoreBar({ label, score }: Props) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-32 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${scoreBgColor(score)}`}
          style={{ width: `${(score / 10) * 100}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-gray-800 w-8 text-right">{score.toFixed(1)}</span>
    </div>
  );
}

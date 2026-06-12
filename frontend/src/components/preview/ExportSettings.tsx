import { Download, FileText } from 'lucide-react';
import { Button } from '../common/Button';

interface ExportSettingsProps {
  margin: number;
  fontSize: number;
  isExporting: boolean;
  withCoverLetter: boolean;
  hasCoverLetter: boolean;
  onMarginChange: (value: number) => void;
  onFontSizeChange: (value: number) => void;
  onCoverLetterToggle: (value: boolean) => void;
  onExport: () => void;
  onEditCoverLetter?: () => void;
}

export function ExportSettings({
  margin,
  fontSize,
  isExporting,
  withCoverLetter,
  hasCoverLetter,
  onMarginChange,
  onFontSizeChange,
  onCoverLetterToggle,
  onExport,
  onEditCoverLetter,
}: ExportSettingsProps) {
  return (
    <aside className="border border-[var(--border)] bg-[var(--surface)] p-4">
      <h2 className="font-display text-xl font-semibold">导出设置</h2>
      <div className="mt-5 space-y-5">
        <label className="block space-y-2 text-sm font-medium">
          <span>页边距 {margin}mm</span>
          <input
            className="w-full accent-[var(--accent)]"
            type="range"
            min="8"
            max="24"
            value={margin}
            onChange={(event) => onMarginChange(Number(event.target.value))}
          />
        </label>
        <label className="block space-y-2 text-sm font-medium">
          <span>字号 {fontSize}px</span>
          <input
            className="w-full accent-[var(--accent)]"
            type="range"
            min="11"
            max="16"
            value={fontSize}
            onChange={(event) => onFontSizeChange(Number(event.target.value))}
          />
        </label>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[var(--accent)]"
                checked={withCoverLetter && hasCoverLetter}
                disabled={!hasCoverLetter}
                onChange={(event) => onCoverLetterToggle(event.target.checked)}
              />
              附加求职信
            </label>
            {hasCoverLetter && onEditCoverLetter ? (
              <button
                className="inline-flex items-center gap-1 text-xs text-[var(--accent-strong)] hover:underline"
                type="button"
                onClick={onEditCoverLetter}
              >
                <FileText size={12} aria-hidden /> 编辑
              </button>
            ) : null}
          </div>
          {!hasCoverLetter ? (
            <p className="text-xs text-[var(--muted)]">还没有求职信，可以在简历编辑页创建。</p>
          ) : null}
        </div>
        <Button
          className="w-full"
          disabled={isExporting}
          icon={<Download size={16} aria-hidden />}
          onClick={onExport}
          variant="primary"
        >
          {isExporting ? '导出中' : '导出 PDF'}
        </Button>
      </div>
    </aside>
  );
}


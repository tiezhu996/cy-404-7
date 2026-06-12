import { useMemo, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';
import { A4Preview } from '../components/preview/A4Preview';
import { ExportSettings } from '../components/preview/ExportSettings';
import { useExportPdf } from '../hooks/useExportPdf';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useCoverLetterStore } from '../stores/cover-letter';
import { useResumeStore } from '../stores/resume';

export function ExportPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const previewRef = useRef<HTMLDivElement | null>(null);
  const resume = useResumeStore((state) => state.resumes.find((item) => item.id === id));
  const coverLetter = useCoverLetterStore((state) =>
    state.coverLetters.find((cl) => cl.resumeId === id),
  );
  const [margin, setMargin] = useLocalStorage('smart-resume:export-margin', 14);
  const [fontSize, setFontSize] = useLocalStorage('smart-resume:export-font-size', 12);
  const [withCoverLetter, setWithCoverLetter] = useLocalStorage(
    'smart-resume:export-with-cover-letter',
    true,
  );
  const { exportPdf, isExporting, error } = useExportPdf(previewRef);

  const hasCoverLetter = useMemo(
    () => Boolean(coverLetter && coverLetter.content.trim().length > 0),
    [coverLetter],
  );

  if (!resume) {
    return <EmptyState title="无法导出" description="没有找到这份简历，可能已被删除。" />;
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 border-b border-[var(--border)] pb-6 md:flex-row md:items-end">
        <div>
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent-strong)]" to={`/resumes/${resume.id}/edit`}>
            <ArrowLeft size={15} aria-hidden /> 返回编辑
          </Link>
          <h1 className="mt-3 font-display text-4xl font-semibold">PDF 导出预览</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">按 A4 比例渲染，导出前可调整页边距、字号及是否附加求职信。</p>
        </div>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[300px_1fr]">
        <ExportSettings
          fontSize={fontSize}
          isExporting={isExporting}
          margin={margin}
          hasCoverLetter={hasCoverLetter}
          withCoverLetter={withCoverLetter}
          onCoverLetterToggle={setWithCoverLetter}
          onExport={() =>
            exportPdf(
              `${resume.title || 'resume'}.pdf`,
              margin,
              withCoverLetter && hasCoverLetter ? '.a4-page' : undefined,
            )
          }
          onFontSizeChange={setFontSize}
          onMarginChange={setMargin}
          onEditCoverLetter={() => navigate(`/resumes/${resume.id}/cover-letter`)}
        />
        <div className="overflow-auto bg-[var(--surface-alt)] p-6">
          <A4Preview
            ref={previewRef}
            resume={resume}
            margin={margin}
            fontSize={fontSize}
            coverLetter={coverLetter}
            withCoverLetter={withCoverLetter && hasCoverLetter}
          />
          {error ? <p className="mt-4 text-sm text-[var(--danger)]">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}


import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Download, RefreshCw, FileText } from 'lucide-react';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { CoverLetterPreview } from '../components/preview/CoverLetterPreview';
import { useCoverLetterStore, generateCoverLetterDraft } from '../stores/cover-letter';
import { useResumeStore } from '../stores/resume';
import { getTemplateById } from '../stores/template';
import { formatDateTime } from '../utils/format';

const inputClass =
  'w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--muted)]';
const textareaClass = `${inputClass} min-h-[420px] resize-y leading-7 font-serif`;

export function CoverLetterEditor() {
  const { id } = useParams();
  const resumes = useResumeStore((state) => state.resumes);
  const coverLetters = useCoverLetterStore((state) => state.coverLetters);
  const getOrCreateCoverLetter = useCoverLetterStore((state) => state.getOrCreateCoverLetter);
  const updateCoverLetter = useCoverLetterStore((state) => state.updateCoverLetter);
  const regenerateContent = useCoverLetterStore((state) => state.regenerateContent);

  const resume = useMemo(() => resumes.find((item) => item.id === id), [id, resumes]);
  const coverLetter = useMemo(
    () => coverLetters.find((cl) => cl.resumeId === id),
    [id, coverLetters],
  );

  useEffect(() => {
    if (resume && !coverLetter) {
      getOrCreateCoverLetter(resume);
    }
  }, [resume, coverLetter, getOrCreateCoverLetter]);

  if (!resume) {
    return (
      <EmptyState
        description="该简历可能已经被删除，返回列表后可以创建或导入新的版本。"
        title="没有找到这份简历"
        actionLabel="回到列表"
        onAction={() => window.history.back()}
      />
    );
  }

  if (!coverLetter) {
    return null;
  }

  const template = getTemplateById(resume.templateId);

  const handleRegenerate = () => {
    const content = generateCoverLetterDraft(resume, coverLetter.targetPosition, coverLetter.targetCompany);
    updateCoverLetter(coverLetter.id, { content });
  };

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 border-b border-[var(--border)] pb-6 lg:flex-row lg:items-end">
        <div className="min-w-0">
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent-strong)]"
            to={`/resumes/${resume.id}/edit`}
          >
            <ArrowLeft size={15} aria-hidden /> 返回简历编辑
          </Link>
          <p className="mt-3 text-sm font-semibold uppercase text-[var(--accent-strong)]">Cover letter editor</p>
          <h1 className="mt-2 font-display text-4xl font-semibold">求职信编辑</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            基于简历内容和目标岗位自动生成初稿，支持手动改写。数据跟随简历保存在本地。
            {coverLetter.updatedAt ? ` · 上次更新 ${formatDateTime(coverLetter.updatedAt)}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button icon={<RefreshCw size={16} aria-hidden />} onClick={handleRegenerate}>
            重新生成
          </Button>
          <Link
            className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--ink-invert)] hover:bg-[var(--accent-strong)]"
            to={`/resumes/${resume.id}/export`}
          >
            <Download size={16} aria-hidden /> 导出预览
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_440px]">
        <div className="space-y-5">
          <section className="border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="flex items-center gap-2">
              <FileText size={18} aria-hidden className="text-[var(--accent-strong)]" />
              <h2 className="font-display text-2xl font-semibold">目标岗位信息</h2>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block space-y-2 text-sm font-medium">
                <span>目标公司</span>
                <input
                  className={inputClass}
                  value={coverLetter.targetCompany}
                  placeholder="例如：青松科技"
                  onChange={(event) => updateCoverLetter(coverLetter.id, { targetCompany: event.target.value })}
                />
              </label>
              <label className="block space-y-2 text-sm font-medium">
                <span>目标岗位</span>
                <input
                  className={inputClass}
                  value={coverLetter.targetPosition}
                  placeholder="例如：高级产品经理"
                  onChange={(event) => updateCoverLetter(coverLetter.id, { targetPosition: event.target.value })}
                />
              </label>
            </div>
            <p className="mt-3 text-xs text-[var(--muted)]">
              填写后点击「重新生成」会根据最新的岗位信息重新生成求职信内容。
            </p>
          </section>

          <section className="border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-2xl font-semibold">求职信正文</h2>
              <Button icon={<RefreshCw size={15} aria-hidden />} variant="ghost" onClick={handleRegenerate}>
                重新生成
              </Button>
            </div>
            <label className="mt-5 block space-y-2 text-sm font-medium">
              <span>正文内容，段落之间用空行分隔</span>
              <textarea
                className={textareaClass}
                value={coverLetter.content}
                onChange={(event) => updateCoverLetter(coverLetter.id, { content: event.target.value })}
              />
            </label>
          </section>
        </div>

        <aside className="max-h-[calc(100vh-140px)] overflow-auto border border-[var(--border)] bg-[var(--surface-alt)] p-4">
          <CoverLetterPreview coverLetter={coverLetter} template={template} fontSize={11} />
        </aside>
      </div>
    </div>
  );
}

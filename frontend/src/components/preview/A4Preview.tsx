import { forwardRef } from 'react';
import { CoverLetter } from '../../types/cover-letter';
import { Resume } from '../../types/resume';
import { getTemplateById } from '../../stores/template';
import { CoverLetterPreview } from './CoverLetterPreview';
import { ResumePreview } from './ResumePreview';

interface A4PreviewProps {
  resume: Resume;
  margin: number;
  fontSize: number;
  coverLetter?: CoverLetter;
  withCoverLetter?: boolean;
}

export const A4Preview = forwardRef<HTMLDivElement, A4PreviewProps>(
  ({ resume, margin, fontSize, coverLetter, withCoverLetter = false }, ref) => {
    const template = getTemplateById(resume.templateId);
    const showCoverLetter = withCoverLetter && coverLetter && coverLetter.content.trim().length > 0;

    return (
      <div className="mx-auto w-full max-w-[794px]">
        <div
          ref={ref}
          className="w-full overflow-hidden bg-white shadow-panel"
          style={{ padding: `${margin}mm` }}
        >
          <div className="space-y-6">
            {showCoverLetter ? (
              <div className="a4-page aspect-[210/297] w-full overflow-hidden break-after-page">
                <CoverLetterPreview coverLetter={coverLetter!} template={template} fontSize={fontSize} />
              </div>
            ) : null}
            <div className="a4-page aspect-[210/297] w-full overflow-hidden break-after-page">
              <ResumePreview resume={resume} fontSize={fontSize} />
            </div>
          </div>
        </div>
      </div>
    );
  },
);

A4Preview.displayName = 'A4Preview';


import { CSSProperties } from 'react';
import { CoverLetter } from '../../types/cover-letter';
import { ResumeTemplate } from '../../stores/template';

interface CoverLetterPreviewProps {
  coverLetter: CoverLetter;
  template: ResumeTemplate;
  fontSize?: number;
}

export function CoverLetterPreview({ coverLetter, template, fontSize = 12 }: CoverLetterPreviewProps) {
  const style = {
    '--template-accent': template.accent,
    '--template-paper': template.paper,
    '--template-ink': template.ink,
    backgroundColor: template.paper,
    color: template.ink,
    fontSize,
  } as CSSProperties;

  const paragraphs = coverLetter.content.split('\n\n').filter(Boolean);

  return (
    <article className="min-h-full p-8 shadow-sm" style={style}>
      <div className="space-y-4 leading-7">
        {paragraphs.map((paragraph, index) => {
          const trimmed = paragraph.trim();
          if (!trimmed) {
            return null;
          }
          const lines = trimmed.split('\n');
          if (index === 0) {
            return (
              <p key={index} className="font-semibold" style={{ color: template.accent }}>
                {trimmed}
              </p>
            );
          }
          if (
            trimmed === '此致' ||
            trimmed === '敬礼！' ||
            trimmed.endsWith('年') ||
            trimmed.endsWith('月') ||
            trimmed.endsWith('日') ||
            /^\d{4}/.test(trimmed)
          ) {
            return (
              <p key={index} className="whitespace-pre-line">
                {trimmed}
              </p>
            );
          }
          return (
            <p key={index} className="whitespace-pre-line indent-8">
              {lines.map((line, lineIndex) => (
                <span key={lineIndex}>
                  {line}
                  {lineIndex < lines.length - 1 ? <br /> : null}
                </span>
              ))}
            </p>
          );
        })}
      </div>
    </article>
  );
}

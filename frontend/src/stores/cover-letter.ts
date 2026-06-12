import { create } from 'zustand';
import { CoverLetter } from '../types/cover-letter';
import { Resume } from '../types/resume';
import { createId } from '../utils/format';
import { readStorage, storageKeys, writeStorage } from '../utils/storage';

function buildCoverLetter(resumeId: string, targetPosition = '', targetCompany = '', content = '', isCustomized = false): CoverLetter {
  const now = new Date().toISOString();
  return {
    id: createId('cl'),
    resumeId,
    targetPosition,
    targetCompany,
    content,
    isCustomized,
    createdAt: now,
    updatedAt: now,
  };
}

export function generateCoverLetterDraft(resume: Resume, targetPosition: string, targetCompany: string): string {
  const { basicInfo, summary, workExperiences, skills, projects } = resume;
  const name = basicInfo.fullName || '求职者';
  const headline = basicInfo.headline || '';
  const position = targetPosition || '目标岗位';
  const company = targetCompany || '贵公司';

  const topSkills = skills.slice(0, 4).map((s) => s.name).join('、') || '核心专业技能';
  const recentWork = workExperiences[0];
  const recentProject = projects[0];

  const workHighlight = recentWork
    ? `在${recentWork.companyName}担任${recentWork.position}期间，${recentWork.achievements.slice(0, 2).join('；') || '积累了扎实的行业经验'}。`
    : '过往工作中积累了扎实的行业经验。';

  const projectHighlight = recentProject
    ? `主导过「${recentProject.name}」项目，${recentProject.outcomes.slice(0, 1).join('') || '取得了显著成果'}。`
    : '';

  const summaryLine = summary ? summary : '';

  const paragraphs = [
    `尊敬的${company}招聘负责人：`,
    `您好！我是${name}，${headline ? `${headline}，` : ''}非常荣幸有机会申请${company}的${position}岗位。结合自身多年的专业积累与对${company}发展方向的关注，我相信能够为团队创造切实的价值。`,
    `${summaryLine ? `${summaryLine} ` : ''}${workHighlight}${projectHighlight}`,
    `技能方面，我熟练掌握${topSkills}，能够快速适应业务需求并推动项目落地。我重视跨团队协作，善于在复杂场景下识别关键问题并组织资源解决。`,
    `我始终关注${company}在行业中的动态与创新实践，非常认同公司的发展理念。期待有机会加入团队，与优秀的同事一起推动业务成长。`,
    `感谢您抽出时间阅读我的求职信，随信附上我的简历供您参考。期待能有机会与您进一步交流。`,
    '',
    `此致`,
    `敬礼！`,
    '',
    name,
    new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
  ];

  return paragraphs.join('\n\n');
}

const CURRENT_MIGRATION_VERSION = 1;

const storedCoverLetters = readStorage<CoverLetter[]>(storageKeys.coverLetters, []);

function persist(coverLetters: CoverLetter[]): void {
  writeStorage(storageKeys.coverLetters, coverLetters);
}

interface CoverLetterState {
  coverLetters: CoverLetter[];
  hasMigrated: boolean;
  getCoverLetterByResumeId: (resumeId: string) => CoverLetter | undefined;
  createCoverLetter: (resumeId: string, targetPosition?: string, targetCompany?: string, content?: string) => CoverLetter;
  getOrCreateCoverLetter: (resume: Resume, targetPosition?: string, targetCompany?: string) => CoverLetter;
  updateCoverLetter: (coverLetterId: string, patch: Partial<CoverLetter>) => void;
  updateTargetField: (coverLetterId: string, patch: Partial<CoverLetter>, resume: Resume) => void;
  markCustomized: (coverLetterId: string) => void;
  regenerateContent: (coverLetterId: string, resume: Resume) => void;
  migrateLegacyData: (resumes: Resume[]) => boolean;
  deleteCoverLetter: (coverLetterId: string) => void;
  deleteCoverLettersByResumeId: (resumeId: string) => void;
  duplicateCoverLetter: (sourceResumeId: string, targetResumeId: string) => void;
}

export const useCoverLetterStore = create<CoverLetterState>((set, get) => ({
  coverLetters: storedCoverLetters,
  hasMigrated: readStorage<number>(storageKeys.coverLetterMigrationVersion, 0) >= CURRENT_MIGRATION_VERSION,
  getCoverLetterByResumeId: (resumeId) => get().coverLetters.find((cl) => cl.resumeId === resumeId),
  createCoverLetter: (resumeId, targetPosition = '', targetCompany = '', content = '') => {
    const newCoverLetter = buildCoverLetter(resumeId, targetPosition, targetCompany, content);
    const next = [...get().coverLetters, newCoverLetter];
    set({ coverLetters: next });
    persist(next);
    return newCoverLetter;
  },
  getOrCreateCoverLetter: (resume, targetPosition, targetCompany) => {
    const existing = get().coverLetters.find((cl) => cl.resumeId === resume.id);
    if (existing) {
      return existing;
    }
    const content = generateCoverLetterDraft(resume, targetPosition || '', targetCompany || '');
    return get().createCoverLetter(resume.id, targetPosition || '', targetCompany || '', content);
  },
  updateCoverLetter: (coverLetterId, patch) => {
    const next = get().coverLetters.map((cl) =>
      cl.id === coverLetterId ? { ...cl, ...patch, updatedAt: new Date().toISOString() } : cl,
    );
    set({ coverLetters: next });
    persist(next);
  },
  updateTargetField: (coverLetterId, patch, resume) => {
    const cl = get().coverLetters.find((item) => item.id === coverLetterId);
    if (!cl) {
      return;
    }
    const merged = { ...cl, ...patch };
    const shouldProtect = cl.isCustomized ?? true;
    if (shouldProtect) {
      const next = get().coverLetters.map((item) =>
        item.id === coverLetterId ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item,
      );
      set({ coverLetters: next });
      persist(next);
      return;
    }
    const content = generateCoverLetterDraft(resume, merged.targetPosition, merged.targetCompany);
    const next = get().coverLetters.map((item) =>
      item.id === coverLetterId ? { ...item, ...patch, content, updatedAt: new Date().toISOString() } : item,
    );
    set({ coverLetters: next });
    persist(next);
  },
  markCustomized: (coverLetterId) => {
    const next = get().coverLetters.map((cl) =>
      cl.id === coverLetterId ? { ...cl, isCustomized: true, updatedAt: new Date().toISOString() } : cl,
    );
    set({ coverLetters: next });
    persist(next);
  },
  regenerateContent: (coverLetterId, resume) => {
    const cl = get().coverLetters.find((item) => item.id === coverLetterId);
    if (!cl) {
      return;
    }
    const content = generateCoverLetterDraft(resume, cl.targetPosition, cl.targetCompany);
    const next = get().coverLetters.map((item) =>
      item.id === coverLetterId ? { ...item, content, isCustomized: false, updatedAt: new Date().toISOString() } : item,
    );
    set({ coverLetters: next });
    persist(next);
  },
  migrateLegacyData: (resumes) => {
    if (get().hasMigrated) {
      return false;
    }
    const resumeMap = new Map(resumes.map((r) => [r.id, r]));
    const migrated = get().coverLetters.map((cl) => {
      if (cl.isCustomized !== undefined) {
        return cl;
      }
      const resume = resumeMap.get(cl.resumeId);
      if (!resume) {
        return { ...cl, isCustomized: true };
      }
      const expected = generateCoverLetterDraft(resume, cl.targetPosition, cl.targetCompany);
      const isCustomized = expected !== cl.content;
      return { ...cl, isCustomized };
    });
    const hasChanges = migrated.some((cl, index) => cl.isCustomized !== get().coverLetters[index]?.isCustomized);
    if (hasChanges) {
      set({ coverLetters: migrated });
      persist(migrated);
    }
    set({ hasMigrated: true });
    writeStorage(storageKeys.coverLetterMigrationVersion, CURRENT_MIGRATION_VERSION);
    return true;
  },
  deleteCoverLetter: (coverLetterId) => {
    const next = get().coverLetters.filter((cl) => cl.id !== coverLetterId);
    set({ coverLetters: next });
    persist(next);
  },
  deleteCoverLettersByResumeId: (resumeId) => {
    const next = get().coverLetters.filter((cl) => cl.resumeId !== resumeId);
    set({ coverLetters: next });
    persist(next);
  },
  duplicateCoverLetter: (sourceResumeId, targetResumeId) => {
    const source = get().coverLetters.find((cl) => cl.resumeId === sourceResumeId);
    if (!source) {
      return;
    }
    const now = new Date().toISOString();
    const clone: CoverLetter = {
      ...source,
      id: createId('cl'),
      resumeId: targetResumeId,
      createdAt: now,
      updatedAt: now,
    };
    const next = [...get().coverLetters, clone];
    set({ coverLetters: next });
    persist(next);
  },
}));

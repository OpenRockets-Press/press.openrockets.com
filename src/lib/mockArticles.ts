export enum ArtifactType {
  ResearchPaper = "ResearchPaper",
  Software = "Software",
  Artifact3D = "Artifact3D",
  Scienteen = "Scienteen Library of Science"
}

export enum LicenseType {
  Kangaroo = "Kangaroo",
  Beaver = "Beaver",
  Hummingbird = "Hummingbird",
  CC = "CC"
}

export enum ProgrammingLanguage {
  Python = "Python",
  Cpp = "C++",
  C = "C",
  JS = "JavaScript",
  Rust = "Rust"
}

export interface MockTag {
  name: string;
  isMain: boolean; // if true, uses orange (#C7511F), else black
}

export interface MockArticle {
  id: string;
  title: string;
  description: string;
  mainImage: string;
  sideImage1: string;
  sideImage2: string;
  tags: MockTag[];
  rating: number;
  comments: number;
  type: ArtifactType;
  metadata?: any;
}

// Registry of Category Hashtags (orange)
export const CATEGORY_HASHTAGS = [
  "Mathematics",
  "Computer Science",
  "Neuroscience",
  "Molecular Biology",
  "Astrophysics",
  "Chemistry",
  "Quantum Computing"
];

// Registry of Normal Hashtags (black)
export const NORMAL_HASHTAGS = [
  "Machine Learning",
  "Brain",
  "Biology",
  "Research",
  "Equations",
  "Algorithms",
  "Telescope",
  "DNA",
  "Genetics",
  "Atoms"
];

const MOCK_IMAGES = [
  "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1531297172867-a04ea7e90875?q=80&w=800&auto=format&fit=crop",
];

function getRandomItems<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function generateMockArticles(count: number, forceCategory?: string, forceType?: ArtifactType): MockArticle[] {
  const artifactTypes = [ArtifactType.ResearchPaper, ArtifactType.Software, ArtifactType.Artifact3D, ArtifactType.Scienteen];
  const licenses = [LicenseType.Kangaroo, LicenseType.Beaver, LicenseType.Hummingbird, LicenseType.CC];
  const languages = Object.values(ProgrammingLanguage);
  const codeBackgrounds = ['Light Crimson', 'Light Pink', 'Pure White', 'Marble', 'Gray'];

  return Array.from({ length: count }).map((_, i) => {
    let mainTags = getRandomItems(CATEGORY_HASHTAGS, Math.floor(Math.random() * 2) + 1);
    if (forceCategory && CATEGORY_HASHTAGS.includes(forceCategory) && !mainTags.includes(forceCategory)) {
      mainTags = [forceCategory, ...mainTags].slice(0, 2);
    }
    
    let normalTags = getRandomItems(NORMAL_HASHTAGS, Math.floor(Math.random() * 3) + 2);
    if (forceCategory && NORMAL_HASHTAGS.includes(forceCategory) && !normalTags.includes(forceCategory)) {
      normalTags = [forceCategory, ...normalTags].slice(0, 3);
    }

    const tags: MockTag[] = [
      ...mainTags.map(name => ({ name, isMain: true })),
      ...normalTags.map(name => ({ name, isMain: false }))
    ];

    const type = forceType || getRandomItems(artifactTypes, 1)[0];
    let metadata: any = {};
    if (type === ArtifactType.Software) {
      metadata = {
        license: getRandomItems(licenses, 1)[0],
        language: getRandomItems(languages, 1)[0],
        codeBackground: getRandomItems(codeBackgrounds, 1)[0]
      };
    }

    return {
      id: `${forceCategory || 'random'}-${type}-${i}-${Math.random().toString(36).substring(7)}`,
      title: forceCategory ? `The Future of ${forceCategory}` : `A Groundbreaking Study in ${mainTags[0]}`,
      description: `A deep dive into how modern techniques are rapidly accelerating our understanding of ${mainTags.join(" and ")}. This comprehensive study explores various aspects including ${normalTags.join(", ")}.`,
      mainImage: getRandomItems(MOCK_IMAGES, 1)[0],
      sideImage1: getRandomItems(MOCK_IMAGES, 1)[0],
      sideImage2: getRandomItems(MOCK_IMAGES, 1)[0],
      tags,
      rating: Math.floor(Math.random() * 1000) + 50,
      comments: Math.floor(Math.random() * 50) + 1,
      type,
      metadata
    };
  });
}

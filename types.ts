
export interface StyleAnalysis {
  prompt: string;
  keywords: string[];
}

export enum AssetType {
  AVATAR_FRAME = 'AVATAR_FRAME',
  ENTRANCE_SHOW = 'ENTRANCE_SHOW',
  MEDAL = 'MEDAL',
  WALLPAPER = 'WALLPAPER'
}

export interface GeneratedAsset {
  id: string;
  type: AssetType;
  imageUrl: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string;
}

export interface AppState {
  referenceImage: string | null;
  userPrompt: string;
  analysis: StyleAnalysis | null;
  assets: Record<AssetType, GeneratedAsset>;
  isAnalyzing: boolean;
}

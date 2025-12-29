
import React, { useState } from 'react';
import { analyzeStyle, generateAsset } from './services/geminiService';
import { AssetType, AppState, GeneratedAsset } from './types';
import { 
  Upload, 
  Sparkles, 
  Download, 
  RefreshCw, 
  Layers, 
  Layout, 
  Award, 
  Smartphone,
  Loader2,
  Settings,
  Image as ImageIcon,
  Zap
} from 'lucide-react';

const INITIAL_ASSETS: Record<AssetType, GeneratedAsset> = {
  [AssetType.AVATAR_FRAME]: { id: '1', type: AssetType.AVATAR_FRAME, imageUrl: '', status: 'idle' },
  [AssetType.ENTRANCE_SHOW]: { id: '2', type: AssetType.ENTRANCE_SHOW, imageUrl: '', status: 'idle' },
  [AssetType.MEDAL]: { id: '3', type: AssetType.MEDAL, imageUrl: '', status: 'idle' },
  [AssetType.WALLPAPER]: { id: '4', type: AssetType.WALLPAPER, imageUrl: '', status: 'idle' },
};

export default function App() {
  const [state, setState] = useState<AppState>({
    referenceImage: null,
    userPrompt: '',
    analysis: null,
    assets: INITIAL_ASSETS,
    isAnalyzing: false,
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setState(prev => ({ ...prev, referenceImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const startDesignProcess = async () => {
    if (!state.referenceImage) return;
    
    setState(prev => ({ ...prev, isAnalyzing: true }));
    try {
      const analysis = await analyzeStyle(state.referenceImage);
      setState(prev => ({ ...prev, analysis, isAnalyzing: false }));
      
      // 并行触发所有类型的生成
      Object.values(AssetType).forEach(type => {
        handleGenerate(type, analysis.prompt);
      });
    } catch (err) {
      console.error(err);
      setState(prev => ({ ...prev, isAnalyzing: false }));
    }
  };

  const handleGenerate = async (type: AssetType, stylePromptOverride?: string) => {
    const stylePrompt = stylePromptOverride || state.analysis?.prompt;
    if (!stylePrompt) return;

    setState(prev => ({
      ...prev,
      assets: {
        ...prev.assets,
        [type]: { ...prev.assets[type], status: 'loading', error: undefined }
      }
    }));

    try {
      const url = await generateAsset(type, stylePrompt, state.userPrompt, state.referenceImage || undefined);
      setState(prev => ({
        ...prev,
        assets: {
          ...prev.assets,
          [type]: { ...prev.assets[type], imageUrl: url, status: 'success' }
        }
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        assets: {
          ...prev.assets,
          [type]: { ...prev.assets[type], status: 'error', error: err.message }
        }
      }));
    }
  };

  const downloadImage = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAssetLabel = (type: AssetType) => {
    switch (type) {
      case AssetType.AVATAR_FRAME: return "精选头像框";
      case AssetType.ENTRANCE_SHOW: return "动态进场秀";
      case AssetType.MEDAL: return "荣誉勋章";
      case AssetType.WALLPAPER: return "极享壁纸";
    }
  };

  const getAssetIcon = (type: AssetType) => {
    const props = { className: "w-4 h-4" };
    switch (type) {
      case AssetType.AVATAR_FRAME: return <Layers {...props} />;
      case AssetType.ENTRANCE_SHOW: return <Layout {...props} />;
      case AssetType.MEDAL: return <Award {...props} />;
      case AssetType.WALLPAPER: return <Smartphone {...props} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] antialiased">
      {/* 顶部导航 - Apple Style */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#D2D2D7]/30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Zap className="text-white w-5 h-5 fill-current" />
            </div>
            <span className="text-xl font-semibold tracking-tight">AI Designer Pro</span>
          </div>
          <div className="flex items-center gap-4">
            {state.referenceImage && (
              <button
                onClick={startDesignProcess}
                disabled={state.isAnalyzing}
                className="px-6 py-2 bg-[#0071E3] hover:bg-[#0077ED] active:bg-[#0066CC] disabled:opacity-50 text-white text-sm font-medium rounded-full transition-all flex items-center gap-2 shadow-sm"
              >
                {state.isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {state.isAnalyzing ? "正在解析..." : "立即设计"}
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* 左侧控制面板 */}
        <div className="lg:col-span-4 space-y-10">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">设计灵感</h2>
            <p className="text-[#86868B] text-sm leading-relaxed">上传一张图片作为视觉参考，系统将深度分析其风格 DNA，并结合您的创意想法生成全套 UI 资产。</p>
            
            <div className="relative group aspect-[4/3] rounded-3xl bg-white border border-[#D2D2D7] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {state.referenceImage ? (
                <>
                  <img src={state.referenceImage} className="w-full h-full object-cover" alt="Style reference" />
                  <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity backdrop-blur-sm">
                    <span className="text-white text-sm font-medium px-5 py-2.5 bg-white/20 rounded-full border border-white/30">更换图片</span>
                    <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                  </label>
                </>
              ) : (
                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-8 text-center transition-colors hover:bg-[#FBFBFC]">
                  <div className="w-16 h-16 rounded-2xl bg-[#F5F5F7] flex items-center justify-center mb-4">
                    <ImageIcon className="w-8 h-8 text-[#86868B]" />
                  </div>
                  <div className="text-lg font-medium">点击上传风格图</div>
                  <p className="text-xs text-[#86868B] mt-2">支持 PNG, JPG, HEIC</p>
                  <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                </label>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#86868B]" />
              创意增强
            </h3>
            <div className="bg-white rounded-2xl border border-[#D2D2D7] p-5 shadow-sm space-y-4">
              <label className="block text-xs font-bold text-[#86868B] uppercase tracking-wider">补充提示词</label>
              <textarea
                value={state.userPrompt}
                onChange={(e) => setState(prev => ({ ...prev, userPrompt: e.target.value }))}
                placeholder="在此输入您的特定设计需求，例如：'加入龙年元素'、'极简黄金质感'..."
                className="w-full h-32 bg-[#F5F5F7] border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-[#0071E3] outline-none transition-all resize-none"
              />
              <div className="text-[11px] text-[#86868B] leading-relaxed italic border-l-2 border-[#D2D2D7] pl-3">
                提示：您的输入将与系统分析的风格提示词智能融合，共同驱动 AI 生图。
              </div>
            </div>
          </section>

          {state.analysis && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
               <div className="bg-white rounded-2xl border border-[#D2D2D7] p-6 shadow-sm">
                 <h4 className="text-sm font-bold text-[#1D1D1F] mb-3 flex items-center gap-2">
                   <Sparkles className="w-4 h-4 text-amber-500" />
                   AI 风格解析报告
                 </h4>
                 <p className="text-sm text-[#424245] leading-relaxed italic">
                   {state.analysis.prompt}
                 </p>
               </div>
            </section>
          )}
        </div>

        {/* 右侧设计成果展示 */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(Object.entries(state.assets) as [AssetType, GeneratedAsset][]).map(([type, asset]) => (
              <div key={type} className="flex flex-col group">
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-[#D2D2D7] shadow-sm flex items-center justify-center text-[#1D1D1F]">
                      {getAssetIcon(type)}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold">{getAssetLabel(type)}</h4>
                      <p className="text-[10px] text-[#86868B] font-medium tracking-tight">
                        {type === AssetType.AVATAR_FRAME ? '无内容中心 / 圆形布局' : 
                         type === AssetType.ENTRANCE_SHOW ? '横幅布局 / 围绕装饰' : 
                         type === AssetType.MEDAL ? '对称六边形 / 3D质感' : '无文字 / 电影感壁纸'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {asset.status === 'success' && (
                      <button 
                        onClick={() => downloadImage(asset.imageUrl, `design-${type}`)}
                        className="p-2 text-[#86868B] hover:text-[#0071E3] transition-colors"
                        title="下载"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleGenerate(type)}
                      disabled={asset.status === 'loading' || !state.analysis}
                      className="p-2 text-[#86868B] hover:text-[#1D1D1F] disabled:opacity-20 transition-colors"
                      title="重试"
                    >
                      <RefreshCw className={`w-4 h-4 ${asset.status === 'loading' ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                <div className="relative aspect-square md:aspect-auto md:h-[380px] rounded-[2.5rem] bg-white border border-[#D2D2D7] shadow-sm flex items-center justify-center overflow-hidden transition-all group-hover:shadow-lg group-hover:border-[#C2C2C7]">
                  {asset.status === 'loading' ? (
                    <div className="flex flex-col items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-[#F5F5F7] flex items-center justify-center animate-pulse">
                        <Loader2 className="w-6 h-6 text-[#0071E3] animate-spin" />
                      </div>
                      <span className="text-[11px] font-semibold text-[#86868B] tracking-widest uppercase">匠心打造中...</span>
                    </div>
                  ) : asset.status === 'success' ? (
                    <div className="w-full h-full p-8 flex items-center justify-center">
                      <img 
                        src={asset.imageUrl} 
                        alt={type} 
                        className={`max-w-full max-h-full object-contain transition-transform duration-700 hover:scale-105 ${type === AssetType.AVATAR_FRAME ? 'rounded-full' : 'rounded-2xl shadow-xl'}`} 
                      />
                    </div>
                  ) : asset.status === 'error' ? (
                    <div className="p-8 text-center space-y-4">
                       <div className="w-12 h-12 mx-auto rounded-full bg-red-50 flex items-center justify-center text-red-500">
                         <span className="text-xl font-bold">!</span>
                       </div>
                       <p className="text-xs text-[#86868B]">{asset.error}</p>
                       <button 
                        onClick={() => handleGenerate(type)}
                        className="text-sm text-[#0071E3] font-semibold hover:underline"
                       >
                         重新生成
                       </button>
                    </div>
                  ) : (
                    <div className="text-center p-12 opacity-30 group-hover:opacity-50 transition-opacity">
                      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#F5F5F7] flex items-center justify-center text-[#86868B]">
                        {getAssetIcon(type)}
                      </div>
                      <p className="text-[11px] font-bold tracking-[0.2em] uppercase">待生成</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-20 border-t border-[#D2D2D7]/50 mt-12 text-center">
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 text-[11px] text-[#86868B] font-semibold tracking-wider uppercase mb-10">
           <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-black"></div> 严格禁区策略</span>
           <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-black"></div> 无文字勋章规范</span>
           <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-black"></div> 对称六边形结构</span>
           <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-black"></div> 沉浸式壁纸延展</span>
        </div>
        <p className="text-[#86868B] text-[10px] font-medium tracking-[0.3em] uppercase">
          AI DESIGNER PRO © 2025 | POWERED BY GEMINI NEURAL SUITE
        </p>
      </footer>
    </div>
  );
}

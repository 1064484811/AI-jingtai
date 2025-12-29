
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AssetType, StyleAnalysis } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeStyle = async (base64Image: string): Promise<StyleAnalysis> => {
  const ai = getAI();
  const imagePart = {
    inlineData: {
      mimeType: 'image/png',
      data: base64Image.split(',')[1],
    },
  };
  
  const prompt = `作为一个专业的视觉设计师，请精确分析这张图片的风格。
  重点关注：
  1. 配色方案（主色、辅助色、点缀色）
  2. 材质与质感（如：拉丝金属、流体霓虹、磨砂玻璃、晶莹宝石等）
  3. 视觉符号与装饰元素
  4. 构图风格与光影氛围（如：赛博朋克、极简奢华、二次元、未来主义）。
  
  请用一段精炼的文字总结该风格，用于后续的AI绘图提示词。`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [imagePart, { text: prompt }] },
  });

  const text = response.text || "现代专业设计风格";
  return {
    prompt: text,
    keywords: text.split(' ').slice(0, 10),
  };
};

export const generateAsset = async (
  type: AssetType, 
  styleSummary: string, 
  userPrompt: string,
  referenceImage?: string
): Promise<string> => {
  const ai = getAI();
  
  let specificPrompt = "";
  let aspectRatio: "1:1" | "9:16" | "16:9" | "3:4" | "4:3" = "1:1";

  const combinedContext = `【核心风格】：${styleSummary}。 【用户自定义需求】：${userPrompt}。`;

  switch (type) {
    case AssetType.AVATAR_FRAME:
      specificPrompt = `设计一款高端头像框 (512x512)。
      【布局规范】：
      1. 中心必须是一个完美的、纯黑色的正圆。
      2. 所有的装饰、纹理、光效必须严格设计在中心黑圆之外的区域。
      3. 禁止在黑色圆心内生成任何内容。
      4. 整体呈现出立体的环绕感。
      ${combinedContext}
      要求：极高画质，背景纯白，商业级UI表现。`;
      aspectRatio = "1:1";
      break;
    
    case AssetType.ENTRANCE_SHOW:
      specificPrompt = `设计一款进场秀横幅组件 (16:9 比例)。
      【布局规范】：
      1. 左侧：有一个纯黑色的圆框，用于放置头像。
      2. 中间/大部分区域：一个长方形的绿色区域，作为聊天气泡/背景。
      3. 装饰规则：所有的设计元素（流光、装饰物、特效）必须围绕黑色圆框和绿色长方形进行设计。
      4. 禁止在黑色圆框内部生成任何内容。
      5. 禁止出现任何真实的文字、字母或数字。
      ${combinedContext}
      要求：极具动感，3D质感，顶级游戏或社交软件UI质感。`;
      aspectRatio = "16:9";
      break;

    case AssetType.MEDAL:
      specificPrompt = `设计一款对称六边形的成就勋章 (480x480)。
      【硬性要求】：
      1. 外形必须是严格对称的六边形。
      2. 极强的3D立体感和材质表现（如重金属、发光水晶、浮雕纹理）。
      3. 纹理厚实、结构清晰，即使在缩小的比例下也能一眼辨认。
      4. 禁止出现任何文字或数字。
      ${combinedContext}
      要求：中心有独特的主题Logo，光影剔透，像实物一样真实。`;
      aspectRatio = "1:1";
      break;

    case AssetType.WALLPAPER:
      specificPrompt = `设计一款手机壁纸海报 (720x1280)。
      【设计原则】：
      1. 基于参考图风格进行更宏大的想象力延展。
      2. 构图大胆、充满细节，有丰富的层次感和色彩渐变。
      3. 禁止出现任何文字或数字。
      4. 创造一个令人沉浸的意境或抽象世界。
      ${combinedContext}
      要求：电影级调色，4K极致细节。`;
      aspectRatio = "9:16";
      break;
  }

  const parts: any[] = [{ text: specificPrompt }];
  
  if (referenceImage) {
    parts.unshift({
      inlineData: {
        mimeType: 'image/png',
        data: referenceImage.split(',')[1]
      }
    });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts },
    config: {
      imageConfig: {
        aspectRatio,
      }
    }
  });

  let imageUrl = "";
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      imageUrl = `data:image/png;base64,${part.inlineData.data}`;
      break;
    }
  }

  if (!imageUrl) throw new Error("生成失败，请检查API Key或输入。");
  return imageUrl;
};

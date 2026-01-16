import type { ChatCompletionResponse, OpenAIModel } from '../types/openai.js'

// 增强 Chat Completion 响应格式
export function enhanceChatCompletionResponse(response: any): ChatCompletionResponse {
  const enhanced = { ...response } as ChatCompletionResponse

  // 确保时间戳存在且为数字
  if (!enhanced.created || typeof enhanced.created !== 'number') {
    enhanced.created = Math.floor(Date.now() / 1000)
  }

  // 确保模型信息存在
  if (!enhanced.model || typeof enhanced.model !== 'string') {
    enhanced.model = 'deepseek-chat'
  }

  // 确保 usage 字段存在
  if (!enhanced.usage) {
    enhanced.usage = {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0
    }
  } else {
    // 确保 usage 字段类型正确
    enhanced.usage = {
      prompt_tokens: Number(enhanced.usage.prompt_tokens) || 0,
      completion_tokens: Number(enhanced.usage.completion_tokens) || 0,
      total_tokens: Number(enhanced.usage.total_tokens) || 0
    }
  }

  // 确保 choices 数组存在且格式正确
  if (!Array.isArray(enhanced.choices) || enhanced.choices.length === 0) {
    enhanced.choices = [{
      index: 0,
      message: {
        role: 'assistant',
        content: null
      },
      finish_reason: 'stop'
    }]
  } else {
    // 修正每个 choice 的格式
    enhanced.choices = enhanced.choices.map((choice, index) => ({
      index: typeof choice.index === 'number' ? choice.index : index,
      message: {
        role: choice.message?.role || 'assistant',
        content: choice.message?.content || null
      },
      finish_reason: choice.finish_reason || 'stop'
    }))
  }

  return enhanced
}

// 增强 Models 响应格式
export function enhanceModelsResponse(data: any): { object: 'list'; data: OpenAIModel[] } {
  if (!data || !Array.isArray(data.data)) {
    return {
      object: 'list',
      data: [
        {
          id: 'deepseek-chat',
          object: 'model',
          created: Math.floor(Date.now() / 1000),
          owned_by: 'deepseek'
        }
      ]
    }
  }

  // 标准化每个模型的格式
  const enhancedData = data.data.map((model: any): OpenAIModel => ({
    id: model.id || 'deepseek-chat',
    object: 'model',
    created: typeof model.created === 'number' ? model.created : Math.floor(Date.now() / 1000),
    owned_by: model.owned_by || 'deepseek'
  }))

  return {
    object: 'list',
    data: enhancedData
  }
}

// 计算文本 token 数量（简单估算，实际应该使用 tokenizer）
export function estimateTokenCount(text: string): number {
  if (!text || typeof text !== 'string') return 0
  // 粗略估算：英文约 4 字符/token，中文约 1.5 字符/token
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length
  const otherChars = text.length - chineseChars
  return Math.ceil(chineseChars / 1.5 + otherChars / 4)
}

// 增强 usage 统计（添加更详细的 token 计算）
export function enhanceUsageWithEstimates(request: any, response: any): any {
  if (!response.usage) {
    const promptText = request.messages?.map((m: any) => m.content || '').join(' ') || ''
    const completionText = response.choices?.[0]?.message?.content || ''
    
    response.usage = {
      prompt_tokens: estimateTokenCount(promptText),
      completion_tokens: estimateTokenCount(completionText),
      total_tokens: estimateTokenCount(promptText + completionText)
    }
  }
  
  return response
}
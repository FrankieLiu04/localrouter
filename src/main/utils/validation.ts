import type { ChatCompletionRequest, EmbeddingRequest } from '../types/openai.js'

// DeepSeek 可用模型映射
export const MODEL_MAPPING: Record<string, string> = {
  // OpenAI 模型映射到 DeepSeek
  'gpt-3.5-turbo': 'deepseek-chat',
  'gpt-3.5-turbo-16k': 'deepseek-chat',
  'gpt-4': 'deepseek-chat',
  'gpt-4-turbo': 'deepseek-chat',
  'gpt-4o': 'deepseek-chat',
  'gpt-4o-mini': 'deepseek-chat',
  
  // DeepSeek 原生模型
  'deepseek-chat': 'deepseek-chat',
  'deepseek-coder': 'deepseek-coder',
  
  // OpenAI Embeddings 映射到 DeepSeek
  'text-embedding-ada-002': 'deepseek-chat',
  'text-embedding-3-small': 'deepseek-chat',
  'text-embedding-3-large': 'deepseek-chat',
  
  // DeepSeek Embeddings (如果有)
  'deepseek-embedding': 'deepseek-chat'
}

export function mapModelName(inputModel: string): string {
  return MODEL_MAPPING[inputModel] || 'deepseek-chat'
}

export function validateChatCompletionRequest(request: any): { isValid: boolean; error?: string; param?: string } {
  if (!request || typeof request !== 'object') {
    return { isValid: false, error: 'Request must be a valid object' }
  }

  // 必填字段验证
  if (!request.model || typeof request.model !== 'string') {
    return { isValid: false, error: 'model is required and must be a string', param: 'model' }
  }

  if (!request.messages || !Array.isArray(request.messages)) {
    return { isValid: false, error: 'messages is required and must be an array', param: 'messages' }
  }

  if (request.messages.length === 0) {
    return { isValid: false, error: 'messages cannot be empty', param: 'messages' }
  }

  // 验证消息格式
  for (const [i, message] of request.messages.entries()) {
    if (!message || typeof message !== 'object') {
      return { isValid: false, error: `messages[${i}] must be an object`, param: `messages[${i}]` }
    }

    const validRoles = ['system', 'user', 'assistant', 'function', 'tool']
    if (!message.role || !validRoles.includes(message.role)) {
      return { isValid: false, error: `messages[${i}].role must be one of: ${validRoles.join(', ')}`, param: `messages[${i}].role` }
    }

    if (typeof message.content !== 'string' && message.content !== null) {
      return { isValid: false, error: `messages[${i}].content must be a string or null`, param: `messages[${i}].content` }
    }
  }

  // 可选参数验证
  if (request.temperature !== undefined) {
    if (typeof request.temperature !== 'number' || request.temperature < 0 || request.temperature > 2) {
      return { isValid: false, error: 'temperature must be a number between 0 and 2', param: 'temperature' }
    }
  }

  if (request.top_p !== undefined) {
    if (typeof request.top_p !== 'number' || request.top_p <= 0 || request.top_p > 1) {
      return { isValid: false, error: 'top_p must be a number between 0 and 1', param: 'top_p' }
    }
  }

  if (request.max_tokens !== undefined) {
    if (typeof request.max_tokens !== 'number' || request.max_tokens < 1 || request.max_tokens > 8192) {
      return { isValid: false, error: 'max_tokens must be a number between 1 and 8192', param: 'max_tokens' }
    }
  }

  if (request.n !== undefined) {
    if (typeof request.n !== 'number' || request.n < 1 || request.n > 10) {
      return { isValid: false, error: 'n must be a number between 1 and 10', param: 'n' }
    }
  }

  if (request.stream !== undefined && typeof request.stream !== 'boolean') {
    return { isValid: false, error: 'stream must be a boolean', param: 'stream' }
  }

  if (request.stop !== undefined) {
    if (typeof request.stop !== 'string' && !Array.isArray(request.stop)) {
      return { isValid: false, error: 'stop must be a string or array of strings', param: 'stop' }
    }
  }

  return { isValid: true }
}

export function validateEmbeddingRequest(request: any): { isValid: boolean; error?: string; param?: string } {
  if (!request || typeof request !== 'object') {
    return { isValid: false, error: 'Request must be a valid object' }
  }

  // 必填字段验证
  if (!request.model || typeof request.model !== 'string') {
    return { isValid: false, error: 'model is required and must be a string', param: 'model' }
  }

  if (request.input === undefined || request.input === null) {
    return { isValid: false, error: 'input is required', param: 'input' }
  }

  if (typeof request.input !== 'string' && !Array.isArray(request.input)) {
    return { isValid: false, error: 'input must be a string or array of strings', param: 'input' }
  }

  if (Array.isArray(request.input)) {
    if (request.input.length === 0) {
      return { isValid: false, error: 'input array cannot be empty', param: 'input' }
    }
    
    for (const [i, item] of request.input.entries()) {
      if (typeof item !== 'string') {
        return { isValid: false, error: `input[${i}] must be a string`, param: `input[${i}]` }
      }
    }
  }

  // 可选参数验证
  if (request.dimensions !== undefined) {
    if (typeof request.dimensions !== 'number' || request.dimensions < 1 || request.dimensions > 1536) {
      return { isValid: false, error: 'dimensions must be a number between 1 and 1536', param: 'dimensions' }
    }
  }

  if (request.encoding_format !== undefined) {
    const validFormats = ['float', 'base64']
    if (!validFormats.includes(request.encoding_format)) {
      return { isValid: false, error: `encoding_format must be one of: ${validFormats.join(', ')}`, param: 'encoding_format' }
    }
  }

  return { isValid: true }
}
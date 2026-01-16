// OpenAI API 标准类型定义

export interface OpenAIError {
  error: {
    message: string
    type: 'invalid_request_error' | 'authentication_error' | 'permission_denied_error' | 'not_found_error' | 'rate_limit_error' | 'api_error' | 'internal_server_error'
    param?: string | null
    code?: string | null
  }
}

export interface OpenAIModel {
  id: string
  object: 'model'
  created: number
  owned_by: string
}

export interface OpenAIModelsResponse {
  object: 'list'
  data: OpenAIModel[]
}

export interface ChatCompletionMessage {
  role: 'system' | 'user' | 'assistant' | 'function' | 'tool'
  content: string | null
  name?: string
  function_call?: any
  tool_calls?: any
}

export interface ChatCompletionRequest {
  model: string
  messages: ChatCompletionMessage[]
  temperature?: number | null
  top_p?: number | null
  n?: number | null
  stream?: boolean | null
  stop?: string | string[] | null
  max_tokens?: number | null
  presence_penalty?: number | null
  frequency_penalty?: number | null
  logit_bias?: Record<string, number> | null
  user?: string | null
  functions?: any[]
  function_call?: any
  tools?: any[]
  tool_choice?: any
  response_format?: any
  seed?: number | null
}

export interface Usage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

export interface ChatCompletionChoice {
  index: number
  message: ChatCompletionMessage
  finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | 'function_call'
}

export interface ChatCompletionResponse {
  id: string
  object: 'chat.completion'
  created: number
  model: string
  choices: ChatCompletionChoice[]
  usage?: Usage
  system_fingerprint?: string
}

export interface EmbeddingRequest {
  model: string
  input: string | string[]
  encoding_format?: 'float' | 'base64' | null
  dimensions?: number | null
  user?: string | null
}

export interface EmbeddingData {
  object: 'embedding'
  embedding: number[]
  index: number
}

export interface EmbeddingUsage {
  prompt_tokens: number
  total_tokens: number
}

export interface EmbeddingResponse {
  object: 'list'
  data: EmbeddingData[]
  model: string
  usage: EmbeddingUsage
}
import { GoogleGenerativeAI } from '@google/generative-ai'
import {
  getFictionChapterSummaryPrompt,
  getNonFictionChapterSummaryPrompt,
  getChapterConnectionsAnalysisPrompt,
  getOverallSummaryPrompt,
  getTestConnectionPrompt,
  getChapterMindMapPrompt,
  getMindMapArrowPrompt,
} from './prompts'
import type { MindElixirData } from 'mind-elixir'
import { getLanguageInstruction, type SupportedLanguage } from './prompts/utils'

interface Chapter {
  id: string
  title: string
  content: string
  summary?: string
}

interface AIConfig {
  provider: 'gemini' | 'openai' | 'ollama' | '302.ai'  | 'qwen3'
  apiKey: string
  apiUrl?: string // 用于OpenAI兼容的API地址
  model?: string
  temperature?: number
}

export class AIService {
  private config: AIConfig | (() => AIConfig)
  private genAI?: GoogleGenerativeAI
  private model: any

  constructor(config: AIConfig | (() => AIConfig)) {
    this.config = config
    
    const currentConfig = typeof config === 'function' ? config() : config
    
    if (currentConfig.provider === 'gemini') {
      this.genAI = new GoogleGenerativeAI(currentConfig.apiKey)
      this.model = this.genAI.getGenerativeModel({ 
        model: currentConfig.model || 'gemini-1.5-flash'
      })
    } else if (currentConfig.provider === 'openai' || currentConfig.provider === '302.ai') {
      // OpenAI compatible configuration
      this.model = {
        apiUrl: currentConfig.apiUrl || 'https://api.openai.com/v1',
        apiKey: currentConfig.apiKey,
        model: currentConfig.model || 'gpt-3.5-turbo'
      }
    } else if (currentConfig.provider === 'ollama') {
      // Ollama configuration
      this.model = {
        apiUrl: currentConfig.apiUrl || 'http://localhost:11434',
        apiKey: currentConfig.apiKey || '', // Ollama通常不需要API密钥
        model: currentConfig.model || 'llama2'
      }
    }else if (currentConfig.provider === 'qwen3') {
        // OpenAI
        this.model = {
            apiUrl: currentConfig.apiUrl || 'https://llm-api.empasy.com/v1',
            apiKey: currentConfig.apiKey,
            model: currentConfig.model || 'Qwen3-VL-8B-Instruct'
        }
    }
  }

  private getCurrentConfig(): AIConfig {
    return typeof this.config === 'function' ? this.config() : this.config
  }

  async summarizeChapter(title: string, content: string, bookType: 'fiction' | 'non-fiction' = 'non-fiction', outputLanguage: SupportedLanguage = 'en', customPrompt?: string): Promise<string> {
    try {
      let prompt = bookType === 'fiction'
        ? getFictionChapterSummaryPrompt(title, content)
        : getNonFictionChapterSummaryPrompt(title, content)

      // If there are custom prompts, append them to the original prompt.
      if (customPrompt && customPrompt.trim()) {
        prompt += `\n\nAdditional requirement：${customPrompt.trim()}`
      }

      const summary = await this.generateContent(prompt, outputLanguage)

      if (!summary || summary.trim().length === 0) {
        throw new Error('AI returned an empty summar')
      }

      return summary.trim()
    } catch (error) {
      throw new Error(`Chapter summary failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async analyzeConnections(chapters: Chapter[], outputLanguage: SupportedLanguage = 'en'): Promise<string> {
    try {
      // Build chapter summary information
      const chapterSummaries = chapters.map((chapter) => 
        `${chapter.title}:\n${chapter.summary || 'No summary'}`
      ).join('\n\n')

      const prompt = getChapterConnectionsAnalysisPrompt(chapterSummaries)

      const connections = await this.generateContent(prompt, outputLanguage)

      if (!connections || connections.trim().length === 0) {
        throw new Error('AI returned an empty association analysis')
      }

      return connections.trim()
    } catch (error) {
      throw new Error(`Chapter association analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async generateOverallSummary(
    bookTitle: string, 
    chapters: Chapter[], 
    connections: string,
    outputLanguage: SupportedLanguage = 'en'
  ): Promise<string> {
    try {
      // Construct simplified chapter information
      const chapterInfo = chapters.map((chapter, index) => 
        `Chapter ${index + 1}：${chapter.title}，content：${chapter.summary || 'No summary'}`
      ).join('\n')

      const prompt = getOverallSummaryPrompt(bookTitle, chapterInfo, connections)

      const summary = await this.generateContent(prompt, outputLanguage)

      if (!summary || summary.trim().length === 0) {
        throw new Error('AI returned an empty book summary')
      }

      return summary.trim()
    } catch (error) {
      throw new Error(`Failed to generate the book summary: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async generateChapterMindMap(content: string, outputLanguage: SupportedLanguage = 'en', customPrompt?: string): Promise<MindElixirData> {
    try {
      const basePrompt = getChapterMindMapPrompt()
      let prompt = basePrompt + `Chapter conten：\n${content}`

      // If there are custom prompts, append them to the original prompt.
      if (customPrompt && customPrompt.trim()) {
        prompt += `\n\nAdditional requirement：${customPrompt.trim()}`
      }

      const mindMapJson = await this.generateContent(prompt, outputLanguage)

      if (!mindMapJson || mindMapJson.trim().length === 0) {
        throw new Error('AI returned empty mind map data')
      }
      
      // Attempt to parse JSON
      try {
        return JSON.parse(mindMapJson.trim())
      } catch (parseError) {
        //  Try to extract JSON from the code block
        const jsonMatch = mindMapJson.match(/```(?:json)?\s*([\s\S]*?)```/)
        if (jsonMatch && jsonMatch[1]) {
          try {
            return JSON.parse(jsonMatch[1].trim())
          } catch (extractError) {
            throw new Error('The mind map data returned by AI is in an incorrect format')
          }
        }
        throw new Error('The mind map data returned by AI is in an incorrect format')
      }
    } catch (error) {
      throw new Error(`Failed to generate chapter mind map: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async generateMindMapArrows(combinedMindMapData: any, outputLanguage: SupportedLanguage = 'en'): Promise<any> {
    try {
      const basePrompt = getMindMapArrowPrompt()
      const prompt = basePrompt + `\n\nCurrent mind map data：\n${JSON.stringify(combinedMindMapData, null, 2)}`

      const arrowsJson = await this.generateContent(prompt, outputLanguage)

      if (!arrowsJson || arrowsJson.trim().length === 0) {
        throw new Error('AI returned an empty arrow data')
      }

      // Attempt to parse JSON
      try {
        return JSON.parse(arrowsJson.trim())
      } catch (parseError) {
        // Try to extract JSON from the code block
        const jsonMatch = arrowsJson.match(/```(?:json)?\s*([\s\S]*?)```/)
        if (jsonMatch && jsonMatch[1]) {
          try {
            return JSON.parse(jsonMatch[1].trim())
          } catch (extractError) {
            throw new Error('The arrow data format returned by AI is incorrect')
          }
        }
        throw new Error('The arrow data format returned by AI is incorrect')
      }
    } catch (error) {
      throw new Error(`Mind map arrow generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async generateCombinedMindMap(bookTitle: string, chapters: Chapter[], customPrompt?: string): Promise<MindElixirData> {
    try {
      const basePrompt = getChapterMindMapPrompt()
      const chaptersContent = chapters.map(item=>item.content).join('\n\n ------------- \n\n')
      let prompt = `${basePrompt}
      Please create a complete mind map for the entire book 《${bookTitle}》 integrating the content of all chapters.
      Chapter content:\\n${chaptersContent}`

      //  If there are custom prompts, append them to the original prompt.
      if (customPrompt && customPrompt.trim()) {
        prompt += `\n\nAdditional requirement：${customPrompt.trim()}`
      }

      const mindMapJson = await this.generateContent(prompt, 'en')

      if (!mindMapJson || mindMapJson.trim().length === 0) {
        throw new Error('AI returned empty mind map data')
      }
      
      // Attempt to parse JSON
      try {
        return JSON.parse(mindMapJson.trim())
      } catch (parseError) {
        // Try to extract JSON from the code block
        const jsonMatch = mindMapJson.match(/```(?:json)?\s*([\s\S]*?)```/)
        if (jsonMatch && jsonMatch[1]) {
          try {
            return JSON.parse(jsonMatch[1].trim())
          } catch (extractError) {
            throw new Error('The mind map data returned by AI is in an incorrect format')
          }
        }
        throw new Error('The mind map data returned by AI is in an incorrect format')
      }
    } catch (error) {
        console.error('Error:', error)
      throw new Error(`Failed to generate the whole book mind map: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Unified content generation method
  private async generateContent(prompt: string, outputLanguage?: SupportedLanguage): Promise<string> {
    const config = this.getCurrentConfig()
    const language = outputLanguage || 'en'
    const systemPrompt = getLanguageInstruction(language)
    
    if (config.provider === 'gemini') {
      // Gemini API does not directly support system prompts, merge system prompts before user prompts
      const finalPrompt = `${prompt}\n\n**${systemPrompt}**`
      const result = await this.model.generateContent(finalPrompt, {
        generationConfig: {
          temperature: config.temperature || 0.7
        }
      })
      const response = await result.response
      return response.text()
    } else if (config.provider === 'openai' || config.provider === '302.ai' || config.provider === 'qwen3') {
      const messages: Array<{role: 'system' | 'user', content: string}> = [
        {
          role: 'user',
          content: prompt + '\n\n' + systemPrompt
        }
      ]
      
      const response = await fetch(`${this.model.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.model.apiKey}`
        },
        body: JSON.stringify({
          model: this.model.model,
          messages,
          temperature: config.temperature || 0.7
        })
      })

      if (!response.ok) {
        const errorBody = await response.text()
        throw new Error(`OpenAI API request failed: ${response.status} ${response.statusText} - ${errorBody}`)
      }

      const data = await response.json()
      return data.choices[0]?.message?.content || ''
    } else if (config.provider === 'ollama') {
      // Ollama API 调用
      const messages: Array<{role: 'system' | 'user', content: string}> = [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: prompt
        }
      ]
      
      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      // If an API key is provided, add an Authorization header.
      if (this.model.apiKey) {
        requestHeaders['Authorization'] = `Bearer ${this.model.apiKey}`
      }
      
      const response = await fetch(`${this.model.apiUrl}/api/chat`, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify({
          model: this.model.model,
          messages,
          stream: false,
          options: {
            temperature: config.temperature || 0.7
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Ollama API request failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data.message?.content || ''
    }
    
    throw new Error(`Unsupported AI provider: ${config.provider}`)
  }

  // 辅助方法：检查API连接
  async testConnection(): Promise<boolean> {
    try {
      const text = await this.generateContent(getTestConnectionPrompt())
      return text.includes('Connection successful') || text.includes('成功')
    } catch (error) {
      return false
    }
  }
}

// 保持向后兼容性
export class AiService extends AIService {
  constructor(apiKey: string) {
    super({ provider: 'gemini', apiKey })
  }
}
// Prompt utility function

/**
 * Get language instructions
 * @param language Output language
 * @returns The command text for the corresponding language
 */
export const getLanguageInstruction = (language: 'ko' |'en' | 'zh' | 'ja' | 'fr' | 'de' | 'es' | 'ru' | 'auto' = 'en'): string => {
  switch (language) {
    case 'zh':
      return '请用中文回复。'
    case 'ja':
      return '日本語で回答してください。'
    case 'fr':
      return 'Veuillez répondre en français.'
    case 'de':
      return 'Bitte antworten Sie auf Deutsch.'
    case 'es':
      return 'Por favor responda en español.'
    case 'ru':
      return 'Пожалуйста, отвечайте на русском языке.'
    case 'ko':
        return '한국어로 대답해 주세요.'
    case 'en':
    case 'auto':
    default:
      return 'Please respond in English.'
  }
}

/**
 * Language type definition
 */
export type SupportedLanguage = 'ko' | 'en' | 'zh' | 'ja' | 'fr' | 'de' | 'es' | 'ru' | 'auto'
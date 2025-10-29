// 全书总结相关的prompt模板

export const getOverallSummaryPrompt = (bookTitle: string, chapterInfo: string, connections: string) => {
  const userPrompt = `Book chapter structure：
${chapterInfo}

Chapter correlation analysis:
${connections}

The above summarizes the key points of the book 《${bookTitle}》. Please generate a comprehensive summary report to help readers quickly grasp the essence of the book. 
`
  return userPrompt
}
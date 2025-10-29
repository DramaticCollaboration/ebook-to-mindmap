// 章节关联分析相关的prompt模板

export const getChapterConnectionsAnalysisPrompt = (chapterSummaries: string) => {
  const userPrompt = `Please help me analyze the relationships between the chapters of this book and summarize the core content of the entire book：

${chapterSummaries}

Please analyze from the following aspects:

## 1. Connections between chapters
- How does each chapter unfold its argument step by step?
- Which key points appear repeatedly in different chapters?
- What foreshadowing did the preceding chapters provide for the content to come?

## 2. The Core Theme of the Book
What is the main message this book wants to convey to its readers?
What is the author's main point?
- What are some important concepts that deserve special attention?

## 3. Practical Value
What guidance does this book offer for real life?
What practical knowledge or methods can readers learn from this?
- What perspectives might change the way we think?

## 4. Brief Summary
- Summarize the essence of this book in a few sentences
- Who should I recommend this to?
What was the biggest takeaway from reading this book?

Please use plain and easy-to-understand language to analyze the book so that ordinary readers can easily understand its value and significance.`
  
  return userPrompt
}
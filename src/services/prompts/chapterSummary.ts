// Chapter summary related prompt template

export const getFictionChapterSummaryPrompt = (title: string, content: string) => {
  const userPrompt = `Please generate a detailed summary for the following section：

Chapter title：${title}

Chapter Contents：
${content}

Please summarize the content of this chapter in natural and fluent language, including the main plot developments, the performance of important characters, key ideas or turning points, and the role and significance of this chapter in the entire story.

Note: If the page contains acknowledgments, table of contents, preface, foreword, or similar content without a substantial story, please reply "No summary needed"`
  
  return userPrompt
}

export const getNonFictionChapterSummaryPrompt = (title: string, content: string) => {
  const userPrompt = ` Please generate a detailed summary for the following social science book chapters：

Chapter title：${title}

Chapter Contents：
${content}

Please summarize the content of this chapter in natural and fluent language, including:

- Key points, along with supporting case studies or research findings.
- Key Concepts
- Keep a few insightful original texts
- Provide practical advice or applications (must be strongly related to the content of this chapter).`
  
  return userPrompt
}
export const getChapterMindMapPrompt = ()=> {
  const userPrompt = `\`\`\`ts
export interface NodeObj {
  topic: string
  id: string
  tags?: string[]
  children?: NodeObj[]
}
// Summarize the contents of the start to end nodes of the parent ID
export interface Summary {
  id: string
  label: string
  /**
   * parent node id of the summary
   */
  parent: string
  /**
   * start index of the summary
   */
  start: number
  /**
   * end index of the summary
   */
  end: number
}
\`\`\`

with JSON in the format { 
  nodeData: NodeObj 
  summaries?: Summary[] 
}. This is a recursive structure representing **mind map data**. 

**Note!! nodeData and summaries are at the same level!!** ** 

Strictly adhere to the following:** 
- Use incrementing numbers for node IDs 
. - Avoid using sibling node relationships indiscriminately; apply parent-child hierarchical structures appropriately. 
- Insert tags into nodes: Optional tags include Core, Case Studies, Practices, and Quotes. 
- Summary is a tool for summarizing multiple child nodes of the same parent node. It will use curly braces to display the summary text next to the specified child node. Because nodes may be distributed on both sides, do not summarize the root node. 
- Add appropriate Summary entries, but avoid adding redundant ones 
. - Finally, add a Quote node to record a few key quotes from this chapter. 
- Add appropriate emojis to express the meaning of the node 
. - Ensure the JSON format is correct; do not return any content other than JSON. 
- If the content is an acknowledgment, table of contents, preface, introduction, references, publisher information, citation notes, etc., please reply directly with "{nodeData:null}". 
`
  
  return userPrompt
}

export const getMindMapArrowPrompt = () => {
  const userPrompt = `You need to add arrow connections to existing mind maps to show the relationships between different nodes. 
\`\`\`ts
export interface NodeObj {
  topic: string
  id: string
  tags?: string[]
  children?: NodeObj[]
}

export interface Arrow {
  id: string
  /**
   * label of arrow
   */
  label: string
  /**
   * id of start node
   */
  from: string
  /**
   * id of end node
   */
  to: string
  /**
   * offset of control point from start point
   */
  delta1: {
    x: number
    y: number
  }
  /**
   * offset of control point from end point
   */
  delta2: {
    x: number
    y: number
  }
  /**
   * whether the arrow is bidirectional
   */
  bidirectional?: boolean
}
\`\`\`

Reply 
to the user 
using JSON formatted as \`{ 
  arrows?: Arrow[] } \`. 
**Strictly adhere to**: 
- Arrow can add arrows connecting any nodes, label indirectly indicates the relationship between two nodes, and delta's default value is 50,50. **Direct parent-child relationships do not require links** 
- **Direct parent-child relationships do not require Arrow links**



- You can only add 6 or fewer Arrows. Please link the most critical node relationships. 
- Make sure the JSON format is correct and do not return anything other than JSON. 
`
  
  return userPrompt
}
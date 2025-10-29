import { toast } from 'sonner'
import { launchMindElixir } from '@mind-elixir/open-desktop'
import { downloadMethodList } from '@mind-elixir/export-mindmap'
import type { MindElixirData, MindElixirInstance } from 'mind-elixir'

/**
 * 滚动到页面顶部
 */
export const scrollToTop = () => {
  const scrollContainer = document.querySelector('.scroll-container')
  if (scrollContainer) {
    scrollContainer.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
}

/**
 * 在 MindElixir Desktop 中打开思维导图
 * @param mindmapData 思维导图数据
 * @param title 思维导图标题
 */
export const openInMindElixir = async (mindmapData: MindElixirData, title: string) => {
  try {
    await launchMindElixir(mindmapData)
    toast.success(`Successfully sent "${title}" to Mind Elixir Deskto`, {
      duration: 3000,
      position: 'top-center',
    })
  } catch (error) {
    console.error('Failed to start Mind Elixir:', error)
    toast.error('Failed to start Mind Elixir', {
      duration: 5000,
      position: 'top-center',
    })
  }
}

/**
 * 下载思维导图
 * @param mindElixirInstance MindElixir 实例
 * @param title 思维导图标题
 * @param format 导出格式
 */
export const downloadMindMap = async (mindElixirInstance: MindElixirInstance, title: string, format: string) => {
  try {
    // 查找对应的下载方法
    const method = downloadMethodList.find((item) => item.type === format)
    if (!method) {
      throw new Error(`Unsupported format: ${format}`)
    }

    // 执行下载
    await method.download(mindElixirInstance)

    toast.success(`${title} has been successfully exported to ${format} format`, {
      duration: 3000,
      position: 'top-center',
    })
  } catch (error) {
    console.error('Failed to export mind map:', error)
    toast.error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`, {
      duration: 5000,
      position: 'top-center',
    })
  }
}

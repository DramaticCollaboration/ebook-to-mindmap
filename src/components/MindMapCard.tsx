import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, ExternalLink } from 'lucide-react'
import { CopyButton } from '@/components/ui/copy-button'
import { ViewContentDialog } from './ViewContentDialog'
import { DownloadMindMapButton } from './DownloadMindMapButton'
import MindElixirReact from './project/MindElixirReact'
import type { MindElixirData, MindElixirInstance, Options } from 'mind-elixir'
import type { MindElixirReactRef } from './project/MindElixirReact'
import { useTranslation } from 'react-i18next'

interface MindMapCardProps {
    /** Chapter ID */
    id: string
    /** Chapter Title */
    title: string
    /** Chapter content (original content) */
    content: string
    /** Mind map data*/
    mindMapData: MindElixirData
    /** Chapter index */
    index: number

    /** Callback function to clear cache*/
    onClearCache?: (chapterId: string) => void
    /** Callback function opened in MindElixir */
    onOpenInMindElixir?: (mindmapData: MindElixirData, title: string) => void
    /** Callback function for downloading mind map*/
    onDownloadMindMap?: (mindElixirInstance: MindElixirInstance, title: string, format: string) => void
    /** Should the "Clear Cache" button be displayed? */
    showClearCache?: boolean
    /** Show/ content button */
    showViewContent?: boolean
    /** Should the copy button be displayed? */
    showCopyButton?: boolean
    /** Should the open button be displayed in MindElixir? */
    showOpenInMindElixir?: boolean
    /** Show download button? */
    showDownloadButton?: boolean
    /** Custom class name */
    className?: string
    /** Custom class name of mind map container*/
    mindMapClassName?: string
    /** MindElixir options */
    mindElixirOptions?: Partial<Options>
}

export const MindMapCard: React.FC<MindMapCardProps> = ({
  id,
  title,
  content,
  mindMapData,
  index,

  onClearCache,
  onOpenInMindElixir,
  onDownloadMindMap,
  showClearCache = true,
  showViewContent = true,
  showCopyButton = true,
  showOpenInMindElixir = true,
  showDownloadButton = true,
  className = '',
  mindMapClassName = 'aspect-square w-full max-w-[500px] mx-auto',
  mindElixirOptions = { direction: 1, alignment: 'nodes' }
}) => {
  const { t } = useTranslation()
  const localMindElixirRef = React.useRef<MindElixirReactRef | null>(null)

  return (
    <Card className={`gap-2 ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg w-full overflow-hidden">
          <div className="truncate w-full">
            {title}
          </div>
          <div className="flex items-center gap-2 mt-2">
            {showOpenInMindElixir && onOpenInMindElixir && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenInMindElixir(mindMapData, title)}
                title={t('common.openInMindElixir')}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
              </Button>
            )}
            {showDownloadButton && onDownloadMindMap && (
              <DownloadMindMapButton
                mindElixirRef={() => localMindElixirRef.current}
                title={title}
                downloadMindMap={onDownloadMindMap}
              />
            )}
            {showCopyButton && (
              <CopyButton
                content={content}
                successMessage={t('common.copiedToClipboard')}
                title={t('common.copyChapterContent')}
              />
            )}
            {showClearCache && onClearCache && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onClearCache(id)}
                title={t('common.clearCache')}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            {showViewContent && (
              <ViewContentDialog
                title={title}
                content={content}
                chapterIndex={index}
              />
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <MindElixirReact
            ref={localMindElixirRef}
            data={mindMapData}
            fitPage={false}
            options={mindElixirOptions}
            className={mindMapClassName}
          />
        </div>
      </CardContent>
    </Card>
  )
}

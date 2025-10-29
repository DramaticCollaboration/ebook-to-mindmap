import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkCjkFriendly from "remark-cjk-friendly";
import { CopyButton } from '@/components/ui/copy-button'
import { ViewContentDialog } from './ViewContentDialog'
import { useTranslation } from 'react-i18next'

interface MarkdownCardProps {
    /** Chapter ID */
    id: string
    /** Chapter Title */
    title: string
    /** Chapter content (original content) */
    content: string
    /** Summary content in Markdown format*/
    markdownContent: string
    /** Chapter index */
    index: number
    /** Callback function to clear cache*/
    onClearCache?: (chapterId: string) => void
    /** Callback function for reading chapters*/
    onReadChapter?: () => void
    /** Should the "Clear Cache" button be displayed? */
    showClearCache?: boolean
    /** Show/ content button */
    showViewContent?: boolean
    /** Should the copy button be displayed? */
    showCopyButton?: boolean
    /** Show/ button? */
    showReadButton?: boolean
    /** Custom class name */
    className?: string
    /** Whether to fold by default */
    defaultCollapsed?: boolean
}

export const MarkdownCard: React.FC<MarkdownCardProps> = ({
  id,
  title,
  content,
  markdownContent,
  index,
  onClearCache,
  onReadChapter,
  showClearCache = true,
  showViewContent = true,
  showCopyButton = true,
  showReadButton = true,
  className = '',
  defaultCollapsed = false,
}) => {
  const { t } = useTranslation()
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  return (
    <Card className={`gap-0 ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between gap-2">
          <Badge variant="outline"># {index + 1}</Badge>
          <div className="truncate flex-1 w-1" title={title}>
            {title}
          </div>
          {showCopyButton && (
            <CopyButton
              content={markdownContent}
              successMessage={t('common.copiedToClipboard')}
              title={t('common.copyChapterSummary')}
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
          {showReadButton && onReadChapter && (
            <Button variant="outline" size="sm" onClick={onReadChapter}>
              <BookOpen className="h-3 w-3" />
            </Button>
          )}
          {showViewContent && (
            <ViewContentDialog
              title={title}
              content={content}
              chapterIndex={index}
            />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? t('common.expand') : t('common.collapse')}
          >
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      {!isCollapsed && (
        <CardContent>
          <div className="text-gray-700 leading-relaxed prose prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm,remarkCjkFriendly]}>
              {markdownContent || ''}
            </ReactMarkdown>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

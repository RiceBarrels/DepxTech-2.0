'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import '@mdxeditor/editor/style.css'

// Dynamically import MDXEditor to avoid SSR issues
const MDXEditorComponent = dynamic(
  () =>
    import('@mdxeditor/editor').then((mod) => {
      const {
        MDXEditor,
        headingsPlugin,
        listsPlugin,
        linkPlugin,
        linkDialogPlugin,
        imagePlugin,
        tablePlugin,
        thematicBreakPlugin,
        quotePlugin,
        markdownShortcutPlugin,
        toolbarPlugin,
        UndoRedo,
        BoldItalicUnderlineToggles,
        BlockTypeSelect,
        CreateLink,
        InsertImage,
        InsertTable,
        InsertThematicBreak,
        ListsToggle,
        CodeToggle,
        Separator,
      } = mod

      // Build the component with all plugins baked in
      function Editor({ markdown, onChange, imageUploadHandler }) {
        return (
          <MDXEditor
            markdown={markdown}
            onChange={onChange}
            className="mdx-editor-wrapper"
            contentEditableClassName="mdx-editor-content"
            plugins={[
              headingsPlugin(),
              listsPlugin(),
              linkPlugin(),
              linkDialogPlugin(),
              quotePlugin(),
              imagePlugin({ imageUploadHandler }),
              tablePlugin(),
              thematicBreakPlugin(),
              markdownShortcutPlugin(),
              toolbarPlugin({
                toolbarContents: () => (
                  <>
                    <UndoRedo />
                    <Separator />
                    <BoldItalicUnderlineToggles />
                    <CodeToggle />
                    <Separator />
                    <BlockTypeSelect />
                    <Separator />
                    <ListsToggle />
                    <Separator />
                    <CreateLink />
                    <InsertImage />
                    <InsertTable />
                    <InsertThematicBreak />
                  </>
                ),
              }),
            ]}
          />
        )
      }

      return Editor
    }),
  { ssr: false, loading: () => <div className="h-64 rounded-lg border bg-muted/30 animate-pulse" /> }
)

export default function BlogEditor({ value, onChange }) {
  const imageUploadHandler = useCallback(async (image) => {
    const formData = new FormData()
    formData.append('file', image)
    formData.append('folder', 'blog')

    const response = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || 'Image upload failed')
    }

    return data.url
  }, [])

  return (
    <div className="border rounded-lg overflow-hidden bg-background [&_.mdx-editor-wrapper]:min-h-[400px] [&_[role=toolbar]]:bg-muted/50 [&_[role=toolbar]]:border-b [&_.mdx-editor-content]:px-4 [&_.mdx-editor-content]:py-3 [&_.mdx-editor-content]:prose [&_.mdx-editor-content]:prose-sm [&_.mdx-editor-content]:max-w-none [&_.mdx-editor-content]:dark:prose-invert">
      <MDXEditorComponent
        markdown={value || ''}
        onChange={onChange}
        imageUploadHandler={imageUploadHandler}
      />
    </div>
  )
}

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { X, Sun, Moon, Plus, Minus, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fitFontSize } from './auto-fit'
import type { DisplayMode as Mode } from './storage'

interface Props {
  text: string
  displayMode: Mode
  onExit: () => void
  onChangeDisplayMode: (m: Mode) => void
}

const STEP = 1.15
const MIN_PX = 16
const MAX_PX = 400
const TOOLBAR_HIDE_MS = 3000

export function DisplayMode({ text, displayMode, onExit, onChangeDisplayMode }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState<{ w: number; h: number }>({
    w: 0,
    h: 0,
  })
  const [autoSize, setAutoSize] = useState(MIN_PX)
  const [manualSize, setManualSize] = useState<number | null>(null)
  const [toolbarVisible, setToolbarVisible] = useState(true)
  const hideTimerRef = useRef<number | null>(null)

  const fontSize = manualSize ?? autoSize

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect
      setContainerSize({ w: rect.width, h: rect.height })
    })
    observer.observe(el)
    setContainerSize({ w: el.clientWidth, h: el.clientHeight })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!measureRef.current) return
    if (containerSize.w <= 0 || containerSize.h <= 0) return
    if (!text) {
      setAutoSize(MIN_PX)
      return
    }
    const node = measureRef.current
    const size = fitFontSize(
      (fs) => {
        node.style.fontSize = `${fs}px`
        return { w: node.scrollWidth, h: node.scrollHeight }
      },
      {
        containerW: containerSize.w,
        containerH: containerSize.h,
        minPx: MIN_PX,
        maxPx: MAX_PX,
      },
    )
    setAutoSize(size)
  }, [text, containerSize])

  const showToolbar = useCallback(() => {
    setToolbarVisible(true)
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current)
    hideTimerRef.current = window.setTimeout(() => {
      setToolbarVisible(false)
    }, TOOLBAR_HIDE_MS)
  }, [])

  useEffect(() => {
    showToolbar()
    return () => {
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current)
    }
  }, [showToolbar])

  const bg = displayMode === 'dark' ? '#000' : '#fff'
  const fg = displayMode === 'dark' ? '#fff' : '#000'

  function bumpSize(factor: number) {
    const current = manualSize ?? autoSize
    const next = Math.max(MIN_PX, Math.min(MAX_PX, current * factor))
    setManualSize(next)
    showToolbar()
  }

  function resetToAuto() {
    setManualSize(null)
    showToolbar()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer select-none"
      style={{ background: bg, color: fg }}
      onClick={showToolbar}
    >
      <div
        ref={containerRef}
        className="absolute inset-0 flex items-center justify-center p-4 overflow-hidden"
      >
        <div
          style={{
            width: '100%',
            fontSize: `${fontSize}px`,
            lineHeight: 1.2,
            whiteSpace: 'pre-wrap',
            overflowWrap: 'anywhere',
            wordBreak: 'break-word',
            textAlign: 'center',
            fontFamily: 'var(--font-serif-tc), var(--font-serif-jp), serif',
          }}
        >
          {text}
        </div>
        <div
          ref={measureRef}
          aria-hidden
          style={{
            position: 'absolute',
            visibility: 'hidden',
            pointerEvents: 'none',
            left: 0,
            top: 0,
            width: `${containerSize.w}px`,
            lineHeight: 1.2,
            whiteSpace: 'pre-wrap',
            overflowWrap: 'anywhere',
            wordBreak: 'break-word',
            textAlign: 'center',
            fontFamily: 'var(--font-serif-tc), var(--font-serif-jp), serif',
          }}
        >
          {text}
        </div>
      </div>

      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border bg-background/95 backdrop-blur px-2 py-1.5 shadow-lg transition-opacity"
        style={{
          opacity: toolbarVisible ? 1 : 0,
          pointerEvents: toolbarVisible ? 'auto' : 'none',
          color: 'var(--foreground)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="退出"
          onClick={onExit}
        >
          <X />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={displayMode === 'dark' ? '亮色' : '暗色'}
          onClick={() =>
            onChangeDisplayMode(displayMode === 'dark' ? 'light' : 'dark')
          }
        >
          {displayMode === 'dark' ? <Sun /> : <Moon />}
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="縮小"
          onClick={() => bumpSize(1 / STEP)}
        >
          <Minus />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="放大"
          onClick={() => bumpSize(STEP)}
        >
          <Plus />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="自動填滿"
          onClick={resetToAuto}
          disabled={manualSize === null}
        >
          <Maximize2 />
        </Button>
      </div>
    </div>
  )
}

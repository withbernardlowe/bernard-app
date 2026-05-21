import { useState } from 'react'
import { EditMode } from './EditMode'
import { DisplayMode } from './DisplayMode'
import {
  commitToHistory,
  read,
  removeItem,
  setCurrent,
  setDisplayMode,
  togglePin,
  type HistoryItem,
  type Stored,
} from './storage'

type View = 'edit' | 'display'

export function BigTextPage() {
  const [stored, setStored] = useState<Stored>(() => read())
  const [view, setView] = useState<View>('edit')

  function handleChangeText(s: string) {
    setStored(setCurrent(s))
  }

  function handleShow() {
    if (!stored.current.trim()) return
    setStored(commitToHistory(stored.current))
    setView('display')
  }

  function handlePickHistory(item: HistoryItem) {
    setStored(setCurrent(item.text))
  }

  function handleTogglePin(id: string) {
    setStored(togglePin(id))
  }

  function handleRemove(id: string) {
    setStored(removeItem(id))
  }

  function handleExit() {
    setView('edit')
  }

  function handleChangeDisplayMode(m: 'light' | 'dark') {
    setStored(setDisplayMode(m))
  }

  if (view === 'display') {
    return (
      <DisplayMode
        text={stored.current}
        displayMode={stored.displayMode}
        onExit={handleExit}
        onChangeDisplayMode={handleChangeDisplayMode}
      />
    )
  }

  return (
    <EditMode
      text={stored.current}
      history={stored.history}
      onChangeText={handleChangeText}
      onShow={handleShow}
      onPickHistory={handlePickHistory}
      onTogglePin={handleTogglePin}
      onRemove={handleRemove}
    />
  )
}

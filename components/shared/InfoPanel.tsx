'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Lightbulb, Info, BookOpen } from 'lucide-react'

interface InfoPanelProps {
  title: string
  description: string
  userStory?: string
  tip?: string
}

export default function InfoPanel({ title, description, userStory, tip }: InfoPanelProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className="rounded-2xl border border-yellow-200 overflow-hidden"
      style={{ backgroundColor: '#fef9c3' }}
    >
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3.5 text-left"
      >
        <div className="flex items-center gap-2.5">
          <Info size={16} className="text-yellow-600 flex-shrink-0" />
          <span className="text-sm font-semibold text-yellow-800">{title}</span>
        </div>
        {collapsed ? (
          <ChevronDown size={16} className="text-yellow-600 flex-shrink-0" />
        ) : (
          <ChevronUp size={16} className="text-yellow-600 flex-shrink-0" />
        )}
      </button>

      {!collapsed && (
        <div className="px-4 pb-4 space-y-3 border-t border-yellow-200">
          <p className="text-sm text-yellow-800 leading-relaxed pt-3">{description}</p>

          {userStory && (
            <div className="flex gap-2.5">
              <BookOpen size={15} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-yellow-700 mb-0.5">Historia de usuario</p>
                <p className="text-xs text-yellow-700 leading-relaxed">{userStory}</p>
              </div>
            </div>
          )}

          {tip && (
            <div className="flex gap-2.5 bg-yellow-100 rounded-xl p-3">
              <Lightbulb size={15} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-yellow-700 mb-0.5">Consejo</p>
                <p className="text-xs text-yellow-700 leading-relaxed">{tip}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

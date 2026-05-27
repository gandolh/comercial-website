import { Tabs as BaseTabs } from '@base-ui/react/tabs'
import type { ReactNode } from 'react'

interface TabItem {
  value: string
  label: string
  icon?: string
}

interface TabsProps {
  value: string
  onValueChange: (value: string) => void
  tabs: TabItem[]
  children: ReactNode
  className?: string
}

export function Tabs({ value, onValueChange, tabs, children, className = '' }: TabsProps) {
  return (
    <BaseTabs.Root value={value} onValueChange={onValueChange} className={className}>
      <BaseTabs.List className="flex border-b border-outline-variant overflow-x-auto">
        {tabs.map((tab) => (
          <BaseTabs.Tab
            key={tab.value}
            value={tab.value}
            className={[
              'group flex items-center gap-2 px-6 py-4 font-bold text-sm transition-all relative min-w-max',
              'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
              'text-on-surface-variant hover:text-on-surface',
              'data-[active]:text-primary',
            ].join(' ')}
          >
            {tab.icon && (
              <span className="material-symbols-outlined text-xl" aria-hidden="true">
                {tab.icon}
              </span>
            )}
            {tab.label}
            <span
              aria-hidden="true"
              className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full bg-primary scale-x-0 transition-transform duration-200 group-data-[active]:scale-x-100"
            />
          </BaseTabs.Tab>
        ))}
      </BaseTabs.List>
      {children}
    </BaseTabs.Root>
  )
}

interface TabPanelProps {
  value: string
  children: ReactNode
  className?: string
}

export function TabPanel({ value, children, className = '' }: TabPanelProps) {
  return (
    <BaseTabs.Panel value={value} className={className}>
      {children}
    </BaseTabs.Panel>
  )
}

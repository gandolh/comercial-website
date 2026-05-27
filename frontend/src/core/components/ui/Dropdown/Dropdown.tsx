import { Menu } from '@base-ui/react/menu'
import type { ReactElement, ReactNode } from 'react'

export interface DropdownItem {
  key: string
  label: string
  icon?: string
  variant?: 'default' | 'danger'
  onClick?: () => void
  href?: string
}

export interface DropdownLinkItem extends DropdownItem {
  renderLink: (props: { className: string; children: ReactNode }) => ReactNode
}

interface DropdownProps {
  trigger: ReactNode
  items: (DropdownItem | DropdownLinkItem)[]
  align?: 'start' | 'end'
}

const itemClass = (variant?: 'default' | 'danger') =>
  [
    'flex items-center gap-2 w-full px-4 py-2 text-sm font-medium transition-colors cursor-default',
    'outline-none data-[highlighted]:bg-surface-container',
    variant === 'danger' ? 'text-error' : 'text-on-surface',
  ].join(' ')

function isLinkItem(item: DropdownItem | DropdownLinkItem): item is DropdownLinkItem {
  return 'renderLink' in item
}

export function Dropdown({ trigger, items, align = 'end' }: DropdownProps) {
  return (
    <Menu.Root>
      <Menu.Trigger render={(props) => <span {...props}>{trigger}</span>}>
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align={align} sideOffset={8} className="outline-none z-50">
          <Menu.Popup className="min-w-48 bg-surface-container-lowest rounded-xl shadow-ambient py-1.5 outline-none">
            {items.map((item, idx) => {
              if (item.key === '__separator__') {
                return (
                  <Menu.Separator
                    key={`sep-${idx}`}
                    className="my-1 border-t border-outline-variant mx-2"
                  />
                )
              }

              if (isLinkItem(item)) {
                return (
                  <Menu.Item
                    key={item.key}
                    className={itemClass(item.variant)}
                    render={(props) =>
                      item.renderLink({
                        className: props.className ?? itemClass(item.variant),
                        children: (
                          <>
                            {item.icon && (
                              <span
                                className="material-symbols-outlined text-lg"
                                aria-hidden="true"
                              >
                                {item.icon}
                              </span>
                            )}
                            {item.label}
                          </>
                        ),
                      }) as ReactElement
                    }
                  />
                )
              }

              return (
                <Menu.Item
                  key={item.key}
                  onClick={item.onClick}
                  className={itemClass(item.variant)}
                >
                  {item.icon && (
                    <span className="material-symbols-outlined text-lg" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </Menu.Item>
              )
            })}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}

export function dropdownSeparator(): DropdownItem {
  return { key: '__separator__', label: '' }
}

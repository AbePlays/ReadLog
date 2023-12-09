import { NavLink, type NavLinkProps } from '@remix-run/react'
import { Book, Home, Library, Search, UserCircle } from 'lucide-react'

import { cn } from '~/utils/cn'

function Navigation({
  className,
  closeNav,
  isLoggedIn
}: { className?: string; closeNav?: () => void; isLoggedIn: boolean }) {
  return (
    <nav aria-label="Main" className={className}>
      <ul className="grid gap-2">
        <li>
          <NavItem onClick={closeNav} to="/">
            <Home aria-hidden="true" size={16} />
            Home
          </NavItem>
        </li>
        <li>
          <NavItem onClick={closeNav} to="/books">
            <Book aria-hidden="true" size={16} />
            Books
          </NavItem>
        </li>
        <li>
          <NavItem onClick={closeNav} to="/search">
            <Search aria-hidden="true" size={16} />
            Search
          </NavItem>
        </li>
        {isLoggedIn ? (
          <li>
            <NavItem onClick={closeNav} to="/library">
              <Library aria-hidden="true" size={16} />
              Library
            </NavItem>
          </li>
        ) : null}
        <li>
          <NavItem onClick={closeNav} to="/auth">
            <UserCircle aria-hidden="true" size={16} />
            Your Account
          </NavItem>
        </li>
      </ul>
    </nav>
  )
}

function NavItem(props: NavLinkProps) {
  const { className, ...rest } = props

  return (
    <NavLink
      className={cn(
        'flex items-center gap-2 rounded-lg [&:not(.active)]:hover:bg-stone-200/50 p-2 border border-transparent focus-visible:ring-2 transition-[box-shadow] duration-300 ring-stone-600 outline-none',
        className
      )}
      {...rest}
    />
  )
}

export { Navigation }

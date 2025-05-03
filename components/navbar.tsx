"use client"

import Link from "next/link"
import { useAuth } from "./auth-provider"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "./mode-toggle"
import { Globe, User, Menu } from "lucide-react"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Navbar() {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/favorites", label: "Favorites" },
  ]

  return (
    <motion.header
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-gray-800"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-emerald-600" />
            <span className="text-lg font-bold">Country Explorer</span>
          </Link>
        </div>

        {user && (
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors hover:text-emerald-600 ${
                  pathname === link.href ? "text-emerald-600 font-medium" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          <ModeToggle />

          {user ? (
            <>
              <Link href="/profile" className="hidden md:block">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Profile</span>
                </Button>
              </Link>
              <Button variant="outline" onClick={() => signOut()} className="hidden md:inline-flex">
                Sign Out
              </Button>

              {/* Mobile menu */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                  <div className="flex flex-col h-full">
                    <div className="flex flex-col gap-4 py-4">
                      {navLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={`text-base transition-colors hover:text-emerald-600 ${
                            pathname === link.href ? "text-emerald-600 font-medium" : ""
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ))}
                      <Link
                        href="/profile"
                        className="text-base transition-colors hover:text-emerald-600"
                        onClick={() => setIsOpen(false)}
                      >
                        Profile
                      </Link>
                    </div>
                    <div className="mt-auto">
                      <Button variant="outline" onClick={() => signOut()} className="w-full">
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden md:block">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/register" className="hidden md:block">
                <Button>Sign Up</Button>
              </Link>

              {/* Mobile menu */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                  <div className="flex flex-col h-full">
                    <div className="flex flex-col gap-4 py-4">
                      <Link
                        href="/login"
                        className="text-base transition-colors hover:text-emerald-600"
                        onClick={() => setIsOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/register"
                        className="text-base transition-colors hover:text-emerald-600"
                        onClick={() => setIsOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          )}
        </div>
      </div>
    </motion.header>
  )
}

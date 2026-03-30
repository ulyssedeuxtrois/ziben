"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, MapPin, Plus, User, LogOut, Shield, Heart, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout, isOrganizer, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 dark:bg-gray-950/80 dark:border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-gray-900 dark:text-gray-100">Ziben</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
            >
              Explorer
            </Link>
            <Link
              href="/map"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
            >
              Carte
            </Link>
            <Link
              href="/submit"
              className="flex items-center gap-1.5 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Proposer un event
            </Link>
            {isOrganizer && (
              <Link
                href="/organizer"
                className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Publier
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}
          </nav>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/saved"
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Mes favoris"
                >
                  <Heart className="w-5 h-5 text-gray-600" />
                </Link>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800">
                  <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.name || user.email}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500"
                  title="Déconnexion"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="btn-secondary text-sm">
                  Connexion
                </Link>
                <Link href="/register" className="btn-primary text-sm">
                  Inscription
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 dark:border-gray-800 animate-fade-in-up">
            <nav className="flex flex-col gap-1">
              <Link
                href="/"
                className="px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                onClick={() => setMenuOpen(false)}
              >
                Explorer
              </Link>
              <Link
                href="/map"
                className="px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                onClick={() => setMenuOpen(false)}
              >
                Carte
              </Link>
              <Link
                href="/submit"
                className="px-3 py-2.5 rounded-xl text-sm font-medium text-primary-500 hover:bg-primary-50"
                onClick={() => setMenuOpen(false)}
              >
                Proposer un événement
              </Link>
              {user && (
                <Link
                  href="/saved"
                  className="px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                  onClick={() => setMenuOpen(false)}
                >
                  Mes favoris
                </Link>
              )}
              {isOrganizer && (
                <>
                  <Link
                    href="/organizer"
                    className="px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                    onClick={() => setMenuOpen(false)}
                  >
                    Publier un événement
                  </Link>
                  <Link
                    href="/organizer/dashboard"
                    className="px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                    onClick={() => setMenuOpen(false)}
                  >
                    Mes événements
                  </Link>
                </>
              )}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="px-3 py-2.5 rounded-xl text-sm font-medium text-orange-600 hover:bg-orange-50"
                  onClick={() => setMenuOpen(false)}
                >
                  Administration
                </Link>
              )}
              <hr className="my-2 border-gray-100 dark:border-gray-800" />
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 text-left"
                >
                  Déconnexion ({user.name || user.email})
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                    onClick={() => setMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    className="px-3 py-2.5 rounded-xl text-sm font-medium text-primary-500 hover:bg-primary-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    Inscription
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

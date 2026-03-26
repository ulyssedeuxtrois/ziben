import Link from "next/link";
import { MapPin, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">Ziben</span>
            </Link>
            <p className="text-sm text-gray-500 max-w-xs">
              Tous les événements de ta ville en un seul endroit. Trouve ton
              prochain plan en 2 clics.
            </p>
          </div>

          {/* Explorer */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Explorer
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Événements
                </Link>
              </li>
              <li>
                <Link
                  href="/map"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Carte
                </Link>
              </li>
              <li>
                <Link
                  href="/?category=musique-soirees"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Musique & soirées
                </Link>
              </li>
              <li>
                <Link
                  href="/?category=food-degustations"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Food & dégustations
                </Link>
              </li>
            </ul>
          </div>

          {/* Organisateurs */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Organisateurs
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/organizer"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Publier un événement
                </Link>
              </li>
              <li>
                <Link
                  href="/organizer/dashboard"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Mes événements
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Devenir organisateur
                </Link>
              </li>
            </ul>
          </div>

          {/* Compte */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Compte</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/login"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Connexion
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Inscription
                </Link>
              </li>
              <li>
                <Link
                  href="/saved"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Mes favoris
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Ziben. Tous droits réservés.
          </p>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            Fait avec <Heart className="w-3 h-3 text-red-400" /> en France
          </p>
        </div>
      </div>
    </footer>
  );
}

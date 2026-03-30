import Link from "next/link";
import { MapPin, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '20px 20px' }} className="bg-gray-900 mt-16">
      <div className="h-1 w-full bg-gradient-to-r from-primary-500 via-accent-400 to-primary-400" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Ziben</span>
            </Link>
            <p className="text-sm text-gray-400 max-w-xs">
              Ziben, c&apos;est le spot de référence des sorties niçoises. Pas besoin de chercher partout.
            </p>
          </div>

          {/* Explorer */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Explorer</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">Événements</Link></li>
              <li><Link href="/map" className="text-sm text-gray-400 hover:text-white transition-colors">Carte</Link></li>
              <li><Link href="/?category=musique-soirees" className="text-sm text-gray-400 hover:text-white transition-colors">Musique & soirées</Link></li>
              <li><Link href="/?category=food-degustations" className="text-sm text-gray-400 hover:text-white transition-colors">Food & dégustations</Link></li>
            </ul>
          </div>

          {/* Proposer */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Proposer</h3>
            <ul className="space-y-2">
              <li><Link href="/submit" className="text-sm text-gray-400 hover:text-white transition-colors">Publier un événement</Link></li>
              <li><Link href="/pour-les-pros" className="text-sm text-gray-400 hover:text-white transition-colors">Pour les pros</Link></li>
              <li><Link href="/organizer" className="text-sm text-gray-400 hover:text-white transition-colors">Espace organisateur</Link></li>
              <li><Link href="/register" className="text-sm text-gray-400 hover:text-white transition-colors">Devenir organisateur</Link></li>
            </ul>
          </div>

          {/* Compte */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Compte</h3>
            <ul className="space-y-2">
              <li><Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Connexion</Link></li>
              <li><Link href="/register" className="text-sm text-gray-400 hover:text-white transition-colors">Inscription</Link></li>
              <li><Link href="/saved" className="text-sm text-gray-400 hover:text-white transition-colors">Mes favoris</Link></li>
              <li><Link href="/stats" className="text-sm text-gray-400 hover:text-white transition-colors">Ziben en chiffres</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Ziben. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/legal" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Mentions légales</Link>
            <Link href="/privacy" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Confidentialité</Link>
            <Link href="/cgu" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">CGU</Link>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              Fait avec <Heart className="w-3 h-3 text-primary-500" /> à Nice · Made in Nice 🌴
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

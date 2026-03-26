import Link from "next/link";
import { MapPin, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <MapPin className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-3">
          Page introuvable
        </h2>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
          Cette page n&apos;existe pas ou a été déplacée. Retourne explorer les
          événements !
        </p>
        <Link
          href="/"
          className="btn-primary inline-flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}

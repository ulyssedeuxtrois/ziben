"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Calendar, MapPin, Tag, Image, FileText, List } from "lucide-react";
import { AddressAutocomplete } from "@/components/ui/AddressAutocomplete";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export default function OrganizerPage() {
  const { user, isOrganizer, loading: authLoading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    categoryId: "",
    date: "",
    endDate: "",
    location: "",
    address: "",
    lat: 48.8566,
    lng: 2.3522,
    price: 0,
    isFree: true,
    imageUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !isOrganizer) {
      router.push("/login");
    }
  }, [authLoading, isOrganizer, router]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []));
  }, []);

  function updateField(key: string, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          organizerId: user.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur");
      }

      setSuccess(true);
      setForm({
        title: "",
        description: "",
        categoryId: "",
        date: "",
        endDate: "",
        location: "",
        address: "",
        lat: 48.8566,
        lng: 2.3522,
        price: 0,
        isFree: true,
        imageUrl: "",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || !isOrganizer) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Publier un événement
          </h1>
          <p className="text-gray-500">
            Remplis le formulaire. Ton événement sera visible après validation.
          </p>
        </div>
        <Link
          href="/organizer/dashboard"
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <List className="w-4 h-4" />
          Mes événements
        </Link>
      </div>

      {success && (
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm">
          Événement soumis avec succès ! Il sera visible après validation.
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <FileText className="w-4 h-4 inline mr-1" />
            Titre *
          </label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="Ex: Soirée karaoké au Bar des Amis"
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Description *
          </label>
          <textarea
            required
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={4}
            placeholder="Décris ton événement en détail..."
            className="input resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <Tag className="w-4 h-4 inline mr-1" />
            Catégorie *
          </label>
          <select
            required
            value={form.categoryId}
            onChange={(e) => updateField("categoryId", e.target.value)}
            className="input"
          >
            <option value="">Sélectionner une catégorie</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <Calendar className="w-4 h-4 inline mr-1" />
              Début *
            </label>
            <input
              type="datetime-local"
              required
              value={form.date}
              onChange={(e) => updateField("date", e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Fin
            </label>
            <input
              type="datetime-local"
              value={form.endDate}
              onChange={(e) => updateField("endDate", e.target.value)}
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <MapPin className="w-4 h-4 inline mr-1" />
            Nom du lieu *
          </label>
          <input
            type="text"
            required
            value={form.location}
            onChange={(e) => updateField("location", e.target.value)}
            placeholder="Ex: Le Bario Café"
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Adresse complète * (tape pour rechercher)
          </label>
          <AddressAutocomplete
            value={form.address}
            onChange={(address, lat, lng) => {
              updateField("address", address);
              updateField("lat", lat);
              updateField("lng", lng);
            }}
            placeholder="Ex: 12 rue de la Paix, 75001 Paris"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Prix</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={form.isFree}
                onChange={() => { updateField("isFree", true); updateField("price", 0); }}
                className="w-4 h-4 text-primary-600"
              />
              <span className="text-sm">Gratuit</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!form.isFree}
                onChange={() => updateField("isFree", false)}
                className="w-4 h-4 text-primary-600"
              />
              <span className="text-sm">Payant</span>
            </label>
          </div>
          {!form.isFree && (
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => updateField("price", parseFloat(e.target.value) || 0)}
              placeholder="Prix en euros"
              className="input mt-2 w-32"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <Image className="w-4 h-4 inline mr-1" />
            URL de l&apos;image (optionnel)
          </label>
          <input
            type="url"
            value={form.imageUrl}
            onChange={(e) => updateField("imageUrl", e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="input"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
          {submitting ? "Envoi en cours..." : "Publier l'événement"}
        </button>
      </form>
    </div>
  );
}

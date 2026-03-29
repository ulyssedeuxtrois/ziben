"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowLeft, Sparkles, Eye, Edit3 } from "lucide-react";
import { AddressAutocomplete } from "@/components/ui/AddressAutocomplete";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

interface FormData {
  title: string;
  description: string;
  categoryId: string;
  date: string;
  time: string;
  endDate: string;
  endTime: string;
  location: string;
  address: string;
  lat: number;
  lng: number;
  price: number;
  isFree: boolean;
  imageUrl: string;
  capacity: string;
  submitterName: string;
  submitterEmail: string;
}

export default function SubmitPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [step, setStep] = useState<"form" | "preview">("form");

  const [form, setForm] = useState<FormData>({
    title: "",
    description: "",
    categoryId: "",
    date: "",
    time: "",
    endDate: "",
    endTime: "",
    location: "",
    address: "",
    lat: 43.7102,
    lng: 7.262,
    price: 0,
    isFree: true,
    imageUrl: "",
    capacity: "",
    submitterName: "",
    submitterEmail: "",
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || data))
      .catch(() => {});
  }, []);

  function handlePreview(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.description || !form.categoryId || !form.date || !form.time || !form.location || !form.address || !form.submitterName || !form.submitterEmail) {
      setError("Remplis tous les champs obligatoires.");
      return;
    }
    setError("");
    setStep("preview");
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");

    try {
      const dateTime = new Date(`${form.date}T${form.time}`);
      const endDateTime = form.endDate && form.endTime ? new Date(`${form.endDate}T${form.endTime}`) : null;

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          categoryId: form.categoryId,
          date: dateTime.toISOString(),
          endDate: endDateTime?.toISOString() || null,
          location: form.location,
          address: form.address,
          lat: form.lat,
          lng: form.lng,
          price: form.isFree ? 0 : parseFloat(String(form.price)),
          isFree: form.isFree,
          imageUrl: form.imageUrl || null,
          capacity: form.capacity ? parseInt(form.capacity) : null,
          submitterName: form.submitterName,
          submitterEmail: form.submitterEmail,
          city: "nice",
        }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        setError("Erreur lors de l'envoi. Réessaie.");
        setStep("form");
      }
    } catch {
      setError("Erreur réseau. Vérifie ta connexion.");
      setStep("form");
    }
    setLoading(false);
  }

  const selectedCategory = categories.find((c) => c.id === form.categoryId);

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 bg-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-accent-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Event envoyé !</h1>
        <p className="text-gray-500 mb-8">
          Ton événement sera visible après validation par notre équipe (sous 24h). Merci de contribuer à la vie locale !
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="btn-secondary">
            Retour à l&apos;accueil
          </Link>
          <button
            onClick={() => {
              setSuccess(false);
              setStep("form");
              setForm({ ...form, title: "", description: "" });
            }}
            className="btn-primary"
          >
            En proposer un autre
          </button>
        </div>
      </div>
    );
  }

  if (step === "preview") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <button
            onClick={() => setStep("form")}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Modifier
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center">
              <Eye className="w-5 h-5 text-accent-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Prévisualisation</h1>
          </div>
          <p className="text-gray-500">Vérifie les infos avant de confirmer.</p>
        </div>

        <div className="card p-6 mb-6 space-y-4">
          {form.imageUrl && (
            <img
              src={form.imageUrl}
              alt={form.title}
              className="w-full aspect-[16/9] object-cover rounded-xl"
            />
          )}

          {selectedCategory && (
            <span className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 text-sm font-medium px-3 py-1 rounded-full">
              {selectedCategory.icon} {selectedCategory.name}
            </span>
          )}

          <h2 className="text-xl font-bold text-gray-900">{form.title}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
            <div>
              <span className="font-medium">Date :</span>{" "}
              {form.date} à {form.time}
              {form.endDate && ` → ${form.endDate} à ${form.endTime}`}
            </div>
            <div>
              <span className="font-medium">Lieu :</span> {form.location}
            </div>
            <div>
              <span className="font-medium">Adresse :</span> {form.address}
            </div>
            <div>
              <span className="font-medium">Prix :</span>{" "}
              {form.isFree ? "Gratuit" : `${form.price} €`}
            </div>
            {form.capacity && (
              <div>
                <span className="font-medium">Capacité :</span> {form.capacity} places
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
            <p className="text-gray-600 text-sm whitespace-pre-line">{form.description}</p>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Contact</p>
            <p className="text-sm text-gray-600">
              {form.submitterName} — {form.submitterEmail}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => setStep("form")}
            className="btn-secondary flex-1 flex items-center justify-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Modifier
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary flex-1 py-3 disabled:opacity-50"
          >
            {loading ? "Envoi en cours..." : "Confirmer et envoyer"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Proposer un événement</h1>
        </div>
        <p className="text-gray-500">
          Pas besoin de compte. Remplis le formulaire et on s&apos;occupe du reste.
        </p>
      </div>

      <form onSubmit={handlePreview} className="space-y-6">
        {/* Submitter info */}
        <div className="bg-warm-100/50 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Tes infos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ton nom *</label>
              <input
                type="text"
                value={form.submitterName}
                onChange={(e) => setForm({ ...form, submitterName: e.target.value })}
                className="input"
                placeholder="Jean Dupont"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ton email *</label>
              <input
                type="email"
                value={form.submitterEmail}
                onChange={(e) => setForm({ ...form, submitterEmail: e.target.value })}
                className="input"
                placeholder="jean@exemple.com"
              />
            </div>
          </div>
        </div>

        {/* Event info */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">L&apos;événement</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input"
              placeholder="Soirée karaoké, Marché de Noël, Concert jazz..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input min-h-[100px] resize-y"
              placeholder="Décris l'événement, l'ambiance, ce qu'on y fait..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="input"
            >
              <option value="">Choisir une catégorie</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date & time */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Quand</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heure *</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heure de fin</label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Où</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du lieu *</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="input"
              placeholder="Le Petit Café, Salle Nikaïa..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
            <AddressAutocomplete
              value={form.address}
              onChange={(address, lat, lng) =>
                setForm({ ...form, address, lat: lat || form.lat, lng: lng || form.lng })
              }
            />
          </div>
        </div>

        {/* Price & capacity */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Détails</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={form.isFree}
                  onChange={(e) => setForm({ ...form, isFree: e.target.checked, price: e.target.checked ? 0 : form.price })}
                  className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">Gratuit</span>
              </label>
              {!form.isFree && (
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                  className="input"
                  placeholder="Prix en €"
                  min="0"
                  step="0.5"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacité (places)</label>
              <input
                type="number"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                className="input"
                placeholder="Laisser vide si illimité"
                min="1"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image (URL)</label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="input"
              placeholder="https://..."
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Prévisualiser
        </button>
      </form>
    </div>
  );
}

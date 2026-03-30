interface EventJsonLdProps {
  title: string;
  description: string;
  date: string;
  endDate?: string | null;
  location: string;
  address: string;
  lat: number;
  lng: number;
  price: number;
  isFree: boolean;
  imageUrl?: string | null;
  sourceUrl?: string | null;
  eventUrl: string;
}

export function EventJsonLd({
  title,
  description,
  date,
  endDate,
  location,
  address,
  lat,
  lng,
  price,
  isFree,
  imageUrl,
  sourceUrl,
  eventUrl,
}: EventJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: title,
    description,
    startDate: date,
    ...(endDate && { endDate }),
    location: {
      "@type": "Place",
      name: location,
      address,
      geo: {
        "@type": "GeoCoordinates",
        latitude: lat,
        longitude: lng,
      },
    },
    ...(imageUrl && { image: imageUrl }),
    ...(isFree
      ? { isAccessibleForFree: true }
      : {
          offers: {
            "@type": "Offer",
            price,
            priceCurrency: "EUR",
            availability: "https://schema.org/InStock",
          },
        }),
    url: sourceUrl || eventUrl,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

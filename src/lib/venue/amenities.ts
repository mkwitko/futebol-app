import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

/**
 * Catálogo de comodidades da quadra (Venue) — espelha o catálogo do backend
 * (`venue.catalog.ts`). Labels ficam no namespace i18n `venue`.
 */
export const AMENITY_KEYS = [
  "gramado",
  "iluminacao",
  "estacionamento",
  "vestiario",
  "bar",
  "lanchonete",
  "cobertura",
] as const;

export type Amenity = (typeof AMENITY_KEYS)[number];

/** Ícone (Ionicons) por comodidade — usado nos chips de exibição. */
export const AMENITY_ICONS: Record<Amenity, IoniconName> = {
  gramado: "leaf-outline",
  iluminacao: "bulb-outline",
  estacionamento: "car-outline",
  vestiario: "shirt-outline",
  bar: "beer-outline",
  lanchonete: "fast-food-outline",
  cobertura: "umbrella-outline",
};

/** Guard defensivo — o backend pode evoluir o catálogo antes do app. */
export function isKnownAmenity(value: string): value is Amenity {
  return (AMENITY_KEYS as readonly string[]).includes(value);
}

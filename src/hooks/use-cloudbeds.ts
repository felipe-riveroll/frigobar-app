import { useQuery } from "@tanstack/react-query";
import { fetchRoomsAndGuests } from "@/lib/cloudbeds-api";
import type { Room } from "@/lib/data";

/**
 * Hook que obtiene las habitaciones y huéspedes desde CloudBeds.
 * - staleTime de 5 minutos (los datos se consideran frescos por 5 min)
 * - refetchOnWindowFocus para actualizar al volver a la pestaña
 */
export function useRoomsAndGuests() {
  return useQuery<Room[]>({
    queryKey: ["cloudbeds", "rooms-and-guests"],
    queryFn: fetchRoomsAndGuests,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

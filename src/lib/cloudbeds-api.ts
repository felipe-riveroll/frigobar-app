import type { Room } from "./data";

const API_URL = "/api";
const API_KEY = import.meta.env.VITE_CLOUDBEDS_API_KEY || "";

/**
 * Helper para hacer peticiones a la API de CloudBeds.
 * Inyecta automáticamente el header x-api-key.
 */
async function cloudbedsFetch<T>(
  path: string,
  params?: Record<string, string>
): Promise<T> {
  const searchParams = new URLSearchParams(params);
  const queryString = searchParams.toString();
  const url = `${API_URL}${path}${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "x-api-key": API_KEY,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`CloudBeds API error ${response.status}: ${text}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || "CloudBeds API request failed");
  }

  return data;
}

// --- Tipos de respuesta de CloudBeds ---

interface CloudBedsGuest {
  guestID: string;
  guestFirstName: string;
  guestLastName: string;
  guestEmail?: string;
  guestPhone?: string;
}

interface CloudBedsRoom {
  roomID: string;
  roomName: string;
  roomTypeID: string;
  roomTypeName?: string;
  isActive?: string;
  isVirtual?: string;
  maxGuests?: string;
  doorlockId?: string;
}

interface CloudBedsReservationRoom {
  roomID: string;
  roomName: string;
  roomTypeID?: string;
  subReservationID?: string;
}

interface CloudBedsReservation {
  reservationID: string;
  status: string;
  guestName?: string;
  guestFirstName?: string;
  guestLastName?: string;
  guestEmail?: string;
  guestPhone?: string;
  checkinDate?: string;
  checkoutDate?: string;
  rooms?: CloudBedsReservationRoom[];
  guests?: CloudBedsGuest[];
  customFields?: Array<{
    customFieldName: string;
    customFieldValue: string;
  }>;
}

interface GetReservationsResponse {
  success: boolean;
  data: CloudBedsReservation[];
  count: number;
  limit: number;
  offset: number;
}

interface GetRoomsResponse {
  success: boolean;
  data: CloudBedsRoom[];
  count: number;
  limit: number;
  offset: number;
}

// --- Funciones públicas ---

/**
 * Obtiene las reservas con huéspedes actualmente check-in.
 */
export async function fetchCheckedInReservations(): Promise<CloudBedsReservation[]> {
  const data = await cloudbedsFetch<GetReservationsResponse>("/getReservations", {
    status: "checked_in",
  });
  return data.data || [];
}

/**
 * Obtiene todas las habitaciones del hotel.
 */
export async function fetchAllRooms(): Promise<CloudBedsRoom[]> {
  const data = await cloudbedsFetch<GetRoomsResponse>("/getRooms");
  return data.data || [];
}

/**
 * Combina habitaciones y reservas para obtener el estado actual del hotel.
 * - Habitaciones con huésped check-in → "occupied" con nombre del huésped
 * - Habitaciones sin reserva activa → "vacant"
 */
export async function fetchRoomsAndGuests(): Promise<Room[]> {
  const [allRooms, checkedInReservations] = await Promise.all([
    fetchAllRooms(),
    fetchCheckedInReservations(),
  ]);

  // Mapa de roomID → reserva check-in
  const occupiedMap = new Map<string, CloudBedsReservation>();
  for (const reservation of checkedInReservations) {
    if (reservation.rooms && reservation.rooms.length > 0) {
      for (const room of reservation.rooms) {
        occupiedMap.set(String(room.roomID), reservation);
      }
    }
  }

  // Construir lista de habitaciones con estado
  const rooms: Room[] = allRooms
    .filter((room) => room.isVirtual !== "1" && room.isActive !== "0")
    .map((room) => {
      const reservation = occupiedMap.get(String(room.roomID));
      const guestName = reservation
        ? reservation.guestName ||
          [reservation.guestFirstName, reservation.guestLastName]
            .filter(Boolean)
            .join(" ")
        : undefined;

      return {
        id: String(room.roomID),
        number: room.roomName,
        guestName,
        status: reservation ? "occupied" : "vacant",
        roomTypeID: room.roomTypeID,
        reservationID: reservation?.reservationID,
      };
    });

  // Ordenar: ocupadas primero, luego limpieza, luego libres
  const statusOrder = { occupied: 0, cleaning: 1, vacant: 2 };
  rooms.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

  return rooms;
}

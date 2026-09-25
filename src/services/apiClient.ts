import {
  CreateShipmentInput,
  LogisticsAnalytics,
  Shipment,
  UserProfile,
  Vehicle,
  Warehouse,
} from '../types/logistics';
import {
  INITIAL_ANALYTICS,
  INITIAL_SHIPMENTS,
  INITIAL_VEHICLES,
  INITIAL_WAREHOUSES,
  DEMO_USERS,
} from '../data/mockLogisticsData';

// Resolves base API URL from environment (e.g. Vercel env NEXT_PUBLIC_API_URL or local)
export function getApiBaseUrl(): string {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }
  if (typeof process !== 'undefined' && process.env?.API_URL) {
    return process.env.API_URL.replace(/\/$/, '');
  }
  return 'http://localhost:8080';
}

// In-memory client state for ultra-fast local fallback if backend is offline
let localShipments: Shipment[] = [...INITIAL_SHIPMENTS];
const localVehicles: Vehicle[] = [...INITIAL_VEHICLES];
const localWarehouses: Warehouse[] = [...INITIAL_WAREHOUSES];

function generateSecureSuffix(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(4);
    crypto.getRandomValues(array);
    return Array.from(array, (b) => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
      .slice(0, 4);
  }
  return Date.now().toString(36).slice(-4).toUpperCase();
}

function generateSecureTrackingCode(): string {
  let num = 1000;
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    num = 1000 + (array[0] % 9000);
  } else {
    num = 1000 + (Date.now() % 9000);
  }
  return `LP-${num}-${generateSecureSuffix()}`;
}

export const apiClient = {
  async checkHealth(): Promise<{ online: boolean; service?: string }> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/health`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const data = await res.json();
        return { online: true, service: data.service };
      }
    } catch {
      // Backend not running locally or network timeout
    }
    return { online: false };
  },

  async login(email: string, password: string): Promise<UserProfile> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback to local authentication
    }

    const matched = DEMO_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (matched && (password === 'password123' || password === 'admin' || password === 'demo')) {
      return matched;
    }
    throw new Error('Invalid email or password. Please use demo credentials.');
  },

  async getAnalytics(): Promise<LogisticsAnalytics> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/analytics/overview`, {
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return INITIAL_ANALYTICS;
  },

  async getShipments(status?: string, search?: string): Promise<Shipment[]> {
    try {
      const apiUrl = new URL('/api/v1/shipments', getApiBaseUrl());
      if (status && status !== 'All') {
        apiUrl.searchParams.set('status', encodeURIComponent(status.trim().slice(0, 50)));
      }
      if (search) {
        apiUrl.searchParams.set('search', encodeURIComponent(search.trim().slice(0, 100)));
      }

      const res = await fetch(apiUrl.toString(), { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        localShipments = data;
        return data;
      }
    } catch {
      // Fallback
    }

    let results = [...localShipments];
    if (status && status !== 'All') {
      results = results.filter((s) => s.status.toLowerCase() === status.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (s) =>
          s.trackingNumber.toLowerCase().includes(q) ||
          s.recipientName.toLowerCase().includes(q) ||
          s.origin.toLowerCase().includes(q) ||
          s.destination.toLowerCase().includes(q),
      );
    }
    return results;
  },

  async trackShipment(trackingNumber: string): Promise<Shipment | null> {
    const safeTracking = encodeURIComponent(trackingNumber.trim().slice(0, 50));
    try {
      const trackUrl = new URL(`/api/v1/shipments/track/${safeTracking}`, getApiBaseUrl());
      const res = await fetch(trackUrl.toString(), {
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    const found = localShipments.find(
      (s) => s.trackingNumber.toLowerCase() === trackingNumber.trim().toLowerCase(),
    );
    return found || null;
  },

  async createShipment(input: CreateShipmentInput): Promise<Shipment> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/shipments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) {
        const created = await res.json();
        localShipments.unshift(created);
        return created;
      }
    } catch {
      // Fallback
    }

    const trackingCode = generateSecureTrackingCode();
    const newShipment: Shipment = {
      id: `shp-${Date.now()}`,
      trackingNumber: trackingCode,
      senderName: input.senderName,
      senderAddress: input.senderAddress,
      recipientName: input.recipientName,
      recipientAddress: input.recipientAddress,
      origin: input.origin,
      destination: input.destination,
      status: 'Pending',
      priority: input.priority,
      weightKg: input.weightKg,
      estimatedDelivery: `In ${input.estimatedDays} days`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      events: [
        {
          id: `evt-${Date.now()}`,
          shipmentId: `shp-${Date.now()}`,
          status: 'Pending',
          location: `${input.origin} Hub`,
          description: 'Waybill created and parcel registered.',
          timestamp: 'Just now',
        },
      ],
    };
    localShipments.unshift(newShipment);
    return newShipment;
  },

  async simulateNextStep(shipmentId: string): Promise<Shipment | null> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/shipments/${shipmentId}/simulate`, {
        method: 'POST',
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) {
        const updated = await res.json();
        localShipments = localShipments.map((s) => (s.id === shipmentId ? updated : s));
        return updated;
      }
    } catch {
      // Fallback
    }

    const target = localShipments.find((s) => s.id === shipmentId);
    if (!target) return null;

    let nextStatus: Shipment['status'];
    let desc = '';
    let loc = '';

    switch (target.status) {
      case 'Pending':
        nextStatus = 'Picked Up';
        loc = `${target.origin} Sorting Facility`;
        desc = 'Package picked up by linehaul courier.';
        break;
      case 'Picked Up':
        nextStatus = 'In Transit';
        loc = 'National Highway Waypoint';
        desc = 'In transit to destination regional hub.';
        break;
      case 'In Transit':
        nextStatus = 'Out for Delivery';
        loc = `${target.destination} Delivery Hub`;
        desc = 'Package loaded on delivery van.';
        break;
      case 'Out for Delivery':
        nextStatus = 'Delivered';
        loc = target.recipientAddress;
        desc = `Delivered and signed by ${target.recipientName}.`;
        break;
      case 'Delayed':
        nextStatus = 'In Transit';
        loc = 'Express Clearance Hub';
        desc = 'Issue resolved; shipment resumed en route.';
        break;
      default:
        nextStatus = 'In Transit';
        loc = `${target.origin} Central Route`;
        desc = 'Simulated cycle restart.';
        break;
    }

    const updatedEvent = {
      id: `evt-${Date.now()}`,
      shipmentId,
      status: nextStatus,
      location: loc,
      description: desc,
      timestamp: 'Just now',
    };

    const updatedShipment: Shipment = {
      ...target,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
      events: [...target.events, updatedEvent],
    };

    localShipments = localShipments.map((s) => (s.id === shipmentId ? updatedShipment : s));
    return updatedShipment;
  },

  async getVehicles(): Promise<Vehicle[]> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/fleet/vehicles`, {
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return localVehicles;
  },

  async getWarehouses(): Promise<Warehouse[]> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/warehouses`, {
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return localWarehouses;
  },
};

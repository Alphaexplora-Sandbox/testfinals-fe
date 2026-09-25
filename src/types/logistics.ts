export type ShipmentStatus =
  | 'Pending'
  | 'Picked Up'
  | 'In Transit'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Delayed'
  | 'Cancelled';

export type ShipmentPriority = 'Standard' | 'Express' | 'Overnight' | 'Cold Chain';

export interface TrackingEvent {
  id: string;
  shipmentId: string;
  status: ShipmentStatus;
  location: string;
  description: string;
  timestamp: string;
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  senderName: string;
  senderAddress: string;
  recipientName: string;
  recipientAddress: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  priority: ShipmentPriority;
  weightKg: number;
  estimatedDelivery: string;
  assignedDriverId?: string | null;
  assignedVehicleId?: string | null;
  createdAt: string;
  updatedAt: string;
  events: TrackingEvent[];
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  type: string;
  status: 'Available' | 'OnRoute' | 'Maintenance';
  capacityKg: number;
  fuelOrBatteryPct: number;
  currentLocation: string;
  assignedDriverId?: string | null;
}

export interface Driver {
  id: string;
  fullName: string;
  licenseNumber: string;
  phone: string;
  status: 'Available' | 'OnDelivery' | 'OffDuty';
  rating: number;
  assignedVehicleId?: string | null;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
  capacitySqM: number;
  occupancyPct: number;
  activeShipments: number;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  warehouseId: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'Admin' | 'Dispatcher' | 'WarehouseManager' | 'Driver';
  token: string;
}

export interface LogisticsAnalytics {
  totalShipments: number;
  activeInTransit: number;
  deliveredToday: number;
  delayedAlerts: number;
  fleetUtilizationPct: number;
  warehouseOccupancyAvgPct: number;
  onTimeDeliveryRatePct: number;
}

export interface CreateShipmentInput {
  senderName: string;
  senderAddress: string;
  recipientName: string;
  recipientAddress: string;
  origin: string;
  destination: string;
  priority: ShipmentPriority;
  weightKg: number;
  estimatedDays: number;
}

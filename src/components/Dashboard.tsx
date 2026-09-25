import React, { useState, useEffect } from 'react';
import {
  CreateShipmentInput,
  LogisticsAnalytics,
  Shipment,
  ShipmentPriority,
  ShipmentStatus,
  UserProfile,
  Vehicle,
  Warehouse,
} from '../types/logistics';
import { apiClient } from '../services/apiClient';
import { INITIAL_ANALYTICS, INITIAL_SHIPMENTS, INITIAL_VEHICLES, INITIAL_WAREHOUSES } from '../data/mockLogisticsData';

export interface DashboardProps {
  currentUser?: UserProfile | null;
  initialTab?: 'shipments' | 'fleet' | 'warehouses';
  initialSelectedShipment?: Shipment | null;
  initialCreateModalOpen?: boolean;
}

export function getPriorityClass(priority: string): string {
  if (priority === 'Cold Chain') return 'priority-coldchain';
  if (priority === 'Express') return 'priority-express';
  return '';
}

export function getVehicleStatusClass(status: string): string {
  if (status === 'OnRoute') return 'status-intransit';
  if (status === 'Available') return 'status-delivered';
  return 'status-delayed';
}

export function getBatteryColor(pct: number): string {
  if (pct > 50) return '#10b981';
  if (pct > 20) return '#f59e0b';
  return '#ef4444';
}

export function getOccupancyColor(pct: number): string {
  if (pct > 85) return '#ef4444';
  return '#06b6d4';
}

export const DashboardActions = {
  getStatusClass: (status: ShipmentStatus) => {
    switch (status) {
      case 'In Transit': return 'status-intransit';
      case 'Out for Delivery': return 'status-outfordelivery';
      case 'Delivered': return 'status-delivered';
      case 'Delayed': return 'status-delayed';
      default: return 'status-pending';
    }
  },

  filterShipments: async (
    filter: string,
    searchTerm: string,
    setStatusFilter: (f: string) => void,
    setShipments: (s: Shipment[]) => void,
  ) => {
    setStatusFilter(filter);
    const filtered = await apiClient.getShipments(filter, searchTerm);
    setShipments(filtered);
    return filtered;
  },

  searchShipments: async (
    term: string,
    statusFilter: string,
    setSearchTerm: (t: string) => void,
    setShipments: (s: Shipment[]) => void,
  ) => {
    setSearchTerm(term);
    const searched = await apiClient.getShipments(statusFilter, term);
    setShipments(searched);
    return searched;
  },

  simulateStep: async (
    id: string,
    selectedShipment: Shipment | null,
    setIsSimulatingId: (id: string | null) => void,
    setShipments: React.Dispatch<React.SetStateAction<Shipment[]>>,
    setSelectedShipment: (s: Shipment | null) => void,
    setAnalytics: (a: LogisticsAnalytics) => void,
  ) => {
    setIsSimulatingId(id);
    try {
      const updated = await apiClient.simulateNextStep(id);
      if (updated) {
        setShipments((prev) => prev.map((s) => (s.id === id ? updated : s)));
        if (selectedShipment?.id === id) {
          setSelectedShipment(updated);
        }
        const newAnalytics = await apiClient.getAnalytics();
        setAnalytics(newAnalytics);
        return updated;
      }
    } finally {
      setIsSimulatingId(null);
    }
    return null;
  },

  createShipment: async (
    input: CreateShipmentInput,
    setShipments: React.Dispatch<React.SetStateAction<Shipment[]>>,
    setIsCreateModalOpen: (open: boolean) => void,
    setSelectedShipment: (s: Shipment | null) => void,
  ) => {
    const created = await apiClient.createShipment(input);
    setShipments((prev) => [created, ...prev]);
    setIsCreateModalOpen(false);
    setSelectedShipment(created);
    return created;
  },

  loadData: async (
    setAnalytics: (a: LogisticsAnalytics) => void,
    setShipments: (s: Shipment[]) => void,
    setVehicles: (v: Vehicle[]) => void,
    setWarehouses: (w: Warehouse[]) => void,
  ) => {
    try {
      const [fetchedAnalytics, fetchedShipments, fetchedVehicles, fetchedWarehouses] = await Promise.all([
        apiClient.getAnalytics(),
        apiClient.getShipments(),
        apiClient.getVehicles(),
        apiClient.getWarehouses(),
      ]);
      setAnalytics(fetchedAnalytics);
      setShipments(fetchedShipments);
      setVehicles(fetchedVehicles);
      setWarehouses(fetchedWarehouses);
    } catch {
      // Keep initial fallback data
    }
  },
};

export const createDashboardHandlers = (
  setActiveTab: (tab: 'shipments' | 'fleet' | 'warehouses') => void,
  searchTerm: string,
  statusFilter: string,
  setStatusFilter: (f: string) => void,
  setSearchTerm: (t: string) => void,
  shipments: Shipment[],
  selectedShipment: Shipment | null,
  setIsSimulatingId: (id: string | null) => void,
  setShipments: React.Dispatch<React.SetStateAction<Shipment[]>>,
  setSelectedShipment: (s: Shipment | null) => void,
  setAnalytics: (a: LogisticsAnalytics) => void,
  setIsCreateModalOpen: (o: boolean) => void,
  setVehicles: (v: Vehicle[]) => void,
  setWarehouses: (w: Warehouse[]) => void,
  newSender: string,
  newRecipient: string,
  newOrigin: string,
  newDestination: string,
  newPriority: ShipmentPriority,
  newWeight: number,
  newDays: number,
  setNewSender: (s: string) => void,
  setNewRecipient: (r: string) => void,
  setNewOrigin: (o: string) => void,
  setNewDestination: (d: string) => void,
  setNewPriority: (p: ShipmentPriority) => void,
  setNewWeight: (w: number) => void,
  setNewDays: (d: number) => void,
) => ({
  onTabShipments: () => setActiveTab('shipments'),
  onTabFleet: () => setActiveTab('fleet'),
  onTabWarehouses: () => setActiveTab('warehouses'),

  onFilterClick: (e: React.MouseEvent<HTMLButtonElement>) => {
    const filter = e.currentTarget.dataset.filter ?? e.currentTarget.getAttribute('data-filter');
    if (filter) void DashboardActions.filterShipments(filter, searchTerm, setStatusFilter, setShipments);
  },

  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => {
    void DashboardActions.searchShipments(e.target.value, statusFilter, setSearchTerm, setShipments);
  },

  onInspectClick: (e: React.MouseEvent<HTMLElement>) => {
    const id = e.currentTarget.dataset.id ?? e.currentTarget.getAttribute('data-id');
    const target = shipments.find((s) => s.id === id);
    if (target) setSelectedShipment(target);
  },

  onSimulateClick: (e: React.MouseEvent<HTMLButtonElement>) => {
    const id = e.currentTarget.dataset.id ?? e.currentTarget.getAttribute('data-id');
    if (id) {
      void DashboardActions.simulateStep(
        id,
        selectedShipment,
        setIsSimulatingId,
        setShipments,
        setSelectedShipment,
        setAnalytics,
      );
    }
  },

  onModalSimulateClick: () => {
    if (selectedShipment) {
      void DashboardActions.simulateStep(
        selectedShipment.id,
        selectedShipment,
        setIsSimulatingId,
        setShipments,
        setSelectedShipment,
        setAnalytics,
      );
    }
  },

  onOpenCreateModal: () => setIsCreateModalOpen(true),
  onCloseCreateModal: () => setIsCreateModalOpen(false),
  onCloseDetailModal: () => setSelectedShipment(null),

  onSyncTelematics: () => {
    void DashboardActions.loadData(setAnalytics, setShipments, setVehicles, setWarehouses);
  },

  onSenderChange: (e: React.ChangeEvent<HTMLInputElement>) => setNewSender(e.target.value),
  onRecipientChange: (e: React.ChangeEvent<HTMLInputElement>) => setNewRecipient(e.target.value),
  onOriginChange: (e: React.ChangeEvent<HTMLSelectElement>) => setNewOrigin(e.target.value),
  onDestinationChange: (e: React.ChangeEvent<HTMLSelectElement>) => setNewDestination(e.target.value),
  onPriorityChange: (e: React.ChangeEvent<HTMLSelectElement>) => setNewPriority(e.target.value as ShipmentPriority),
  onWeightChange: (e: React.ChangeEvent<HTMLInputElement>) => setNewWeight(Number(e.target.value)),
  onDaysChange: (e: React.ChangeEvent<HTMLInputElement>) => setNewDays(Number(e.target.value)),

  handleCreateShipment: async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const input: CreateShipmentInput = {
      senderName: newSender || 'LogiPulse Enterprise Client',
      senderAddress: `${newOrigin} Logistics Node`,
      recipientName: newRecipient || 'Continental Distribution',
      recipientAddress: `${newDestination} Freight Bay`,
      origin: newOrigin,
      destination: newDestination,
      priority: newPriority,
      weightKg: Number(newWeight) || 100,
      estimatedDays: Number(newDays) || 3,
    };
    await DashboardActions.createShipment(input, setShipments, setIsCreateModalOpen, setSelectedShipment);
    setNewSender('');
    setNewRecipient('');
  },
});

interface ShipmentsViewProps {
  shipments: Shipment[];
  statusFilter: string;
  searchTerm: string;
  isSimulatingId: string | null;
  handlers: ReturnType<typeof createDashboardHandlers>;
}

function ShipmentsView({ shipments, statusFilter, searchTerm, isSimulatingId, handlers }: Readonly<ShipmentsViewProps>) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['All', 'In Transit', 'Out for Delivery', 'Delivered', 'Delayed', 'Pending'].map((filter) => (
            <button
              key={filter}
              type="button"
              className={`action-btn-sm ${statusFilter === filter ? 'active' : ''}`}
              style={{
                background: statusFilter === filter ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                borderColor: statusFilter === filter ? '#3b82f6' : 'var(--border-subtle)',
                color: statusFilter === filter ? '#fff' : 'var(--text-secondary)',
              }}
              data-filter={filter}
              onClick={handlers.onFilterClick}
              data-testid={`filter-${filter.toLowerCase().replace(/\s+/g, '')}`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: '280px' }}>
          <input
            type="text"
            className="form-input"
            style={{ width: '100%', paddingLeft: '2.25rem' }}
            placeholder="Search Waybill, Recipient, Route..."
            value={searchTerm}
            onChange={handlers.onSearchChange}
            data-testid="shipment-search-input"
          />
          <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            &#128269;
          </span>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table" data-testid="shipments-table">
          <thead>
            <tr>
              <th>Tracking Number</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Route (Origin &rarr; Destination)</th>
              <th>Weight</th>
              <th>Est. Arrival</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((s) => (
              <tr key={s.id} data-testid="shipment-row">
                <td>
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      color: 'var(--accent-cyan)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    data-id={s.id}
                    onClick={handlers.onInspectClick}
                  >
                    {s.trackingNumber}
                  </button>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{s.recipientName}</div>
                </td>
                <td>
                  <span className={`status-badge ${DashboardActions.getStatusClass(s.status)}`}>
                    {s.status}
                  </span>
                </td>
                <td>
                  <span className={`priority-badge ${getPriorityClass(s.priority)}`}>
                    {s.priority}
                  </span>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{s.origin} &rarr; {s.destination}</div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{s.senderName}</div>
                </td>
                <td>{s.weightKg} kg</td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {s.estimatedDelivery}
                </td>
                <td>
                  <button
                    type="button"
                    className="action-btn-sm"
                    data-id={s.id}
                    onClick={handlers.onInspectClick}
                    data-testid="btn-inspect-waybill"
                  >
                    Inspect
                  </button>
                  <button
                    type="button"
                    className="action-btn-sm"
                    style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}
                    disabled={isSimulatingId === s.id}
                    data-id={s.id}
                    onClick={handlers.onSimulateClick}
                    data-testid="btn-simulate-step"
                    title="Simulate progression to next delivery checkpoint"
                  >
                    {isSimulatingId === s.id ? 'Advancing...' : 'Simulate \u25b6'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FleetView({ vehicles }: Readonly<{ vehicles: Vehicle[] }>) {
  return (
    <div data-testid="fleet-tab-content">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {vehicles.map((v) => (
          <div key={v.id} className="glass-panel" style={{ padding: '1.5rem' }} data-testid="vehicle-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--accent-cyan)', background: 'rgba(6,182,212,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  {v.plateNumber}
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '0.4rem' }}>{v.model}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{v.type}</div>
              </div>
              <span className={`status-badge ${getVehicleStatusClass(v.status)}`}>
                {v.status}
              </span>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
                <span>Energy / Fuel Reserve</span>
                <span style={{ fontWeight: 600, color: '#fff' }}>{v.fuelOrBatteryPct}%</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${v.fuelOrBatteryPct}%`, height: '100%', background: getBatteryColor(v.fuelOrBatteryPct) }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.8rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Capacity:</span> {v.capacityKg} kg
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Location:</span> {v.currentLocation}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WarehousesView({ warehouses }: Readonly<{ warehouses: Warehouse[] }>) {
  return (
    <div data-testid="warehouses-tab-content">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {warehouses.map((wh) => (
          <div key={wh.id} className="glass-panel" style={{ padding: '1.5rem' }} data-testid="warehouse-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-blue)', background: 'rgba(59,130,246,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                {wh.code}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{wh.country}</span>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>{wh.name}</h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{wh.city}</div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
                <span>Storage Occupancy</span>
                <span style={{ fontWeight: 600, color: '#fff' }}>{wh.occupancyPct}%</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${wh.occupancyPct}%`, height: '100%', background: getOccupancyColor(wh.occupancyPct) }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Capacity: {wh.capacitySqM.toLocaleString()} m&sup2;</span>
              <span style={{ color: '#fff', fontWeight: 600 }}>{wh.activeShipments} Pallets</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ShipmentDetailModalProps {
  selectedShipment: Shipment | null;
  isSimulatingId: string | null;
  handlers: ReturnType<typeof createDashboardHandlers>;
}

function ShipmentDetailModal({ selectedShipment, isSimulatingId, handlers }: Readonly<ShipmentDetailModalProps>) {
  return (
    <div
      className="modal-overlay"
      data-testid="shipment-detail-modal"
      style={{ display: selectedShipment ? 'flex' : 'none' }}
    >
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Waybill Dossier
            </span>
            <h2
              className="modal-title"
              style={{ fontFamily: 'monospace', color: 'var(--accent-cyan)' }}
              data-testid="detail-tracking-number"
            >
              {selectedShipment ? selectedShipment.trackingNumber : 'LP-8924-XQ'}
            </h2>
          </div>
          <button type="button" className="close-btn" onClick={handlers.onCloseDetailModal}>
            &times;
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Sender</div>
            <div style={{ fontWeight: 600 }}>{selectedShipment ? selectedShipment.senderName : 'Apex Semiconductor Mfg'}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{selectedShipment ? selectedShipment.senderAddress : 'Austin, TX'}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Recipient</div>
            <div style={{ fontWeight: 600 }}>{selectedShipment ? selectedShipment.recipientName : 'NextGen Robotics Corp'}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{selectedShipment ? selectedShipment.recipientAddress : 'Chicago, IL'}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Weight & Payload</div>
            <div style={{ fontWeight: 600 }}>{selectedShipment ? `${selectedShipment.weightKg} kg (${selectedShipment.priority})` : '1450 kg (Express)'}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Current Status</div>
            <div style={{ fontWeight: 700, color: '#38bdf8' }}>{selectedShipment ? selectedShipment.status : 'In Transit'}</div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Telemetry Audit Trail
          </div>
          <div className="timeline">
            {(selectedShipment ? selectedShipment.events : [
              { id: '1', status: 'In Transit', location: 'Highway Waypoint', description: 'Normal telemetry scan.', timestamp: 'Just now' },
            ]).map((evt) => (
              <div key={evt.id} className="timeline-step">
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <div className="timeline-status">
                    {evt.status} &bull; <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{evt.location}</span>
                  </div>
                  <div className="timeline-desc">{evt.description}</div>
                  <div className="timeline-meta">{evt.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
          <button
            type="button"
            className="primary-btn"
            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
            onClick={handlers.onModalSimulateClick}
            disabled={selectedShipment ? isSimulatingId === selectedShipment.id : false}
          >
            {selectedShipment && isSimulatingId === selectedShipment.id ? 'Advancing Telemetry...' : 'Simulate Next Checkpoint \u25b6'}
          </button>
          <button type="button" className="secondary-btn" onClick={handlers.onCloseDetailModal}>
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

interface CreateShipmentModalProps {
  isCreateModalOpen: boolean;
  newSender: string;
  newRecipient: string;
  newOrigin: string;
  newDestination: string;
  newPriority: ShipmentPriority;
  newWeight: number;
  newDays: number;
  handlers: ReturnType<typeof createDashboardHandlers>;
}

function CreateShipmentModal({
  isCreateModalOpen,
  newSender,
  newRecipient,
  newOrigin,
  newDestination,
  newPriority,
  newWeight,
  newDays,
  handlers,
}: Readonly<CreateShipmentModalProps>) {
  return (
    <div
      className="modal-overlay"
      data-testid="create-shipment-modal"
      style={{ display: isCreateModalOpen ? 'flex' : 'none' }}
    >
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Register New Freight Waybill</h2>
          <button type="button" className="close-btn" onClick={handlers.onCloseCreateModal}>
            &times;
          </button>
        </div>

        <form onSubmit={handlers.handleCreateShipment}>
          <div className="form-group">
            <label className="form-label" htmlFor="form-create-sender">Sender Enterprise Name</label>
            <input
              id="form-create-sender"
              type="text"
              className="form-input"
              placeholder="e.g. Apex Semi Labs"
              value={newSender}
              onChange={handlers.onSenderChange}
              required
              data-testid="input-sender"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="form-create-recipient">Recipient Consignee Name</label>
            <input
              id="form-create-recipient"
              type="text"
              className="form-input"
              placeholder="e.g. NextGen Robotics Ltd"
              value={newRecipient}
              onChange={handlers.onRecipientChange}
              required
              data-testid="input-recipient"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="form-create-origin">Origin Hub</label>
              <select
                id="form-create-origin"
                className="form-select"
                value={newOrigin}
                onChange={handlers.onOriginChange}
              >
                <option value="Chicago, IL">Chicago Central (US)</option>
                <option value="Rotterdam, NL">Rotterdam Euro Gateway (NL)</option>
                <option value="Dallas, TX">Dallas Inland Port (US)</option>
                <option value="Singapore, SG">Singapore Freight Terminal (SG)</option>
                <option value="Frankfurt, DE">Frankfurt CargoCity (DE)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="form-create-destination">Destination Node</label>
              <select
                id="form-create-destination"
                className="form-select"
                value={newDestination}
                onChange={handlers.onDestinationChange}
              >
                <option value="Rotterdam, NL">Rotterdam Euro Gateway (NL)</option>
                <option value="Chicago, IL">Chicago Central (US)</option>
                <option value="Dallas, TX">Dallas Inland Port (US)</option>
                <option value="Singapore, SG">Singapore Freight Terminal (SG)</option>
                <option value="Amsterdam, NL">Amsterdam Metro Center (NL)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="form-create-priority">Priority</label>
              <select
                id="form-create-priority"
                className="form-select"
                value={newPriority}
                onChange={handlers.onPriorityChange}
              >
                <option value="Standard">Standard</option>
                <option value="Express">Express</option>
                <option value="Overnight">Overnight</option>
                <option value="Cold Chain">Cold Chain (-20°C)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="form-create-weight">Weight (kg)</label>
              <input
                id="form-create-weight"
                type="number"
                className="form-input"
                value={newWeight}
                onChange={handlers.onWeightChange}
                min={1}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="form-create-days">Est. Days</label>
              <input
                id="form-create-days"
                type="number"
                className="form-input"
                value={newDays}
                onChange={handlers.onDaysChange}
                min={1}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="secondary-btn"
              onClick={handlers.onCloseCreateModal}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-btn"
              data-testid="btn-submit-shipment"
            >
              Issue Waybill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Dashboard(props: Readonly<DashboardProps>) {
  const {
    currentUser,
    initialTab = 'shipments',
    initialSelectedShipment = null,
    initialCreateModalOpen = false,
  } = props;

  const [activeTab, setActiveTab] = useState<'shipments' | 'fleet' | 'warehouses'>(initialTab);
  const [analytics, setAnalytics] = useState<LogisticsAnalytics>(INITIAL_ANALYTICS);
  const [shipments, setShipments] = useState<Shipment[]>(INITIAL_SHIPMENTS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(INITIAL_WAREHOUSES);

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(initialSelectedShipment);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(initialCreateModalOpen);
  const [isSimulatingId, setIsSimulatingId] = useState<string | null>(null);

  // New Shipment Form State
  const [newSender, setNewSender] = useState('');
  const [newRecipient, setNewRecipient] = useState('');
  const [newOrigin, setNewOrigin] = useState('Chicago, IL');
  const [newDestination, setNewDestination] = useState('Rotterdam, NL');
  const [newPriority, setNewPriority] = useState<ShipmentPriority>('Express');
  const [newWeight, setNewWeight] = useState(500);
  const [newDays, setNewDays] = useState(3);

  useEffect(() => {
    void DashboardActions.loadData(setAnalytics, setShipments, setVehicles, setWarehouses);
  }, []);

  const handlers = createDashboardHandlers(
    setActiveTab,
    searchTerm,
    statusFilter,
    setStatusFilter,
    setSearchTerm,
    shipments,
    selectedShipment,
    setIsSimulatingId,
    setShipments,
    setSelectedShipment,
    setAnalytics,
    setIsCreateModalOpen,
    setVehicles,
    setWarehouses,
    newSender,
    newRecipient,
    newOrigin,
    newDestination,
    newPriority,
    newWeight,
    newDays,
    setNewSender,
    setNewRecipient,
    setNewOrigin,
    setNewDestination,
    setNewPriority,
    setNewWeight,
    setNewDays,
  );

  return (
    <div style={{ maxWidth: '1360px', margin: '2rem auto', padding: '0 1.5rem' }} data-testid="dashboard-root">
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Mission Control &bull; Live Telematics Feed
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Operations Command Center
          </h1>
          {currentUser && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Terminal Operator: <strong style={{ color: '#fff' }}>{currentUser.fullName}</strong> ({currentUser.role})
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="secondary-btn"
            onClick={handlers.onSyncTelematics}
            data-testid="btn-refresh-data"
          >
            &#x21bb; Sync Telematics
          </button>
          <button
            type="button"
            className="primary-btn"
            onClick={handlers.onOpenCreateModal}
            data-testid="btn-create-shipment"
          >
            + Register Waybill
          </button>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-title">Active Freight Volume</span>
          <span className="metric-value">{shipments.length}</span>
          <span className="metric-trend trend-positive">&uarr; Monitored Waybills</span>
        </div>
        <div className="metric-card">
          <span className="metric-title">In Transit & En Route</span>
          <span className="metric-value" style={{ color: '#38bdf8' }}>
            {shipments.filter((s) => s.status === 'In Transit' || s.status === 'Out for Delivery').length}
          </span>
          <span className="metric-trend trend-positive" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span className="pulse-dot" /> Live GPS streaming
          </span>
        </div>
        <div className="metric-card">
          <span className="metric-title">Delayed Exceptions</span>
          <span className="metric-value" style={{ color: 'var(--accent-rose)' }}>
            {shipments.filter((s) => s.status === 'Delayed').length}
          </span>
          <span className="metric-trend trend-warning">&excl; Weather & Highway Alerts</span>
        </div>
        <div className="metric-card">
          <span className="metric-title">Fleet Utilization</span>
          <span className="metric-value" style={{ color: 'var(--accent-cyan)' }}>
            {analytics.fleetUtilizationPct}%
          </span>
          <span className="metric-trend trend-positive">Payload efficiency</span>
        </div>
        <div className="metric-card">
          <span className="metric-title">Global Warehouse Capacity</span>
          <span className="metric-value" style={{ color: '#a78bfa' }}>
            {analytics.warehouseOccupancyAvgPct}%
          </span>
          <span className="metric-trend" style={{ color: 'var(--text-muted)' }}>4 Hubs aggregated</span>
        </div>
        <div className="metric-card">
          <span className="metric-title">On-Time SLA Rate</span>
          <span className="metric-value" style={{ color: 'var(--accent-emerald)' }}>
            {analytics.onTimeDeliveryRatePct}%
          </span>
          <span className="metric-trend trend-positive">&uarr; Industry benchmark</span>
        </div>
      </div>

      {/* Main Tab Controls */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
        <button
          type="button"
          className={`nav-btn ${activeTab === 'shipments' ? 'active' : ''}`}
          style={{ padding: '0.75rem 1.25rem', fontSize: '0.95rem' }}
          onClick={handlers.onTabShipments}
          data-testid="tab-shipments"
        >
          Shipments & Waybills ({shipments.length})
        </button>
        <button
          type="button"
          className={`nav-btn ${activeTab === 'fleet' ? 'active' : ''}`}
          style={{ padding: '0.75rem 1.25rem', fontSize: '0.95rem' }}
          onClick={handlers.onTabFleet}
          data-testid="tab-fleet"
        >
          Fleet & Vehicle Telematics ({vehicles.length})
        </button>
        <button
          type="button"
          className={`nav-btn ${activeTab === 'warehouses' ? 'active' : ''}`}
          style={{ padding: '0.75rem 1.25rem', fontSize: '0.95rem' }}
          onClick={handlers.onTabWarehouses}
          data-testid="tab-warehouses"
        >
          Warehouse Hubs & Inventory ({warehouses.length})
        </button>
      </div>

      {activeTab === 'shipments' && (
        <ShipmentsView
          shipments={shipments}
          statusFilter={statusFilter}
          searchTerm={searchTerm}
          isSimulatingId={isSimulatingId}
          handlers={handlers}
        />
      )}

      {activeTab === 'fleet' && <FleetView vehicles={vehicles} />}

      {activeTab === 'warehouses' && <WarehousesView warehouses={warehouses} />}

      <ShipmentDetailModal
        selectedShipment={selectedShipment}
        isSimulatingId={isSimulatingId}
        handlers={handlers}
      />

      <CreateShipmentModal
        isCreateModalOpen={isCreateModalOpen}
        newSender={newSender}
        newRecipient={newRecipient}
        newOrigin={newOrigin}
        newDestination={newDestination}
        newPriority={newPriority}
        newWeight={newWeight}
        newDays={newDays}
        handlers={handlers}
      />
    </div>
  );
}

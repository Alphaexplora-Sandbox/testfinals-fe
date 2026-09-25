import { renderToString } from 'react-dom/server';
import React from 'react';
import { App, AppActions, createAppHandlers } from '../../src/App';
import { LandingPage, LandingPageActions, createLandingHandlers } from '../../src/components/LandingPage';
import { LoginPage, LoginPageActions, createLoginHandlers } from '../../src/components/LoginPage';
import { Dashboard, DashboardActions, createDashboardHandlers } from '../../src/components/Dashboard';
import { Navigation, NavigationActions, createNavHandlers } from '../../src/components/Navigation';
import { apiClient, getApiBaseUrl } from '../../src/services/apiClient';
import { DEMO_USERS, INITIAL_SHIPMENTS } from '../../src/data/mockLogisticsData';

const mockInput = (val: string) =>
  ({ target: { value: val } } as unknown as React.ChangeEvent<HTMLInputElement>);

const mockSelect = (val: string) =>
  ({ target: { value: val } } as unknown as React.ChangeEvent<HTMLSelectElement>);

const mockForm = () =>
  ({ preventDefault: jest.fn() } as unknown as React.FormEvent);

const mockBtnWithAttr = <T extends HTMLElement = HTMLButtonElement>(attrName: string, attrVal: string | null) =>
  ({ currentTarget: { getAttribute: (key: string) => (key === attrName ? attrVal : null) } } as unknown as React.MouseEvent<T>);

describe('Logistics Platform Components', () => {
  it('renders the LandingPage with tracking input, suggestions, and metrics', () => {
    const html = renderToString(
      <LandingPage
        onNavigateToLogin={() => {}}
        onNavigateToDashboard={() => {}}
        initialTrackingCode="LP-8924-XQ"
      />,
    );

    expect(html).toContain('Global Supply Chain Orchestration');
    expect(html).toContain('hero-tracking-input');
    expect(html).toContain('hero-track-btn');
    expect(html).toContain('99.8%');
  });

  it('renders LandingPage modal dossier and error states', () => {
    const modalHtml = renderToString(
      <LandingPage
        onNavigateToLogin={() => {}}
        onNavigateToDashboard={() => {}}
        initialSearchedShipment={INITIAL_SHIPMENTS[0]}
        initialSearchError="Tracking code not found"
      />,
    );

    expect(modalHtml).toContain('modal-tracking-number');
    expect(modalHtml).toContain('Tracking code not found');
  });

  it('executes LandingPageActions performTrack and quickLookup', async () => {
    const setSearching = jest.fn();
    const setError = jest.fn();
    const setShipment = jest.fn();
    const setCode = jest.fn();

    // 1. Empty code early return
    await LandingPageActions.performTrack('', setSearching, setError, setShipment);
    expect(setSearching).not.toHaveBeenCalled();

    // 2. Valid code
    await LandingPageActions.performTrack('LP-8924-XQ', setSearching, setError, setShipment);
    expect(setShipment).toHaveBeenCalled();

    // 3. Invalid code
    await LandingPageActions.performTrack('LP-UNKNOWN', setSearching, setError, setShipment);
    expect(setError).toHaveBeenCalled();

    // 4. Quick lookup
    await LandingPageActions.quickLookup('LP-8924-XQ', setCode, setSearching, setError, setShipment);
    expect(setCode).toHaveBeenCalledWith('LP-8924-XQ');

    // 5. Test createLandingHandlers
    const handlers = createLandingHandlers('LP-8924-XQ', setCode, setSearching, setError, setShipment);
    handlers.onTrackingChange(mockInput('LP-TEST'));
    expect(setCode).toHaveBeenCalledWith('LP-TEST');

    await handlers.handleTrack(mockForm());
    await handlers.handleTrack();
    await handlers.handleQuickLookup('LP-8924-XQ');

    handlers.onQuickButtonClick(mockBtnWithAttr('data-code', 'LP-8924-XQ'));
    handlers.onQuickButtonClick(mockBtnWithAttr('data-code', null));

    handlers.handleCloseModal();
    expect(setShipment).toHaveBeenCalledWith(null);
  });

  it('renders the LoginPage with 1-click demo profiles and error alert', () => {
    const html = renderToString(
      <LoginPage
        onLoginSuccess={() => {}}
        onNavigateToHome={() => {}}
        initialError="Invalid access token."
      />,
    );

    expect(html).toContain('Operations Terminal Sign In');
    expect(html).toContain('login-email');
    expect(html).toContain('login-password');
    expect(html).toContain('login-submit');
    expect(html).toContain('demo-dispatcher');
    expect(html).toContain('demo-admin');
    expect(html).toContain('Invalid access token.');
  });

  it('executes LoginPageActions performLogin and selectDemoProfile', async () => {
    const setLoading = jest.fn();
    const setError = jest.fn();
    const onSuccess = jest.fn();
    const setEmail = jest.fn();
    const setPassword = jest.fn();

    // Valid login
    await LoginPageActions.performLogin('dispatcher@logipulse.io', 'password123', setLoading, setError, onSuccess);
    expect(onSuccess).toHaveBeenCalled();

    // Invalid login
    await LoginPageActions.performLogin('dispatcher@logipulse.io', 'wrong', setLoading, setError, onSuccess);
    expect(setError).toHaveBeenCalled();

    // Select demo profile
    LoginPageActions.selectDemoProfile('admin@logipulse.io', setEmail, setPassword, setError);
    expect(setEmail).toHaveBeenCalledWith('admin@logipulse.io');
    expect(setPassword).toHaveBeenCalledWith('password123');

    // Test createLoginHandlers
    const handlers = createLoginHandlers('admin@logipulse.io', 'pass', setLoading, setError, onSuccess, setEmail, setPassword);
    handlers.onEmailChange(mockInput('test@logipulse.io'));
    expect(setEmail).toHaveBeenCalledWith('test@logipulse.io');
    handlers.onPasswordChange(mockInput('secret'));
    expect(setPassword).toHaveBeenCalledWith('secret');

    await handlers.handleSubmit(mockForm());
    await handlers.handleSubmit();

    handlers.onSelectDemoClick(mockBtnWithAttr('data-email', 'dispatcher@logipulse.io'));
    expect(setEmail).toHaveBeenCalledWith('dispatcher@logipulse.io');
    handlers.onSelectDemoClick(mockBtnWithAttr('data-email', null));
  });

  it('renders Navigation in anonymous and authenticated states and executes NavigationActions', () => {
    const onNav = jest.fn();
    const onLogout = jest.fn();

    const anonHtml = renderToString(
      <Navigation
        currentView="landing"
        onNavigate={onNav}
        currentUser={null}
        onLogout={onLogout}
        isBackendConnected={false}
      />,
    );
    expect(anonHtml).toContain('Portal Sign In');
    expect(anonHtml).toContain('Local Telemetry Mode');

    const authHtml = renderToString(
      <Navigation
        currentView="dashboard"
        onNavigate={onNav}
        currentUser={DEMO_USERS[0]}
        onLogout={onLogout}
        isBackendConnected={true}
      />,
    );
    expect(authHtml).toContain('Sign Out');
    expect(authHtml).toContain('Render API Online');
    expect(authHtml).toContain('Sarah');
    expect(authHtml).toContain('user-role-badge');

    // Test createNavHandlers & NavigationActions
    const navHandlers = createNavHandlers(onNav);
    navHandlers.toLanding();
    expect(onNav).toHaveBeenCalledWith('landing');
    navHandlers.toDashboard();
    expect(onNav).toHaveBeenCalledWith('dashboard');
    navHandlers.toLogin();
    expect(onNav).toHaveBeenCalledWith('login');

    const compatNav = NavigationActions.createHandlers(onNav);
    compatNav.toLanding();
  });

  it('renders Dashboard across tabs (shipments, fleet, warehouses) and modals', () => {
    const shipmentsHtml = renderToString(
      <Dashboard currentUser={DEMO_USERS[0]} initialTab="shipments" />,
    );
    expect(shipmentsHtml).toContain('Operations Command Center');
    expect(shipmentsHtml).toContain('tab-shipments');
    expect(shipmentsHtml).toContain('LP-8924-XQ');

    const fleetHtml = renderToString(
      <Dashboard currentUser={DEMO_USERS[0]} initialTab="fleet" />,
    );
    expect(fleetHtml).toContain('fleet-tab-content');
    expect(fleetHtml).toContain('Energy / Fuel Reserve');

    const warehousesHtml = renderToString(
      <Dashboard currentUser={DEMO_USERS[0]} initialTab="warehouses" />,
    );
    expect(warehousesHtml).toContain('warehouses-tab-content');
    expect(warehousesHtml).toContain('warehouse-card');

    const modalHtml = renderToString(
      <Dashboard
        currentUser={DEMO_USERS[0]}
        initialSelectedShipment={INITIAL_SHIPMENTS[0]}
        initialCreateModalOpen={true}
      />,
    );
    expect(modalHtml).toContain('Waybill Dossier');
    expect(modalHtml).toContain('Register New Freight Waybill');
  });

  it('executes DashboardActions for status styles, filtering, search, and waybills', async () => {
    // 1. Status class mapper branches
    expect(DashboardActions.getStatusClass('In Transit')).toBe('status-intransit');
    expect(DashboardActions.getStatusClass('Out for Delivery')).toBe('status-outfordelivery');
    expect(DashboardActions.getStatusClass('Delivered')).toBe('status-delivered');
    expect(DashboardActions.getStatusClass('Delayed')).toBe('status-delayed');
    expect(DashboardActions.getStatusClass('Pending')).toBe('status-pending');

    // 2. Filter & Search
    const setStatus = jest.fn();
    const setSearch = jest.fn();
    const setShipments = jest.fn();
    const setSimulating = jest.fn();
    const setSelected = jest.fn();
    const setAnalytics = jest.fn();
    const setModal = jest.fn();

    const filtered = await DashboardActions.filterShipments('In Transit', '', setStatus, setShipments);
    expect(filtered).toBeDefined();

    const searched = await DashboardActions.searchShipments('Chicago', 'All', setSearch, setShipments);
    expect(searched).toBeDefined();

    // 3. Simulate step
    const simulated = await DashboardActions.simulateStep(
      INITIAL_SHIPMENTS[0].id,
      INITIAL_SHIPMENTS[0],
      setSimulating,
      setShipments,
      setSelected,
      setAnalytics,
    );
    expect(simulated).not.toBeNull();

    // 4. Create shipment
    const created = await DashboardActions.createShipment(
      {
        senderName: 'Sender',
        senderAddress: 'Addr',
        recipientName: 'Recipient',
        recipientAddress: 'RecAddr',
        origin: 'Dallas',
        destination: 'Miami',
        priority: 'Standard',
        weightKg: 50,
        estimatedDays: 2,
      },
      setShipments,
      setModal,
      setSelected,
    );
    expect(created.trackingNumber).toMatch(/^LP-/);

    // 5. Test createDashboardHandlers and loadData
    const setActiveTab = jest.fn();
    const setVehicles = jest.fn();
    const setWarehouses = jest.fn();
    const setNewSender = jest.fn();
    const setNewRecipient = jest.fn();
    const setNewOrigin = jest.fn();
    const setNewDestination = jest.fn();
    const setNewPriority = jest.fn();
    const setNewWeight = jest.fn();
    const setNewDays = jest.fn();

    const dHandlers = createDashboardHandlers(
      setActiveTab,
      'searchTerm',
      'All',
      setStatus,
      setSearch,
      INITIAL_SHIPMENTS,
      INITIAL_SHIPMENTS[0],
      setSimulating,
      setShipments,
      setSelected,
      setAnalytics,
      setModal,
      setVehicles,
      setWarehouses,
      'Apex Semi',
      'NextGen',
      'Chicago, IL',
      'Rotterdam, NL',
      'Express',
      500,
      3,
      setNewSender,
      setNewRecipient,
      setNewOrigin,
      setNewDestination,
      setNewPriority,
      setNewWeight,
      setNewDays,
    );

    dHandlers.onTabShipments();
    expect(setActiveTab).toHaveBeenCalledWith('shipments');
    dHandlers.onTabFleet();
    expect(setActiveTab).toHaveBeenCalledWith('fleet');
    dHandlers.onTabWarehouses();
    expect(setActiveTab).toHaveBeenCalledWith('warehouses');

    dHandlers.onFilterClick(mockBtnWithAttr('data-filter', 'In Transit'));
    dHandlers.onFilterClick(mockBtnWithAttr('data-filter', null));

    dHandlers.onSearchChange(mockInput('Chicago'));

    dHandlers.onInspectClick(mockBtnWithAttr<HTMLElement>('data-id', INITIAL_SHIPMENTS[0].id));
    expect(setSelected).toHaveBeenCalledWith(INITIAL_SHIPMENTS[0]);
    dHandlers.onInspectClick(mockBtnWithAttr<HTMLElement>('data-id', 'non-existent'));

    dHandlers.onSimulateClick(mockBtnWithAttr('data-id', INITIAL_SHIPMENTS[0].id));
    dHandlers.onSimulateClick(mockBtnWithAttr('data-id', null));

    dHandlers.onModalSimulateClick();
    dHandlers.onOpenCreateModal();
    expect(setModal).toHaveBeenCalledWith(true);
    dHandlers.onCloseCreateModal();
    expect(setModal).toHaveBeenCalledWith(false);
    dHandlers.onCloseDetailModal();
    expect(setSelected).toHaveBeenCalledWith(null);

    dHandlers.onSyncTelematics();

    dHandlers.onSenderChange(mockInput('Sender'));
    expect(setNewSender).toHaveBeenCalledWith('Sender');
    dHandlers.onRecipientChange(mockInput('Recipient'));
    expect(setNewRecipient).toHaveBeenCalledWith('Recipient');
    dHandlers.onOriginChange(mockSelect('Dallas, TX'));
    expect(setNewOrigin).toHaveBeenCalledWith('Dallas, TX');
    dHandlers.onDestinationChange(mockSelect('Singapore, SG'));
    expect(setNewDestination).toHaveBeenCalledWith('Singapore, SG');
    dHandlers.onPriorityChange(mockSelect('Cold Chain'));
    expect(setNewPriority).toHaveBeenCalledWith('Cold Chain');
    dHandlers.onWeightChange(mockInput('250'));
    expect(setNewWeight).toHaveBeenCalledWith(250);
    dHandlers.onDaysChange(mockInput('5'));
    expect(setNewDays).toHaveBeenCalledWith(5);

    await dHandlers.handleCreateShipment(mockForm());
    await dHandlers.handleCreateShipment();

    await DashboardActions.loadData(setAnalytics, setShipments, setVehicles, setWarehouses);
    expect(setAnalytics).toHaveBeenCalled();
  });

  it('renders App across different initial views and executes AppActions', async () => {
    const landingHtml = renderToString(<App initialView="landing" />);
    expect(landingHtml).toContain('Track &amp; Overview');

    const loginHtml = renderToString(<App initialView="login" />);
    expect(loginHtml).toContain('Operations Terminal Sign In');

    const dashboardHtml = renderToString(<App initialView="dashboard" />);
    expect(dashboardHtml).toContain('Operations Command Center');

    // Test AppActions
    const setUser = jest.fn();
    const setView = jest.fn();

    AppActions.handleLoginSuccess(DEMO_USERS[0], setUser, setView);
    expect(setUser).toHaveBeenCalledWith(DEMO_USERS[0]);
    expect(setView).toHaveBeenCalledWith('dashboard');

    AppActions.handleLogout(setUser, setView);
    expect(setUser).toHaveBeenCalledWith(null);
    expect(setView).toHaveBeenCalledWith('landing');

    AppActions.handleNavigate('login', setView);
    expect(setView).toHaveBeenCalledWith('login');

    const appHandlers = createAppHandlers(setUser, setView);
    appHandlers.onLoginSuccess(DEMO_USERS[0]);
    appHandlers.onLogout();
    appHandlers.onNavigate('dashboard');
    appHandlers.toLanding();
    appHandlers.toLogin();
    appHandlers.toDashboard();

    const setConnected = jest.fn();
    await AppActions.checkInitialRoute(setView, setConnected);
  });
});

describe('Logistics API Client', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Backend offline'));
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.restoreAllMocks();
  });

  it('resolves API base URLs correctly according to environment', () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    delete process.env.API_URL;
    expect(getApiBaseUrl()).toBe('http://localhost:8080');

    process.env.API_URL = 'https://api.logipulse.internal/';
    expect(getApiBaseUrl()).toBe('https://api.logipulse.internal');

    process.env.NEXT_PUBLIC_API_URL = 'https://render-be.onrender.com/';
    expect(getApiBaseUrl()).toBe('https://render-be.onrender.com');
  });

  it('checks service health via network and fallback', async () => {
    const offline = await apiClient.checkHealth();
    expect(offline).toBeDefined();

    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'ok', service: 'testfinals-backend' }),
      } as Response),
    );

    const online = await apiClient.checkHealth();
    expect(online.online).toBe(true);
    expect(online.service).toBe('testfinals-backend');
  });

  it('authenticates demo users with valid and fallback passwords', async () => {
    const dispatcher = await apiClient.login('dispatcher@logipulse.io', 'password123');
    expect(dispatcher.role).toBe('Dispatcher');

    const admin = await apiClient.login('admin@logipulse.io', 'admin');
    expect(admin.role).toBe('Admin');

    const warehouse = await apiClient.login('warehouse@logipulse.io', 'demo');
    expect(warehouse.role).toBe('WarehouseManager');

    const driver = await apiClient.login('driver@logipulse.io', 'password123');
    expect(driver.role).toBe('Driver');

    await expect(apiClient.login('admin@logipulse.io', 'wrong')).rejects.toThrow();
    await expect(apiClient.login('unknown@logipulse.io', 'password123')).rejects.toThrow();
  });

  it('fetches analytics with live fallback', async () => {
    const analytics = await apiClient.getAnalytics();
    expect(analytics).toBeDefined();
    expect(analytics.activeInTransit).toBeGreaterThan(0);
    expect(analytics.onTimeDeliveryRatePct).toBeGreaterThan(90);

    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ ...analytics, activeInTransit: 99 }),
      } as Response),
    );

    const liveAnalytics = await apiClient.getAnalytics();
    expect(liveAnalytics.activeInTransit).toBe(99);
  });

  it('fetches shipments with status and search filters', async () => {
    const all = await apiClient.getShipments();
    expect(all.length).toBeGreaterThan(0);

    const inTransit = await apiClient.getShipments('In Transit');
    expect(inTransit.every((s) => s.status.toLowerCase() === 'in transit')).toBe(true);

    const searched = await apiClient.getShipments('All', 'Chicago');
    expect(searched.length).toBeGreaterThan(0);

    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(all),
      } as Response),
    );
    const live = await apiClient.getShipments('All', 'test');
    expect(live).toBeDefined();
  });

  it('tracks shipment by valid and invalid tracking codes', async () => {
    const shipment = await apiClient.trackShipment('LP-8924-XQ');
    expect(shipment).not.toBeNull();
    expect(shipment?.trackingNumber).toBe('LP-8924-XQ');

    const notFound = await apiClient.trackShipment('LP-0000-NONEXISTENT');
    expect(notFound).toBeNull();

    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(shipment),
      } as Response),
    );
    const liveTrack = await apiClient.trackShipment('LP-8924-XQ');
    expect(liveTrack?.id).toBe(shipment?.id);
  });

  it('creates new shipment and returns waybill information', async () => {
    const newShipment = await apiClient.createShipment({
      senderName: 'Test Corp',
      senderAddress: '123 Main St, Seattle',
      recipientName: 'Alpha Logistics',
      recipientAddress: '456 Harbor Blvd, Long Beach',
      origin: 'Seattle, WA',
      destination: 'Long Beach, CA',
      priority: 'Express',
      weightKg: 450,
      estimatedDays: 2,
    });

    expect(newShipment.id).toBeDefined();
    expect(newShipment.trackingNumber).toMatch(/^LP-/);
    expect(newShipment.status).toBe('Pending');
    expect(newShipment.events.length).toBeGreaterThan(0);

    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(newShipment),
      } as Response),
    );

    const liveCreated = await apiClient.createShipment({
      senderName: 'Live Test',
      senderAddress: 'Address',
      recipientName: 'Recipient',
      recipientAddress: 'Rec Address',
      origin: 'A',
      destination: 'B',
      priority: 'Standard',
      weightKg: 10,
      estimatedDays: 1,
    });
    expect(liveCreated.id).toBe(newShipment.id);
  });

  it('simulates shipment cycle across various lifecycle states', async () => {
    const created = await apiClient.createShipment({
      senderName: 'Sim Test',
      senderAddress: 'Origin Addr',
      recipientName: 'Sim Recipient',
      recipientAddress: 'Dest Addr',
      origin: 'Tokyo',
      destination: 'Frankfurt',
      priority: 'Express',
      weightKg: 100,
      estimatedDays: 3,
    });

    const step1 = await apiClient.simulateNextStep(created.id);
    expect(step1?.status).toBe('Picked Up');

    const step2 = await apiClient.simulateNextStep(created.id);
    expect(step2?.status).toBe('In Transit');

    const step3 = await apiClient.simulateNextStep(created.id);
    expect(step3?.status).toBe('Out for Delivery');

    const step4 = await apiClient.simulateNextStep(created.id);
    expect(step4?.status).toBe('Delivered');

    const step5 = await apiClient.simulateNextStep(created.id);
    expect(step5?.status).toBe('In Transit');

    const nonExistent = await apiClient.simulateNextStep('shp-not-found-id');
    expect(nonExistent).toBeNull();
  });

  it('fetches vehicles and warehouses with mock and fallback', async () => {
    const vehicles = await apiClient.getVehicles();
    expect(vehicles.length).toBeGreaterThan(0);

    const warehouses = await apiClient.getWarehouses();
    expect(warehouses.length).toBeGreaterThan(0);

    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(vehicles),
      } as Response),
    );
    const liveVehicles = await apiClient.getVehicles();
    expect(liveVehicles.length).toBe(vehicles.length);

    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(warehouses),
      } as Response),
    );
    const liveWarehouses = await apiClient.getWarehouses();
    expect(liveWarehouses.length).toBe(warehouses.length);
  });
});

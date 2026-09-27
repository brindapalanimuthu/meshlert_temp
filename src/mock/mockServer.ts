import type { User } from '@/types';

const API_BASE = 'http://localhost:5001/api';

interface MockUser extends User {
  password: string;
}

const mockUsers: MockUser[] = [
  { name: 'Aanya Sharma', email: 'aanya@mesh.local', password: 'demo1234', role: 'Command Center', meshId: 'mesh-a1b2' },
  { name: 'Ravi Kumar', email: 'ravi@mesh.local', password: 'demo1234', role: 'Volunteer', meshId: 'mesh-c3d4' },
  { name: 'Priya Nair', email: 'priya@mesh.local', password: 'demo1234', role: 'Victim', meshId: 'mesh-e5f6' },
];

function makeToken(user: MockUser): string {
  return btoa(`${user.email}:${user.meshId}:${Date.now()}`);
}

function userFromToken(token: string): MockUser | undefined {
  try {
    const decoded = atob(token);
    const email = decoded.split(':')[0];
    return mockUsers.find((u) => u.email === email);
  } catch {
    return undefined;
  }
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const mockOverview = {
  summary: {
    totalIncidents: 8,
    totalResources: 5,
    activePeers: 12,
    incidentsBySeverity: { Low: 2, Medium: 3, High: 2, Critical: 1 },
  },
  incidents: [
    { _id: 'srv-1', type: 'Flood', severity: 'Critical', description: 'Rising water levels near the riverside settlement, families evacuating.', status: 'Reported' },
    { _id: 'srv-2', type: 'Medical', severity: 'High', description: 'Elderly resident needs urgent medical supplies in Sector 7.', status: 'In Progress' },
    { _id: 'srv-3', type: 'Structural Damage', severity: 'Medium', description: 'Bridge on Main Street has visible cracks, partial collapse risk.', status: 'Acknowledged' },
    { _id: 'srv-4', type: 'Fire', severity: 'High', description: 'Warehouse fire on Industrial Road, spreading toward residential area.', status: 'In Progress' },
    { _id: 'srv-5', type: 'Trapped', severity: 'Critical', description: 'Three people trapped in collapsed building near the old market.', status: 'Reported' },
    { _id: 'srv-6', type: 'Missing Person', severity: 'Medium', description: 'Child separated from family during evacuation at the community center.', status: 'Acknowledged' },
    { _id: 'srv-7', type: 'Medical', severity: 'Low', description: 'Minor injuries reported at the temporary shelter, need bandages.', status: 'Resolved' },
    { _id: 'srv-8', type: 'Flood', severity: 'Low', description: 'Waterlogging on Park Avenue, vehicles unable to pass.', status: 'Resolved' },
  ],
  resources: [
    { _id: 'srv-r1', type: 'Water', quantity: '200 bottles', description: 'Purified drinking water available at the community hall.', status: 'Available' },
    { _id: 'srv-r2', type: 'Medical Aid', quantity: '5 first-aid kits', description: 'Bandages, antiseptics, and basic medicines at the field clinic.', status: 'Available' },
    { _id: 'srv-r3', type: 'Shelter', quantity: '40 beds', description: 'Temporary shelter set up at the municipal school.', status: 'Claimed' },
    { _id: 'srv-r4', type: 'Food', quantity: '150 meals', description: 'Hot meals being distributed at the temple grounds.', status: 'Available' },
    { _id: 'srv-r5', type: 'Transport', quantity: '3 vans', description: 'Vehicles available for evacuation near the bus depot.', status: 'Depleted' },
  ],
  peers: [
    { meshId: 'mesh-a1b2', name: 'Aanya', role: 'Command Center', lastSeen: '2026-09-27T10:30:00Z' },
    { meshId: 'mesh-c3d4', name: 'Ravi', role: 'Volunteer', lastSeen: '2026-09-27T10:28:00Z' },
    { meshId: 'mesh-e5f6', name: 'Priya', role: 'Victim', lastSeen: '2026-09-27T10:25:00Z' },
  ],
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function installMockServer(): void {
  const originalFetch = window.fetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

    if (!url.startsWith(API_BASE)) {
      return originalFetch(input, init);
    }

    const path = url.slice(API_BASE.length);
    const method = init?.method || 'GET';
    const body = init?.body ? JSON.parse(init.body as string) : {};

    // Auth: login
    if (path === '/auth/login' && method === 'POST') {
      await delay(400);
      const user = mockUsers.find((u) => u.email === body.email && u.password === body.password);
      if (!user) {
        return jsonResponse(401, { error: 'Invalid email or password.' });
      }
      return jsonResponse(200, { token: makeToken(user), user: { name: user.name, email: user.email, role: user.role, meshId: user.meshId } });
    }

    // Auth: register
    if (path === '/auth/register' && method === 'POST') {
      await delay(400);
      const existing = mockUsers.find((u) => u.email === body.email);
      if (existing) {
        return jsonResponse(409, { error: 'An account with this email already exists.' });
      }
      const newUser: MockUser = {
        name: body.name || 'New User',
        email: body.email,
        password: body.password,
        role: body.role || 'Victim',
        meshId: `mesh-${Math.random().toString(36).slice(2, 6)}`,
      };
      mockUsers.push(newUser);
      return jsonResponse(200, { token: makeToken(newUser), user: { name: newUser.name, email: newUser.email, role: newUser.role, meshId: newUser.meshId } });
    }

    // Incidents: create
    if (path === '/incidents' && method === 'POST') {
      await delay(200);
      return jsonResponse(201, { _id: `srv-${Date.now()}`, ...body });
    }

    // Resources: create
    if (path === '/resources' && method === 'POST') {
      await delay(200);
      return jsonResponse(201, { _id: `srv-r${Date.now()}`, ...body });
    }

    // Command: overview
    if (path === '/command/overview' && method === 'GET') {
      await delay(500);
      const token = init?.headers && typeof init.headers === 'object' && 'Authorization' in init.headers
        ? (init.headers as Record<string, string>).Authorization.replace('Bearer ', '')
        : '';
      const user = userFromToken(token);
      if (!user) {
        return jsonResponse(401, { error: 'Authentication required.' });
      }
      return jsonResponse(200, mockOverview);
    }

    // Fallback: pass through to real fetch
    return originalFetch(input, init);
  };
}

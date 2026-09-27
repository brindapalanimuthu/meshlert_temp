import localDB from '@/db/localDB';

const SEED_INCIDENTS = [
  {
    meshId: 'mesh-a1b2',
    type: 'Flood',
    severity: 'Critical',
    description: 'Rising water levels near the riverside settlement, families evacuating.',
    location: { lat: 11.0168, lng: 76.9558 },
    clientId: 'seed-inc-1',
    status: 'Reported',
    synced: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    meshId: 'mesh-a1b2',
    type: 'Medical',
    severity: 'High',
    description: 'Elderly resident needs urgent medical supplies in Sector 7.',
    location: { lat: 11.0205, lng: 76.9612 },
    clientId: 'seed-inc-2',
    status: 'In Progress',
    synced: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    meshId: 'mesh-c3d4',
    type: 'Fire',
    severity: 'High',
    description: 'Warehouse fire on Industrial Road, spreading toward residential area.',
    location: { lat: 11.0089, lng: 76.9488 },
    clientId: 'seed-inc-3',
    status: 'In Progress',
    synced: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    meshId: 'mesh-e5f6',
    type: 'Trapped',
    severity: 'Critical',
    description: 'Three people trapped in collapsed building near the old market.',
    location: { lat: 11.0241, lng: 76.9530 },
    clientId: 'seed-inc-4',
    status: 'Reported',
    synced: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
];

const SEED_RESOURCES = [
  {
    meshId: 'mesh-c3d4',
    type: 'Water',
    description: 'Purified drinking water available at the community hall.',
    quantity: '200 bottles',
    location: { lat: 11.0120, lng: 76.9590 },
    clientId: 'seed-res-1',
    status: 'Available',
    synced: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    meshId: 'mesh-c3d4',
    type: 'Medical Aid',
    description: 'Bandages, antiseptics, and basic medicines at the field clinic.',
    quantity: '5 first-aid kits',
    location: { lat: 11.0180, lng: 76.9630 },
    clientId: 'seed-res-2',
    status: 'Available',
    synced: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
  },
  {
    meshId: 'mesh-a1b2',
    type: 'Shelter',
    description: 'Temporary shelter set up at the municipal school.',
    quantity: '40 beds',
    location: { lat: 11.0050, lng: 76.9500 },
    clientId: 'seed-res-3',
    status: 'Claimed',
    synced: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 100).toISOString(),
  },
];

export async function seedDemoData(): Promise<void> {
  const existingIncidents = await localDB.incidents.toArray();
  const existingResources = await localDB.resources.toArray();

  if (existingIncidents.length === 0 && existingResources.length === 0) {
    await localDB.incidents.bulkAdd(SEED_INCIDENTS);
    await localDB.resources.bulkAdd(SEED_RESOURCES);
  }
}

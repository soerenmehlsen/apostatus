export const mockUser = { name: "John Doe", role: "Pharmacist" };
export const mockLocations = [
  { id: '101', name: 'Main Floor' },
  { id: '102', name: 'Back Storage' },
  { id: '103', name: 'Refrigerator' },
  { id: '104', name: 'Controlled Substances' },
  { id: '105', name: 'OTC Section' },
  { id: '111', name: 'Emergency Kit' }
];

export const mockProducts = [
  { id: 'Z00124', name: 'Aspirin Extensan Junior 75 mg 100 stk', qty: 5, count: 4, status: 'Check' },
  { id: 'Z18827', name: 'Aspirin Extensan Junior 75mg ×100 stk', qty: 1, count: 1, status: 'OK' },
  { id: 'Z17748', name: 'Aspirin Extensan 500mg', qty: 0, count: 0, status: 'Restocked' },
  { id: 'Z88186', name: 'Aspirin Ibuprofen 60×10', qty: 2, count: 0, status: 'Missing' },
  { id: 'Z78711', name: 'Aspirin Paracetamol TMF 50', qty: 0, count: 0, status: 'Check' },
  { id: 'Z39849', name: 'Aspirin Pr & Balance Med 80 gr', qty: 1, count: 0, status: 'Check' }
];

export const mockStocktakes = [
  { location: 101, name: 'SM', date: '2024-07-16', status: 'In Progress' },
  { location: 104, name: 'SM', date: '2024-07-15', status: 'Not confirmed' },
  { location: 102, name: 'SM', date: '2024-07-12', status: 'Completed' },
  { location: 103, name: 'SM', date: '2024-07-12', status: 'Completed' },
  { location: 101, name: 'SM', date: '2024-07-12', status: 'Completed' },
  { location: 100, name: 'SM', date: '2024-06-11', status: 'Completed' }
];
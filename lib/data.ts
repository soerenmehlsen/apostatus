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
  // Main Floor (101) - General medications and common prescriptions
  { id: 'Z00124', name: 'Aspirin Extensan Junior 75 mg 100 stk', qty: 5, location: '101' },
  { id: 'Z18827', name: 'Aspirin Extensan Junior 75mg 100 stk', qty: 1, location: '101' },
  { id: 'Z17748', name: 'Aspirin Extensan 500mg', qty: 0, location: '101' },
  { id: 'Z88186', name: 'Aspirin Ibuprofen 60×10', qty: 2, location: '101' },
  { id: 'Z78711', name: 'Aspirin Paracetamol TMF 50', qty: 0, location: '101' },
  { id: 'Z39849', name: 'Aspirin Pr & Balance Med 80 gr', qty: 1, location: '101' },
  { id: 'M10234', name: 'Metformin 500mg 100 tablets', qty: 15, location: '101' },
  { id: 'L45678', name: 'Lisinopril 10mg 30 tablets', qty: 8, location: '101' },
  { id: 'A67890', name: 'Atorvastatin 20mg 90 tablets', qty: 12, location: '101' },
  { id: 'O23456', name: 'Omeprazole 20mg 30 capsules', qty: 6, location: '101' },

  // Back Storage (102) - Bulk items and overflow stock
  { id: 'B11111', name: 'Bandages Elastic 10cm x 4.5m', qty: 25, location: '102' },
  { id: 'B22222', name: 'Betadine Solution 500ml', qty: 8, location: '102' },
  { id: 'G33333', name: 'Gauze Pads Sterile 10x10cm 100pk', qty: 12, location: '102' },
  { id: 'S44444', name: 'Syringes 5ml Disposable 100pk', qty: 5, location: '102' },
  { id: 'A55555', name: 'Alcohol Swabs 70% 200pk', qty: 18, location: '102' },
  { id: 'T66666', name: 'Thermometer Digital 10pk', qty: 3, location: '102' },
  { id: 'C77777', name: 'Cotton Balls Sterile 500pk', qty: 9, location: '102' },
  { id: 'M88888', name: 'Medical Tape 2.5cm x 10m', qty: 15, location: '102' },

  // Refrigerator (103) - Temperature-sensitive medications
  { id: 'I10001', name: 'Insulin Lantus 100IU/ml 3ml', qty: 4, location: '103' },
  { id: 'I20002', name: 'Insulin NovoRapid 100IU/ml 3ml', qty: 6, location: '103' },
  { id: 'V30003', name: 'Vaccine Flu Quadrivalent 0.5ml', qty: 12, location: '103' },
  { id: 'V40004', name: 'Vaccine Hepatitis B 1ml', qty: 8, location: '103' },
  { id: 'E50005', name: 'EpiPen 0.3mg Auto-injector', qty: 3, location: '103' },
  { id: 'H60006', name: 'Humira 40mg Pen Injector', qty: 2, location: '103' },
  { id: 'P70007', name: 'Prolia 60mg/ml Syringe', qty: 1, location: '103' },

  // Controlled Substances (104) - Narcotics and controlled medications
  { id: 'C90001', name: 'Codeine Phosphate 30mg 30 tablets', qty: 2, location: '104' },
  { id: 'C90002', name: 'Concerta 18mg 30 tablets', qty: 1, location: '104' },
  { id: 'F90003', name: 'Fentanyl Patch 25mcg/hr 5pk', qty: 1, location: '104' },
  { id: 'M90004', name: 'Morphine SR 30mg 30 tablets', qty: 3, location: '104' },
  { id: 'O90005', name: 'OxyContin 10mg 30 tablets', qty: 1, location: '104' },
  { id: 'R90006', name: 'Ritalin 10mg 30 tablets', qty: 2, location: '104' },
  { id: 'T90007', name: 'Tramadol 50mg 30 capsules', qty: 4, location: '104' },
  { id: 'A90008', name: 'Ativan 1mg 30 tablets', qty: 2, location: '104' },

  // OTC Section (105) - Over-the-counter medications
  { id: 'O50001', name: 'Tylenol Extra Strength 500mg 100pk', qty: 20, location: '105' },
  { id: 'O50002', name: 'Advil Liqui-Gels 200mg 80pk', qty: 15, location: '105' },
  { id: 'O50003', name: 'Benadryl 25mg 48 capsules', qty: 12, location: '105' },
  { id: 'O50004', name: 'Pepto-Bismol 262mg 60 tablets', qty: 8, location: '105' },
  { id: 'O50005', name: 'Claritin 10mg 30 tablets', qty: 10, location: '105' },
  { id: 'O50006', name: 'Tums Antacid 500mg 150 tablets', qty: 18, location: '105' },
  { id: 'O50007', name: 'Robitussin DM 118ml', qty: 6, location: '105' },
  { id: 'O50008', name: 'Imodium A-D 2mg 24 capsules', qty: 9, location: '105' },
  { id: 'O50009', name: 'Sudafed PE 10mg 36 tablets', qty: 7, location: '105' },

  // Emergency Kit (111) - Emergency and first aid supplies
  { id: 'E80001', name: 'Epinephrine Auto-injector 0.3mg', qty: 2, location: '111' },
  { id: 'E80002', name: 'Atropine Sulfate 1mg/ml 1ml', qty: 3, location: '111' },
  { id: 'E80003', name: 'Naloxone Nasal Spray 4mg', qty: 4, location: '111' },
  { id: 'E80004', name: 'Dextrose 50% 50ml Syringe', qty: 5, location: '111' },
  { id: 'E80005', name: 'Lidocaine 2% 20ml Vial', qty: 2, location: '111' },
  { id: 'E80006', name: 'Oxygen Mask Adult Disposable', qty: 10, location: '111' },
  { id: 'E80007', name: 'Emergency Blanket Mylar', qty: 8, location: '111' },
  { id: 'E80008', name: 'Burn Gel 3.5g Packets 25pk', qty: 6, location: '111' }
];

export const mockStocktakes = [
  { location: 101, name: 'SM', date: '2024-07-16', status: 'In Progress' },
  { location: 104, name: 'SM', date: '2024-07-15', status: 'Review' },
  { location: 102, name: 'SM', date: '2024-07-12', status: 'Completed' },
  { location: 103, name: 'SM', date: '2024-07-12', status: 'Completed' },
  { location: 101, name: 'SM', date: '2024-07-12', status: 'Completed' },
  { location: 100, name: 'SM', date: '2024-06-11', status: 'Completed' }
];
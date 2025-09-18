export interface ProductData {
  lagernr: string;
  varenr: string;
  navn: string;
  location: string;
  antal: number;
  kostpris: number;
  lagervaerdi: number;
}

export function parseCSV(csvContent: string): ProductData[] {
  const lines = csvContent.split('\n');
  const products: ProductData[] = [];
  
  // Skip header row (index 0)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse CSV line with quoted values
    const values = parseCSVLine(line);
    
    if (values.length >= 7) {
      products.push({
        lagernr: values[0],
        varenr: values[1],
        navn: values[2],
        location: values[3],
        antal: parseInt(values[4]) || 0,
        kostpris: parseFloat(values[5].replace(',', '.')) || 0,
        lagervaerdi: parseFloat(values[6].replace(',', '.')) || 0
      });
    }
  }
 console.log(`✅ Created product:`, products);
  return products;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}
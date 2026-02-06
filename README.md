#  <img width="40" height="40" alt="ApoStatus_Logo" src="https://github.com/user-attachments/assets/bbfce373-7752-4905-996a-747a99503613" /> ApoStatus

A modern pharmacy inventory management and stocktake system built to streamline pharmacy operations, track inventory across multiple locations, and manage stock discrepancies efficiently.

## 📋 Description

ApoStatus is a full-stack web application designed for pharmacies to manage their inventory through structured stocktake sessions. The system allows pharmacy staff to upload product data, conduct stock checks across different locations, review discrepancies, and maintain accurate inventory records. With real-time tracking and comprehensive reporting, ApoStatus helps pharmacies reduce stock errors and improve operational efficiency.

## 💡 Benefits

- **Easy to Use** - Intuitive interface requires minimal training, staff can start counting in minutes
- **Tablet Friendly** - Conduct stock checks on tablets while moving through the pharmacy
- **Quick Entry** - Fast quantity adjustment with +/- buttons and "set to expected" shortcuts
- **Real-Time Progress** - Visual progress tracking shows exactly how much work remains
- **Error Prevention** - Built-in validation prevents common mistakes and duplicate entries
- **Flexible Workflow** - Pause and resume stocktakes at any time without losing progress
- **Multi-Location Support** - Easily switch between different pharmacy areas without confusion
- **No Paper Trail** - Eliminate clipboard management and manual data entry headaches

## ✨ Features

### 📊 Dashboard
- View all stocktake sessions with status tracking (In Progress, Review, Completed)
- Real-time statistics on active sessions and inventory status
- Quick access to recent stocktake activities

### 📤 File Upload Management
- Upload product inventory files with location mapping
- Automatic product count extraction
- File history with upload date tracking
- Location-based file organization

### 🔍 Stock Check System
- Create new stocktake sessions for specific locations
- Product search and lookup by SKU or name
- Progress tracking for each stocktake session
- Multi-location support with predefined location mappings

### 📈 Review & Reporting
- Stocktake review interface
- Automatic variance calculation (expected vs counted quantities)
- Value-based discrepancy reporting
- Identify missing items and overstocked products

### 🎨 User Experience
- Dark/Light theme support with system preference detection
- Responsive design for desktop and tablet devices
- Loading states and error handling

## 🛠️ Tech Stack

### Frontend
- **Framework:** [Next.js 16](https://nextjs.org/) (React 19)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) with custom configuration
- **UI Components:** [Radix UI](https://www.radix-ui.com/) primitives
- **Icons:** [Lucide React](https://lucide.dev/)
- **Theme:** [next-themes](https://github.com/pacocoursey/next-themes)
- **Type Safety:** TypeScript 5

### Backend
- **Runtime:** Node.js 20+
- **API Routes:** Next.js API Routes
- **Database:** SQL Server (Azure SQL)
- **ORM:** [Prisma 6](https://www.prisma.io/)
- **Authentication:** Azure MSAL (Microsoft Authentication Library)
- **Validation:** [Zod](https://zod.dev/)

### DevOps & Tools
- **CI/CD:** GitHub Actions
- **Hosting:** Azure App Service
- **Linting:** ESLint 9
- **Development:** Turbopack (Next.js)
- **Database Management:** Prisma Studio
- **Version Control:** Git

## 🗄️ Database Schema

The application uses four main models:

- **StocktakeSession** - Manages stocktake sessions with status tracking
- **UploadedFile** - Stores uploaded inventory files with location data
- **Product** - Contains product information including SKU, name, quantity, and pricing
- **StockCheck** - Records individual stock checks with variance calculations

## 🚀 Getting Started

### Prerequisites

- Node.js 20 or higher
- npm, yarn, pnpm, or bun
- SQL Server database (Azure SQL or local instance)
- Azure account for authentication (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/soerenmehlsen/apostatus.git
   cd apostatus
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="sqlserver://your-server.database.windows.net:1433;database=your-db;user=your-user;password=your-password;encrypt=true"
   ```

4. **Initialize the database**
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Database Commands

```bash
# Generate Prisma Client
npm run db:generate

# Push schema changes to database
npm run db:push

# Run database migrations
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio
```

## 📁 Project Structure

```
apostatus/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── stocktake/         # Stocktake pages (new, check)
│   ├── review/            # Review page
│   └── upload/            # Upload page
├── components/            # React components
│   ├── dashboard/         # Dashboard components
│   ├── layout/            # Layout components (header, nav)
│   ├── review/            # Review components
│   ├── stocktake/         # Stocktake components
│   ├── ui/                # Reusable UI components (shadcn/ui)
│   └── upload/            # Upload components
���── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and helpers
├── prisma/                # Prisma schema and migrations
├── public/                # Static assets
└── types/                 # TypeScript type definitions
```

## 🔧 Configuration

### Location Mapping

Locations are predefined in the system:
- **101** - Main Floor
- **102** - Back Storage
- **103** - Refrigerator
- **104** - Controlled Substances
- **105** - OTC Section
- **111** - Emergency Kit

Edit location mappings in `types/api.ts`.

## 📝 Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema to database
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
```

## 🚢 Deployment

### Azure App Service (Current Hosting)

ApoStatus is deployed on Azure App Service with continuous deployment via GitHub Actions using Next.js standalone output for optimized deployments.

**Prerequisites:**
- Azure subscription
- Azure App Service instance
- Azure SQL Database

**Deployment Configuration:**

The application uses Next.js standalone build mode for optimized production deployments, resulting in:
- ✅ 80-90% smaller deployments (~150MB vs ~600MB)
- ✅ Faster GitHub Actions (smaller artifacts)
- ✅ Faster Azure deployments
- ✅ Faster cold starts

**Azure App Service Configuration:**

1. **Startup Command** (in Azure Portal → App Service → Configuration → General Settings):
   ```bash
   node server.js
   ```

2. **Environment Variables** (Azure App Service Configuration):
   ```bash
   DATABASE_URL="sqlserver://your-server.database.windows.net:1433;database=your-db;user=your-user;password=your-password;encrypt=true"
   PORT=8080  # or your preferred port
   NODE_ENV=production
   ```

**GitHub Actions Workflow:**

The CI/CD pipeline (`.github/workflows/main_apostatus.yml`) automatically:
1. Builds the Next.js application with standalone output
2. Packages the minimal runtime dependencies
3. Includes static assets and public files
4. Deploys to Azure App Service

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. The standalone output will be in `.next/standalone/`

3. For manual deployment, you need:
   - `.next/standalone/*` (standalone server)
   - `.next/static/` (static assets)
   - `public/` (public files)

4. Start the production server:
   ```bash
   cd .next/standalone
   node server.js
   ```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary.

## 👤 Author

**Søren Mehlsen** - [@soerenmehlsen](https://github.com/soerenmehlsen)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)

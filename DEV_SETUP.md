# ChipuRobo Development Setup

This project consists of two main parts:
- **Frontend** (`/src`) - React + Vite application 
- **CMS** (`/cms`) - Payload CMS for content management

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- pnpm (`npm install -g pnpm`)
- PostgreSQL database (local or cloud)

### 1. Environment Setup

**CMS Environment** (`cms/.env`):
```bash
PAYLOAD_SECRET=your-super-secret-payload-key-here
POSTGRES_URL=postgresql://username:password@localhost:5432/chipurobo_cms
BLOB_READ_WRITE_TOKEN=your-blob-storage-token
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

**Frontend Environment** (`.env`):
```bash
VITE_CMS_URL=http://localhost:3000
VITE_CMS_API_KEY=
```

### 2. Database Setup

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL locally, then create database
createdb chipurobo_cms
```

**Option B: Docker PostgreSQL**
```bash
docker run --name chipurobo-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=chipurobo_cms \
  -p 5432:5432 -d postgres
```

**Option C: Cloud Database** (Recommended for production)
- Use Vercel Postgres, Neon, or similar
- Update `POSTGRES_URL` in `cms/.env`

### 3. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install CMS dependencies
cd cms && pnpm install
```

### 4. Run Development

**Option A: Both services together**
```bash
./dev.sh
```

**Option B: Individual services**
```bash
# Terminal 1: Start CMS
cd cms && pnpm dev

# Terminal 2: Start Frontend
npm run dev
```

### 5. Populate CMS Data

```bash
cd cms && pnpm seed
```

## URLs

- **Frontend**: http://localhost:5173
- **CMS Admin**: http://localhost:3000/admin
- **CMS API**: http://localhost:3000/api

## Development Workflow

1. **Data Changes**: Update data via CMS admin panel at `/admin`
2. **Code Changes**: Frontend hot-reloads automatically
3. **Schema Changes**: Update collections in `cms/src/collections/`
4. **Content Migration**: Run `pnpm seed` to repopulate data

## Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
```

### CMS (Vercel)
```bash
cd cms && pnpm build
```

Make sure to update environment variables in your deployment platform.

## Troubleshooting

**CMS not connecting to database:**
- Check `POSTGRES_URL` in `cms/.env`
- Ensure database exists and is accessible

**Frontend showing fallback data:**
- Check `VITE_CMS_URL` in `.env`
- Ensure CMS is running on the specified URL
- Check browser console for API errors

**Build issues:**
- Run `npm run lint` for frontend issues
- Run `cd cms && pnpm lint` for CMS issues
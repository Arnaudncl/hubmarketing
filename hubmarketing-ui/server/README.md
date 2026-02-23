# HubMarketing API (Sage + PrestaShop)

## Installation

```powershell
cd "d:\IT\Ancien PC\App\HubMarketing\hubmarketing-ui\server"
npm install
```

## Configuration

Le fichier `.env` est déjà configuré avec:
- SQL Server: `SRV-SAGE\SAGE` en Windows Auth
- Database: `House`
- PrestaShop: `https://www.house-store.com/api`

## Démarrage

```powershell
npm run dev
```

API: `http://127.0.0.1:4000`

## Endpoints Sage

- `GET /api/sage/health`
- `GET /api/sage/products?limit=200`
- `GET /api/sage/stock?limit=500`
- `GET /api/sage/sales?limit=500`

## Endpoints PrestaShop

- `GET /api/prestashop/health`
- `GET /api/prestashop/products?limit=100`
- `GET /api/prestashop/orders?limit=100`

## Endpoint unifié

- `GET /api/unified/overview?limit=100`

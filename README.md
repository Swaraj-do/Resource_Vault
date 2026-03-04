# 📚 ResourceVault v2

Flip cards to see your saved links AND uploaded files per topic. Full auth system included.

---

## 🗂 Project Structure

```
resource-vault/
├── backend/
│   ├── src/
│   │   ├── index.js
│   │   ├── models/        User.js, Topic.js
│   │   ├── routes/        auth.js, topics.js, uploads.js
│   │   └── middleware/    auth.js
│   ├── uploads/           (uploaded files stored here locally)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── pages/         AuthPage, DashboardPage
│   │   ├── components/    TopicCard, TopicModal, ResourceModal, Toast
│   │   ├── hooks/         useAuth.jsx
│   │   └── utils/         api.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Local Setup

### 1. MongoDB Atlas (free database)
1. Sign up at https://cloud.mongodb.com
2. Create free **M0 cluster**
3. Create a DB user, allow all IPs (`0.0.0.0/0`)
4. Copy your connection string

### 2. Backend
```bash
cd backend
cp .env.example .env       # fill in your values
npm install
npm run dev                # http://localhost:5000
```

`.env` values:
```
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/resource-vault
JWT_SECRET=<run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
FRONTEND_URL=http://localhost:5173
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env       # VITE_API_URL=http://localhost:5000
npm install
npm run dev                # http://localhost:5173
```

---

## 🌍 Free Deployment

### Backend → Render.com
1. Push to GitHub
2. Render → **New Web Service** → connect repo
3. Root dir: `backend` | Build: `npm install` | Start: `node src/index.js`
4. Add env vars (MONGODB_URI, JWT_SECRET, FRONTEND_URL, NODE_ENV=production)
5. Deploy → get URL like `https://resource-vault-api.onrender.com`

> ⚠️ **File uploads on Render free tier**: Files are stored on disk, which resets on each deploy.
> For permanent file storage, use **Cloudinary** or **AWS S3** (both have free tiers).
> See "Upgrading File Storage" section below.

### Frontend → Vercel
1. Vercel → **New Project** → import repo
2. Root dir: `frontend`
3. Env var: `VITE_API_URL=https://your-render-url.onrender.com`
4. Deploy → get URL like `https://resource-vault.vercel.app`
5. Go back to Render → update `FRONTEND_URL` to your Vercel URL

---

## ☁️ Upgrading File Storage (for production)

For permanent file storage replace local disk with **Cloudinary** (easiest free option):

```bash
cd backend && npm install cloudinary multer-storage-cloudinary
```

Then in `routes/uploads.js` replace the `multer.diskStorage` with:
```js
const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
cloudinary.config({ cloud_name: process.env.CLOUDINARY_NAME, api_key: process.env.CLOUDINARY_KEY, api_secret: process.env.CLOUDINARY_SECRET })
const storage = new CloudinaryStorage({ cloudinary, params: { folder: 'resource-vault', resource_type: 'raw' } })
```

Add to `.env`: `CLOUDINARY_NAME`, `CLOUDINARY_KEY`, `CLOUDINARY_SECRET` (from cloudinary.com free account)

---

## 📋 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Create account |
| POST | `/api/auth/login` | ❌ | Login |
| GET | `/api/auth/me` | ✅ | Current user |
| GET | `/api/topics` | ✅ | All topics |
| POST | `/api/topics` | ✅ | Create topic |
| PUT | `/api/topics/:id` | ✅ | Update topic |
| DELETE | `/api/topics/:id` | ✅ | Delete topic + files |
| POST | `/api/topics/:id/resources` | ✅ | Add link |
| DELETE | `/api/topics/:id/resources/:rid` | ✅ | Delete link |
| POST | `/api/uploads/:topicId` | ✅ | Upload files (multipart) |
| DELETE | `/api/topics/:id/files/:fid` | ✅ | Delete file |

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, React Router, Axios, CSS Modules |
| Backend | Node.js, Express, Multer |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + bcrypt |
| File storage | Local disk (dev) / Cloudinary (prod) |
| Deploy | Vercel + Render |

## 📁 Supported File Types
PDF, Word (.doc/.docx), PowerPoint (.ppt/.pptx), Excel (.xls/.xlsx), Text (.txt/.md)
Max size: **20MB per file**, up to **20 files per upload batch**

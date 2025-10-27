# GarBaNusa Prototype - Deployment Guide

## 🚀 Quick Deploy to Vercel

### Option 1: Deploy via Vercel CLI (5 minutes)

```bash
# 1. Navigate to project
cd /Users/antopucung/Desktop/GarBaNusa/garbanusa-app

# 2. Install dependencies
npm install

# 3. Test locally
npm run dev
# Open http://localhost:3000

# 4. Install Vercel CLI (if not installed)
npm i -g vercel

# 5. Login to Vercel
vercel login

# 6. Deploy
vercel

# 7. Deploy to production
vercel --prod
```

### Option 2: Deploy via Vercel Website (3 minutes)

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import from Git (or upload this folder)
4. Framework: Next.js (auto-detected)
5. Click "Deploy"
6. Done! ✅

---

## 📁 Project Structure

```
garbanusa-app/
├── app/
│   ├── globals.css              # Tailwind styles
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home (redirects to login)
│   ├── login/                   # Login page
│   ├── dashboard/               # ASN Dashboard
│   ├── career-gps/              # Career GPS
│   └── merit-board/             # Committee Merit Dashboard
├── lib/
│   ├── mock-data/               # JSON mock data
│   │   ├── users.json
│   │   ├── training.json
│   │   └── candidates.json
│   ├── ai-simulator/            # AI simulation functions
│   ├── auth.ts                  # Authentication
│   └── utils.ts                 # Utilities
├── components/                   # Reusable UI components
│   └── ui/                      # shadcn/ui components
├── package.json                 # Dependencies
├── next.config.js               # Next.js config
├── tailwind.config.js           # Tailwind config
└── tsconfig.json                # TypeScript config
```

---

## 🎭 Demo Accounts

After deployment, login with these accounts:

| Email | Password | Role |
|-------|----------|------|
| rina.sari@demo.go.id | demo123 | ASN (Individual User) |
| budi.santoso@demo.go.id | demo123 | Supervisor |
| dr.siti@demo.go.id | demo123 | Committee Chair |

---

## ⚙️ Configuration

### Environment Variables (Optional)

Create `.env.local`:
```env
NEXT_PUBLIC_APP_NAME="GarBaNusa 5.0"
NEXT_PUBLIC_DEMO_MODE="true"
```

### Vercel Settings

Recommended settings in Vercel dashboard:
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node Version**: 18.x

---

## 🛠️ Development

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

---

## 📦 Required Packages

The app uses these key dependencies:

- **next**: 14.2.5 (React framework)
- **react**: 18.3.1
- **typescript**: 5.x
- **tailwindcss**: 3.4.1 (Styling)
- **zustand**: 4.5.2 (State management)
- **lucide-react**: 0.395.0 (Icons)
- **recharts**: 2.12.7 (Charts)

All automatically installed with `npm install`

---

## 🎯 What's Implemented

### ✅ Working Features:
- Login with demo accounts
- ASN Dashboard with merit score
- Career GPS visualization
- Merit Intelligence Dashboard (Committee)
- Simulated AI processing (delays, progress bars)
- Mock data from JSON files
- Responsive design

### ⚠️ Simulated Features:
- AI merit calculation (1.5s delay, pre-computed results)
- Document parsing (2s delay, fake extraction)
- Career recommendations (1s delay, pre-determined)
- All data stored client-side (LocalStorage)

### ❌ Not Implemented (By Design):
- Real backend API
- Real database
- Real AI/ML models
- Multi-user persistence
- Email notifications

---

## 🐛 Troubleshooting

### Build Fails

```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### TypeScript Errors

```bash
# Regenerate types
npx next build

# Skip type checking (not recommended)
# Edit next.config.js:
typescript: {
  ignoreBuildErrors: true
}
```

### Vercel Deployment Fails

1. Check build logs in Vercel dashboard
2. Ensure all dependencies in package.json
3. Verify Next.js version compatibility
4. Try: `npm run build` locally first

---

## 📊 Performance

Expected metrics:
- **Initial Load**: < 2s
- **Page Transitions**: < 500ms
- **AI Simulations**: 1-3s (intentional delay)
- **Lighthouse Score**: > 90

---

## 🔗 Useful Links

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Deployment Guide**: ../01_VERCEL_SETUP_GUIDE.md

---

## 🎉 After Deployment

1. **Test all demo accounts** - Make sure login works
2. **Check mobile view** - Responsive design
3. **Share URL** - Ready for demo!
4. **Practice presentation** - Use 03_PROTOTYPE_DEMO_SCRIPT.md

---

## 💡 Tips

### Before Demo:
- Test in incognito window (clear cache)
- Check loading speed
- Verify all pages work
- Have backup screenshots ready

### During Demo:
- Use ASN account (rina.sari@demo.go.id) first
- Show Career GPS - it's the wow factor
- Switch to Committee account for Merit Dashboard
- Emphasize AI transparency

### For Judges:
- "This is a high-fidelity prototype"
- "AI features simulated to demonstrate UX"
- "Full architecture documented in /Guide folder"
- "Ready to build real version"

---

## 📝 Next Steps

After successful deployment:

1. ✅ Share Vercel URL with team
2. ✅ Test all demo flows
3. ✅ Prepare presentation (03_PROTOTYPE_DEMO_SCRIPT.md)
4. ✅ Gather feedback
5. 🚀 Win the hackathon!

---

## ❓ Need Help?

- Check ../00_PROTOTYPE_OVERVIEW.md for architecture
- Check ../02_AI_SIMULATION_COOKBOOK.md for AI patterns
- Check ../03_PROTOTYPE_DEMO_SCRIPT.md for presentation

---

**Your app is ready to deploy! Run `vercel` in this directory and you're live in minutes! 🚀**

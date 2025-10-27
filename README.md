# GarBaNusa 5.0 - Prototype Application

## 🎯 What This Is

This is a **frontend-only Next.js prototype** of the GarBaNusa 5.0 platform for the ASN Digital AI Hackathon 2025.

**Purpose**: Demonstrate UX and AI transparency features  
**Deployment**: Vercel (free tier)  
**Tech Stack**: Next.js 14, TypeScript, Tailwind CSS  

---

## 🚀 Quick Start

### Deploy to Vercel (Recommended)

```bash
cd garbanusa-app
npm install
vercel
```

That's it! Your app is live.

### Run Locally

```bash
npm install
npm run dev
# Open http://localhost:3000
```

---

## 🎭 Demo Accounts

| Email | Password | Role |
|-------|----------|------|
| rina.sari@demo.go.id | demo123 | ASN |
| budi.santoso@demo.go.id | demo123 | Supervisor |
| dr.siti@demo.go.id | demo123 | Committee |

---

## 📁 Project Status

### ✅ Created:
- Project configuration (package.json, next.config.js, etc.)
- Mock data files (users, training, candidates)
- Basic app structure
- Global styles
- Deployment configuration

### 📝 To Complete:

You need to add these files (use code from `../02_AI_SIMULATION_COOKBOOK.md`):

1. **lib/auth.ts** - Authentication utilities
2. **lib/ai-simulator/delays.ts** - AI simulation delays
3. **lib/ai-simulator/merit-calculator.ts** - Merit calculation
4. **lib/ai-simulator/career-recommender.ts** - Career recommendations
5. **app/login/page.tsx** - Login page
6. **app/dashboard/page.tsx** - ASN Dashboard
7. **app/career-gps/page.tsx** - Career GPS
8. **app/merit-board/page.tsx** - Committee Merit Dashboard
9. **components/ui/*.tsx** - UI components (from shadcn/ui)

### Quick Setup Option:

For shadcn/ui components:
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card badge progress alert
```

---

## 📖 Documentation

- **DEPLOY_README.md** - Complete deployment guide
- **../00_PROTOTYPE_OVERVIEW.md** - Full architecture
- **../01_VERCEL_SETUP_GUIDE.md** - Step-by-step setup
- **../02_AI_SIMULATION_COOKBOOK.md** - Code examples
- **../03_PROTOTYPE_DEMO_SCRIPT.md** - Presentation guide

---

## 🎯 Implementation Priority

### Phase 1: Basic App (2-4 hours)
1. Add authentication (lib/auth.ts)
2. Add login page
3. Add dashboard layout
4. Test login flow

### Phase 2: Key Features (4-6 hours)
1. ASN Dashboard with mock data
2. Career GPS page
3. Merit Board for committee
4. AI simulation utilities

### Phase 3: Polish (2-3 hours)
1. UI components
2. Loading states
3. Mobile responsiveness
4. Final testing

---

## 💡 Quick Tips

### Copy Code from Documentation:

All code examples are in:
- `../02_AI_SIMULATION_COOKBOOK.md` - AI simulation patterns
- `../00_PROTOTYPE_OVERVIEW.md` - Complete examples

### Use shadcn/ui for Components:

```bash
npx shadcn-ui@latest add [component-name]
```

Available components: button, card, badge, dialog, alert, progress, etc.

### Test Before Deploying:

```bash
npm run build
npm start
```

---

## 🐛 Common Issues

**Issue**: TypeScript errors  
**Fix**: Add `// @ts-ignore` or fix types

**Issue**: Missing dependencies  
**Fix**: `npm install [package-name]`

**Issue**: Build fails  
**Fix**: Check console errors, fix imports

---

## 🎉 Ready to Deploy?

1. Complete the missing files (or use minimal versions)
2. Test locally: `npm run dev`
3. Build: `npm run build`
4. Deploy: `vercel`
5. Done! 🚀

---

## 📞 Need Help?

- Check `DEPLOY_README.md` for deployment issues
- Check `../00_PROTOTYPE_OVERVIEW.md` for architecture
- Check `../02_AI_SIMULATION_COOKBOOK.md` for code examples

---

**This app is structured and ready - just add the page implementations and deploy!** 🎯

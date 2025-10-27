# 🚀 Setup Instructions - Run Locally

## Step-by-Step Guide

### 1. Open Terminal

Navigate to the app folder:
```bash
cd /Users/antopucung/Desktop/GarBaNusa/garbanusa-app
```

### 2. Install Dependencies

```bash
npm install
```

**Note**: This might take 2-3 minutes. Wait for it to complete.

### 3. Run Development Server

```bash
npm run dev
```

You should see:
```
  ▲ Next.js 14.2.5
  - Local:        http://localhost:3000
  - Ready in 2.3s
```

### 4. Open in Browser

Open: **http://localhost:3000**

### 5. Login

Use any demo account:
- **Email**: rina.sari@demo.go.id
- **Password**: demo123

---

## ✅ What You Should See

1. **Login Page** - Clean login form with demo accounts
2. **Dashboard** - After login, see:
   - Merit Score: 76/100
   - Profile Completeness: 85%
   - Career Progress: 40%
   - Career path preview
   - Training recommendations

---

## 🧪 Test All Pages

After login as **rina.sari@demo.go.id**:

1. **Dashboard** - `/dashboard` ✅
2. **Career GPS** - Click "View Career GPS →" or go to `/career-gps` ✅
3. **Logout** - Click logout button ✅

Login as **dr.siti@demo.go.id**:
1. **Merit Board** - `/merit-board` ✅
2. **View candidates** - Click on each candidate ✅
3. **See AI justification** - In candidate details ✅

---

## 🐛 Common Issues

### Issue: "Cannot find module"
**Solution**: Make sure npm install completed successfully
```bash
rm -rf node_modules
npm install
```

### Issue: Port 3000 already in use
**Solution**: Use different port
```bash
PORT=3001 npm run dev
```
Then open: http://localhost:3001

### Issue: Page not loading
**Solution**: Wait a few seconds, Next.js is compiling. Check terminal for errors.

### Issue: TypeScript warnings
**Solution**: These are okay for the prototype. App will still run.

---

## 📁 What's Implemented

### ✅ Pages:
- `/` - Redirects to login
- `/login` - Login page with demo accounts
- `/dashboard` - ASN dashboard (rina.sari@demo.go.id)
- `/career-gps` - Career path visualization
- `/merit-board` - Committee merit dashboard (dr.siti@demo.go.id)

### ✅ Features:
- Authentication (LocalStorage)
- Mock data loading
- AI simulation (delays with progress)
- Responsive design
- Navigation
- Logout

### ✅ AI Simulations:
- Career recommendations (1s delay)
- Merit calculation (1.5s delay)
- Progress indicators

---

## 🎯 Next: Deploy to Vercel

Once you confirm it works locally:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

## 💡 Tips

- Keep terminal open while developing
- Refresh browser if something doesn't load
- Check terminal for error messages
- Use Cmd+C in terminal to stop server

---

## ✅ Success Checklist

- [ ] npm install completed without errors
- [ ] npm run dev started successfully
- [ ] Can open http://localhost:3000
- [ ] Login page loads
- [ ] Can login with demo accounts
- [ ] Dashboard shows correctly
- [ ] Career GPS page works
- [ ] Merit Board page works (committee login)
- [ ] Logout works

---

**If all checked ✅ - You're ready to deploy to Vercel!** 🎉

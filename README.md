# 🎽 I Am GDG Noida — Photo Booth

A production-ready, mobile-first photo booth web application for GDG Noida events. Attendees scan a QR code, open their browser, allow camera access, and can "wear" the GDG Noida jersey virtually using MediaPipe face detection.

---

## ✨ Features

- **MediaPipe Face Detection** — real-time face tracking to position the jersey naturally
- **Live Jersey Overlay** — GDG Noida jersey placed below the user's face, scaled to fit
- **3-2-1 Countdown** — before capture with camera flash effect
- **Confetti celebration** — Google-color confetti on photo capture
- **Branding overlay** — GDG Noida logo, tagline, and #IAmGDGNoida on every photo
- **Download + Instagram Story** — one-tap download + Instagram Story instructions
- **Participant counter** — shows live selfie count (localStorage)
- **Works offline** — fully client-side, no backend needed
- **Mobile-first** — tested on Chrome Android + Safari iPhone

---

## 🚀 Quick Start (Deploy Tonight)

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Install dependencies
```bash
cd gdg-noida-photobooth
npm install
```

### 2. Add the Jersey Image
The jersey image is already placed at:
```
public/jersey.jpeg
```
If you want to use a different image or a PNG with transparency:
- Replace `public/jersey.jpeg` with your file
- Update the `src` references in `src/components/CameraView.tsx` and `src/hooks/usePhotoCapture.ts`
- **For best results**: Use a PNG with transparent background (remove bg.remove or remove.bg)

### 3. Run locally
```bash
npm run dev
```
Open `http://localhost:3000` on your phone (same WiFi network using your machine's local IP).

### 4. Deploy to Vercel (Recommended — Free, Fast)
```bash
npm install -g vercel
vercel
```
Or connect your GitHub repo at [vercel.com](https://vercel.com) and deploy in 2 minutes.

---

## 📁 Project Structure

```
gdg-noida-photobooth/
├── public/
│   ├── jersey.jpeg          ← GDG Noida jersey (YOUR IMAGE)
│   └── manifest.json        ← PWA manifest
├── src/
│   ├── app/
│   │   ├── globals.css      ← Global styles + animations
│   │   ├── layout.tsx       ← HTML head, fonts, meta tags
│   │   └── page.tsx         ← Entry point
│   ├── components/
│   │   ├── PhotoBooth.tsx   ← Main orchestrator
│   │   ├── WelcomeScreen.tsx← Landing screen
│   │   ├── CameraView.tsx   ← Camera + jersey overlay + countdown
│   │   ├── PhotoResult.tsx  ← Captured photo + share actions
│   │   ├── CameraError.tsx  ← Permission error screen
│   │   └── GDGLogo.tsx      ← SVG logo + color bar
│   └── hooks/
│       ├── useCamera.ts     ← getUserMedia, stream management
│       ├── useFaceDetection.ts ← MediaPipe face tracking
│       ├── usePhotoCapture.ts  ← Canvas composition + download
│       └── useConfetti.ts   ← Google-color confetti
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## 🎽 Jersey Image Tips

**Best result**: Use a PNG with transparent background.

To remove the background from your jersey image for free:
1. Go to [remove.bg](https://www.remove.bg) or [PhotoRoom](https://www.photoroom.com)
2. Upload `GDG_Noida_jersey.jpeg`
3. Download the transparent PNG
4. Save as `public/jersey.png`
5. Update two lines:
   - `src/components/CameraView.tsx` → `img.src = "/jersey.png"`
   - `src/hooks/usePhotoCapture.ts` → `img.src = "/jersey.png"`

---

## 📱 Sharing QR Code at Event

After deploying to Vercel, you'll get a URL like:
`https://gdg-noida-photobooth.vercel.app`

Generate a QR code at [qr-code-generator.com](https://www.qr-code-generator.com) or [qrcode-monkey.com](https://www.qrcode-monkey.com) with GDG branding.

Print it on:
- Event banner / standee
- Swag table card
- Digital display

---

## ⚙️ Configuration

### Participant Counter
The counter persists in `localStorage`. To reset between events:
```javascript
localStorage.removeItem('gdg_noida_photo_count');
```

### Jersey Position Tuning
In `src/hooks/useFaceDetection.ts`, adjust these constants:
```typescript
const jerseyWidth = faceW * 3.2;   // wider = bigger jersey
const jerseyHeight = jerseyWidth * 1.1; // aspect ratio
const jerseyY = faceY + faceH * 0.75;  // 0.75 = overlap with chin
```

### Countdown Duration
In `src/components/CameraView.tsx`:
```typescript
const COUNTDOWN_SECONDS = 3; // change to 5 for more time
```

---

## 🌐 Environment Variables

None required! Fully client-side.

---

## 📊 Performance

- **No backend** — zero server costs
- **MediaPipe loaded from CDN** — cached after first visit
- **Canvas-based compositing** — runs at 30fps on mid-range phones
- **Handles 200+ concurrent users** — each session is independent

---

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| Camera not working on iPhone | Must be served over **HTTPS** (Vercel does this automatically) |
| Face not detected | Ensure good lighting; face needs to be clearly visible |
| Jersey position off | Adjust `jerseyY` multiplier in `useFaceDetection.ts` |
| Instagram button not working | App downloads photo first; user manually uploads |
| White screen on load | Check browser console; likely a CSP issue |

---

## 🎨 Branding

- **Colors**: Google Blue `#4285F4`, Red `#EA4335`, Yellow `#FBBC04`, Green `#34A853`
- **Fonts**: Exo 2 (display), DM Sans (body), JetBrains Mono (code)
- **Theme**: Dark tech-event aesthetic with grid background and glow effects

---

## 📄 License

Built for GDG Noida. Free to use and modify for GDG events.

---

*Built with ❤️ for GDG Noida • Learn • Build • Connect*

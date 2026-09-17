# Netra Screen — Frontend

React + TypeScript + Tailwind implementation of the supplied `dr-screening-mockup-v5.html`.

## What is implemented

- Dashboard matching the supplied wireframe structure
- Patient details → image upload → review → analysis → rejected-image flow
- JPEG/PNG upload, 15 MB client-side validation
- FastAPI integration at `POST /api/predict` with multipart field `file`
- Response normalization layer in `src/api.ts` that accepts either shape:
  - the real backend's current response (`prediction`, Title Case probability keys like `"No DR"`, FastAPI's default `{ detail }` error shape)
  - the originally frozen contract (`severity`, snake_case probability keys, `{ error }`)
  Everything downstream of `predictImage()` only ever sees the normalized (`severity`, snake_case, `error`) shape — components don't need to know which backend version they're talking to.
- 5-class ICDR display, probability bars, referral messaging
- Original/Grad-CAM toggle; real heatmap is shown automatically when `heatmap_url` exists
- Demo mode for UI work before backend deployment
- **Dev-only rejection test**: append `?reject=1` to the URL to force the "Image couldn't be graded" branch without needing a live backend that actually rejects an image. Remove this from `api.ts` once the real backend is stable.
- **Referral slip vs full report are now distinct print outputs.** "Referral slip" prints a compact patient-facing handout (name, ID, grade, referral recommendation, sign lines). "Print / PDF" prints the full two-column technical report. Both use the browser's native print dialog — see `printAs()` in `App.tsx` and the `@media print` rules in `index.css`.
- Responsive layout for laptop/tablet/mobile

## Known backend integration notes

The backend (`AI-Diabetic-Retinopathy-Screening-Backend`) currently:
- Returns `prediction` instead of `severity` — handled by `api.ts`.
- Returns probability keys as `"No DR"`, `"Mild"`, etc. (Title Case, matching `CLASS_NAMES`) instead of snake_case — handled by `api.ts`.
- Returns failures as FastAPI's default `{"detail": "..."}` via `HTTPException(400, ...)` rather than `{"success": false, "error": "..."}` — handled by `api.ts`.
- **Has no CORS middleware yet.** Requests from this frontend will be blocked by the browser until `CORSMiddleware` is added to the backend's `main.py`. This cannot be fixed from the frontend side — flag it to the backend owner.

If the backend is later updated to match the originally frozen contract exactly, `api.ts` will continue to work unchanged — the normalization is a no-op on already-correct data.

## GitHub Codespaces

```bash
npm install
cp .env.example .env
npm run dev
```

Open the forwarded port 5173.

For UI-only work:
```env
VITE_DEMO_MODE=true
```

For the FastAPI backend:
```env
VITE_DEMO_MODE=false
VITE_API_BASE_URL=http://localhost:8000
```

If frontend and backend are in the same Codespace, run the backend on port 8000 and forward both ports.

## Branch

```bash
git checkout -b frontend
git add .
git commit -m "feat: Netra Screen frontend (mockup v5 parity) + backend response normalization"
git push -u origin frontend
```

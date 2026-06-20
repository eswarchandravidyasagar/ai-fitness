# AI Fitness Coach

Free browser-based fitness coach with **live camera pose tracking**, rep/set counting, form cues, and voice feedback. Runs entirely on your device — no API keys, no video upload.

**Live demo:** `https://<your-username>.github.io/ai-fitness/`

## Features

- Real-time skeleton overlay via [MediaPipe Pose Landmarker](https://developers.google.com/mediapipe/solutions/vision/pose_landmarker)
- Rep counting with joint-angle state machines
- Voice form cues via Web Speech API
- Exercises: push-ups, squats, pull-ups, lunges, plank
- Set tracking with rest timer
- Static Next.js site — host free on GitHub Pages

## Privacy

Your camera feed is processed locally in the browser. No frames are sent to any server after the pose model is downloaded.

## Camera setup

| Exercise | Best camera angle |
|----------|-------------------|
| Push-ups | Side view, full body |
| Squats | Side or 45°, hips to ankles visible |
| Pull-ups | Side view, arms and upper body |
| Lunges | Side view, both legs |
| Plank | Side view, full profile |

Prop your phone against something stable. Good lighting and fitted clothing improve accuracy.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Camera requires HTTPS in production; `localhost` is allowed for dev.

## Deploy to GitHub Pages

1. Create a repo named `ai-fitness` (or update `repo` in `next.config.ts`)
2. Push to `main`
3. Enable **Settings → Pages → Build and deployment → GitHub Actions**
4. The workflow in `.github/workflows/deploy.yml` builds and deploys `out/`

## Tech stack

- Next.js (App Router, static export)
- TypeScript
- Tailwind CSS
- MediaPipe `@mediapipe/tasks-vision`

## Disclaimer

Form feedback is heuristic, not professional coaching or medical advice. Always train safely.

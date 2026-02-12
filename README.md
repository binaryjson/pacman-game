# Dot Chomper — Maze Chase Game

A browser-based maze chase game. Collect dots, avoid ghosts, eat power pellets to turn the tables, and clear the board to advance.

## How to play

- **Move:** Arrow keys or W / A / S / D  
- **Goal:** Eat all dots and power pellets (big white dots)  
- **Power pellets:** Turn ghosts blue for a few seconds — you can eat them for 200 points each  
- **Tunnel:** Row 14 has a tunnel — exit one side to wrap to the other  

## Run locally

Open `index.html` in a browser, or serve the folder with any static server:

```bash
# Python 3
python3 -m http.server 8000

# Node (npx)
npx serve .
```

Then visit `http://localhost:8000`.

---

## Publishing for free

Here are solid **free** options to host and share your game.

### 1. **GitHub Pages**
- **Cost:** Free  
- **Best for:** Simple static sites, open source  
- **Steps:** Create a repo → push your game → Settings → Pages → source: main branch, `/ (root)` or `/docs`  
- **URL:** `https://<username>.github.io/<repo>/`  
- **Pros:** No signup beyond GitHub, custom domain possible  
- **Cons:** Repo is public unless you use a paid plan  

### 2. **Netlify**
- **Cost:** Free tier (generous)  
- **Steps:** Sign up at [netlify.com](https://netlify.com) → “Add new site” → “Deploy manually” (drag the `pacman-game` folder) or connect a Git repo  
- **URL:** `https://random-name-123.netlify.app` or your custom domain  
- **Pros:** Instant deploys, HTTPS, optional form handling and serverless  
- **Cons:** Free tier has bandwidth/site limits  

### 3. **Vercel**
- **Cost:** Free for hobby  
- **Steps:** Sign up at [vercel.com](https://vercel.com) → “New Project” → import from Git or upload  
- **URL:** `https://your-project.vercel.app`  
- **Pros:** Fast CDN, great for static/JS apps  
- **Cons:** Same idea as Netlify; pick one unless you need both  

### 4. **Cloudflare Pages**
- **Cost:** Free  
- **Steps:** [dash.cloudflare.com](https://dash.cloudflare.com) → Pages → Create project → connect Git or direct upload  
- **URL:** `https://<project>.pages.dev`  
- **Pros:** Global CDN, generous limits, DDoS protection  
- **Cons:** Slightly more “infra” feel than Netlify/Vercel  

### 5. **itch.io**
- **Cost:** Free to publish; you can charge or keep games free  
- **Steps:** Create account at [itch.io](https://itch.io) → “Create new project” → upload a ZIP of your game **or** link to a web URL (e.g. your GitHub Pages / Netlify URL)  
- **URL:** `https://yourname.itch.io/dot-chomper`  
- **Pros:** Built for games, discovery, optional payments  
- **Cons:** If you upload a ZIP, players download; for “play in browser” use “External link” to your hosted URL  

### Recommendation

- **Easiest:** Push to GitHub and turn on **GitHub Pages** (no extra accounts if you already use GitHub).  
- **Best for “game” audience:** Host the game on **Netlify** or **Vercel**, then add a “Play” link on **itch.io** pointing to that URL so people can find and play it in the browser for free.

All of these options let you publish and share the game for free.

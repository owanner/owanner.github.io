# Windows XP Style Portfolio 🖥

A mini "operating system" built entirely with **HTML, CSS, and vanilla JavaScript** (no frameworks, no build tools, no backend). It runs directly on **GitHub Pages**.

## Project Structure

```
/
├── index.html          → desktop layout, windows, and taskbar
├── css/
│   └── style.css       → all styling (XP theme, animations, responsiveness)
├── js/
│   └── desktop.js      → application logic (open/close/drag windows, clock, Start menu)
├── assets/
│   ├── wallpaper.jpg   → desktop wallpaper
│   ├── avatar.png      → your profile picture
│   └── xp-icons/       → optional folder for additional icons
└── resume.pdf          → your résumé in PDF format
```

## Customization

1. **Wallpaper:** Replace `assets/wallpaper.jpeg` with any image you like (keep the same filename, or update the path in `css/style.css` under `body { background-image: ... }`).

   The project includes a sample wallpaper generated automatically (a sky and green hill inspired by the classic Windows XP "Bliss" wallpaper).

2. **Avatar:** Replace `assets/avatar.png` with your own profile picture.

3. **Résumé:** Replace `resume.pdf` with your actual résumé while keeping the same filename. The **Resume** button will automatically open this file in a new browser tab.

4. **Content:** All window content (About, Experience, Skills, Projects, Contact) is written directly inside `index.html`, within each `<div class="xp-window">`. Feel free to edit the text as needed.

5. **Colors:** Theme colors are centralized at the top of `css/style.css` inside the `:root { ... }` block. Changing a variable there updates the entire website.

6. **Icons:** Desktop icons use emojis (🖥 📄 💼 ⚙ 🧪 📧) by default, so no external image files are required. If you'd like authentic Windows XP-style icons, place your `.png` or `.ico` files inside `assets/xp-icons/` and replace the corresponding `<span class="icon-emoji">` with an `<img src="assets/xp-icons/your-icon.png">` tag.

## How It Works (For Beginners)

- **`index.html`** contains the entire page structure: desktop icons, windows (initially hidden using the `hidden` class), the Start menu, and the taskbar.
- **`css/style.css`** is organized into numbered sections (reset, desktop, windows, Start menu, taskbar, animations, responsiveness), each with comments explaining its purpose.
- **`js/desktop.js`** is composed of small, independent functions, each with a single responsibility: `openWindow()`, `closeWindow()`, `minimizeWindow()`, `focusWindow()`, `makeWindowDraggable()`, and more.

If you're new to the project, start reading from the comment **`1. REFERENCES TO PAGE ELEMENTS`** at the top of the JavaScript file.

## Running Locally

Some browsers restrict certain features when opening `index.html` directly via `file://`. The recommended approach is to serve the project using a simple local web server.

If you have Python installed:

```bash
# From the project folder
python3 -m http.server 8000
```

Then open:

```
http://localhost:8000
```

in your browser.

## Deploying to GitHub Pages

1. Create a GitHub repository and upload all project files while preserving the folder structure.
2. Go to **Settings → Pages** in your repository.
3. Under **Source**, select the `main` (or `master`) branch and the `/root` folder.
4. Save your changes. After a few minutes, your website will be available at:

```
https://your-username.github.io/repository-name/
```

Since the project is **100% static** (no build process and no external dependencies other than system fonts), no additional deployment steps are required.
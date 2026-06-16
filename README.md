# 🔐 PassNova
> A sleek, advanced password generator built with vanilla HTML, CSS, and JavaScript — featuring real-time strength analysis, toast notifications, and a beautiful glassmorphism UI.

**Live Demo → [adityakbharti-passnova.netlify.app](https://adityakbharti-passnova.netlify.app)**

---

## ✨ Features

- ⚡ **Instant generation** — strong, randomized passwords at the click of a button (or `Ctrl + G`)
- 🛡️ **Strength analyzer** — real-time scoring across 5 levels: Very Weak → Very Strong
- 🎛️ **Full customization** — toggle Uppercase, Lowercase, Numbers, and Symbols independently
- 📏 **Adjustable length** — slider from 4 to 50 characters with live display
- 📋 **One-click copy** — clipboard support with fallback for older browsers
- 🔔 **Toast notification system** — animated feedback for every action (success, error, warning, info)
- 🎨 **Glassmorphism UI** — frosted-glass card, animated background blobs, smooth transitions
- 📱 **Fully responsive** — works seamlessly on mobile, tablet, and desktop
- ♿ **Accessible** — focus-visible outlines, `prefers-reduced-motion` support, high-contrast mode

---

## 🗂️ Project Structure

```
Password-Generator/
├── index.html         # Main app structure and layout
├── PasswordGen.css    # Glassmorphism styles, animations, responsive design
├── PasswordGen.js     # PasswordGenerator, ToastManager, and UI controller classes
└── copy.png           # Copy-to-clipboard icon
```

---

## 🛠️ Tech Stack

| Technology | Usage |
|---|---|
| HTML5 | Semantic structure and layout |
| CSS3 | Glassmorphism, animations, responsive design |
| JavaScript (ES6+) | Password logic, strength scoring, clipboard API |
| [Bootstrap Icons](https://icons.getbootstrap.com/) | Footer social icons |

---

## 🧠 How It Works

### Password Generation
The `PasswordGenerator` class builds a character set based on selected options, guarantees at least one character from each enabled type, fills remaining length randomly, then **shuffles** the result for true randomness.

### Strength Scoring
Passwords are scored out of 100 based on length, character variety (lowercase, uppercase, numbers, symbols), and a bonus for 16+ character passwords — mapped to five strength levels with color-coded feedback.

### Toast System
The `ToastManager` class dynamically creates and manages animated toast notifications with auto-dismiss timers, progress bars, and four types: `success`, `error`, `warning`, and `info`.

---

## ⌨️ Keyboard Shortcut

| Shortcut | Action |
|---|---|
| `Ctrl + G` | Generate a new password |
| Click password field | Copy password (on mobile) |

---

## 🚀 Run Locally

No build tools needed — pure vanilla project.

```bash
git clone https://github.com/aditya-k-bharti/Password-Generator.git
cd Password-Generator
```

Then open `index.html` in your browser, or use a local server:

```bash
# With VS Code → Live Server extension (recommended)
# OR with Python
python -m http.server 8000
```

---

## 📸 Pages

| File | Description |
|---|---|
| `index.html` | Main password generator interface |

---

## 🙌 Author

**Aditya Kumar Bharti**

[![GitHub](https://img.shields.io/badge/GitHub-aditya--k--bharti-181717?style=flat&logo=github)](https://github.com/aditya-k-bharti)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-aditya--kumar--bharti-0077B5?style=flat&logo=linkedin)](https://linkedin.com/in/aditya-kumar-bharti-dev-6214b6354)

---

## 📄 License

MIT License — feel free to fork, modify, and use.

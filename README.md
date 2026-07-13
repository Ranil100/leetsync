<div align="center">

# 🔄 LeetSync

**Automatically sync your LeetCode accepted solutions to GitHub**

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](.)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-green?style=for-the-badge)](manifest.json)

</div>

---

## ✨ What it does

Every time you get an **Accepted** submission on LeetCode, LeetPush automatically pushes your solution to a GitHub repository — no copy-pasting, no manual commits.

```
DSA-practice/
├── 257-binary-tree-paths/
│   ├── solution.py       ← your code
│   └── README.md         ← problem description + stats
├── 1-two-sum/
│   ├── solution.py
│   └── README.md
└── ...
```

---

## 🚀 Installation

### 1. Clone this repo
```bash
git clone https://github.com/YOUR_USERNAME/leetpush.git
```

### 2. Load into Chrome
1. Go to `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the cloned folder

### 3. Get a GitHub Token
1. Go to [github.com/settings/tokens/new](https://github.com/settings/tokens/new)
2. Name it `LeetPush`, check the **`repo`** scope
3. Click **Generate token** and copy it

### 4. Configure the extension
1. Click the LeetPush icon in Chrome toolbar
2. Go to **Settings**
3. Paste your token and enter your repo as `username/repo-name`
4. Click **Save Settings** → **Test Connection**

---

## 🎯 How it works

1. `inject.js` is injected into the LeetCode page context and intercepts `window.fetch` before React captures it
2. When a submit POST is detected, it captures the `submissionId`
3. `content.js` polls `leetcode.com/submissions/detail/{id}/check/` until the result is `SUCCESS`
4. If `status_msg === "Accepted"`, it pushes the solution and README directly to GitHub via the Contents API
5. `background.js` shows a Chrome notification on success/failure

---

## 📁 Project Structure

```
leetpush/
├── manifest.json          # Chrome Extension config (MV3)
├── popup.html             # Extension popup UI
├── icons/                 # Extension icons
└── src/
    ├── inject.js          # Page-context fetch interceptor
    ├── content.js         # Submission detection + GitHub push
    ├── background.js      # Chrome notifications
    └── popup.js           # Settings UI logic
```

---

## 🛠️ Features

- ✅ Auto-detects accepted submissions
- 📁 Folder per problem: `257-binary-tree-paths/`
- 📝 Auto-generates README with problem description
- 🌐 Supports 15+ languages (Python, JS, Java, C++, Go, Rust...)
- 📊 Dashboard with solve count, today's count, streak
- 🔔 Chrome notifications on push
- 🔒 Token stored locally, never sent anywhere except GitHub API

---

## 🤝 Contributing

Pull requests are welcome! If LeetCode updates their API or DOM and something breaks, please open an issue.

---



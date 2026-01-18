# Physics Illustrator (DrawPhy) - Local Usage Guide

這是一個基於 React + Vite 開發的物理繪圖工具。由於使用了現代網頁技術 (ES Modules)，因此**不能**直接雙擊 `index.html` 開啟，必須透過本地伺服器 (Localhost) 執行。

## 快速啟動 (Windows)

1.  確保電腦已安裝 [Node.js](https://nodejs.org/) (建議 LTS 版本)。
2.  雙擊資料夾中的 **`start_app.bat`**。
    *   如果是第一次執行，它會自動安裝所需的套件 (需要一點時間)。
    *   安裝完成後，會自動開啟瀏覽器並進入程式 (預設網址通常是 `http://localhost:5173`)。

## 手動啟動 (Terminal)

如果您習慣使用指令列：

1.  開啟終端機 (CMD / PowerShell) 並進入專案資料夾。
2.  安裝依賴套件 (僅需一次)：
    ```bash
    npm install
    ```
3.  啟動開發伺服器：
    ```bash
    npm run dev
    ```
4.  按住 Ctrl 並點擊終端機顯示的 Local網址 (例如 `http://localhost:5173`)。

## 功能簡介
*   **拖曳**: 移動物件 (彈簧端點、滑輪中心等)。
*   **Ctrl 鍵**: 按住可暫時停用吸附 (Snapping)。
*   **工具列**:上方按鈕可新增彈簧、繩索、物塊等物件。
*   **屬性面板**: 點選物件後，右側可調整顏色、參數。
*   **刪除**: 選取物件後按 Delete 鍵。


Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

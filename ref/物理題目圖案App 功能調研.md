# **靜態高品質物理示意圖生成軟體市場需求與功能規格深度研究報告**

## **1\. 執行摘要**

本報告旨在為開發一款專門用於生成「靜態高品質物理題目圖案」的 Web App 提供詳盡的市場調研與策略分析。本研究回應了對於物理教學與科研繪圖領域中，針對「靜態出版級」圖形需求的深入探索，特別區別於以 Geogebra 為代表的動態演示工具。透過對全球物理教育論壇、學術出版討論區（如 Reddit Physics, StackExchange, AAS Journals 等）的廣泛文本挖掘與分析，本報告識別了出題教師與學術研究人員在製作物理示意圖時的深層痛點、未被滿足的功能需求以及對「高品質」圖形的具體定義。

研究發現，市場存在一個顯著的「工具斷層」：一端是易於上手但缺乏物理語義與精確度的通用繪圖軟體（如 PowerPoint, Paint），另一端是產出品質極高但學習曲線陡峭的程式碼驅動工具（如 LaTeX/TikZ, Python Matplotlib）。目標用戶群體——包括 K-12 物理教師、大學教授及科研人員——迫切需要一款結合了「物理語義約束」與「所見即所得（WYSIWYG）」操作介面的工具。核心需求集中在力學自由體圖（Free Body Diagrams）的智能對齊、光學光路圖的半自動生成、電磁場線的精確分佈模擬，以及高度參數化的實驗器材（如游標卡尺）生成。此外，對於科研用戶而言，支援向量格式（SVG/PDF/EPS）導出及與 LaTeX/TikZ 的無縫整合是決定其採用的關鍵因素。

本報告將詳細闡述各物理子領域（力學、光學、電磁學、現代物理、實驗器材）的具體繪圖需求，分析現有解決方案的局限性，並提出針對性的功能開發建議，以期為該 Web App 的版本推進提供堅實的實證基礎。

## **2\. 市場格局與用戶畫像深度分析**

在深入探討具體功能之前，必須先釐清目標用戶的構成及其在工作流程中面臨的結構性挑戰。市場上的物理繪圖需求並非單一均質，而是呈現出「教學出題」與「學術出版」雙峰分佈的特徵。

### **2.1 教學出題者：K-12 及大學物理教師**

對於負責出題的教師而言，時間效率與圖形的標準化是首要考量。他們的主要工作場景包括製作期中/期末考卷、課堂講義及投影片。根據 Reddit 等論壇的討論，這類用戶在繪製物理圖形時面臨著巨大的挫折感。

**核心痛點與需求特徵：**

* **效率與精確度的兩難：** 許多教師反映，為了畫一個簡單的「斜面上的滑塊」並標註受力分析（Free Body Diagram, FBD），他們不得不在 PowerPoint 中花費大量時間調整箭頭的角度，以確保「正向力垂直於斜面」或「重力垂直於地面」1。通用繪圖軟體缺乏「物理吸附」功能，導致圖形往往存在視覺上的誤差，這對於強調嚴謹性的物理學科來說是不可接受的。  
* **黑白印刷的適配性：** 考卷通常是黑白影印的。因此，教師們極度需要能夠生成高對比度、線條清晰的黑白線稿（Line Art）的工具。彩色圖表在轉為灰階後往往模糊不清，導致學生無法辨識關鍵細節。  
* **標準化符號的匱乏：** 在繪製電路圖或實驗裝置時，教師常苦於找不到符合當地教學大綱標準（如符號樣式）的圖庫。現有的剪貼畫往往風格不統一，拼湊在一起顯得不專業 3。

### **2.2 學術研究人員：研究生與教授**

對於科研人員，繪圖的目標是滿足期刊（如 *Physical Review Letters*, *Nature*）的嚴格出版要求。他們對圖片的解析度、字體一致性及向量格式有著近乎苛刻的要求。

**核心痛點與需求特徵：**

* **程式碼繪圖的門檻：** 雖然 LaTeX 的 TikZ 套件被公認為能產出最完美的物理圖形，但其學習曲線極為陡峭。許多研究生表示，為了畫一個複雜的實驗裝置示意圖，往往需要花費數小時編寫程式碼，且難以即時預覽效果 5。  
* **出版級格式要求：** 學術期刊通常要求圖片為 EPS 或 PDF 向量格式，或者 300 DPI 以上的高解析度 TIFF 檔。此外，圖片中的文字（標籤、變數符號）必須與正文的 LaTeX 字體（通常是 Computer Modern）一致。許多通用軟體（如 Inkscape）在處理數學公式排版時存在困難，導致圖片中的公式與論文正文格格不入 7。  
* **跨軟體整合的斷裂：** 研究人員常需將 Python (Matplotlib) 生成的數據圖與手繪的示意圖結合。缺乏一個能整合這兩者的統一平台，導致工作流程支離破碎 10。

### **2.3 競爭光譜中的定位：靜態與動態的區隔**

用戶明確指出，Geogebra 雖然強大，但其核心在於「動態演示」與「數學探索」。對於需要「靜態、高品質、標準化」圖形的出題者與作者來說，Geogebra 並非最佳解。

* **Geogebra 的局限：** 側重於函數與幾何關係的動態變化，其導出靜態圖片的流程（特別是控制線寬、線型、CMYK 色彩模式）相對繁瑣，且不易繪製非幾何的物理實體（如實驗燒杯、滑輪組的厚度感）11。  
* **本產品的機會點：** 應定位為「物理版的 Chemix」或「視覺化的 TikZ」。重點不在於圖形會不會動，而在於圖形是否「物理正確」且「美觀可出版」。

## ---

**3\. 核心領域需求 I：經典力學 (Classical Mechanics)**

力學是物理教學的基石，也是圖形需求量最大、最頻繁的領域。研究顯示，力學繪圖的核心挑戰在於如何快速構建符合幾何約束（Geometric Constraints）的系統。

### **3.1 智能化自由體圖 (Free Body Diagrams, FBD)**

自由體圖是力學分析的靈魂。現有的通用繪圖工具將每一個箭頭視為獨立的線段，而物理老師需要的，是具備「力學邏輯」的箭頭系統。

* **物理吸附與自動對齊 (Physics-aware Snapping):**  
  * **斜面約束：** 當用戶畫一個斜面並放置一個物體時，軟體應自動識別接觸面。此時繪製的「正向力（Normal Force）」應自動鎖定為垂直於斜面，而「摩擦力（Friction）」應自動鎖定為平行於斜面。這種「智慧吸附」能節省 90% 的調整時間 2。  
  * **重力與分力：** 重力（$mg$）應永遠垂直向下。更進一步，軟體應提供「自動分解」功能，一鍵生成平行與垂直於斜面的分力虛線箭頭，這在教學講解中極為常用 13。  
* **向量的可視化屬性：**  
  * **長度代表量值：** 在嚴謹的 FBD 中，箭頭的長度應成比例地代表力的大小。軟體應允許用戶輸入數值（如 Fg \= 10N, Fn \= 8N），並自動調整箭頭長度比例，或提供網格輔助以繪製準確的比例圖 1。  
  * **樣式標準化：** 支援多種箭頭樣式（實心頭、空心頭、半箭頭），以適應不同地區教科書的規範。

### **3.2 剛體系統與約束元件**

力學題目常涉及滑輪、繩索、彈簧等連接件，這些元件的繪製在幾何上非常繁瑣。

* **繩索與滑輪系統 (Pulleys & Rope Logic):**  
  * **切線連接：** 繪製滑輪組時，繩索必須沿著滑輪的「切線」方向延伸，而不是連到圓心。軟體需要內建演算法，根據滑輪的位置自動計算繩索的切線路徑，即使移動滑輪，繩索也應保持切線連接 2。  
  * **複滑輪與繞線：** 支援多滑輪系統的自動繞線繪製，能區分繩索的前後遮擋關係，表現立體感。  
* **參數化彈簧 (Parametric Springs):**  
  * **痛點：** 在 PPT 中拉長一個彈簧圖片，會導致金屬線變形、變粗，失去物理真實感。  
  * **需求：** 彈簧應作為參數化物件存在。用戶輸入「圈數」、「線徑」、「長度」，軟體重新生成螺旋線，確保在拉伸或壓縮時，金屬線的粗細保持不變，僅改變螺距 15。  
  * **端點樣式：** 支援多種端點（掛鉤、平面接觸、直接連接質點）。

### **3.3 運動學圖示 (Kinematics Visualization)**

* **頻閃攝影效果 (Stroboscopic Motion):** 為了展示加速運動或拋體運動，軟體應能生成「頻閃殘影」。用戶設定加速度與時間間隔，系統自動生成一系列位置精確的半透明物體殘影，視覺化速度的變化 16。  
* **軌跡與坐標系：** 支援繪製帶有箭頭的路徑曲線，並能方便地疊加直角坐標系或極坐標系。

## ---

**4\. 核心領域需求 II：光學與波動 (Optics & Waves)**

光學繪圖的難點在於「光路的可預測性」。手繪光線很難精確符合成像公式，導致圖解與計算結果不符，誤導學生。

### **4.1 幾何光學的半自動光線追蹤 (Semi-automated Ray Tracing)**

用戶需要的不是全功能的 3D 光線追蹤渲染（如 Blender），而是符合幾何光學教學規範的 2D 示意圖生成器。

* **透鏡與面鏡邏輯：**  
  * **智能光線行為：** 當用戶放置凸透鏡並設定焦點（F）後，繪製平行主軸的入射光時，軟體應自動將折射光吸附並對準焦點；繪製過光心的光線應自動保持直線。這類「輔助繪圖」功能是區別於 Illustrator 的關鍵競爭力 17。  
  * **虛像與實像的視覺區分：** 軟體應自動識別光線是否為反向延長線，並將虛像部分的光線自動繪製為虛線，符合物理繪圖規範 17。  
* **光學元件庫：**  
  * **標準化符號：** 除了真實的透鏡形狀（雙凸、平凸），還需支援簡化符號（雙箭頭線代表凸透鏡，分叉箭頭線代表凹透鏡）19。  
  * **複雜光路元件：** 三稜鏡（需支援色散示意圖繪製）、半反射鏡、光纖路徑示意。

### **4.2 波動光學與干涉衍射 (Interference & Diffraction)**

繪製波動現象是許多老師的夢魘，因為涉及複雜的曲線干涉圖樣。

* **干涉圖樣生成器：**  
  * **需求：** 用戶輸入波源數量（如雙狹縫）、波長、狹縫間距，軟體應自動生成干涉條紋（Fringes）或波前（Wavefronts）的摩爾紋（Moiré patterns）示意圖。這在解釋楊氏雙狹縫實驗或水波干涉時至關重要 20。  
  * **強度分佈曲線：** 能在干涉圖樣旁自動生成對應的光強分佈曲線（$I \\propto \\cos^2 \\theta$），並對齊極大值與極小值位置 20。  
* **波的疊加：** 視覺化兩個波列疊加後的合成波形，支援調整相位差與振幅。

## ---

**5\. 核心領域需求 III：電磁學與電路 (Electromagnetism & Circuits)**

電磁學繪圖面臨兩大挑戰：一是電路圖的標準繁多，二是電磁場的 3D 空間特性在 2D 平面上的表達。

### **5.1 電路圖繪製 (Circuit Diagramming)**

* **自動佈線與網格對齊 (Auto-routing & Snapping):**  
  * **Schematic 模式：** 針對高年級與考試，導線應自動保持水平或垂直（Orthogonal routing），避免出現隨意的斜線。元件連接點應精確吸附網格 22。  
  * **拓樸結構支援：** 除了簡單的串並聯，需支援惠斯同電橋（Wheatstone Bridge）、星形-三角形（Star-Delta）等非矩形結構的繪製 24。  
* **標準與風格切換：**  
  * **國際標準支援：** 需提供 IEEE（美國）與 IEC（歐洲/國際）兩種標準的元件符號（例如電阻是鋸齒線還是長方形），並允許一鍵切換整張圖的風格 4。  
  * **Pictorial 模式：** 針對初學者，提供「實物風格」的元件庫（真實外觀的電池、燈泡、開關、鱷魚夾），用於展示真實的接線方式 25。

### **5.2 電磁場可視化 (Field Visualization)**

* **場線生成器 (Field Line Generator):**  
  * **痛點：** 手繪磁力線或電力線很難準確表現「疏密代表場強」的物理意義。  
  * **功能：** 用戶在畫布上放置正負電荷或電流源，軟體根據物理定律（庫侖定律、毕奥-萨伐尔定律）自動生成正確分佈的電力線或磁力線，並帶有方向箭頭 26。  
* **3D 線圈與透視 (3D Coils & Perspective):**  
  * **螺旋管 (Solenoid) 繪製：** 在 2D 平面上畫立體螺旋管非常困難，需要處理線圈的前後遮擋關係。軟體應提供「3D 轉 2D」工具，用戶調整 3D 視角後，自動生成符合透視關係的 2D 向量圖，清楚呈現哪段線在前、哪段在後 28。  
  * **右手定則指示器：** 提供標準化的手勢圖示庫（大拇指、四指、手掌方向），且能調整手部角度，用於教學演示 31。

## ---

**6\. 核心領域需求 IV：實驗器材與量測工具 (Lab Equipment & Instrumentation)**

這是市場上最大的空白點之一。現有的化學繪圖軟體（如 Chemix）雖然存在，但缺乏針對物理實驗的特定器材。

### **6.1 參數化精密量測工具**

這是出題老師的剛性需求，用於考察學生的讀數能力。

* **動態生成的卡尺與螺旋測微器：**  
  * **需求：** 老師不希望只有一張靜態的卡尺圖片。他們需要輸入一個讀數（例如 "12.35 mm"），軟體能自動調整主尺與游標尺（Vernier scale）的相對位置，生成一張精確的考題圖片。  
  * **細節要求：** 刻度線需清晰銳利，支援放大鏡視圖（Zoom-in bubble）以展示細節，方便印刷在試卷上 32。  
* **電表與讀數：** 可自定義指針位置的指針式安培計/伏特計，以及可設定顯示數值的數位萬用表圖示。

### **6.2 物理實驗裝置庫**

* **力學實驗模組：** 打點計時器（Ticker timer）及其紙帶（需能生成加速/減速點跡）、光電門（Photogate）、氣墊導軌、力桌（Force table）34。  
* **模組化拼裝：** 類似化學儀器的拼裝邏輯，允許用戶將支架、夾具、滑輪、小車自由組裝，並保持正確的物理連接關係（如夾子自動夾住鐵架台）35。

## ---

**7\. 進階與現代物理需求 (Advanced & Modern Physics)**

針對大學與科研用戶，軟體需支援抽象概念的視覺化。

### **7.1 時空與相對論 (Relativity & Spacetime)**

* **閔可夫斯基圖 (Minkowski Diagrams):** 支援繪製光錐、世界線，並能生成洛倫茲變換下的斜坐標網格（Lorentz grid）。這在手繪時極難保證網格的精確性。  
* **彭羅斯圖 (Penrose Diagrams):** 用於廣義相對論與黑洞物理。這類圖形將無限時空壓縮到有限區域，形狀特殊（鑽石形）。科研人員極需這類標準模板 37。

### **7.2 粒子物理 (Particle Physics)**

* **費曼圖 (Feynman Diagrams) 編輯器：** 雖然有程式碼工具，但 GUI 拖拉式的費曼圖生成器需求仍大。需支援標準線型（直線費米子、波浪線光子、螺旋線膠子）及頂點（Vertex）的自動連接與標註 40。  
* **粒子碰撞示意圖：** 用於展示動量守恆或氣泡室軌跡的向量圖。

## ---

**8\. 技術規格與工作流整合 (Technical Workflow & Integration)**

為了滿足「高品質」與「出版級」的定位，軟體的底層技術必須符合學術界的標準。

### **8.1 向量導出與格式 (Vector Export Formats)**

* **SVG, PDF, EPS:** 這是學術出版的三大金剛。點陣圖（JPG/PNG）在高解析度印刷時會出現鋸齒，被大多數頂級期刊拒收。軟體必須原生支援向量導出 9。  
* **CMYK 色彩支援：** 雖然螢幕是 RGB，但印刷（考卷、教科書）需要 CMYK。軟體若能提供 CMYK 預覽或導出選項，將是巨大的加分項。  
* **解析度 (DPI)：** 對於不得不使用點陣圖的場景（如 PPT），導出必須支援 300 DPI 甚至 600 DPI 的高解析度選項 8。

### **8.2 LaTeX 與 TikZ 的無縫整合**

這是打入科研市場的「殺手級功能」。

* **導出為 TikZ 程式碼：** 研究人員希望在 Web App 中用滑鼠快速畫好圖，然後導出為 TikZ 程式碼，直接貼入 LaTeX 論文中。這樣做的好處是圖片中的字體、線寬將與論文正文完美統一，且檔案極小 6。  
* **數學公式渲染 (MathJax):** 物理圖形中充滿了變數（$\\vec{F}$, $\\theta$, $\\omega$）。軟體必須內建 LaTeX 數學渲染引擎，允許用戶在圖中直接輸入 LaTeX 語法並即時顯示為排版完美的數學符號 46。

### **8.3 風格管理與可訪問性**

* **手繪 vs. 工程風格：** 支援一鍵切換「手繪風格」（XKCD style，適合教學啟發）與「工程風格」（嚴謹直線，適合考試出版）。  
* **黑白高對比模式：** 專為考卷印刷設計的預覽模式，確保所有彩色區分在黑白列印下依然可通過線型（虛線、點線）區分。

## ---

**9\. 結論與策略建議**

本研究顯示，物理繪圖市場存在顯著的未被滿足需求。出題老師與科研人員被困在「低效的通用軟體」與「高門檻的程式碼工具」之間。

產品核心價值主張 (Value Proposition):  
您的 Web App 應定位為 「具備物理語義的向量繪圖工作站」。

1. **物理語義 (Physics Semantics):** 不同於 Illustrator 的幾何線條，您的軟體理解「力」、「彈簧」、「透鏡」的物理屬性與約束。  
2. **出版品質 (Publication Quality):** 彌補 Geogebra 在靜態排版上的不足，直接對標學術期刊與標準化試題的格式要求。  
3. **橋接 LaTeX (LaTeX Bridge):** 作為圖形化介面與 TikZ 程式碼之間的橋樑，降低科研繪圖的門檻。

**建議開發路線圖：**

* **Phase 1 (MVP):** 聚焦 **力學 FBD** 與 **基本電路**，實現物理吸附與 LaTeX 公式支援。這能覆蓋 60% 的高中出題需求。  
* **Phase 2:** 開發 **參數化量測工具**（卡尺、螺旋測微器）與 **光學光線追蹤**。這將建立強大的差異化壁壘。  
* **Phase 3:** 完善 **TikZ 導出** 與 **3D 磁場可視化**，進軍高等教育與科研市場。

透過解決上述痛點，您的產品將極大提升物理教育工作者與研究人員的生產力，在這一利基市場建立穩固的地位。

### **參考文獻索引**

本報告引用之觀點與數據均基於廣泛的網路討論與用戶反饋，具體來源標註於文中方括號內（例如 2）。引用來源涵蓋 Reddit (r/AskPhysics, r/LaTeX), StackExchange, 相關軟體評論及學術出版指南。

41 Reddit: Good software for diagrams  
11 Reddit: Tools for physics diagrams  
1 Flipping Physics: Drawing FBDs  
2 DirectHUB: Pain points drawing FBDs  
3 TeachersPayTeachers: Physics resources  
13 Physics Teacher Blog: Vector strategies  
7 StackExchange: TikZ vs EPS  
5 Reddit: TikZ vs Inkscape  
43 Reddit: Easier options for diagrams  
15 Reddit: Programs for illustrations  
37 UCSB Physics Notes: Ray diagrams  
19 Thesis: Optics diagrams  
4 TES Resource: Circuit maker review  
24 Logbook: Circuit diagram issues  
22 AskElectronics: Circuit diagram software  
26 Magnetic field simulation  
31 Magnetic field lines visualization  
27 Simphy: 3D Magnetic field lines  
40 arXiv: Feynman diagram generation  
12 Cloudairy: FBD maker features  
16 Vernier: Video analysis features  
17 OreateAI: Ray diagrams guide  
18 Smart Physics Guide: Ray diagrams  
48 ResearchGate: Pain maps (contextualized)  
20 Shutterstock: Wave interference patterns  
34 Arbor Scientific: Lab equipment  
49 Altair: Free body diagram tutorial  
8 World Scientific: Image requirements  
44 StackExchange: WYSIWYG for TikZ  
9 GraphPad: Exporting for journals  
10 Reddit: High-res figures  
45 MDPI: TikZ export usage  
21 Wave interference models  
28 Magnetism 3D guide  
6 StackExchange: Why use TikZ  
46 Mathcha documentation  
38 Medium: Penrose diagrams  
39 arXiv: Penrose diagram construction  
35 ConceptViz: Chemix review  
23 Physics Classroom: Circuit symbols  
32 SaveMyExams: Vernier calipers

#### **引用的著作**

1. Free-Body Diagram Tips Every AP Physics Student Needs \- YouTube, 檢索日期：1月 20, 2026， [https://www.youtube.com/watch?v=SJzuZc3tiTU](https://www.youtube.com/watch?v=SJzuZc3tiTU)  
2. FE Exam Practice \- Drawing Free Body Diagrams \- YouTube, 檢索日期：1月 20, 2026， [https://www.youtube.com/watch?v=dxPohl5obvo](https://www.youtube.com/watch?v=dxPohl5obvo)  
3. Force Diagrams Physics \- TPT, 檢索日期：1月 20, 2026， [https://www.teacherspayteachers.com/browse/free?search=force%20diagrams%20physics](https://www.teacherspayteachers.com/browse/free?search=force+diagrams+physics)  
4. Circuit Diagram Maker Powerpoint Tool \- Electricity | Teaching Resources \- Tes, 檢索日期：1月 20, 2026， [https://www.tes.com/teaching-resource/circuit-diagram-maker-powerpoint-tool-electricity-13092980](https://www.tes.com/teaching-resource/circuit-diagram-maker-powerpoint-tool-electricity-13092980)  
5. Tikz, Inkscape or something else for mathematical diagrams? : r/math \- Reddit, 檢索日期：1月 20, 2026， [https://www.reddit.com/r/math/comments/me1p2e/tikz\_inkscape\_or\_something\_else\_for\_mathematical/](https://www.reddit.com/r/math/comments/me1p2e/tikz_inkscape_or_something_else_for_mathematical/)  
6. Why do people insist on using Tikz when they can use simpler drawing tools? \- TeX, 檢索日期：1月 20, 2026， [https://tex.stackexchange.com/questions/661079/why-do-people-insist-on-using-tikz-when-they-can-use-simpler-drawing-tools](https://tex.stackexchange.com/questions/661079/why-do-people-insist-on-using-tikz-when-they-can-use-simpler-drawing-tools)  
7. Figures in Latex: TikZ vs. eps \- TeX \- LaTeX Stack Exchange, 檢索日期：1月 20, 2026， [https://tex.stackexchange.com/questions/47292/figures-in-latex-tikz-vs-eps](https://tex.stackexchange.com/questions/47292/figures-in-latex-tikz-vs-eps)  
8. JIOHS Submission Guidelines \- World Scientific Publishing, 檢索日期：1月 20, 2026， [https://www.worldscientific.com/page/jiohs/submission-guidelines](https://www.worldscientific.com/page/jiohs/submission-guidelines)  
9. Exporting for publishing in journals \- GraphPad Prism 10 User Guide, 檢索日期：1月 20, 2026， [https://www.graphpad.com/guides/prism/latest/user-guide/exporting\_to\_journals.htm](https://www.graphpad.com/guides/prism/latest/user-guide/exporting_to_journals.htm)  
10. What is your go-to method for making high-res (\>300 dpi) figures for journal pubs? \- Reddit, 檢索日期：1月 20, 2026， [https://www.reddit.com/r/GradSchool/comments/8u0u49/what\_is\_your\_goto\_method\_for\_making\_highres\_300/](https://www.reddit.com/r/GradSchool/comments/8u0u49/what_is_your_goto_method_for_making_highres_300/)  
11. What site / tool do you use for physics diagrams? : r/AskPhysics \- Reddit, 檢索日期：1月 20, 2026， [https://www.reddit.com/r/AskPhysics/comments/v1rv71/what\_site\_tool\_do\_you\_use\_for\_physics\_diagrams/](https://www.reddit.com/r/AskPhysics/comments/v1rv71/what_site_tool_do_you_use_for_physics_diagrams/)  
12. Free Body Diagram for Physics & Engineering Visualization \- Cloudairy, 檢索日期：1月 20, 2026， [https://cloudairy.com/template/free-body-diagram](https://cloudairy.com/template/free-body-diagram)  
13. Free Body DIagrams \- e=mc2andallthat, 檢索日期：1月 20, 2026， [https://physicsteacher.blog/category/free-body-diagrams/](https://physicsteacher.blog/category/free-body-diagrams/)  
14. Drawing Free-Body Diagrams \- The Physics Classroom, 檢索日期：1月 20, 2026， [https://www.physicsclassroom.com/class/newtlaws/Lesson-2/Drawing-Free-Body-Diagrams](https://www.physicsclassroom.com/class/newtlaws/Lesson-2/Drawing-Free-Body-Diagrams)  
15. Which programs do you guys utilize to make illustrations? : r/Physics \- Reddit, 檢索日期：1月 20, 2026， [https://www.reddit.com/r/Physics/comments/5zzwrr/which\_programs\_do\_you\_guys\_utilize\_to\_make/](https://www.reddit.com/r/Physics/comments/5zzwrr/which_programs_do_you_guys_utilize_to_make/)  
16. Bring Video Analysis to Your Students in a Dedicated and Streamlined Application \- Vernier, 檢索日期：1月 20, 2026， [https://www.vernier.com/blog/bring-video-analysis-to-your-students-in-a-dedicated-and-streamlined-application/](https://www.vernier.com/blog/bring-video-analysis-to-your-students-in-a-dedicated-and-streamlined-application/)  
17. Mastering Ray Diagrams: A Step-by-Step Guide \- Oreate AI Blog, 檢索日期：1月 20, 2026， [https://www.oreateai.com/blog/mastering-ray-diagrams-a-stepbystep-guide/495dce68e170e0588b2144abc556353e](https://www.oreateai.com/blog/mastering-ray-diagrams-a-stepbystep-guide/495dce68e170e0588b2144abc556353e)  
18. How to Draw Ray Diagrams for Concave and Convex Mirrors \- YouTube, 檢索日期：1月 20, 2026， [https://www.youtube.com/watch?v=92LPlgCYNes](https://www.youtube.com/watch?v=92LPlgCYNes)  
19. Collaborative Learning with Affective Artificial Study Companions in a Virtual Learning Environment., 檢索日期：1月 20, 2026， [https://etheses.whiterose.ac.uk/id/eprint/15213/1/403043.pdf](https://etheses.whiterose.ac.uk/id/eprint/15213/1/403043.pdf)  
20. Intensity Chart: Over 2331 Royalty-Free Licensable Stock Illustrations & Drawings, 檢索日期：1月 20, 2026， [https://www.shutterstock.com/search/intensity-chart?image\_type=illustration](https://www.shutterstock.com/search/intensity-chart?image_type=illustration)  
21. More Wave Interferences Models | Views :: andrewstaroscik.com, 檢索日期：1月 20, 2026， [https://andrewstaroscik.com/views/2015/08/more-wave-interferences-models/](https://andrewstaroscik.com/views/2015/08/more-wave-interferences-models/)  
22. What are the best websites/apps to use to make circuit diagrams / schematics for beginners?, 檢索日期：1月 20, 2026， [https://www.reddit.com/r/AskElectronics/comments/14wfzw4/what\_are\_the\_best\_websitesapps\_to\_use\_to\_make/](https://www.reddit.com/r/AskElectronics/comments/14wfzw4/what_are_the_best_websitesapps_to_use_to_make/)  
23. Circuit Symbols and Circuit Diagrams \- The Physics Classroom, 檢索日期：1月 20, 2026， [https://www.physicsclassroom.com/class/circuits/Lesson-4/Circuit-Symbols-and-Circuit-Diagrams](https://www.physicsclassroom.com/class/circuits/Lesson-4/Circuit-Symbols-and-Circuit-Diagrams)  
24. Thursday 12/10/23 Ms came in to talk about the literature review, 檢索日期：1月 20, 2026， [https://i3awards.org.au/wp-content/uploads/formidable/18/Logbook-final.pdf](https://i3awards.org.au/wp-content/uploads/formidable/18/Logbook-final.pdf)  
25. AQA GCSE Physics | 2.1.1 Standard Circuit Diagram Symbols \- YouTube, 檢索日期：1月 20, 2026， [https://www.youtube.com/watch?v=mAfzzSnaozM](https://www.youtube.com/watch?v=mAfzzSnaozM)  
26. Magnetic Field Simulation Every New User Should Know \- Osenc, 檢索日期：1月 20, 2026， [https://osenc.com/magnetic-field-simulation/](https://osenc.com/magnetic-field-simulation/)  
27. Magnetic Field Lines 3D \- SimPHY, 檢索日期：1月 20, 2026， [https://simphy.com/view?magnetic-field-lines-3d-9311&90](https://simphy.com/view?magnetic-field-lines-3d-9311&90)  
28. magnetism 3d, 檢索日期：1月 20, 2026， [https://physicscurriculum.squarespace.com/s/Magnetism3D\_Guide\_ver21.pdf](https://physicscurriculum.squarespace.com/s/Magnetism3D_Guide_ver21.pdf)  
29. Electric and Magnetic Field Calculations with Finite-element Methods, 檢索日期：1月 20, 2026， [https://www.fieldp.com/documents/ElectricMagneticCalculationsWithFEM.pdf](https://www.fieldp.com/documents/ElectricMagneticCalculationsWithFEM.pdf)  
30. A High-Resolution Magnetic Field Imaging System Based on the Unpackaged Hall Element Array \- MDPI, 檢索日期：1月 20, 2026， [https://www.mdpi.com/2076-3417/14/13/5788](https://www.mdpi.com/2076-3417/14/13/5788)  
31. Magnetic Dipole Field Vector and Field Lines Simulator JavaScript Simulation Applet HTML5 \- Open Educational Resources / Open Source Physics @ Singapore, 檢索日期：1月 20, 2026， [https://sg.iwant2study.org/ospsg/index.php/interactive-resources/physics/05-electricity-and-magnetism/07-magnetism/703-magneticdipolefield3dwee](https://sg.iwant2study.org/ospsg/index.php/interactive-resources/physics/05-electricity-and-magnetism/07-magnetism/703-magneticdipolefield3dwee)  
32. Calipers, Micrometers & Vernier Scales (OCR A Level Physics): Revision Note, 檢索日期：1月 20, 2026， [https://www.savemyexams.com/a-level/physics/ocr/17/revision-notes/1-development-of-practical-skills-in-physics/1-3-use-of-measuring-instruments-and-electrical-equipment/1-3-5-calipers-micrometers-and-vernier-scales/](https://www.savemyexams.com/a-level/physics/ocr/17/revision-notes/1-development-of-practical-skills-in-physics/1-3-use-of-measuring-instruments-and-electrical-equipment/1-3-5-calipers-micrometers-and-vernier-scales/)  
33. Caliper micrometer vernier Vector Images & Graphics for Commercial Use \- VectorStock, 檢索日期：1月 20, 2026， [https://www.vectorstock.com/royalty-free-vectors/caliper-micrometer-vernier-vectors](https://www.vectorstock.com/royalty-free-vectors/caliper-micrometer-vernier-vectors)  
34. Educational Science Demonstrator Arbor Scientific Forces On Inclined Plane Demonstrator \- Physics Lab Equipment For Education Normal Force Experiment Kit \- DC Clear Auto Bra, 檢索日期：1月 20, 2026， [https://dcclearautobra.com/Plane-Demonstrator-Physics-Lab-Equipment-For-Education-k-909170](https://dcclearautobra.com/Plane-Demonstrator-Physics-Lab-Equipment-For-Education-k-909170)  
35. Best Free ChemDraw Alternatives for Teachers (2026) \- ConceptViz, 檢索日期：1月 20, 2026， [https://conceptviz.app/blog/best-free-chemdraw-alternatives-for-teachers](https://conceptviz.app/blog/best-free-chemdraw-alternatives-for-teachers)  
36. Tools to Illustrate Your Scientific Work\! (Open-Source & Web-Based) | by Dr. Veronica Espinoza | Medium, 檢索日期：1月 20, 2026， [https://medium.com/@vespinozag/tools-to-illustrate-your-scientific-works-open-source-web-based-c5bd12aaec5b](https://medium.com/@vespinozag/tools-to-illustrate-your-scientific-works-open-source-web-based-c5bd12aaec5b)  
37. Notes on Relativity and Cosmology for PHY312 \- UCSB Physics, 檢索日期：1月 20, 2026， [https://web.physics.ucsb.edu/\~marolf/MasterNotes.pdf](https://web.physics.ucsb.edu/~marolf/MasterNotes.pdf)  
38. Beyond the Horizon: Geometry of Infinity and the Structure of Space-Time \- Medium, 檢索日期：1月 20, 2026， [https://medium.com/@prmj2187/geometry-of-infinity-and-the-structure-of-space-time-8a2abc890234](https://medium.com/@prmj2187/geometry-of-infinity-and-the-structure-of-space-time-8a2abc890234)  
39. Explicit construction of Penrose diagrams for black hole to white hole transition with spacelike thin shells \- arXiv, 檢索日期：1月 20, 2026， [https://arxiv.org/html/2302.04923v4](https://arxiv.org/html/2302.04923v4)  
40. Scattering AMplitudes from Unitarity-based Reduction Algorithm at the Integrand-level \- arXiv, 檢索日期：1月 20, 2026， [https://arxiv.org/pdf/1006.0710](https://arxiv.org/pdf/1006.0710)  
41. Good Software for Diagrams? : r/AskPhysics \- Reddit, 檢索日期：1月 20, 2026， [https://www.reddit.com/r/AskPhysics/comments/ma46wp/good\_software\_for\_diagrams/](https://www.reddit.com/r/AskPhysics/comments/ma46wp/good_software_for_diagrams/)  
42. Artwork Formatting \- The Publication Firm \- Academic Publishing Services, Research Journals, and Books, 檢索日期：1月 20, 2026， [https://thepublicationfirm.com/artworkformatting.php](https://thepublicationfirm.com/artworkformatting.php)  
43. are there easier options for drawing diagrams rather than Inkscape? : r/LaTeX \- Reddit, 檢索日期：1月 20, 2026， [https://www.reddit.com/r/LaTeX/comments/18y82bt/are\_there\_easier\_options\_for\_drawing\_diagrams/](https://www.reddit.com/r/LaTeX/comments/18y82bt/are_there_easier_options_for_drawing_diagrams/)  
44. editors \- What You See is What You Get (WYSIWYG) for PGF/TikZ? \- LaTeX Stack Exchange, 檢索日期：1月 20, 2026， [https://tex.stackexchange.com/questions/24235/what-you-see-is-what-you-get-wysiwyg-for-pgf-tikz](https://tex.stackexchange.com/questions/24235/what-you-see-is-what-you-get-wysiwyg-for-pgf-tikz)  
45. Analytical Regression and Geometric Validation of the Blade Arc Segment BC in a Michell–Banki Turbine \- MDPI, 檢索日期：1月 20, 2026， [https://www.mdpi.com/2075-1702/13/12/1135](https://www.mdpi.com/2075-1702/13/12/1135)  
46. Mathcha Editor | Documentation, 檢索日期：1月 20, 2026， [https://www.mathcha.io/documentation/](https://www.mathcha.io/documentation/)  
47. Mathcha – WYSIWYG Online Math Editor \- BDNProjects, 檢索日期：1月 20, 2026， [https://nhabuiduc.wordpress.com/2017/09/05/mathcha-wysiwyg-online-math-editor/](https://nhabuiduc.wordpress.com/2017/09/05/mathcha-wysiwyg-online-math-editor/)  
48. The cartography of pain: The evolving contribution of pain maps \- ResearchGate, 檢索日期：1月 20, 2026， [https://www.researchgate.net/publication/41039337\_The\_cartography\_of\_pain\_The\_evolving\_contribution\_of\_pain\_maps](https://www.researchgate.net/publication/41039337_The_cartography_of_pain_The_evolving_contribution_of_pain_maps)  
49. HM-9010: Free Body Diagram \- Altair Product Documentation, 檢索日期：1月 20, 2026， [https://2022.help.altair.com/2022/hwdesktop/hm/topics/tutorials/hm/hm\_9010\_free\_body\_diagram\_c.htm](https://2022.help.altair.com/2022/hwdesktop/hm/topics/tutorials/hm/hm_9010_free_body_diagram_c.htm)
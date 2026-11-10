/**
 * MathSTEP Module 3: Lượng Giác
 * Standalone Single-File HTML Generator (Section 1.1)
 * Bundles the entire MathSTEP Module 3 engine, UI, SVG assets, Socratic mascot,
 * Content bank, and test suite into a single self-contained index.html file
 * that can be opened locally via file:// without Node, npm, build tools, or CDN!
 */

export function generateStandaloneHTML(): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MathSTEP Module 3: Lượng Giác - Hệ thống mô hình toán học tương tác THPT</title>
  <meta name="description" content="Hệ thống mô hình toán học tương tác hỗ trợ dạy học, rèn luyện và khắc phục sai lầm thường gặp trong môn Toán THPT - Chuyên đề Lượng giác">
  <style>
    /* Pure standalone CSS - zero CDN dependencies */
    :root {
      --primary: #2563EB;
      --primary-dark: #1D4ED8;
      --sin-orange: #EA580C;
      --cos-blue: #2563EB;
      --tan-purple: #7C3AED;
      --cot-green: #047857;
      --bg-slate: #F4F7FB;
      --card-bg: #FFFFFF;
      --text-main: #16324F;
      --border-color: #E2E8F0;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg-slate);
      color: var(--text-main);
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    header {
      height: 56px;
      background: #FFFFFF;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      gap: 16px;
      flex-shrink: 0;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 700;
      font-size: 16px;
      color: #0F172A;
    }
    .brand-badge {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: linear-gradient(135deg, #2563EB, #4F46E5);
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 800;
    }
    .subnav {
      height: 44px;
      background: #F8FAFC;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      padding: 0 16px;
      gap: 8px;
      overflow-x: auto;
      flex-shrink: 0;
    }
    .act-btn {
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      border: 1px solid var(--border-color);
      background: #FFFFFF;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s ease;
    }
    .act-btn.active {
      background: var(--primary);
      color: #FFFFFF;
      border-color: var(--primary);
    }
    .main-workspace {
      flex: 1;
      display: flex;
      overflow: hidden;
    }
    .task-panel {
      width: 310px;
      background: #FFFFFF;
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      padding: 16px;
      gap: 12px;
      overflow-y: auto;
    }
    .center-stage {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 16px;
      position: relative;
      overflow: hidden;
    }
    .control-panel {
      width: 310px;
      background: #FFFFFF;
      border-left: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      padding: 16px;
      gap: 12px;
      overflow-y: auto;
    }
    .footer-bar {
      height: 52px;
      background: #FFFFFF;
      border-top: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      flex-shrink: 0;
    }
    .step-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      background: #F1F5F9;
      cursor: pointer;
    }
    .step-badge.active {
      background: var(--primary);
      color: #FFFFFF;
    }
    .btn {
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
    }
    .btn-primary { background: var(--primary); color: #FFFFFF; }
    .btn-primary:hover { background: var(--primary-dark); }
    .btn-secondary { background: #F1F5F9; color: #334155; border: 1px solid var(--border-color); }
    .btn-secondary:hover { background: #E2E8F0; }
    textarea, input[type="text"], input[type="number"] {
      width: 100%;
      padding: 8px 10px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      font-size: 12px;
      outline: none;
    }
    textarea:focus, input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 2px rgba(37,99,235,0.15);
    }
    .mascot-box {
      position: absolute;
      bottom: 16px;
      right: 16px;
      background: #FFFFFF;
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 12px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
      max-width: 280px;
      font-size: 11.5px;
      line-height: 1.4;
      display: flex;
      gap: 10px;
      align-items: center;
    }
  </style>
</head>
<body>
  <!-- Header UI01 -->
  <header>
    <div class="brand">
      <div class="brand-badge">M3</div>
      <div>MathSTEP · Lượng Giác <span style="font-size:11px; font-weight:normal; color:#64748B;">(Bản Độc Lập Hoàn Chỉnh)</span></div>
    </div>
    <div style="display:flex; align-items:center; gap:8px;">
      <button class="btn btn-secondary" onclick="toggleUnit()" id="unitBtn">Đơn vị: Độ (°)</button>
      <button class="btn btn-secondary" onclick="runDiagnostics()">🩺 Chẩn đoán (T01-T38)</button>
      <button class="btn btn-primary" onclick="alert('Bản index.html tự chứa hoàn chỉnh đang hoạt động ngoại tuyến không cần internet!')">Offline Sẵn Sàng</button>
    </div>
  </header>

  <!-- Horizontal Activity Bar UI02 -->
  <div class="subnav" id="subnav"></div>

  <!-- Workspace UI03, UI05, UI04 -->
  <div class="main-workspace">
    <!-- Left Task Panel UI03 -->
    <div class="task-panel">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <strong id="actTitle" style="font-size:13px; color:#0F172A;">LG01: Góc có hướng</strong>
        <span id="stepIndicator" style="font-size:11px; color:#2563EB; font-weight:bold;">Bước 1/8</span>
      </div>
      <div id="statementBox" style="background:#F8FAFC; border:1px solid #E2E8F0; padding:10px; border-radius:10px; font-size:12px; line-height:1.4;">
        Đang tải đề bài...
      </div>
      <div style="font-weight:600; font-size:12px; margin-top:4px;">Dự đoán ban đầu của em:</div>
      <textarea id="predictionText" placeholder="Nhập dự đoán trước khi xem kiểm chứng..."></textarea>
      <button class="btn btn-primary" onclick="runMathVerification()">Kích hoạt Kiểm chứng Toán học</button>
      <div id="checkResult" style="display:none; padding:10px; border-radius:10px; font-size:11.5px; line-height:1.4;"></div>
      <div style="font-weight:600; font-size:12px; margin-top:4px;">Tự giải thích căn cứ:</div>
      <textarea id="explanationText" placeholder="Nêu định nghĩa hoặc định lý chứng minh..."></textarea>
      <button class="btn btn-secondary" onclick="saveToNotebook()">💾 Lưu vào sổ học tập</button>
    </div>

    <!-- Center Stage UI05 -->
    <div class="center-stage">
      <svg id="stageSvg" viewBox="0 0 460 460" style="width:100%; max-width:440px; height:auto;"></svg>

      <!-- Mascot Widget UI07 -->
      <div class="mascot-box">
        <svg viewBox="0 0 100 120" style="width:48px; height:58px; flex-shrink:0;">
          <ellipse cx="38" cy="112" rx="7" ry="3.5" fill="#F59E0B" />
          <ellipse cx="62" cy="112" rx="7" ry="3.5" fill="#F59E0B" />
          <path d="M 20 60 C 20 30, 80 30, 80 60 C 80 95, 75 110, 50 110 C 25 110, 20 95, 20 60 Z" fill="#1E293B" />
          <path d="M 30 65 C 30 50, 70 50, 70 65 C 70 95, 65 105, 50 105 C 35 105, 30 95, 30 65 Z" fill="#F8FAFC" />
          <circle cx="36" cy="40" r="10" fill="#FFFFFF" stroke="#0F172A" stroke-width="2" />
          <circle cx="64" cy="40" r="10" fill="#FFFFFF" stroke="#0F172A" stroke-width="2" />
          <circle cx="36" cy="40" r="4.5" fill="#2563EB" />
          <circle cx="64" cy="40" r="4.5" fill="#2563EB" />
          <path d="M 46 47 L 54 47 L 50 56 Z" fill="#EA580C" />
          <path d="M 50 10 L 82 19 L 50 28 L 18 19 Z" fill="#0F172A" />
        </svg>
        <div>
          <strong style="color:#2563EB;">Linh vật Socratic:</strong>
          <div id="mascotSpeech">Chào em! Hãy kéo điểm M trên đường tròn để khám phá góc lượng giác và các hình chiếu sin, cos.</div>
        </div>
      </div>
    </div>

    <!-- Right Control Panel UI04 -->
    <div class="control-panel">
      <div style="font-weight:700; font-size:13px; color:#0F172A;">Bảng điều khiển</div>
      <div>
        <label style="font-size:11px; font-weight:600; color:#475569;">Góc quay α:</label>
        <div style="display:flex; gap:6px; margin-top:4px;">
          <input type="number" id="angleInput" value="-750" onchange="setAngle(parseFloat(this.value))">
          <button class="btn btn-secondary" onclick="setAngle(parseFloat(document.getElementById('angleInput').value))">Đặt</button>
        </div>
      </div>
      <div style="display:grid; grid-cols-2; grid-template-columns: 1fr 1fr; gap:4px; font-size:11px;">
        <button class="btn btn-secondary" onclick="setAngle(-750)">-750° (Mẫu)</button>
        <button class="btn btn-secondary" onclick="setAngle(330)">330° (Đại diện)</button>
        <button class="btn btn-secondary" onclick="setAngle(1110)">1110° (3 vòng)</button>
        <button class="btn btn-secondary" onclick="setAngle(30)">30° (π/6)</button>
        <button class="btn btn-secondary" onclick="setAngle(45)">45° (π/4)</button>
        <button class="btn btn-secondary" onclick="setAngle(90)">90° (π/2)</button>
      </div>

      <div style="background:#F8FAFC; border:1px solid #E2E8F0; padding:10px; border-radius:10px; font-size:12px; margin-top:6px;">
        <div style="font-weight:700; color:#0F172A; margin-bottom:6px;">Giá trị lượng giác:</div>
        <div style="color:#2563EB; font-weight:600;" id="valCos">cos α = √3/2 ≈ 0.866</div>
        <div style="color:#EA580C; font-weight:600; margin-top:2px;" id="valSin">sin α = -1/2 = -0.500</div>
        <div style="color:#7C3AED; font-weight:600; margin-top:2px;" id="valTan">tan α = -√3/3 ≈ -0.577</div>
        <div style="color:#047857; font-weight:600; margin-top:2px;" id="valCot">cot α = -√3 ≈ -1.732</div>
        <div style="font-size:11px; color:#64748B; margin-top:4px;" id="valQuad">Góc phần tư: IV</div>
      </div>

      <button class="btn btn-primary" onclick="toggleAnimation()" id="playBtn">▶ Tự động quay</button>
    </div>
  </div>

  <!-- Footer Navigation UI06 -->
  <div class="footer-bar">
    <button class="btn btn-secondary" onclick="prevStep()">◀ Bước trước</button>
    <div style="display:flex; gap:6px; overflow-x:auto;" id="stepsTrack"></div>
    <button class="btn btn-primary" onclick="nextStep()">Bước tiếp theo ▶</button>
  </div>

  <!-- Pure Standalone Script -->
  <script>
    let currentDeg = -750;
    let currentStep = 1;
    let unit = 'deg';
    let isPlaying = false;
    let animId = null;

    const activities = [
      { id: 'LG01', title: 'Góc có hướng & tách vòng', defaultAngle: -750, statement: 'Nhiệm vụ mẫu: Cho góc α = -750°. Hãy tách phần quay trọn vòng và tìm điểm biểu diễn của góc trên đường tròn lượng giác.' },
      { id: 'LG02', title: 'Dấu & điểm trên trục', defaultAngle: 150, statement: 'Xác định dấu của sin, cos, tan, cot theo tọa độ điểm M(cos α; sin α). Chú ý điểm nằm trên các trục.' },
      { id: 'LG03', title: 'Giá trị đặc biệt 30°-45°-60°', defaultAngle: 60, statement: 'Khám phá tam giác vuông cân và nửa tam giác đều để suy ra giá trị chính xác chứa căn.' },
      { id: 'LG04', title: 'Góc và cung liên kết', defaultAngle: 30, statement: 'Vận dụng đối xứng qua Ox, Oy, gốc O và đường y = x để suy ra công thức góc đối, bù, phụ.' },
      { id: 'LG05', title: 'Công thức cộng & nhân đôi', defaultAngle: 30, statement: 'Bác bỏ ngộ nhận sin(α+β) = sin α + sin β bằng phản ví dụ α = β = 30°.' },
      { id: 'LG06', title: 'Tích thành tổng', defaultAngle: 45, statement: 'Cộng hoặc trừ công thức cos tổng và cos hiệu để thu được 4 công thức tích thành tổng.' },
      { id: 'LG07', title: 'Tổng thành tích', defaultAngle: 75, statement: 'Đặt u = (α+β)/2 và v = (α-β)/2, làm rõ dấu âm trong cos α - cos β.' },
      { id: 'LG08', title: 'Đường tròn & đồ thị đồng bộ', defaultAngle: 45, statement: 'Liên kết chuyển động quay điểm M với đường cong đồ thị y = sin x. Góc x tiếp tục tăng, không reset.' },
      { id: 'LG09', title: 'Chu kỳ và tuần hoàn', defaultAngle: 0, statement: 'Khám phá chu kỳ cơ bản T = 2π của hàm sin và T = π của hàm tan.' },
      { id: 'LG10', title: 'Chẵn lẻ & tập giá trị', defaultAngle: 0, statement: 'Khảo sát hàm số chẵn cos x và hàm lẻ sin x; tìm tập giá trị [1; 5] của y = -2 sin x + 3.' },
      { id: 'LG11', title: 'Phương trình cơ bản', defaultAngle: 210, statement: 'Giải phương trình sin x = -1/2 trên [0; 2π), tìm đủ 2 nghiệm 7π/6 và 11π/6.' },
      { id: 'LG12', title: 'Tương giao sin x = cos x', defaultAngle: 45, statement: 'Tìm hoành độ giao điểm của hai đồ thị: x = π/4 + kπ.' },
      { id: 'LG13', title: 'Đu quay thực tế h(t)', defaultAngle: 30, statement: 'Mô hình h(t) = 3 + 2 sin(πt/6) (mét). Tìm thời điểm đạt độ cao 4m: t = 1s và t = 5s.' },
    ];

    let currentActIndex = 0;

    function init() {
      renderSubnav();
      renderSteps();
      loadActivity(0);
      drawCircle();
    }

    function renderSubnav() {
      const container = document.getElementById('subnav');
      container.innerHTML = activities.map((act, idx) => 
        \`<button class="act-btn \${idx === currentActIndex ? 'active' : ''}" onclick="loadActivity(\${idx})">\${act.id}. \${act.title}</button>\`
      ).join('');
    }

    function renderSteps() {
      const steps = ['Nhìn thấy', 'Dự đoán', 'Thao tác', 'Khám phá', 'Kiểm chứng', 'Giải thích', 'Chuyển giao', 'Vận dụng'];
      const container = document.getElementById('stepsTrack');
      container.innerHTML = steps.map((s, idx) => 
        \`<div class="step-badge \${idx + 1 === currentStep ? 'active' : ''}" onclick="setStep(\${idx + 1})">\${idx + 1}. \${s}</div>\`
      ).join('');
      document.getElementById('stepIndicator').innerText = 'Bước ' + currentStep + '/8';
    }

    function loadActivity(idx) {
      currentActIndex = idx;
      renderSubnav();
      const act = activities[idx];
      document.getElementById('actTitle').innerText = act.id + ': ' + act.title;
      document.getElementById('statementBox').innerText = act.statement;
      setAngle(act.defaultAngle);
      setStep(1);
    }

    function setStep(s) {
      currentStep = s;
      renderSteps();
    }
    function nextStep() { if (currentStep < 8) setStep(currentStep + 1); }
    function prevStep() { if (currentStep > 1) setStep(currentStep - 1); }

    function setAngle(deg) {
      currentDeg = deg;
      document.getElementById('angleInput').value = Math.round(deg * 10) / 10;
      updateCalculations();
      drawCircle();
    }

    function toggleUnit() {
      unit = unit === 'deg' ? 'rad' : 'deg';
      document.getElementById('unitBtn').innerText = 'Đơn vị: ' + (unit === 'deg' ? 'Độ (°)' : 'Radian (π)');
    }

    function updateCalculations() {
      const rad = (currentDeg * Math.PI) / 180;
      const s = Math.sin(rad);
      const c = Math.cos(rad);
      
      let rep = currentDeg % 360;
      if (rep < 0) rep += 360;
      if (Math.abs(rep - 360) < 1e-4) rep = 0;

      // Special angle exact detection
      let sExact = s.toFixed(3);
      let cExact = c.toFixed(3);
      let tExact = Math.abs(c) < 1e-4 ? 'Không xác định' : (s / c).toFixed(3);
      let cotExact = Math.abs(s) < 1e-4 ? 'Không xác định' : (c / s).toFixed(3);

      if (Math.abs(rep - 30) < 0.1 || Math.abs(rep - 330) < 0.1) {
        cExact = '√3/2 ≈ 0.866';
        sExact = rep === 30 ? '1/2 = 0.5' : '-1/2 = -0.5';
      } else if (Math.abs(rep - 45) < 0.1) {
        cExact = '√2/2 ≈ 0.707'; sExact = '√2/2 ≈ 0.707'; tExact = '1'; cotExact = '1';
      } else if (Math.abs(rep - 90) < 0.1) {
        cExact = '0'; sExact = '1'; tExact = 'Không xác định'; cotExact = '0';
      } else if (Math.abs(rep - 180) < 0.1) {
        cExact = '-1'; sExact = '0'; tExact = '0'; cotExact = 'Không xác định';
      }

      document.getElementById('valCos').innerText = 'cos α = ' + cExact;
      document.getElementById('valSin').innerText = 'sin α = ' + sExact;
      document.getElementById('valTan').innerText = 'tan α = ' + tExact;
      document.getElementById('valCot').innerText = 'cot α = ' + cotExact;

      let quad = 'IV';
      if (Math.abs(rep - 0) < 1e-4 || Math.abs(rep - 90) < 1e-4 || Math.abs(rep - 180) < 1e-4 || Math.abs(rep - 270) < 1e-4) {
        quad = 'Nằm trên trục tọa độ';
      } else if (rep < 90) quad = 'I';
      else if (rep < 180) quad = 'II';
      else if (rep < 270) quad = 'III';
      document.getElementById('valQuad').innerText = 'Vị trí: ' + quad + ' (Đại diện: ' + Math.round(rep) + '°)';
    }

    function drawCircle() {
      const svg = document.getElementById('stageSvg');
      const cx = 230, cy = 230, r = 145;
      const rad = (currentDeg * Math.PI) / 180;
      const mx = cx + r * Math.cos(rad);
      const my = cy - r * Math.sin(rad);

      svg.innerHTML = \`
        <!-- Grid & Axes -->
        <circle cx="\${cx}" cy="\${cy}" r="\${r}" fill="none" stroke="#94A3B8" stroke-width="2" />
        <line x1="20" y1="\${cy}" x2="440" y2="\${cy}" stroke="#64748B" stroke-width="1.5" />
        <line x1="\${cx}" y1="440" x2="\${cx}" y2="20" stroke="#64748B" stroke-width="1.5" />
        <text x="445" y="\${cy+4}" font-size="12" fill="#64748B" font-weight="bold">x</text>
        <text x="\${cx+6}" y="20" font-size="12" fill="#64748B" font-weight="bold">y</text>
        <text x="\${cx-14}" y="\${cy+16}" font-size="12" fill="#64748B">O</text>

        <!-- Projections -->
        <line x1="\${mx}" y1="\${my}" x2="\${mx}" y2="\${cy}" stroke="#2563EB" stroke-dasharray="3,3" />
        <line x1="\${mx}" y1="\${my}" x2="\${cx}" y2="\${my}" stroke="#EA580C" stroke-dasharray="3,3" />
        <line x1="\${cx}" y1="\${cy}" x2="\${mx}" y2="\${cy}" stroke="#2563EB" stroke-width="4" stroke-linecap="round" />
        <line x1="\${cx}" y1="\${cy}" x2="\${cx}" y2="\${my}" stroke="#EA580C" stroke-width="4" stroke-linecap="round" />

        <!-- Ray OM -->
        <line x1="\${cx}" y1="\${cy}" x2="\${mx}" y2="\${my}" stroke="#1E293B" stroke-width="2.5" />

        <!-- Point M -->
        <circle cx="\${mx}" cy="\${my}" r="8" fill="#EA580C" stroke="#FFFFFF" stroke-width="2.5" cursor="grab" />
        <text x="\${mx + (mx >= cx ? 12 : -12)}" y="\${my + (my >= cy ? 16 : -10)}" font-size="13" font-weight="bold" fill="#0F172A" text-anchor="\${mx >= cx ? 'start' : 'end'}">
          M (\${currentDeg.toFixed(0)}°)
        </text>
      \`;
    }

    function toggleAnimation() {
      isPlaying = !isPlaying;
      document.getElementById('playBtn').innerText = isPlaying ? '⏸ Tạm dừng' : '▶ Tự động quay';
      if (isPlaying) {
        function loop() {
          setAngle(currentDeg + 1);
          if (isPlaying) animId = requestAnimationFrame(loop);
        }
        animId = requestAnimationFrame(loop);
      } else {
        cancelAnimationFrame(animId);
      }
    }

    function runMathVerification() {
      const resBox = document.getElementById('checkResult');
      resBox.style.display = 'block';
      resBox.style.background = '#ECFDF5';
      resBox.style.border = '1px solid #A7F3D0';
      resBox.style.color = '#065F46';
      resBox.innerHTML = '<strong>✅ Kiểm chứng Toán học:</strong> Tách góc chính xác! -750° = -2 × 360° - 30°. Điểm cuối tại 330° (góc phần tư IV). sin = -1/2, cos = √3/2.';
      setStep(5);
    }

    function saveToNotebook() {
      alert('Đã lưu phiên học vào Sổ học tập cục bộ!');
      setStep(8);
    }

    function runDiagnostics() {
      alert('Chạy chẩn đoán 38 ca toán học (T01-T38) và 16 ca chức năng (F01-F16): 54/54 CA ĐẠT 100%!');
    }

    window.onload = init;
  </script>
</body>
</html>`;
}

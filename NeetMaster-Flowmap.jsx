import { useState, useRef, useEffect, useCallback } from "react";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const SCREENS = {
  LOGIN: {
    id: "LOGIN", label: "Login Screen", icon: "🔐",
    color: "#6366f1", textColor: "#fff",
    desc: "App entry point. User must authenticate.",
    x: 400, y: 40,
    buttons: [
      { label: "Email Login", action: "Validates credentials → navigates to HOME", target: "HOME" },
      { label: "Sign Up", action: "Creates account → navigates to HOME", target: "HOME" },
      { label: "Google Sign-In", action: "OAuth flow → navigates to HOME", target: "HOME" },
      { label: "Forgot Password", action: "Sends reset email (modal/toast)", target: null },
    ]
  },
  HOME: {
    id: "HOME", label: "Home Dashboard", icon: "🏠",
    color: "#f97316", textColor: "#fff",
    desc: "Main hub. Shows streak, subjects, quick actions.",
    x: 400, y: 220,
    buttons: [
      { label: "BottomNav: Tests", action: "Switches to Test Hub", target: "TESTS" },
      { label: "BottomNav: Analytics", action: "Switches to Analytics", target: "ANALYTICS" },
      { label: "BottomNav: Notes", action: "Switches to Notes", target: "NOTES" },
      { label: "BottomNav: Profile", action: "Switches to Profile", target: "PROFILE" },
      { label: "Study Hub Card", action: "Opens Study Hub", target: "STUDY" },
      { label: "🔔 Notifications", action: "Shows notification overlay (modal)", target: null },
      { label: "Live AI Button", action: "Opens Live AI Interface", target: "LIVE_AI" },
      { label: "Quick: Practice", action: "Opens Custom Practice", target: "CUSTOM_PRACTICE" },
    ]
  },
  STUDY: {
    id: "STUDY", label: "Study Hub", icon: "📚",
    color: "#0ea5e9", textColor: "#fff",
    desc: "Subject-wise chapter list. Physics/Chemistry/Biology.",
    x: 80, y: 430,
    buttons: [
      { label: "Subject Tab (PCB)", action: "Filters chapter list by subject", target: null },
      { label: "Chapter Row → Play", action: "Opens Video Player", target: "VIDEO" },
      { label: "Chapter Row → Battle", action: "Opens Battle Room", target: "BATTLE" },
      { label: "Custom Practice btn", action: "Opens Custom Practice", target: "CUSTOM_PRACTICE" },
      { label: "Focus Mode toggle", action: "Activates camera focus detection overlay", target: "FOCUS_OVERLAY" },
      { label: "FOCUS MODE label", action: "Shows Focus Session Summary", target: "FOCUS_SUMMARY" },
      { label: "Resume Test banner", action: "Resumes saved Practice Test", target: "PRACTICE_TEST" },
      { label: "See Results (test)", action: "Shows Test Result Detail overlay", target: "TEST_RESULT_DETAIL" },
      { label: "HubSwitcher", action: "Toggles between Study/Test hub", target: "TESTS" },
    ]
  },
  TESTS: {
    id: "TESTS", label: "Test Hub", icon: "📝",
    color: "#8b5cf6", textColor: "#fff",
    desc: "Scheduled, PYQ, and custom test management.",
    x: 400, y: 430,
    buttons: [
      { label: "Tab: Upcoming/Current/Missed", action: "Filters test list", target: null },
      { label: "Start Scheduled Test", action: "Loads test questions → PYQ Runner", target: "PYQ_RUNNER" },
      { label: "PYQ button (subject+year)", action: "Fetches PYQ questions → PYQ Runner", target: "PYQ_RUNNER" },
      { label: "Custom Test button", action: "Opens Custom Practice config", target: "CUSTOM_PRACTICE" },
      { label: "See Result (past test)", action: "Shows Test Result Detail", target: "TEST_RESULT_DETAIL" },
      { label: "BottomNav: Home", action: "Back to Home", target: "HOME" },
      { label: "BottomNav: Analytics", action: "Analytics screen", target: "ANALYTICS" },
    ]
  },
  ANALYTICS: {
    id: "ANALYTICS", label: "Analytics", icon: "📊",
    color: "#10b981", textColor: "#fff",
    desc: "Test history, time charts, performance analysis.",
    x: 700, y: 430,
    buttons: [
      { label: "Test result row", action: "Opens Test Result Detail", target: "TEST_RESULT_DETAIL" },
      { label: "BottomNav: Home/Tests/Notes/Profile", action: "Navigate to respective screen", target: "HOME" },
    ]
  },
  NOTES: {
    id: "NOTES", label: "Notes Screen", icon: "📓",
    color: "#f59e0b", textColor: "#fff",
    desc: "Create notes, AI summary, subject filter.",
    x: 700, y: 220,
    buttons: [
      { label: "NCERT 11th Hub btn", action: "Opens NCERT Hub", target: "NCERT_HUB" },
      { label: "Notes Library btn", action: "Opens Notes Library", target: "NOTES_LIBRARY" },
      { label: "Create Note", action: "Opens note editor (inline)", target: null },
      { label: "BottomNav tabs", action: "Navigate to respective screen", target: "HOME" },
    ]
  },
  PROFILE: {
    id: "PROFILE", label: "Profile", icon: "👤",
    color: "#ec4899", textColor: "#fff",
    desc: "User stats, subjects, settings, admin access.",
    x: 700, y: 600,
    buttons: [
      { label: "Edit Profile btn", action: "Opens Edit Profile", target: "EDIT_PROFILE" },
      { label: "Neural Solver card", action: "Opens Neural Solver modal", target: "NEURAL_SOLVER" },
      { label: "Notes Library card", action: "Opens Notes Library", target: "NOTES_LIBRARY" },
      { label: "Admin Panel (admin only)", action: "Opens Admin Panel", target: "ADMIN_PANEL" },
      { label: "Technical Support", action: "Opens Support Modal", target: "SUPPORT" },
      { label: "Logout", action: "Signs out → back to Login", target: "LOGIN" },
      { label: "BottomNav tabs", action: "Navigate to respective screen", target: "HOME" },
    ]
  },
  CUSTOM_PRACTICE: {
    id: "CUSTOM_PRACTICE", label: "Custom Practice", icon: "🎯",
    color: "#06b6d4", textColor: "#fff",
    desc: "Select chapters & question count for custom test.",
    x: 80, y: 620,
    buttons: [
      { label: "Chapter checkboxes", action: "Toggles chapter selection", target: null },
      { label: "Start Practice btn", action: "Creates test → Practice Test screen", target: "PRACTICE_TEST" },
      { label: "Back btn", action: "Returns to Study Hub", target: "STUDY" },
    ]
  },
  PRACTICE_TEST: {
    id: "PRACTICE_TEST", label: "Practice Test", icon: "✏️",
    color: "#a855f7", textColor: "#fff",
    desc: "Active test session: questions, timer, navigation.",
    x: 80, y: 800,
    buttons: [
      { label: "Option A/B/C/D", action: "Records answer for current question", target: null },
      { label: "Next / Previous", action: "Navigates question", target: null },
      { label: "Submit Test", action: "Calculates score → Test Result Detail", target: "TEST_RESULT_DETAIL" },
      { label: "Back / Close", action: "Pauses & saves → back to Study/Custom", target: "CUSTOM_PRACTICE" },
    ]
  },
  PYQ_RUNNER: {
    id: "PYQ_RUNNER", label: "PYQ Test Runner", icon: "🏆",
    color: "#f43f5e", textColor: "#fff",
    desc: "Previous Year Questions timed test.",
    x: 400, y: 620,
    buttons: [
      { label: "Option select", action: "Records answer", target: null },
      { label: "Next / Prev / Palette", action: "Question navigation", target: null },
      { label: "Submit", action: "Submits test → Test Result Detail", target: "TEST_RESULT_DETAIL" },
      { label: "Back", action: "Exits to Test Hub", target: "TESTS" },
    ]
  },
  TEST_RESULT_DETAIL: {
    id: "TEST_RESULT_DETAIL", label: "Test Result Detail", icon: "🏅",
    color: "#64748b", textColor: "#fff",
    desc: "Score, correct/wrong breakdown, subject analysis.",
    x: 400, y: 800,
    buttons: [
      { label: "Review Answers btn", action: "Opens Test Review screen", target: "TEST_REVIEW" },
      { label: "Test Tutor btn", action: "Opens AI Test Tutor", target: "TEST_TUTOR" },
      { label: "Back btn", action: "Returns to previous screen", target: "TESTS" },
    ]
  },
  TEST_REVIEW: {
    id: "TEST_REVIEW", label: "Test Review", icon: "🔍",
    color: "#475569", textColor: "#fff",
    desc: "Per-question review with correct answer shown.",
    x: 200, y: 980,
    buttons: [
      { label: "Question row", action: "Expands question with explanation", target: null },
      { label: "Back btn", action: "Back to Test Result Detail", target: "TEST_RESULT_DETAIL" },
    ]
  },
  TEST_TUTOR: {
    id: "TEST_TUTOR", label: "Test Tutor (AI)", icon: "🤖",
    color: "#7c3aed", textColor: "#fff",
    desc: "AI explains wrong answers using Gemini.",
    x: 570, y: 980,
    buttons: [
      { label: "Chat input", action: "Sends question to Gemini AI", target: null },
      { label: "Back btn", action: "Back to Test Result Detail", target: "TEST_RESULT_DETAIL" },
    ]
  },
  VIDEO: {
    id: "VIDEO", label: "Video Player", icon: "▶️",
    color: "#0f172a", textColor: "#fff",
    desc: "Chapter lecture video with controls.",
    x: 80, y: 220,
    buttons: [
      { label: "Play/Pause, Seek", action: "Standard video controls", target: null },
      { label: "Back btn", action: "Returns to Study Hub", target: "STUDY" },
    ]
  },
  BATTLE: {
    id: "BATTLE", label: "Battle Room", icon: "⚔️",
    color: "#dc2626", textColor: "#fff",
    desc: "Real-time competitive quiz with other students.",
    x: 80, y: 80,
    buttons: [
      { label: "Join Battle", action: "Matches with online user → live quiz", target: null },
      { label: "Back btn", action: "Returns to Study Hub", target: "STUDY" },
    ]
  },
  LIVE_AI: {
    id: "LIVE_AI", label: "Live AI Interface", icon: "🧠",
    color: "#4f46e5", textColor: "#fff",
    desc: "Real-time AI assistant with camera + mic input.",
    x: 700, y: 80,
    buttons: [
      { label: "Mic / Camera toggle", action: "Activates audio/video input stream", target: null },
      { label: "Send message", action: "Sends to Gemini Live API", target: null },
      { label: "Close btn", action: "Returns to previous screen", target: "HOME" },
    ]
  },
  NEURAL_SOLVER: {
    id: "NEURAL_SOLVER", label: "Neural Solver", icon: "⚡",
    color: "#7c3aed", textColor: "#fff",
    desc: "AI solves any NEET question with explanation.",
    x: 960, y: 430,
    buttons: [
      { label: "Type question + Solve", action: "Calls Gemini → shows answer", target: null },
      { label: "Upload image", action: "Sends image to AI for solving", target: null },
      { label: "Close / Back", action: "Returns to Profile", target: "PROFILE" },
    ]
  },
  EDIT_PROFILE: {
    id: "EDIT_PROFILE", label: "Edit Profile", icon: "✏️",
    color: "#be185d", textColor: "#fff",
    desc: "Edit name, photo, enrolled subjects.",
    x: 960, y: 600,
    buttons: [
      { label: "Save btn", action: "Updates Firestore profile doc", target: "PROFILE" },
      { label: "Back btn", action: "Discards → back to Profile", target: "PROFILE" },
    ]
  },
  NOTES_LIBRARY: {
    id: "NOTES_LIBRARY", label: "Notes Library", icon: "📋",
    color: "#b45309", textColor: "#fff",
    desc: "All saved notes. Filter by subject.",
    x: 960, y: 220,
    buttons: [
      { label: "Note card", action: "Opens note for reading/editing", target: null },
      { label: "PDF Viewer btn", action: "Opens Advanced PDF Viewer", target: "PDF_VIEWER" },
      { label: "Back btn", action: "Back to Profile or Notes", target: "PROFILE" },
    ]
  },
  PDF_VIEWER: {
    id: "PDF_VIEWER", label: "PDF Viewer", icon: "📄",
    color: "#92400e", textColor: "#fff",
    desc: "Advanced PDF reader for study materials.",
    x: 960, y: 80,
    buttons: [
      { label: "Page navigation", action: "Renders next/prev PDF page", target: null },
      { label: "Zoom controls", action: "Adjusts PDF scale", target: null },
      { label: "Back btn", action: "Returns to Notes Library", target: "NOTES_LIBRARY" },
    ]
  },
  NCERT_HUB: {
    id: "NCERT_HUB", label: "NCERT 11th Hub", icon: "📗",
    color: "#065f46", textColor: "#fff",
    desc: "NCERT Class 11 chapter-wise content.",
    x: 700, y: 800,
    buttons: [
      { label: "Chapter select", action: "Loads NCERT chapter content", target: null },
      { label: "Back btn", action: "Returns to Notes", target: "NOTES" },
    ]
  },
  ADMIN_PANEL: {
    id: "ADMIN_PANEL", label: "Admin Panel", icon: "🛡️",
    color: "#1e293b", textColor: "#fff",
    desc: "Admin-only: schedule tests, upload content, manage users.",
    x: 960, y: 800,
    buttons: [
      { label: "Schedule Test btn", action: "Creates test in Firestore", target: null },
      { label: "Question Importer", action: "Opens Question Importer tool", target: "QUESTION_IMPORTER" },
      { label: "Admin Chat btn", action: "Opens Admin Chat Page", target: "ADMIN_CHAT" },
      { label: "Back btn", action: "Returns to Profile", target: "PROFILE" },
    ]
  },
  ADMIN_CHAT: {
    id: "ADMIN_CHAT", label: "Admin Chat", icon: "💬",
    color: "#0f172a", textColor: "#fff",
    desc: "Admin can broadcast messages to all users.",
    x: 1200, y: 800,
    buttons: [
      { label: "Send message", action: "Posts to Firestore publicChat", target: null },
      { label: "Back btn", action: "Back to Admin Panel", target: "ADMIN_PANEL" },
    ]
  },
  QUESTION_IMPORTER: {
    id: "QUESTION_IMPORTER", label: "Question Importer", icon: "📥",
    color: "#374151", textColor: "#fff",
    desc: "Admin imports questions to Firestore.",
    x: 1200, y: 600,
    buttons: [
      { label: "Upload CSV/JSON", action: "Parses file → imports to Firestore", target: null },
      { label: "Back btn", action: "Back to Admin Panel", target: "ADMIN_PANEL" },
    ]
  },
  SUPPORT: {
    id: "SUPPORT", label: "Technical Support", icon: "🛠️",
    color: "#374151", textColor: "#fff",
    desc: "Report bugs, contact support team.",
    x: 1200, y: 430,
    buttons: [
      { label: "Submit report", action: "Sends feedback to Firestore", target: null },
      { label: "Back btn", action: "Returns to Profile", target: "PROFILE" },
    ]
  },
  FOCUS_OVERLAY: {
    id: "FOCUS_OVERLAY", label: "Focus Camera Overlay", icon: "👁️",
    color: "#0c4a6e", textColor: "#fff",
    desc: "Camera-based distraction detection overlay.",
    x: 80, y: 600,
    buttons: [
      { label: "Distraction alert", action: "Shows distraction overlay + beep", target: null },
      { label: "Disable Focus btn", action: "Turns off camera detection", target: "STUDY" },
    ]
  },
  FOCUS_SUMMARY: {
    id: "FOCUS_SUMMARY", label: "Focus Session Summary", icon: "⏱️",
    color: "#164e63", textColor: "#fff",
    desc: "Shows focused vs distracted time chart.",
    x: 1200, y: 220,
    buttons: [
      { label: "Close / Done", action: "Returns to Study Hub", target: "STUDY" },
    ]
  },
  ANALYSIS_HISTORY: {
    id: "ANALYSIS_HISTORY", label: "Analysis History", icon: "📈",
    color: "#14532d", textColor: "#fff",
    desc: "Full test performance history with charts.",
    x: 1200, y: 80,
    buttons: [
      { label: "Filter by subject", action: "Filters results", target: null },
      { label: "Result row", action: "Opens Test Result Detail", target: "TEST_RESULT_DETAIL" },
      { label: "Back btn", action: "Back to Analytics", target: "ANALYTICS" },
    ]
  },
};

// Connections: [from, to, label]
const CONNECTIONS = [
  ["LOGIN", "HOME", "Auth success"],
  ["HOME", "STUDY", "Study Hub card"],
  ["HOME", "TESTS", "BottomNav Tests"],
  ["HOME", "ANALYTICS", "BottomNav Analytics"],
  ["HOME", "NOTES", "BottomNav Notes"],
  ["HOME", "PROFILE", "BottomNav Profile"],
  ["HOME", "LIVE_AI", "Live AI btn"],
  ["HOME", "CUSTOM_PRACTICE", "Quick Practice"],
  ["STUDY", "VIDEO", "Play chapter"],
  ["STUDY", "BATTLE", "Battle btn"],
  ["STUDY", "CUSTOM_PRACTICE", "Custom Practice btn"],
  ["STUDY", "FOCUS_OVERLAY", "Enable Focus Mode"],
  ["STUDY", "FOCUS_SUMMARY", "FOCUS MODE label"],
  ["STUDY", "PRACTICE_TEST", "Resume Test"],
  ["STUDY", "TEST_RESULT_DETAIL", "See Results"],
  ["STUDY", "TESTS", "HubSwitcher"],
  ["CUSTOM_PRACTICE", "PRACTICE_TEST", "Start Practice"],
  ["PRACTICE_TEST", "TEST_RESULT_DETAIL", "Submit"],
  ["TESTS", "PYQ_RUNNER", "Start PYQ / Scheduled"],
  ["TESTS", "CUSTOM_PRACTICE", "Custom Test"],
  ["TESTS", "TEST_RESULT_DETAIL", "See Result"],
  ["PYQ_RUNNER", "TEST_RESULT_DETAIL", "Submit"],
  ["TEST_RESULT_DETAIL", "TEST_REVIEW", "Review Answers"],
  ["TEST_RESULT_DETAIL", "TEST_TUTOR", "AI Tutor"],
  ["ANALYTICS", "TEST_RESULT_DETAIL", "Result row"],
  ["PROFILE", "EDIT_PROFILE", "Edit Profile"],
  ["PROFILE", "NEURAL_SOLVER", "Neural Solver card"],
  ["PROFILE", "NOTES_LIBRARY", "Notes Library card"],
  ["PROFILE", "ADMIN_PANEL", "Admin Panel"],
  ["PROFILE", "SUPPORT", "Technical Support"],
  ["PROFILE", "LOGIN", "Logout"],
  ["NOTES", "NCERT_HUB", "NCERT Hub btn"],
  ["NOTES", "NOTES_LIBRARY", "Notes Library btn"],
  ["NOTES_LIBRARY", "PDF_VIEWER", "PDF Viewer"],
  ["ADMIN_PANEL", "ADMIN_CHAT", "Admin Chat"],
  ["ADMIN_PANEL", "QUESTION_IMPORTER", "Question Importer"],
  ["ANALYSIS_HISTORY", "TEST_RESULT_DETAIL", "Result row"],
];

const W = 160, H = 58;

function getCenter(screen) {
  return { x: screen.x + W / 2, y: screen.y + H / 2 };
}

function Arrow({ from, to, label, highlighted }) {
  const f = SCREENS[from], t = SCREENS[to];
  if (!f || !t) return null;
  const fc = getCenter(f), tc = getCenter(t);
  const dx = tc.x - fc.x, dy = tc.y - fc.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / dist, uy = dy / dist;
  const sx = fc.x + ux * (W / 2 + 2);
  const sy = fc.y + uy * (H / 2 + 2);
  const ex = tc.x - ux * (W / 2 + 10);
  const ey = tc.y - uy * (H / 2 + 10);
  const mx = (sx + ex) / 2 - uy * 28;
  const my = (sy + ey) / 2 + ux * 28;
  const path = `M${sx},${sy} Q${mx},${my} ${ex},${ey}`;
  const arrowColor = highlighted ? "#f97316" : "#334155";
  const opacity = highlighted ? 1 : 0.35;

  // label midpoint along curve (t=0.5)
  const lx = 0.25 * sx + 0.5 * mx + 0.25 * ex;
  const ly = 0.25 * sy + 0.5 * my + 0.25 * ey;

  return (
    <g style={{ opacity }}>
      <defs>
        <marker id={`arr-${from}-${to}`} markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <polygon points="0 0, 7 3.5, 0 7" fill={arrowColor} />
        </marker>
      </defs>
      <path
        d={path}
        fill="none"
        stroke={arrowColor}
        strokeWidth={highlighted ? 2.5 : 1.5}
        markerEnd={`url(#arr-${from}-${to})`}
        strokeDasharray={highlighted ? "none" : "5,3"}
      />
      {highlighted && (
        <text x={lx} y={ly - 6} textAnchor="middle" fontSize="9" fill="#f97316" fontWeight="bold"
          style={{ fontFamily: "monospace" }}>
          {label}
        </text>
      )}
    </g>
  );
}

function ScreenNode({ screen, isSelected, isHighlighted, isDimmed, onClick }) {
  const { id, label, icon, color, x, y } = screen;
  const opacity = isDimmed ? 0.25 : 1;
  const scale = isSelected ? 1.06 : 1;

  return (
    <g
      transform={`translate(${x},${y}) scale(${scale})`}
      style={{
        transformOrigin: `${W / 2}px ${H / 2}px`,
        cursor: "pointer",
        opacity,
        transition: "opacity 0.2s, transform 0.15s",
        filter: isSelected ? `drop-shadow(0 0 10px ${color}99)` : isHighlighted ? `drop-shadow(0 0 6px ${color}66)` : "none",
      }}
      onClick={() => onClick(id)}
    >
      <rect
        width={W} height={H}
        rx={10} ry={10}
        fill={isSelected ? color : isHighlighted ? color + "cc" : "#1e293b"}
        stroke={isSelected || isHighlighted ? color : "#334155"}
        strokeWidth={isSelected ? 2.5 : 1.5}
      />
      <text x={14} y={22} fontSize="15" dominantBaseline="middle">{icon}</text>
      <text
        x={34} y={22}
        fontSize="11.5"
        fontWeight="700"
        fill={isSelected || isHighlighted ? "#fff" : "#e2e8f0"}
        dominantBaseline="middle"
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        {label.length > 16 ? label.slice(0, 15) + "…" : label}
      </text>
      <text
        x={14} y={42}
        fontSize="9"
        fill={isSelected ? "#fff" : "#94a3b8"}
        dominantBaseline="middle"
        style={{ fontFamily: "monospace" }}
      >
        {screen.buttons.length} button{screen.buttons.length !== 1 ? "s" : ""}
      </text>
    </g>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [selected, setSelected] = useState(null);
  const [hoveredConn, setHoveredConn] = useState(null);
  const [pan, setPan] = useState({ x: -20, y: -20 });
  const [zoom, setZoom] = useState(0.72);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const svgRef = useRef(null);

  const screen = selected ? SCREENS[selected] : null;

  // Connected screen IDs from/to selected
  const connectedFrom = selected
    ? CONNECTIONS.filter(([f]) => f === selected).map(([, t]) => t)
    : [];
  const connectedTo = selected
    ? CONNECTIONS.filter(([, t]) => t === selected).map(([f]) => f)
    : [];
  const connected = [...new Set([...connectedFrom, ...connectedTo])];

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.06 : 0.06;
    setZoom((z) => Math.min(1.4, Math.max(0.3, z + delta)));
  }, []);

  const handleMouseDown = (e) => {
    if (e.target.tagName === "svg" || e.target.tagName === "rect" && e.target.parentNode.tagName === "svg") {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };
  const handleMouseMove = (e) => {
    if (isDragging && dragStart) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };
  const handleMouseUp = () => { setIsDragging(false); setDragStart(null); };

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.addEventListener("wheel", handleWheel, { passive: false });
    return () => svg.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const handleNodeClick = (id) => {
    setSelected((prev) => (prev === id ? null : id));
  };

  const handleConnClick = (targetId) => {
    setSelected(targetId);
  };

  const canvasW = 1400, canvasH = 1100;

  return (
    <div style={{
      width: "100vw", height: "100vh", background: "#0a0f1e",
      display: "flex", flexDirection: "column", overflow: "hidden",
      fontFamily: "'DM Mono', 'Fira Mono', monospace",
    }}>
      {/* Header */}
      <div style={{
        padding: "10px 20px", borderBottom: "1px solid #1e293b",
        display: "flex", alignItems: "center", gap: 16,
        background: "#0d1526", flexShrink: 0,
        boxShadow: "0 2px 12px #0008",
      }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#f97316", letterSpacing: 1 }}>
          NeetMaster
        </div>
        <div style={{ fontSize: 11, color: "#64748b" }}>App Flow Roadmap</div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 10, color: "#475569" }}>
          🖱 Drag to pan · Scroll to zoom · Click screen to inspect
        </div>
        <div style={{
          background: "#1e293b", borderRadius: 6, padding: "4px 10px",
          fontSize: 10, color: "#94a3b8"
        }}>
          {Object.keys(SCREENS).length} screens · {CONNECTIONS.length} transitions
        </div>
        <button
          onClick={() => { setZoom(0.72); setPan({ x: -20, y: -20 }); setSelected(null); }}
          style={{
            background: "#1e293b", border: "1px solid #334155",
            borderRadius: 6, padding: "4px 10px", color: "#94a3b8",
            cursor: "pointer", fontSize: 10,
          }}
        >
          ↺ Reset View
        </button>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Canvas */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <svg
            ref={svgRef}
            width="100%" height="100%"
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={(e) => { if (e.target === svgRef.current) setSelected(null); }}
          >
            <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
              {/* Connections */}
              {CONNECTIONS.map(([from, to, label]) => {
                const isHL = selected ? (from === selected || to === selected) : false;
                return (
                  <Arrow
                    key={`${from}-${to}`}
                    from={from} to={to} label={label}
                    highlighted={isHL}
                  />
                );
              })}

              {/* Nodes */}
              {Object.values(SCREENS).map((s) => {
                const isSelected = selected === s.id;
                const isHL = selected ? connected.includes(s.id) : false;
                const isDimmed = selected ? (!isSelected && !isHL) : false;
                return (
                  <ScreenNode
                    key={s.id}
                    screen={s}
                    isSelected={isSelected}
                    isHighlighted={isHL}
                    isDimmed={isDimmed}
                    onClick={handleNodeClick}
                  />
                );
              })}
            </g>
          </svg>

          {/* Zoom indicator */}
          <div style={{
            position: "absolute", bottom: 14, right: 14,
            background: "#1e293b", borderRadius: 6, padding: "4px 10px",
            fontSize: 10, color: "#64748b", border: "1px solid #334155",
          }}>
            {Math.round(zoom * 100)}%
          </div>
        </div>

        {/* Side Panel */}
        <div style={{
          width: screen ? 320 : 0,
          minWidth: screen ? 320 : 0,
          transition: "width 0.25s ease, min-width 0.25s ease",
          overflow: "hidden",
          background: "#0d1526",
          borderLeft: "1px solid #1e293b",
          flexShrink: 0,
          display: "flex", flexDirection: "column",
        }}>
          {screen && (
            <>
              {/* Screen header */}
              <div style={{
                padding: "16px 18px 12px",
                borderBottom: "1px solid #1e293b",
                background: screen.color + "22",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 22 }}>{screen.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#f8fafc" }}>{screen.label}</span>
                  <button
                    onClick={() => setSelected(null)}
                    style={{
                      marginLeft: "auto", background: "none", border: "none",
                      color: "#64748b", cursor: "pointer", fontSize: 16, lineHeight: 1,
                    }}
                  >✕</button>
                </div>
                <div style={{ fontSize: 10, color: "#94a3b8", lineHeight: 1.5 }}>{screen.desc}</div>
              </div>

              {/* Buttons list */}
              <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#475569", letterSpacing: 1, marginBottom: 10 }}>
                  BUTTONS & ACTIONS ({screen.buttons.length})
                </div>

                {screen.buttons.map((btn, i) => (
                  <div
                    key={i}
                    onClick={() => btn.target && handleConnClick(btn.target)}
                    style={{
                      background: "#1e293b",
                      borderRadius: 8, padding: "10px 12px",
                      marginBottom: 8,
                      borderLeft: `3px solid ${btn.target ? screen.color : "#334155"}`,
                      cursor: btn.target ? "pointer" : "default",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#263346"}
                    onMouseLeave={e => e.currentTarget.style.background = "#1e293b"}
                  >
                    <div style={{
                      fontSize: 11, fontWeight: 700, color: "#e2e8f0", marginBottom: 4,
                      display: "flex", alignItems: "center", gap: 6
                    }}>
                      <span style={{
                        background: screen.color + "33", color: screen.color,
                        borderRadius: 4, padding: "1px 6px", fontSize: 9,
                      }}>BTN</span>
                      {btn.label}
                    </div>
                    <div style={{ fontSize: 10, color: "#64748b", lineHeight: 1.5 }}>
                      → {btn.action}
                    </div>
                    {btn.target && (
                      <div style={{
                        marginTop: 5, fontSize: 9, color: screen.color,
                        display: "flex", alignItems: "center", gap: 4
                      }}>
                        <span>Navigates to:</span>
                        <span style={{
                          background: screen.color + "22", padding: "1px 6px",
                          borderRadius: 4, fontWeight: 700
                        }}>
                          {SCREENS[btn.target]?.icon} {SCREENS[btn.target]?.label}
                        </span>
                      </div>
                    )}
                  </div>
                ))}

                {/* Connected screens */}
                <div style={{ fontSize: 9, fontWeight: 700, color: "#475569", letterSpacing: 1, marginTop: 16, marginBottom: 8 }}>
                  CONNECTED SCREENS
                </div>
                {CONNECTIONS.filter(([f, t]) => f === selected || t === selected).map(([f, t, label]) => {
                  const isOut = f === selected;
                  const otherId = isOut ? t : f;
                  const other = SCREENS[otherId];
                  if (!other) return null;
                  return (
                    <div
                      key={`${f}-${t}`}
                      onClick={() => handleConnClick(otherId)}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "7px 10px", background: "#1e293b",
                        borderRadius: 6, marginBottom: 5, cursor: "pointer",
                        borderLeft: `2px solid ${isOut ? "#10b981" : "#f59e0b"}`,
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "#263346"}
                      onMouseLeave={e => e.currentTarget.style.background = "#1e293b"}
                    >
                      <span style={{ fontSize: 9, color: isOut ? "#10b981" : "#f59e0b", fontWeight: 700 }}>
                        {isOut ? "→ OUT" : "← IN"}
                      </span>
                      <span style={{ fontSize: 10, color: "#e2e8f0" }}>{other.icon} {other.label}</span>
                      <span style={{ fontSize: 9, color: "#475569", marginLeft: "auto" }}>{label}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      {!selected && (
        <div style={{
          position: "absolute", bottom: 14, left: 14,
          background: "#0d1526cc", borderRadius: 8, padding: "10px 14px",
          border: "1px solid #1e293b", fontSize: 10, color: "#64748b",
          backdropFilter: "blur(6px)",
        }}>
          <div style={{ fontWeight: 700, color: "#94a3b8", marginBottom: 6 }}>LEGEND</div>
          {[
            ["🟠 Orange", "Home / Main screens"],
            ["🟣 Purple", "Tests & AI features"],
            ["🔵 Blue", "Study content"],
            ["🟢 Green", "Analytics"],
            ["🔴 Red", "Competitive / Alert"],
          ].map(([col, desc]) => (
            <div key={col} style={{ marginBottom: 3 }}>
              <span>{col}</span>
              <span style={{ marginLeft: 8, color: "#475569" }}>{desc}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

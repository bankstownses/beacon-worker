import React, { useState, useEffect, useRef, createContext, useContext } from "https://esm.sh/react@18.3.1";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client";
import { ClipboardList, Plus, Send, Sun, Moon, RefreshCw, Wifi, WifiOff } from "https://esm.sh/lucide-react@0.383.0?deps=react@18.3.1";

// ---------------------------------------------------------------
// This talks to the same live backend as the rest of the BKK apps,
// so it shows real, current data immediately -- no separate setup.
// ---------------------------------------------------------------
const SERVER_URL = "https://api.bankstownses.com";
const INCIDENTS_APP_URL = "https://incidents.bankstownses.com";
const VEHICLES = ["BKK31", "BKK32", "BKK33", "BKK36", "BKK37", "BKK44", "BKK56", "SES59", "SES43K", "BKK-FEIGE", "BKK-ALLPORT", "BKK-OFEIGE"];
const RESCUE_TYPES = ["FR", "RCR", "GLR", "CFR", "VR", "LAR"];
const INCIDENT_TYPES = ["Storm", "Support", "Flood Support", "Tsunami"];
const REJECT_REASONS = ["Asset N/A", "Team N/A", "Wrong Unit", "Other"];
const CANCEL_REASONS = ["Created in error", "Duplicate", "No longer required", "Not an SES task", "Other"];
const FLOOD_RESCUE_CATEGORY_DESC = {
  1: "Critical assistance – person underwater / rescuer in duress",
  2: "Imminent threat to life – person in water",
  3: "Person trapped – water rising",
  4: "Person trapped – water level and platform stable",
  5: "Domestic animal rescue"
};
const SUBURBS = ["Bankstown", "Chullora", "Greenacre", "Punchbowl", "Bass Hill", "Chester Hill", "Condell Park", "Georges Hall", "Revesby", "Padstow"];
const RANDOM_FIRST_NAMES = ["Jamie", "Alex", "Sam", "Chris", "Jordan", "Taylor", "Sarah", "Michael", "Emma", "Daniel"];
const RANDOM_LAST_NAMES = ["Smith", "Jones", "Brown", "Nguyen", "Wilson", "Taylor", "Lee", "Chen", "Patel", "Cooper"];
const RANDOM_STREET_NAMES = ["Park", "High", "Main", "Church", "King", "Queen", "George", "William", "Victoria", "Station"];
const RANDOM_STREET_TYPES = ["Street", "Road", "Avenue", "Place", "Crescent", "Drive"];
const RANDOM_AGENCIES = ["NSWPF", "FRNSW", "Ambulance NSW", "Council", "Neighbour", "Resident", "WIRES"];
const RANDOM_NOTES = ["Called back to confirm details", "Resident advised to stay clear of area", "Awaiting further update from caller", "Photos taken on arrival", "Spoke to neighbour on scene"];
const GENERAL_INCIDENT_TEMPLATES = [{
  situationOnScene: "ROOF LEAKING. WATER INCOMING TO LOUNGEROOM.",
  tags: ["Ceiling Damage", "Leaking Roof", "Roof Damage", "Tiled Roof"],
  priority: "General"
}, {
  situationOnScene: "LARGE BRANCH DOWN ON ROOF, ROOF DAMAGE",
  tags: ["Branch Down", "1 Storey", "Owner", "Residential"],
  priority: "General"
}, {
  situationOnScene: "TREE DOWN OVER CAR AND HAS TAKEN DOWN POWERLINES",
  tags: ["Tree Down", "Power Lines Down", "Car/Vehicle", "Road"],
  priority: "General"
}, {
  situationOnScene: "TREE BRANCH DOWN NATURE STRIP. BLOCKING HALF THE LANE.",
  tags: ["Branch Down", "Council Land", "Road"],
  priority: "Priority"
}, {
  situationOnScene: "CARPORT COLLAPSED DUE TO WIND - BLOCKING ACCESS TO THE REAR OF THE HOME",
  tags: ["Other", "Driveway", "Owner", "Yard"],
  priority: "General"
}, {
  situationOnScene: "HOUSE FLOODING - WATER COMING FROM ROOF AND COMING FROM ROOF OF FRONT DOOR",
  tags: ["Flood Threatening", "Leaking Roof", "1 Storey"],
  priority: "General"
}];
const RESCUE_TEMPLATES = [{
  rescueType: "FR",
  floodRescueCategory: "3",
  situationOnScene: "INFORMANT VEHICLE IN FLOOD WATER - CAN SEE EMERGENCY SERVICES"
}, {
  rescueType: "GLR",
  situationOnScene: "PERSON REPORTED STUCK IN DIFFICULT TERRAIN, UNABLE TO SELF-EXTRICATE"
}, {
  rescueType: "RCR",
  situationOnScene: "MVA - PERSON TRAPPED IN VEHICLE, REQUIRES EXTRICATION"
}];
const SUPPORT_TEMPLATES = [{
  requestingAgency: "NSWPF",
  situationOnScene: "LIGHTING AT CRIME SCENE - APPROX 10 LIGHTS REQUIRED"
}, {
  requestingAgency: "NSWPF",
  situationOnScene: "TREE DOWN ONTO FENCE AFTER MVA - NPT"
}];
const TAG_TAXONOMY = [{
  id: "damage",
  label: "Damage",
  groups: [{
    label: "Damage - Tree",
    tags: ["Branch Down", "Branch Threatening", "Tree Down", "Tree Threatening"]
  }, {
    label: "Damage - Building",
    tags: ["Building Collapse", "Ceiling Damage", "Door Damage", "Flood Threatening", "Flooded", "Flooded - Riverine", "Leaking Roof", "Other", "Roof Damage", "Subsidence", "Threat of Collapse", "Wall Damage", "Window Damage"]
  }]
}, {
  id: "hazard",
  label: "Hazards",
  groups: [{
    label: "Hazards - Building",
    tags: ["Fibro/Asbestos", "Satellite Dish", "Skylight", "Solar Hot Water", "Solar Power", "Water Rising", "Water Steady or Falling"]
  }, {
    label: "Hazards - Miscellaneous",
    tags: ["Animals", "Erosion", "Other"]
  }, {
    label: "Hazards - Utility",
    tags: ["Blocked Drain", "Burst Gas", "Burst Sewer", "Burst Water", "Electrical", "Power Lines Down", "Power Lines Threatened"]
  }]
}, {
  id: "property",
  label: "Property",
  groups: [{
    label: "Property - Critical Infrastructure",
    tags: ["Aged Care", "Day Care", "Hospital", "Major Utility", "School"]
  }, {
    label: "Property - Roof / Height",
    tags: ["1 Storey", "2 Storeys", "> 2 Storeys", "Av Slope Roof", "Colourbond", "Fibro", "Flat Roof", "Iron Roof", "Slate Roof", "Steep Roof", "Tiled Roof"]
  }, {
    label: "Property - Ownership",
    tags: ["Commercial", "Council/Government", "Owner", "Public Housing", "Renter", "Residential"]
  }, {
    label: "Property - Type",
    tags: ["Basement", "Bedroom", "Bridge", "Building", "Car / Vehicle", "Caravan / Mobile Home", "Causeway", "Council Land", "Crown Land", "Detached", "Driveway", "Fence", "Garage", "National Park", "Path", "Pool", "Retaining Wall", "Road", "Shed / Workshop", "Terrace", "Townhouse", "Unit", "Vacant Block", "Veranda / Deck", "Yard"]
  }]
}, {
  id: "specialNeeds",
  label: "Special Needs",
  groups: [{
    label: "Special Needs",
    tags: ["Aged", "Carer", "Hearing Impaired", "Infirm", "Medical", "Non-English Speaking", "Sight Impaired", "Walking Aid", "Wheelchair"]
  }]
}, {
  id: "task",
  label: "Tasks",
  groups: [{
    label: "Tasks - Miscellaneous",
    tags: ["40km/hr Zone Incident", "Animal Clearance", "Assist Evac", "Body Recovery", "Bushfire Support", "Catering Transport", "Chain Sawing", "Communications", "DPI Support", "Evacuation Required", "Evidence Search", "First Aid", "Flood Intel Collection", "FRAO", "Fuel Drops", "Liaison", "Lighting", "Other", "Pandemic Support", "Patient Lift", "PLB Response", "Pumping", "Radio Duress", "Recovery", "Resupply – Equipment", "Sandbagging", "Shoring", "Tarping", "Transport", "Vehicle Retrieval", "Vessel Used"]
  }, {
    label: "Tasks - Search",
    tags: ["Land Search"]
  }, {
    label: "Tasks - Search Category",
    tags: ["Alpine", "Canyon", "On-Water", "Open", "Remote", "Rugged", "Suburban"]
  }, {
    label: "Tasks - Traffic/People",
    tags: ["Crowd Assistance", "Door Knocking", "Driver Reviver", "Land Recon", "Road Closure", "Traffic Assistance"]
  }]
}, {
  id: "aviation",
  label: "Aviation",
  groups: [{
    label: "Aviation",
    tags: ["Air Recon", "Air Search", "Air Support", "Body Recovery", "Evacuation", "Flood Assistance", "Fuel Drops", "Land Search", "Other", "Resupply", "RPAS", "Water Search"]
  }]
}, {
  id: "pscu",
  label: "PSCU",
  groups: [{
    label: "PSCU Activity Types",
    tags: ["PSCU CFR", "PSCU Flood Rescue", "PSCU GLR", "PSCU Land Search", "PSCU Large Scale Event", "PSCU LOD Death", "PSCU LOD Injury", "PSCU PAD", "PSCU RCR", "PSCU Storm", "PSCU USAR", "PSCU VR"]
  }, {
    label: "PSCU Intervention Types",
    tags: ["PSCU Chaplain Visit", "PSCU On Scene Support", "PSCU PFA", "PSCU Targeted Education"]
  }]
}, {
  id: "floodMisc",
  label: "Flood Misc",
  groups: [{
    label: "Flood Misc",
    tags: ["Clean-up Assistance", "Furniture Lift Required", "General Assistance", "Other", "Pumping Required", "Recovery Assistance", "Sandbags Required"]
  }]
}];
function shortId(id) { return (id || "").replace(/^Incident /, ""); }

// Blends fgHex at the given alpha (0-1) over bgHex, returning a fully
// opaque solid colour -- used for the sticky Id column, which can't
// use a translucent tint or cells scrolling underneath it show through.
function blendOverBg(fgHex, alpha, bgHex) {
  const hexToRgb = (h) => {
    const n = parseInt(h.replace("#", ""), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  };
  const fg = hexToRgb(fgHex);
  const bg = hexToRgb(bgHex);
  const r = Math.round(bg.r * (1 - alpha) + fg.r * alpha);
  const g = Math.round(bg.g * (1 - alpha) + fg.g * alpha);
  const b = Math.round(bg.b * (1 - alpha) + fg.b * alpha);
  return `rgb(${r}, ${g}, ${b})`;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randomBool(chance = 0.5) {
  return Math.random() < chance;
}
function formatDT(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-AU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

// ---------------------------------------------------------------
// SERVER STATE -- polls /state, exposes dispatch() for /action
// ---------------------------------------------------------------
function useServerState(serverUrl) {
  const [state, setState] = useState(null);
  const [connected, setConnected] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    let cancelled = false;
    let timer = null;
    const poll = async () => {
      try {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 15000);
        const res = await fetch(`${serverUrl}/state`, {
          headers: {
            "ngrok-skip-browser-warning": "true"
          },
          signal: controller.signal
        });
        clearTimeout(t);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setState(data);
          setConnected(true);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setConnected(false);
          setError(e.message);
        }
      } finally {
        if (!cancelled) timer = setTimeout(poll, 3000);
      }
    };
    poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [serverUrl]);
  const dispatch = async (type, payload) => {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(`${serverUrl}/action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({
          type,
          payload
        }),
        signal: controller.signal
      });
      clearTimeout(t);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");
      if (data.state) setState(data.state);
      return data.result;
    } catch (e) {
      clearTimeout(t);
      throw e;
    }
  };
  return {
    state,
    connected,
    error,
    dispatch
  };
}

// ---------------------------------------------------------------
// ROUTER -- real URL paths via the History API, no hash routing.
// ---------------------------------------------------------------
function useRouter() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const navigate = to => {
    if (to === window.location.pathname) return;
    window.history.pushState({}, "", to);
    setPath(to);
    window.scrollTo(0, 0);
  };
  return {
    path,
    navigate
  };
}
function Link({
  to,
  navigate,
  children,
  style,
  className
}) {
  return /*#__PURE__*/React.createElement("a", {
    href: to,
    className: className,
    onClick: e => {
      e.preventDefault();
      navigate(to);
    },
    style: {
      textDecoration: "none",
      cursor: "pointer",
      ...style
    }
  }, children);
}

// ---------------------------------------------------------------
// THEME -- toggles between BKK's dark theme and a light theme
// styled after the real Beacon system.
// ---------------------------------------------------------------
const THEMES = {
  dark: {
    name: "dark",
    bg: "#05070a",
    panel: "#161B20",
    panelAlt: "#0d1114",
    border: "#2E373F",
    text: "#F2F5F6",
    textMuted: "#B7C0C8",
    textFaint: "#7C8791",
    textGhost: "#5c6771",
    accent: "#2F8FD1",
    accentText: "#05070a",
    navBg: "#0d1114",
    navText: "#F2F5F6",
    navBorder: "#1c2228",
    tableHeadBg: "#161B20",
    tableRowBorder: "#1c2228",
    tableRowHover: "#161B20",
    fontUi: "Inter, -apple-system, sans-serif",
    fontMono: "'JetBrains Mono', monospace"
  },
  light: {
    name: "light",
    bg: "#eef1f4",
    panel: "#ffffff",
    panelAlt: "#f7f8fa",
    border: "#d7dde3",
    text: "#1f2933",
    textMuted: "#3e4c59",
    textFaint: "#7b8794",
    textGhost: "#9aa5b1",
    accent: "#2f6fb0",
    accentText: "#ffffff",
    navBg: "#2c3e50",
    navText: "#ffffff",
    navBorder: "#1f2c39",
    tableHeadBg: "#f7f8fa",
    tableRowBorder: "#e4e9ed",
    tableRowHover: "#f2f5f8",
    fontUi: "-apple-system, 'Segoe UI', Arial, sans-serif",
    fontMono: "Consolas, monospace"
  }
};
const ThemeContext = createContext(THEMES.dark);
function useTheme() {
  return useContext(ThemeContext);
}
const PRIORITY_COLORS_DARK = {
  Immediate: "#D9463D",
  Priority: "#E8B23C",
  General: "#2F8FD1"
};
const PRIORITY_COLORS_LIGHT = {
  Immediate: "#c0392b",
  Priority: "#b7860b",
  General: "#2f6fb0"
};

// HQ display codes and the zone (Parent HQ) each one belongs to.
const HQ_CODES = { "Bankstown": "BKK" };
const HQ_ZONE_CODES = { "Bankstown": "MTZ" };

// The Categories column shows the PSCU letter (Orange=O, Red=R) and/or
// the Flood Rescue Category number (1-5) -- combined as e.g. "R3" when
// both are set on the incident.
function categoryLabel(inc) {
  const pscuLetter = inc.pscuCategory === "Orange" ? "O" : inc.pscuCategory === "Red" ? "R" : null;
  const floodNum = inc.floodRescueCategory || null;
  if (pscuLetter && floodNum) return `${pscuLetter}${floodNum}`;
  if (pscuLetter) return pscuLetter;
  if (floodNum) return floodNum;
  return "—";
}

// Response-type colour for the Register: life-threatening jobs and
// Priority/Immediate responses get specific fixed colours; General
// uses the theme's normal text colour (white in dark mode) instead
// of the old blue.
function priorityDisplayColor(inc, theme) {
  if (inc.lifeThreatening === "Yes") return "#a94442";
  if (inc.priority === "Priority") return "#8a6d3b";
  if (inc.priority === "Immediate") return "#31708f";
  return theme.text;
}

const STATUS_COLORS_DARK = {
  New: "#8A6FD1",
  Active: "#2F8FD1",
  Tasked: "#E8B23C",
  Referred: "#E4780C",
  Rejected: "#D9463D",
  Cancelled: "#7C8791",
  Complete: "#3FA34D",
  Finalised: "#3a444d"
};
const STATUS_COLORS_LIGHT = {
  New: "#6c5ce7",
  Active: "#2f6fb0",
  Tasked: "#b7860b",
  Referred: "#b35a00",
  Rejected: "#c0392b",
  Cancelled: "#7b8794",
  Complete: "#2e8b57",
  Finalised: "#5a6470"
};
function Chip({
  label,
  color,
  theme
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: theme.fontMono,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.02em",
      color,
      background: color + "22",
      border: `1px solid ${color}55`,
      padding: "2px 8px",
      borderRadius: 5,
      display: "inline-block",
      whiteSpace: "nowrap"
    }
  }, label);
}

// ---------------------------------------------------------------
// TOP NAV
// ---------------------------------------------------------------
function TopNav({
  path,
  navigate,
  theme,
  toggleTheme
}) {
  const [jobsOpen, setJobsOpen] = useState(false);
  const linkStyle = active => ({
    color: theme.navText,
    fontFamily: theme.fontUi,
    fontSize: 14,
    fontWeight: active ? 700 : 500,
    padding: "10px 14px",
    opacity: active ? 1 : 0.85
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: theme.navBg,
      borderBottom: `1px solid ${theme.navBorder}`,
      position: "sticky",
      top: 0,
      zIndex: 50
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "top-nav-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "top-nav-left"
  }, /*#__PURE__*/React.createElement(Link, {
    to: "/",
    navigate: navigate,
    style: {
      color: theme.navText,
      fontFamily: "Oswald, sans-serif",
      fontWeight: 700,
      fontSize: 18,
      padding: "14px 16px 14px 0"
    }
  }, "beacon"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    },
    onMouseEnter: () => setJobsOpen(true),
    onMouseLeave: () => setJobsOpen(false)
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      ...linkStyle(path.startsWith("/Jobs")),
      cursor: "pointer",
      display: "inline-block"
    }
  }, "Incidents ▾"), jobsOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: "100%",
      left: 0,
      background: theme.panel,
      border: `1px solid ${theme.border}`,
      borderRadius: 6,
      minWidth: 200,
      boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
      overflow: "hidden"
    }
  }, [{
    to: "/Jobs/Create",
    label: "Create New Incident"
  }, {
    to: "/Jobs",
    label: "Incident Register"
  }, {
    to: "/Jobs/Tasking",
    label: "Tasking"
  }].map(item => /*#__PURE__*/React.createElement(Link, {
    key: item.to,
    to: item.to,
    navigate: navigate,
    style: {
      display: "block",
      padding: "10px 16px",
      color: theme.text,
      fontFamily: theme.fontUi,
      fontSize: 13.5,
      borderBottom: `1px solid ${theme.border}`
    }
  }, item.label))))), /*#__PURE__*/React.createElement("button", {
    onClick: toggleTheme,
    title: "Toggle theme",
    style: {
      background: "none",
      border: `1px solid ${theme.navBorder}`,
      borderRadius: 6,
      color: theme.navText,
      padding: "6px 10px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 6,
      fontSize: 12.5,
      fontFamily: theme.fontUi
    }
  }, theme.name === "dark" ? /*#__PURE__*/React.createElement(Sun, {
    size: 14
  }) : /*#__PURE__*/React.createElement(Moon, {
    size: 14
  }), theme.name === "dark" ? "Light" : "Dark")));
}
function ConnectionBar({
  connected,
  error,
  theme
}) {
  if (connected !== false) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#D9463D18",
      borderBottom: "1px solid #D9463D55",
      color: "#D9463D",
      fontFamily: theme.fontUi,
      fontSize: 12.5,
      padding: "7px 20px",
      textAlign: "center"
    }
  }, "Can't reach the server", error ? ` (${error})` : "", " — retrying…");
}

// ---------------------------------------------------------------
// DASHBOARD (/)
// ---------------------------------------------------------------
function Dashboard({
  state,
  navigate,
  theme
}) {
  const incidents = state?.allIncidents || [];
  const activeCount = incidents.filter(i => i.status === "Active" || i.status === "New").length;
  const completeCount = incidents.filter(i => i.status === "Complete" || i.status === "Finalised").length;
  const statCard = (label, value, color) => /*#__PURE__*/React.createElement("div", {
    style: {
      background: theme.panel,
      border: `1px solid ${theme.border}`,
      borderRadius: 8,
      padding: "18px 20px",
      flex: 1,
      minWidth: 160
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: theme.fontUi,
      fontSize: 12,
      color: theme.textFaint,
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      marginBottom: 6
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "Oswald, sans-serif",
      fontSize: 32,
      fontWeight: 700,
      color: color || theme.text
    }
  }, value));
  return /*#__PURE__*/React.createElement("div", {
    className: "page-wrap"
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "Oswald, sans-serif",
      fontSize: 24,
      fontWeight: 700,
      color: theme.text,
      marginBottom: 4
    }
  }, "Dashboard"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: theme.fontUi,
      fontSize: 13,
      color: theme.textFaint,
      marginBottom: 24
    }
  }, "Bankstown Unit"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 16,
      flexWrap: "wrap",
      marginBottom: 28
    }
  }, statCard("Total Incidents", incidents.length), statCard("Active / New", activeCount, theme.accent), statCard("Complete", completeCount)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(Link, {
    to: "/Jobs/Create",
    navigate: navigate,
    style: {
      background: theme.accent,
      color: theme.accentText,
      fontFamily: theme.fontUi,
      fontWeight: 700,
      fontSize: 13.5,
      padding: "11px 20px",
      borderRadius: 7,
      display: "inline-flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Plus, {
    size: 15
  }), " Create New Incident"), /*#__PURE__*/React.createElement(Link, {
    to: "/Jobs",
    navigate: navigate,
    style: {
      background: "none",
      color: theme.text,
      border: `1px solid ${theme.border}`,
      fontFamily: theme.fontUi,
      fontWeight: 600,
      fontSize: 13.5,
      padding: "11px 20px",
      borderRadius: 7,
      display: "inline-flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(ClipboardList, {
    size: 15
  }), " Incident Register"), /*#__PURE__*/React.createElement(Link, {
    to: "/Jobs/Tasking",
    navigate: navigate,
    style: {
      background: "none",
      color: theme.text,
      border: `1px solid ${theme.border}`,
      fontFamily: theme.fontUi,
      fontWeight: 600,
      fontSize: 13.5,
      padding: "11px 20px",
      borderRadius: 7,
      display: "inline-flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Send, {
    size: 15
  }), " Tasking")));
}

// ---------------------------------------------------------------
// INCIDENT REGISTER (/Jobs) -- real table, matching the columns
// from the actual Beacon Incident Register.
// ---------------------------------------------------------------
function JobsRegisterScreen({
  state,
  theme,
  navigate
}) {
  const incidents = state?.allIncidents || [];
  const priorityColors = theme.name === "dark" ? PRIORITY_COLORS_DARK : PRIORITY_COLORS_LIGHT;
  const statusColors = theme.name === "dark" ? STATUS_COLORS_DARK : STATUS_COLORS_LIGHT;
  const th = {
    textAlign: "left",
    padding: "10px 14px",
    fontFamily: theme.fontUi,
    fontSize: 11.5,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.03em",
    color: theme.textFaint,
    borderBottom: `1px solid ${theme.border}`,
    whiteSpace: "nowrap"
  };
  const td = {
    padding: "11px 14px",
    fontFamily: theme.fontUi,
    fontSize: 13,
    color: theme.text,
    borderBottom: `1px solid ${theme.tableRowBorder}`,
    verticalAlign: "top"
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "page-wrap"
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "Oswald, sans-serif",
      fontSize: 22,
      fontWeight: 700,
      color: theme.text,
      marginBottom: 4
    }
  }, "Incident Register"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: theme.fontUi,
      fontSize: 13,
      color: theme.textFaint,
      marginBottom: 18
    }
  }, incidents.length, " incidents"), /*#__PURE__*/React.createElement("div", {
    className: "jobs-table-wrap",
    style: {
      background: theme.panel,
      border: `1px solid ${theme.border}`,
      borderRadius: 8
    }
  }, /*#__PURE__*/React.createElement("table", {
    className: "jobs-table"
  }, /*#__PURE__*/React.createElement("thead", {
    style: {
      background: theme.tableHeadBg
    }
  }, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Id"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Received"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Response"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Type"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Categories"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "FRAO"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Status"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "HQ"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Parent HQ"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Address"))), /*#__PURE__*/React.createElement("tbody", null, incidents.length === 0 ? /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      textAlign: "center",
      color: theme.textGhost
    },
    colSpan: 10
  }, "No incidents created yet.")) : incidents.map(inc => {
    const typeLabel = inc.incidentTypeCategory || inc.rescueType || "—";
    const priColor = priorityDisplayColor(inc, theme);
    const statColor = statusColors[inc.status] || theme.textFaint;
    const hqCode = HQ_CODES[inc.assignedHQ] || inc.assignedHQ || "—";
    const parentHqCode = HQ_ZONE_CODES[inc.assignedHQ] || "—";
    // General incidents keep the normal row background; Priority,
    // Immediate, and life-threatening jobs get the whole row tinted
    // with their colour, not just the Response chip.
    const isTinted = priColor !== theme.text;
    const baseBg = isTinted ? priColor + "59" : theme.panel;
    const hoverBg = isTinted ? priColor + "80" : theme.tableRowHover;
    // The sticky Id column has real content scrolling underneath it,
    // so it needs a fully opaque background -- a translucent tint
    // would let those cells show through as they pass under it.
    const stickyBaseBg = isTinted ? blendOverBg(priColor, 0.35, theme.panel) : theme.panel;
    const stickyHoverBg = isTinted ? blendOverBg(priColor, 0.5, theme.panel) : theme.tableRowHover;
    return /*#__PURE__*/React.createElement("tr", {
      key: inc.id,
      onClick: () => navigate(`/Jobs/${parseInt(shortId(inc.id).replace(/[^0-9]/g, ""), 10)}`),
      style: {
        cursor: "pointer",
        borderBottom: `1px solid ${theme.tableRowBorder}`,
        background: isTinted ? baseBg : "transparent"
      },
      onMouseEnter: e => {
        e.currentTarget.style.background = hoverBg;
        const firstCell = e.currentTarget.firstElementChild;
        if (firstCell) firstCell.style.background = stickyHoverBg;
      },
      onMouseLeave: e => {
        e.currentTarget.style.background = isTinted ? baseBg : "transparent";
        const firstCell = e.currentTarget.firstElementChild;
        if (firstCell) firstCell.style.background = stickyBaseBg;
      }
    }, /*#__PURE__*/React.createElement("td", {
      "data-label": "Id",
      style: {
        ...td,
        fontFamily: theme.fontMono,
        color: theme.textMuted,
        background: stickyBaseBg
      }
    }, shortId(inc.id)), /*#__PURE__*/React.createElement("td", {
      "data-label": "Received",
      style: {
        ...td,
        fontFamily: theme.fontMono,
        fontSize: 12,
        whiteSpace: "nowrap"
      }
    }, formatDT(inc.taskedAt)), /*#__PURE__*/React.createElement("td", {
      "data-label": "Response",
      style: td
    }, /*#__PURE__*/React.createElement(Chip, {
      label: (inc.priority || "General").toUpperCase(),
      color: priColor,
      theme: theme
    })), /*#__PURE__*/React.createElement("td", {
      "data-label": "Type",
      style: td
    }, typeLabel), /*#__PURE__*/React.createElement("td", {
      "data-label": "Categories",
      style: td
    }, categoryLabel(inc)), /*#__PURE__*/React.createElement("td", {
      "data-label": "FRAO",
      style: td
    }, ""), /*#__PURE__*/React.createElement("td", {
      "data-label": "Status",
      style: td
    }, /*#__PURE__*/React.createElement(Chip, {
      label: (inc.status || "").toUpperCase(),
      color: statColor,
      theme: theme
    })), /*#__PURE__*/React.createElement("td", {
      "data-label": "HQ",
      style: td
    }, hqCode), /*#__PURE__*/React.createElement("td", {
      "data-label": "Parent HQ",
      style: td
    }, parentHqCode), /*#__PURE__*/React.createElement("td", {
      "data-label": "Address",
      style: {
        ...td,
        maxWidth: 280,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, inc.addr || "—"));
  })))));
}
function FieldSet({
  title,
  theme,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: theme.fontUi,
      fontSize: 12,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      color: theme.accent,
      borderBottom: `1px solid ${theme.border}`,
      paddingBottom: 6,
      marginBottom: 14
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, children));
}
function FormRow({
  label,
  children,
  theme,
  required
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "form-row"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-row-label",
    style: {
      fontFamily: theme.fontUi,
      color: theme.textMuted
    }
  }, label, required && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#D9463D"
    }
  }, " *")), /*#__PURE__*/React.createElement("div", { style: { minWidth: 0 } }, children));
}
function inputStyle(theme) {
  return {
    width: "100%",
    background: theme.panelAlt,
    border: `1px solid ${theme.border}`,
    borderRadius: 6,
    padding: "8px 11px",
    color: theme.text,
    fontFamily: theme.fontUi,
    fontSize: 13.5,
    outline: "none",
    boxSizing: "border-box"
  };
}
function YesNo({
  value,
  onChange,
  theme,
  labels = ["Yes", "No"]
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, labels.map(l => /*#__PURE__*/React.createElement("button", {
    key: l,
    onClick: () => onChange(l),
    style: {
      flex: 1,
      padding: "8px 0",
      borderRadius: 6,
      cursor: "pointer",
      fontFamily: theme.fontUi,
      fontWeight: 600,
      fontSize: 13,
      background: value === l ? theme.accent : theme.panelAlt,
      color: value === l ? theme.accentText : theme.textMuted,
      border: `1px solid ${value === l ? theme.accent : theme.border}`
    }
  }, l)));
}
function PillSelect({
  options,
  value,
  onChange,
  theme
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap"
    }
  }, options.map(o => /*#__PURE__*/React.createElement("button", {
    key: o,
    onClick: () => onChange(o),
    style: {
      padding: "7px 14px",
      borderRadius: 6,
      cursor: "pointer",
      fontFamily: theme.fontUi,
      fontWeight: 600,
      fontSize: 12.5,
      background: value === o ? theme.accent : theme.panelAlt,
      color: value === o ? theme.accentText : theme.textMuted,
      border: `1px solid ${value === o ? theme.accent : theme.border}`
    }
  }, o)));
}
function CreateIncidentScreen({
  dispatch,
  theme,
  navigate,
  state
}) {
  const [lifeThreatening, setLifeThreatening] = useState(null);
  const [rescueType, setRescueType] = useState(null);
  const [floodRescueCategory, setFloodRescueCategory] = useState(null);
  const [referringFrom, setReferringFrom] = useState("");
  const [referringRef, setReferringRef] = useState("");
  const [situationOnScene, setSituationOnScene] = useState("");
  const [incidentType, setIncidentType] = useState(null);
  const [callersNumber, setCallersNumber] = useState("");
  const [callersName, setCallersName] = useState("");
  const [incidentContactCalling, setIncidentContactCalling] = useState("Yes");
  const [contactNumber, setContactNumber] = useState("");
  const [contactName, setContactName] = useState("");
  const [addr, setAddr] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeStatus, setGeocodeStatus] = useState(null);
  const [extraInfo, setExtraInfo] = useState("");
  const [permissionToEnter, setPermissionToEnter] = useState(null);
  const [howToEnter, setHowToEnter] = useState("");
  const [lat, setLat] = useState("");
  const [long, setLong] = useState("");
  const [assignedHQ, setAssignedHQ] = useState("Bankstown");
  const [requestingAgency, setRequestingAgency] = useState("");
  const [requestingAgencyRef, setRequestingAgencyRef] = useState("");
  const [tags, setTags] = useState(new Set());
  const [tagPickerTab, setTagPickerTab] = useState(TAG_TAXONOMY[0].id);
  const [responseType, setResponseType] = useState(null);
  const [pscuCategory, setPscuCategory] = useState(null);
  const [sendMessage, setSendMessage] = useState(null);
  const [message, setMessage] = useState("");
  const [wantsToTask, setWantsToTask] = useState(null);
  const [selectedVehicles, setSelectedVehicles] = useState(new Set());
  const [noteText, setNoteText] = useState("");
  const [dateReceived, setDateReceived] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [result, setResult] = useState(null);
  useEffect(() => {
    if (lifeThreatening === "Yes") setResponseType("Immediate");
  }, [lifeThreatening]);
  useEffect(() => {
    const q = addr.trim();
    if (q.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=8&countrycodes=au&q=${encodeURIComponent(q + ", NSW, Australia")}`);
        const data = await res.json();
        if (cancelled) return;
        const sorted = [...data].sort((a, b) => (b.importance || 0) - (a.importance || 0)).slice(0, 5);
        setAddressSuggestions(sorted.map(d => ({
          label: d.display_name,
          lat: d.lat,
          lon: d.lon
        })));
        setShowSuggestions(sorted.length > 0);
      } catch {
        if (!cancelled) setAddressSuggestions([]);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [addr]);
  const selectAddressSuggestion = s => {
    setAddr(s.label);
    setLat(parseFloat(s.lat).toFixed(6));
    setLong(parseFloat(s.lon).toFixed(6));
    setGeocodeStatus("success");
    setAddressSuggestions([]);
    setShowSuggestions(false);
  };
  const autoFill = () => {
    const suburb = pick(SUBURBS);
    const streetNum = Math.floor(Math.random() * 200) + 1;
    const fullAddr = `${streetNum} ${pick(RANDOM_STREET_NAMES)} ${pick(RANDOM_STREET_TYPES)}, ${suburb}, NSW`;
    setAddr(fullAddr);
    setExtraInfo("");
    setLat("");
    setLong("");
    setGeocodeStatus(null);
    setAssignedHQ("Bankstown");
    setGeocoding(true);
    (async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=au&q=${encodeURIComponent(suburb + ", NSW, Australia")}`);
        const data = await res.json();
        if (data[0]) {
          setLat(parseFloat(data[0].lat).toFixed(6));
          setLong(parseFloat(data[0].lon).toFixed(6));
          setGeocodeStatus("success");
        }
      } catch {
        setGeocodeStatus("error");
      } finally {
        setGeocoding(false);
      }
    })();
    const r = Math.random();
    const kind = r < 0.15 ? "rescue" : r < 0.30 ? "support" : "general";
    setLifeThreatening(kind === "rescue" ? "Yes" : "No");
    if (kind === "rescue") {
      const t = pick(RESCUE_TEMPLATES);
      setRescueType(t.rescueType);
      setFloodRescueCategory(t.floodRescueCategory || null);
      setReferringFrom("");
      setReferringRef("");
      setSituationOnScene(t.situationOnScene);
      setIncidentType(null);
      setRequestingAgency("");
      setRequestingAgencyRef("");
      setTags(new Set());
      setResponseType("Immediate");
    } else if (kind === "support") {
      const t = pick(SUPPORT_TEMPLATES);
      setRescueType(null);
      setFloodRescueCategory(null);
      setReferringFrom("");
      setReferringRef("");
      setSituationOnScene(t.situationOnScene);
      setIncidentType("Support");
      setRequestingAgency(t.requestingAgency);
      setRequestingAgencyRef(`REF-${Math.floor(Math.random() * 90000) + 10000}`);
      setTags(new Set());
      setResponseType(pick(["Immediate", "Priority"]));
    } else {
      const t = pick(GENERAL_INCIDENT_TEMPLATES);
      setRescueType(null);
      setFloodRescueCategory(null);
      setReferringFrom("");
      setReferringRef("");
      setSituationOnScene(t.situationOnScene);
      setIncidentType("Storm");
      setRequestingAgency("");
      setRequestingAgencyRef("");
      setTags(new Set(t.tags));
      setResponseType(t.priority);
    }
    setCallersName(`${pick(RANDOM_FIRST_NAMES)} ${pick(RANDOM_LAST_NAMES)}`);
    setCallersNumber(`04${Math.floor(Math.random() * 90000000) + 10000000}`);
    const calling = randomBool(0.8) ? "Yes" : "No";
    setIncidentContactCalling(calling);
    if (calling === "No") {
      setContactName(`${pick(RANDOM_FIRST_NAMES)} ${pick(RANDOM_LAST_NAMES)}`);
      setContactNumber(`04${Math.floor(Math.random() * 90000000) + 10000000}`);
    } else {
      setContactName("");
      setContactNumber("");
    }
    const permission = randomBool(0.5) ? "Yes" : "No";
    setPermissionToEnter(permission);
    setHowToEnter(permission === "Yes" && randomBool(0.5) ? "Key under mat" : "");
    const willTask = randomBool(0.3);
    setWantsToTask(willTask ? "Yes" : "No");
    setSelectedVehicles(willTask ? new Set([pick(VEHICLES)]) : new Set());
    setNoteText(randomBool(0.4) ? pick(RANDOM_NOTES) : "");
    setResult(null);
  };
  const toggleTag = t => setTags(prev => {
    const n = new Set(prev);
    n.has(t) ? n.delete(t) : n.add(t);
    return n;
  });
  const toggleVehicle = v => setSelectedVehicles(prev => {
    const n = new Set(prev);
    n.has(v) ? n.delete(v) : n.add(v);
    return n;
  });
  const requiredOk = lifeThreatening && (lifeThreatening === "Yes" ? !!rescueType : !!incidentType) && callersNumber.trim() && callersName.trim() && addr.trim() && assignedHQ.trim() && responseType && tags.size > 0;
  const derivedType = lifeThreatening === "Yes" ? floodRescueCategory ? `${rescueType} ${floodRescueCategory}` : rescueType : incidentType || "Incident";
  const submit = async () => {
    if (!requiredOk || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    setResult(null);
    try {
      const res = await dispatch("CREATE_INCIDENT", {
        fields: {
          type: situationOnScene.trim() || derivedType,
          priority: responseType,
          addr: addr.trim(),
          additionalAddressInfo: extraInfo.trim() || null,
          permissionToEnter,
          howToEnter: permissionToEnter === "Yes" ? howToEnter.trim() || null : null,
          assignedHQ: assignedHQ.trim(),
          lat: lat.trim() || null,
          long: long.trim() || null,
          callersName: callersName.trim(),
          callersNumber: callersNumber.trim(),
          incidentContactCalling,
          contactNumber: incidentContactCalling === "No" ? contactNumber.trim() || null : null,
          contactName: incidentContactCalling === "No" ? contactName.trim() || null : null,
          situationOnScene: situationOnScene.trim() || null,
          lifeThreatening,
          rescueType: lifeThreatening === "Yes" ? rescueType : null,
          floodRescueCategory: rescueType === "FR" ? floodRescueCategory : null,
          referringAgency: referringFrom.trim() || null,
          agencyRef: referringRef.trim() || null,
          incidentTypeCategory: lifeThreatening === "No" ? incidentType : null,
          requestingAgency: incidentType === "Support" ? requestingAgency.trim() || null : null,
          requestingAgencyRef: incidentType === "Support" ? requestingAgencyRef.trim() || null : null,
          pscuCategory: pscuCategory || null,
          message: sendMessage === "Yes" ? message.trim() || null : null,
          tags: [...tags],
          taskedAt: dateReceived ? new Date(dateReceived).toISOString() : undefined
        },
        vehicles: wantsToTask === "Yes" ? [...selectedVehicles] : []
      });
      if (noteText.trim()) await dispatch("ADD_NOTE", {
        incidentId: res.incident.id,
        text: noteText.trim()
      });
      setResult(res.incident);
      setLifeThreatening(null);
      setRescueType(null);
      setFloodRescueCategory(null);
      setReferringFrom("");
      setReferringRef("");
      setSituationOnScene("");
      setIncidentType(null);
      setCallersNumber("");
      setCallersName("");
      setIncidentContactCalling("Yes");
      setContactNumber("");
      setContactName("");
      setAddr("");
      setExtraInfo("");
      setPermissionToEnter(null);
      setHowToEnter("");
      setLat("");
      setLong("");
      setAssignedHQ("Bankstown");
      setRequestingAgency("");
      setRequestingAgencyRef("");
      setPscuCategory(null);
      setSendMessage(null);
      setMessage("");
      setTags(new Set());
      setResponseType(null);
      setWantsToTask(null);
      setSelectedVehicles(new Set());
      setNoteText("");
      const d = new Date();
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      setDateReceived(d.toISOString().slice(0, 16));
    } catch (e) {
      setSubmitError(e.message || "Something went wrong creating the incident.");
    } finally {
      setSubmitting(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "page-wrap",
    style: {
      maxWidth: 820
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 4,
      flexWrap: "wrap",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "Oswald, sans-serif",
      fontSize: 22,
      fontWeight: 700,
      color: theme.text,
      margin: 0
    }
  }, "Create New Incident"), /*#__PURE__*/React.createElement("button", {
    onClick: autoFill,
    style: {
      background: "none",
      border: `1px solid ${theme.border}`,
      borderRadius: 6,
      color: theme.textMuted,
      fontFamily: theme.fontUi,
      fontWeight: 600,
      fontSize: 12.5,
      padding: "7px 12px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(RefreshCw, {
    size: 13
  }), " Auto Create")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: theme.fontUi,
      fontSize: 12.5,
      color: theme.textFaint,
      marginBottom: 22
    }
  }, "Fields marked * are required."), result && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#3FA34D18",
      border: "1px solid #3FA34D55",
      borderRadius: 8,
      padding: "12px 16px",
      marginBottom: 20,
      color: "#3FA34D",
      fontFamily: theme.fontUi,
      fontSize: 13.5
    }
  }, "Incident ", shortId(result.id), " created successfully."), submitError && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#D9463D18",
      border: "1px solid #D9463D55",
      borderRadius: 8,
      padding: "12px 16px",
      marginBottom: 20,
      color: "#D9463D",
      fontFamily: theme.fontUi,
      fontSize: 13.5
    }
  }, submitError), /*#__PURE__*/React.createElement("div", {
    className: "create-incident-panel",
    style: {
      background: theme.panel,
      border: `1px solid ${theme.border}`,
      borderRadius: 8
    }
  }, /*#__PURE__*/React.createElement(FieldSet, {
    title: "Is This A Life Threatening Emergency?",
    theme: theme
  }, /*#__PURE__*/React.createElement(YesNo, {
    value: lifeThreatening,
    onChange: setLifeThreatening,
    theme: theme
  })), lifeThreatening !== null && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(FieldSet, {
    title: "Caller Details",
    theme: theme
  }, /*#__PURE__*/React.createElement(FormRow, {
    label: "Callers Number",
    theme: theme,
    required: true
  }, /*#__PURE__*/React.createElement("input", {
    value: callersNumber,
    onChange: e => setCallersNumber(e.target.value),
    placeholder: "Best number to call back on",
    style: inputStyle(theme)
  })), /*#__PURE__*/React.createElement(FormRow, {
    label: "Callers Name",
    theme: theme,
    required: true
  }, /*#__PURE__*/React.createElement("input", {
    value: callersName,
    onChange: e => setCallersName(e.target.value),
    placeholder: "Caller's name",
    style: inputStyle(theme)
  })), /*#__PURE__*/React.createElement(FormRow, {
    label: "Incident Contact Calling",
    theme: theme
  }, /*#__PURE__*/React.createElement(YesNo, {
    value: incidentContactCalling,
    onChange: setIncidentContactCalling,
    theme: theme
  }))), incidentContactCalling === "No" && /*#__PURE__*/React.createElement(FieldSet, {
    title: "Incident Contact Details",
    theme: theme
  }, /*#__PURE__*/React.createElement(FormRow, {
    label: "Contacts Number",
    theme: theme
  }, /*#__PURE__*/React.createElement("input", {
    value: contactNumber,
    onChange: e => setContactNumber(e.target.value),
    style: inputStyle(theme)
  })), /*#__PURE__*/React.createElement(FormRow, {
    label: "Contacts Name",
    theme: theme
  }, /*#__PURE__*/React.createElement("input", {
    value: contactName,
    onChange: e => setContactName(e.target.value),
    style: inputStyle(theme)
  }))), /*#__PURE__*/React.createElement(FieldSet, {
    title: "Incident Location",
    theme: theme
  }, /*#__PURE__*/React.createElement(FormRow, {
    label: "Address",
    theme: theme,
    required: true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: addr,
    onChange: e => setAddr(e.target.value),
    placeholder: "Address of the incident",
    style: inputStyle(theme)
  }), showSuggestions && addressSuggestions.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: "100%",
      left: 0,
      right: 0,
      background: theme.panel,
      border: `1px solid ${theme.border}`,
      borderRadius: 6,
      marginTop: 4,
      zIndex: 10,
      boxShadow: "0 8px 24px rgba(0,0,0,0.25)"
    }
  }, addressSuggestions.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    onClick: () => selectAddressSuggestion(s),
    style: {
      padding: "8px 12px",
      fontFamily: theme.fontUi,
      fontSize: 12.5,
      color: theme.text,
      cursor: "pointer",
      borderBottom: i < addressSuggestions.length - 1 ? `1px solid ${theme.border}` : "none"
    }
  }, s.label))), geocodeStatus === "success" && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#3FA34D",
      marginTop: 4,
      fontFamily: theme.fontUi
    }
  }, "Geocoded: ", lat, ", ", long))), /*#__PURE__*/React.createElement(FormRow, {
    label: "Additional Address Info",
    theme: theme
  }, /*#__PURE__*/React.createElement("input", {
    value: extraInfo,
    onChange: e => setExtraInfo(e.target.value),
    placeholder: "Property names, cross streets, landmarks",
    style: inputStyle(theme)
  })), /*#__PURE__*/React.createElement(FormRow, {
    label: "Permission to Enter",
    theme: theme
  }, /*#__PURE__*/React.createElement(YesNo, {
    value: permissionToEnter,
    onChange: setPermissionToEnter,
    theme: theme
  })), permissionToEnter === "Yes" && /*#__PURE__*/React.createElement(FormRow, {
    label: "How to Enter",
    theme: theme
  }, /*#__PURE__*/React.createElement("input", {
    value: howToEnter,
    onChange: e => setHowToEnter(e.target.value),
    style: inputStyle(theme)
  })), /*#__PURE__*/React.createElement(FormRow, {
    label: "Assigned HQ",
    theme: theme,
    required: true
  }, /*#__PURE__*/React.createElement("input", {
    value: assignedHQ,
    onChange: e => setAssignedHQ(e.target.value),
    style: inputStyle(theme)
  }))), /*#__PURE__*/React.createElement(FieldSet, {
    title: "Incident Details",
    theme: theme
  }, /*#__PURE__*/React.createElement(FormRow, {
    label: "Situation On Scene",
    theme: theme
  }, /*#__PURE__*/React.createElement("input", {
    value: situationOnScene,
    onChange: e => setSituationOnScene(e.target.value),
    placeholder: "Provide brief details about the incident",
    style: inputStyle(theme)
  })), lifeThreatening === "Yes" ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(FormRow, {
    label: "Rescue Type",
    theme: theme,
    required: true
  }, /*#__PURE__*/React.createElement(PillSelect, {
    options: RESCUE_TYPES,
    value: rescueType,
    onChange: setRescueType,
    theme: theme
  })), rescueType === "FR" && /*#__PURE__*/React.createElement(FormRow, {
    label: "Flood Rescue Category",
    theme: theme
  }, /*#__PURE__*/React.createElement("select", {
    value: floodRescueCategory || "",
    onChange: e => setFloodRescueCategory(e.target.value),
    style: inputStyle(theme)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Select…"), Object.entries(FLOOD_RESCUE_CATEGORY_DESC).map(([k, v]) => /*#__PURE__*/React.createElement("option", {
    key: k,
    value: k
  }, k, " — ", v)))), /*#__PURE__*/React.createElement(FormRow, {
    label: "Referring Agency",
    theme: theme
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: referringFrom,
    onChange: e => setReferringFrom(e.target.value),
    placeholder: "Referring From",
    style: inputStyle(theme)
  }), /*#__PURE__*/React.createElement("input", {
    value: referringRef,
    onChange: e => setReferringRef(e.target.value),
    placeholder: "Agency Reference",
    style: inputStyle(theme)
  })))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(FormRow, {
    label: "Incident Type",
    theme: theme,
    required: true
  }, /*#__PURE__*/React.createElement(PillSelect, {
    options: INCIDENT_TYPES,
    value: incidentType,
    onChange: setIncidentType,
    theme: theme
  })), incidentType === "Support" && /*#__PURE__*/React.createElement(FormRow, {
    label: "Requesting Agency",
    theme: theme
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: requestingAgency,
    onChange: e => setRequestingAgency(e.target.value),
    placeholder: "Agency Requesting Support",
    style: inputStyle(theme)
  }), /*#__PURE__*/React.createElement("input", {
    value: requestingAgencyRef,
    onChange: e => setRequestingAgencyRef(e.target.value),
    placeholder: "Agency Reference",
    style: inputStyle(theme)
  }))))), /*#__PURE__*/React.createElement(FieldSet, {
    title: "Incident Categorisation",
    theme: theme
  }, /*#__PURE__*/React.createElement(FormRow, {
    label: "PSCU Category",
    theme: theme
  }, /*#__PURE__*/React.createElement(PillSelect, {
    options: ["Orange", "Red", "None"],
    value: pscuCategory || "None",
    onChange: v => setPscuCategory(v === "None" ? null : v),
    theme: theme
  }))), /*#__PURE__*/React.createElement(FieldSet, {
    title: "Tags",
    theme: theme
  }, tags.size > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      flexWrap: "wrap",
      marginBottom: 10
    }
  }, [...tags].map(t => /*#__PURE__*/React.createElement("span", {
    key: t,
    onClick: () => toggleTag(t),
    style: {
      background: theme.accent,
      border: `1px solid ${theme.accent}`,
      color: theme.accentText,
      fontSize: 11.5,
      padding: "3px 9px",
      borderRadius: 5,
      cursor: "pointer",
      fontFamily: theme.fontUi,
      fontWeight: 600
    }
  }, t, " ×"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 4,
      flexWrap: "wrap",
      borderBottom: `1px solid ${theme.border}`,
      marginBottom: 12,
      paddingBottom: 8
    }
  }, TAG_TAXONOMY.map(tab => /*#__PURE__*/React.createElement("button", {
    key: tab.id,
    onClick: () => setTagPickerTab(tab.id),
    style: {
      padding: "6px 12px",
      borderRadius: 6,
      cursor: "pointer",
      fontFamily: theme.fontUi,
      fontWeight: 600,
      fontSize: 12,
      background: tagPickerTab === tab.id ? theme.accent : "none",
      color: tagPickerTab === tab.id ? theme.accentText : theme.textMuted,
      border: `1px solid ${tagPickerTab === tab.id ? theme.accent : theme.border}`
    }
  }, tab.label))), TAG_TAXONOMY.filter(t => t.id === tagPickerTab).map(tab => /*#__PURE__*/React.createElement("div", {
    key: tab.id,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, tab.groups.map(g => /*#__PURE__*/React.createElement("div", {
    key: g.label
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: theme.fontUi,
      fontSize: 11,
      color: theme.textFaint,
      marginBottom: 6
    }
  }, g.label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      flexWrap: "wrap"
    }
  }, g.tags.map(t => /*#__PURE__*/React.createElement("button", {
    key: t,
    onClick: () => toggleTag(t),
    style: {
      padding: "5px 10px",
      borderRadius: 5,
      cursor: "pointer",
      fontFamily: theme.fontUi,
      fontSize: 12,
      background: tags.has(t) ? theme.accent : theme.panelAlt,
      color: tags.has(t) ? theme.accentText : theme.textMuted,
      border: `1px solid ${tags.has(t) ? theme.accent : theme.border}`
    }
  }, t)))))))), /*#__PURE__*/React.createElement(FieldSet, {
    title: "Response Required",
    theme: theme
  }, /*#__PURE__*/React.createElement(FormRow, {
    label: "Response Type",
    theme: theme,
    required: true
  }, /*#__PURE__*/React.createElement(PillSelect, {
    options: lifeThreatening === "Yes" ? ["Immediate"] : ["Immediate", "Priority", "General"],
    value: responseType,
    onChange: setResponseType,
    theme: theme
  }))), /*#__PURE__*/React.createElement(FieldSet, {
    title: "Messaging",
    theme: theme
  }, /*#__PURE__*/React.createElement(FormRow, {
    label: "Send Message",
    theme: theme
  }, /*#__PURE__*/React.createElement(YesNo, {
    value: sendMessage,
    onChange: setSendMessage,
    theme: theme
  })), sendMessage === "Yes" && /*#__PURE__*/React.createElement(FormRow, {
    label: "Message",
    theme: theme
  }, /*#__PURE__*/React.createElement("textarea", {
    value: message,
    onChange: e => setMessage(e.target.value),
    rows: 2,
    style: {
      ...inputStyle(theme),
      resize: "vertical"
    }
  }))), /*#__PURE__*/React.createElement(FieldSet, {
    title: "Tasking",
    theme: theme
  }, /*#__PURE__*/React.createElement(FormRow, {
    label: "Task Vehicles Now?",
    theme: theme
  }, /*#__PURE__*/React.createElement(YesNo, {
    value: wantsToTask,
    onChange: setWantsToTask,
    theme: theme
  })), wantsToTask === "Yes" && /*#__PURE__*/React.createElement(FormRow, {
    label: "Notify Vehicles",
    theme: theme
  }, (() => {
    const available = state ? VEHICLES.filter(v => state.vehicleStates?.[v]?.teamStatus?.id !== "stooddown") : VEHICLES;
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: theme.fontUi,
        fontSize: 11.5,
        color: theme.textFaint
      }
    }, "Showing vehicles not stood down (", available.length, " of ", VEHICLES.length, ")"), /*#__PURE__*/React.createElement("button", {
      onClick: () => setSelectedVehicles(prev => new Set([...prev].filter(v => available.includes(v)))),
      style: {
        background: "none",
        border: `1px solid ${theme.border}`,
        borderRadius: 6,
        color: theme.textMuted,
        fontFamily: theme.fontUi,
        fontWeight: 600,
        fontSize: 11.5,
        padding: "5px 10px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 5
      }
    }, /*#__PURE__*/React.createElement(RefreshCw, {
      size: 12
    }), " Refresh")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6,
        flexWrap: "wrap"
      }
    }, available.length === 0 ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: theme.fontUi,
        fontSize: 12.5,
        color: theme.textGhost
      }
    }, "No vehicles currently available -- all stood down.") : available.map(v => /*#__PURE__*/React.createElement("button", {
      key: v,
      onClick: () => toggleVehicle(v),
      style: {
        padding: "6px 11px",
        borderRadius: 6,
        cursor: "pointer",
        fontFamily: theme.fontMono,
        fontWeight: 600,
        fontSize: 11.5,
        background: selectedVehicles.has(v) ? theme.accent : theme.panelAlt,
        color: selectedVehicles.has(v) ? theme.accentText : theme.textMuted,
        border: `1px solid ${selectedVehicles.has(v) ? theme.accent : theme.border}`
      }
    }, v))));
  })())), /*#__PURE__*/React.createElement(FieldSet, {
    title: "Notes",
    theme: theme
  }, /*#__PURE__*/React.createElement(FormRow, {
    label: "Note Text",
    theme: theme
  }, /*#__PURE__*/React.createElement("textarea", {
    value: noteText,
    onChange: e => setNoteText(e.target.value),
    rows: 3,
    style: {
      ...inputStyle(theme),
      resize: "vertical"
    }
  }))), /*#__PURE__*/React.createElement(FieldSet, {
    title: "Date Received",
    theme: theme
  }, /*#__PURE__*/React.createElement(FormRow, {
    label: "Date Received",
    theme: theme
  }, /*#__PURE__*/React.createElement("input", {
    type: "datetime-local",
    value: dateReceived,
    onChange: e => setDateReceived(e.target.value),
    style: inputStyle(theme)
  }))), /*#__PURE__*/React.createElement("button", {
    onClick: submit,
    disabled: !requiredOk || submitting,
    style: {
      width: "100%",
      padding: "13px 0",
      borderRadius: 7,
      border: "none",
      cursor: requiredOk ? "pointer" : "not-allowed",
      background: requiredOk ? theme.accent : theme.panelAlt,
      color: requiredOk ? theme.accentText : theme.textGhost,
      fontFamily: theme.fontUi,
      fontWeight: 700,
      fontSize: 14,
      marginTop: 4
    }
  }, submitting ? "Creating…" : "Create Incident"))));
}
function ComingSoon({
  title,
  theme
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1200,
      margin: "0 auto",
      padding: "60px 20px",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "Oswald, sans-serif",
      fontSize: 22,
      fontWeight: 700,
      color: theme.text,
      marginBottom: 8
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: theme.fontUi,
      fontSize: 13.5,
      color: theme.textFaint
    }
  }, "This page is being built next."));
}

// ---------------------------------------------------------------
// APP
// ---------------------------------------------------------------
function DetailRow({
  label,
  value,
  theme
}) {
  if (value === null || value === undefined || value === "") return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "detail-row",
    style: {
      fontFamily: theme.fontUi
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "row-label",
    style: {
      color: theme.textFaint
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      color: theme.text
    }
  }, value));
}
function DetailSection({
  title,
  theme,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      color: theme.accent,
      borderBottom: `1px solid ${theme.border}`,
      paddingBottom: 6,
      marginBottom: 8,
      fontFamily: theme.fontUi
    }
  }, title), children);
}
function resizeImageFile(file, maxDim, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      img.onerror = reject;
      img.onload = () => {
        let {
          width,
          height
        } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round(height * (maxDim / width));
            width = maxDim;
          } else {
            width = Math.round(width * (maxDim / height));
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl.split(",")[1]);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
function PhotosSection({
  incident,
  theme,
  dispatch
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const photos = Array.isArray(incident.photos) ? incident.photos : [];
  const onFileChosen = async e => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const dataBase64 = await resizeImageFile(file, 1600, 0.8);
      await dispatch("UPLOAD_PHOTO", {
        incidentId: incident.id,
        filename: file.name,
        mimeType: "image/jpeg",
        dataBase64
      });
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };
  const deletePhoto = async photoId => {
    try {
      await dispatch("DELETE_PHOTO", {
        incidentId: incident.id,
        photoId
      });
    } catch (err) {
      setError(err.message || "Delete failed");
    }
  };
  return /*#__PURE__*/React.createElement(DetailSection, {
    title: "Photos",
    theme: theme
  }, error && /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#a94442",
      fontSize: 12.5,
      fontFamily: theme.fontUi,
      marginBottom: 8
    }
  }, error), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 10,
      marginBottom: 12
    }
  }, photos.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    style: {
      position: "relative",
      width: 92,
      height: 92
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: `${SERVER_URL}/photo/${p.id}`,
    target: "_blank",
    rel: "noopener noreferrer"
  }, /*#__PURE__*/React.createElement("img", {
    src: `${SERVER_URL}/photo/${p.id}`,
    alt: p.filename,
    style: {
      width: 92,
      height: 92,
      objectFit: "cover",
      borderRadius: 6,
      border: `1px solid ${theme.border}`,
      display: "block"
    }
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => deletePhoto(p.id),
    title: "Delete photo",
    style: {
      position: "absolute",
      top: -6,
      right: -6,
      width: 20,
      height: 20,
      borderRadius: "50%",
      background: "#a94442",
      color: "#fff",
      border: "none",
      cursor: "pointer",
      fontSize: 12,
      lineHeight: "20px",
      padding: 0,
      fontFamily: theme.fontUi
    }
  }, "×")))), /*#__PURE__*/React.createElement("input", {
    ref: fileInputRef,
    type: "file",
    accept: "image/*",
    onChange: onFileChosen,
    style: {
      display: "none"
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => fileInputRef.current?.click(),
    disabled: uploading,
    style: {
      background: "none",
      border: `1px solid ${theme.border}`,
      borderRadius: 6,
      color: theme.textMuted,
      fontFamily: theme.fontUi,
      fontWeight: 600,
      fontSize: 12.5,
      padding: "8px 14px",
      cursor: uploading ? "default" : "pointer"
    }
  }, uploading ? "Uploading…" : "+ Upload Photo"));
}
const HQ_ZONE_NAMES = {
  "Bankstown": "Metro Zone"
};
const NOTE_TAG_GROUPS = {
  "Contact Types": ["Ambulance", "Arborist", "BOM", "Contractor", "Council", "Crane/EWP", "Electricity", "FRNSW", "Gas", "HAZMAT", "Incident Contact", "NPWS", "Other", "Police", "Recon", "Resident", "RFS", "RMS", "SES", "Telco", "TMC", "Water"],
  "Contact Method": ["Email", "Face-to-Face", "Fax", "ICEMS", "Phone Call", "Printed", "Radio", "SMS"],
  "Entry Purpose": ["All Capabilities", "Backdated", "CFR", "Flood/Storm", "FR In Water", "FR On Water", "GLR", "Incoming", "Information", "Outgoing", "RCR", "Support", "Unavailability", "Update", "VR"],
  "Action Items": ["Awaiting Update", "Call Made", "Call Needed", "Further Action Required", "Handover", "Media", "Not SES Incident", "Ready To Task", "Referral Required", "Reopened", "Retrieve Equipment", "Teams", "Complete", "Untasked", "Welfare Check"]
};
const ACTION_ITEM_TAGS = new Set(NOTE_TAG_GROUPS["Action Items"]);
function tagColor(tag) {
  return ACTION_ITEM_TAGS.has(tag) ? "#ee0039" : "#837947";
}
function timeSince(fromIso, toIso) {
  if (!fromIso || !toIso) return "";
  const ms = new Date(toIso) - new Date(fromIso);
  if (ms < 0 || isNaN(ms)) return "";
  const mins = Math.floor(ms / 60000);
  const days = Math.floor(mins / 1440);
  const hours = Math.floor(mins % 1440 / 60);
  const remMins = mins % 60;
  return `T+${days > 0 ? days + "d " : ""}${String(hours).padStart(2, "0")}:${String(remMins).padStart(2, "0")}`;
}

// ---------------------------------------------------------------
// JOB HISTORY -- past incidents at the same address, then nearby
// (same street, close house numbers), then the wider street.
// ---------------------------------------------------------------
function parseAddress(addr) {
  const s = (addr || "").trim();
  const m = s.match(/^(\d+)\s+(.*)$/);
  if (!m) return {
    number: null,
    rest: s.toLowerCase()
  };
  return {
    number: parseInt(m[1], 10),
    rest: m[2].toLowerCase()
  };
}
function getJobHistory(allIncidents, current) {
  const cur = parseAddress(current.addr);
  const others = allIncidents.filter(i => i.id !== current.id);
  const sameAddress = others.filter(i => (i.addr || "").trim().toLowerCase() === (current.addr || "").trim().toLowerCase());
  const sameStreetAll = cur.number !== null ? others.filter(i => {
    const p = parseAddress(i.addr);
    return p.rest === cur.rest && p.number !== cur.number;
  }) : [];
  const neighbours = sameStreetAll.filter(i => {
    const p = parseAddress(i.addr);
    return p.number !== null && Math.abs(p.number - cur.number) <= 4;
  });
  const neighbourIds = new Set(neighbours.map(i => i.id));
  const sameStreet = sameStreetAll.filter(i => !neighbourIds.has(i.id));
  return {
    sameAddress,
    neighbours,
    sameStreet
  };
}
function JobHistoryList({
  items,
  theme,
  navigate
}) {
  if (items.length === 0) return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: theme.fontUi,
      fontSize: 12.5,
      color: theme.textGhost
    }
  }, "None found.");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, items.map(i => /*#__PURE__*/React.createElement("div", {
    key: i.id,
    onClick: () => navigate(`/Jobs/${parseInt(shortId(i.id).replace(/[^0-9]/g, ""), 10)}`),
    style: {
      cursor: "pointer",
      fontFamily: theme.fontUi,
      fontSize: 12.5,
      color: theme.textMuted,
      padding: "6px 0",
      borderBottom: `1px solid ${theme.tableRowBorder}`
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: theme.accent,
      fontWeight: 600
    }
  }, shortId(i.id)), " — ", i.type || "Incident", " — ", i.addr, /*#__PURE__*/React.createElement("span", {
    style: {
      color: theme.textGhost
    }
  }, " (", formatDT(i.taskedAt), ")"))));
}
function JobHistorySection({
  state,
  incident,
  theme,
  navigate
}) {
  const {
    sameAddress,
    neighbours,
    sameStreet
  } = getJobHistory(state.allIncidents || [], incident);
  return /*#__PURE__*/React.createElement(DetailSection, {
    title: "Job History",
    theme: theme
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: theme.fontUi,
      fontSize: 11,
      fontWeight: 700,
      color: theme.textFaint,
      textTransform: "uppercase",
      marginBottom: 4
    }
  }, "Same Address"), /*#__PURE__*/React.createElement(JobHistoryList, {
    items: sameAddress,
    theme: theme,
    navigate: navigate
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: theme.fontUi,
      fontSize: 11,
      fontWeight: 700,
      color: theme.textFaint,
      textTransform: "uppercase",
      margin: "12px 0 4px"
    }
  }, "Immediate Neighbours"), /*#__PURE__*/React.createElement(JobHistoryList, {
    items: neighbours,
    theme: theme,
    navigate: navigate
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: theme.fontUi,
      fontSize: 11,
      fontWeight: 700,
      color: theme.textFaint,
      textTransform: "uppercase",
      margin: "12px 0 4px"
    }
  }, "Same Street"), /*#__PURE__*/React.createElement(JobHistoryList, {
    items: sameStreet,
    theme: theme,
    navigate: navigate
  }));
}

// ---------------------------------------------------------------
// NOTES -- display only; creation happens in AddNoteForm further
// down the page. Notes with outstanding Action Required show a
// Resolve button, which opens ResolveNoteModal.
// ---------------------------------------------------------------
function ResolveNoteModal({
  theme,
  onCancel,
  onResolve
}) {
  const [stillRequired, setStillRequired] = useState(false);
  const [resolutionText, setResolutionText] = useState("");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100,
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: theme.panel,
      border: `1px solid ${theme.border}`,
      borderRadius: 10,
      padding: 20,
      maxWidth: 420,
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "Oswald, sans-serif",
      fontSize: 17,
      fontWeight: 700,
      color: theme.text,
      marginBottom: 14
    }
  }, "Resolve Note"), /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      fontFamily: theme.fontUi,
      fontSize: 13,
      color: theme.textMuted,
      marginBottom: 14,
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: stillRequired,
    onChange: e => setStillRequired(e.target.checked)
  }), "Further Action Required"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: theme.fontUi,
      fontSize: 12.5,
      color: theme.textFaint,
      marginBottom: 6
    }
  }, "Resolution"), /*#__PURE__*/React.createElement("textarea", {
    value: resolutionText,
    onChange: e => setResolutionText(e.target.value),
    rows: 3,
    placeholder: "Description of resolution",
    style: {
      width: "100%",
      background: theme.panelAlt,
      border: `1px solid ${theme.border}`,
      borderRadius: 6,
      padding: "8px 11px",
      color: theme.text,
      fontFamily: theme.fontUi,
      fontSize: 13,
      outline: "none",
      resize: "vertical",
      boxSizing: "border-box",
      marginBottom: 16
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onCancel,
    style: {
      flex: 1,
      background: "none",
      border: `1px solid ${theme.border}`,
      borderRadius: 6,
      color: theme.textMuted,
      fontFamily: theme.fontUi,
      fontWeight: 600,
      fontSize: 13,
      padding: "9px 0",
      cursor: "pointer"
    }
  }, "Cancel"), /*#__PURE__*/React.createElement("button", {
    onClick: () => onResolve({
      stillRequired,
      resolutionText
    }),
    style: {
      flex: 1,
      background: theme.accent,
      border: "none",
      borderRadius: 6,
      color: theme.accentText,
      fontFamily: theme.fontUi,
      fontWeight: 700,
      fontSize: 13,
      padding: "9px 0",
      cursor: "pointer"
    }
  }, "Resolve"))));
}
function NotesSection({
  incident,
  notes,
  theme,
  dispatch
}) {
  const [resolvingId, setResolvingId] = useState(null);
  const doResolve = async ({
    stillRequired,
    resolutionText
  }) => {
    await dispatch("RESOLVE_NOTE", {
      incidentId: incident.id,
      noteId: resolvingId,
      stillActionRequired: stillRequired,
      resolutionText
    });
    setResolvingId(null);
  };
  return /*#__PURE__*/React.createElement(DetailSection, {
    title: "Notes",
    theme: theme
  }, notes.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: theme.fontUi,
      fontSize: 12.5,
      color: theme.textGhost
    }
  }, "No notes yet."), notes.map(n => {
    const created = new Date(n.time);
    const receivedLine = `Received at ${created.toLocaleDateString()} ${created.toLocaleTimeString()} ${timeSince(incident.taskedAt, n.time)}`;
    return /*#__PURE__*/React.createElement("div", {
      key: n.id,
      style: {
        borderBottom: `1px solid ${theme.tableRowBorder}`,
        padding: "10px 0",
        fontFamily: theme.fontUi
      }
    }, n.tags && n.tags.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: 5,
        marginBottom: 5
      }
    }, n.tags.map(t => /*#__PURE__*/React.createElement("span", {
      key: t,
      style: {
        color: tagColor(t),
        background: tagColor(t) + "22",
        border: `1px solid ${tagColor(t)}55`,
        fontSize: 10.5,
        fontWeight: 700,
        padding: "2px 7px",
        borderRadius: 4
      }
    }, t))), n.subject && /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 13.5,
        color: theme.text,
        marginBottom: 2
      }
    }, n.subject), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: theme.textMuted,
        marginBottom: 4
      }
    }, n.resolved ? `${n.text} - Resolved on ${new Date(n.resolvedAt).toLocaleDateString()} ${new Date(n.resolvedAt).toLocaleTimeString()} with the following text: ${n.resolutionText || ""}` : n.text), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: theme.textGhost
      }
    }, receivedLine), n.actionRequired && !n.resolved && /*#__PURE__*/React.createElement("button", {
      onClick: () => setResolvingId(n.id),
      style: {
        marginTop: 6,
        background: "none",
        border: `1px solid ${theme.accent}`,
        color: theme.accent,
        borderRadius: 5,
        fontSize: 11.5,
        fontWeight: 700,
        padding: "4px 10px",
        cursor: "pointer",
        fontFamily: theme.fontUi
      }
    }, "Resolve"));
  }), resolvingId && /*#__PURE__*/React.createElement(ResolveNoteModal, {
    theme: theme,
    onCancel: () => setResolvingId(null),
    onResolve: doResolve
  }));
}

// ---------------------------------------------------------------
// ACTIONS
// ---------------------------------------------------------------
function ActionsSection({
  incident,
  notes,
  theme,
  dispatch
}) {
  const [open, setOpen] = useState(null);
  const [reason, setReason] = useState(null);
  const [note, setNote] = useState("");
  const [vehiclesSel, setVehiclesSel] = useState(new Set());
  const [busy, setBusy] = useState(false);
  const hasUnresolved = (notes || []).some(n => n.actionRequired && !n.resolved);
  const btnStyle = {
    background: "none",
    border: `1px solid ${theme.border}`,
    borderRadius: 6,
    color: theme.textMuted,
    fontFamily: theme.fontUi,
    fontWeight: 600,
    fontSize: 12.5,
    padding: "8px 14px",
    cursor: "pointer"
  };
  const reset = () => {
    setOpen(null);
    setReason(null);
    setNote("");
    setVehiclesSel(new Set());
  };
  const doRecce = async () => {
    setBusy(true);
    try {
      await dispatch("RECCE_INCIDENT", {
        incidentId: incident.id
      });
    } finally {
      setBusy(false);
    }
  };
  const doAcknowledge = async () => {
    setBusy(true);
    try {
      await dispatch("ACKNOWLEDGE_INCIDENT", {
        incidentId: incident.id
      });
    } finally {
      setBusy(false);
    }
  };
  const doReject = async () => {
    if (!reason) return;
    setBusy(true);
    try {
      await dispatch("REJECT_INCIDENT", {
        incidentId: incident.id,
        reason,
        note
      });
      reset();
    } finally {
      setBusy(false);
    }
  };
  const doCancel = async () => {
    if (!reason) return;
    setBusy(true);
    try {
      await dispatch("CANCEL_INCIDENT", {
        incidentId: incident.id,
        reason,
        note
      });
      reset();
    } finally {
      setBusy(false);
    }
  };
  const doComplete = async () => {
    setBusy(true);
    try {
      await dispatch("COMPLETE_INCIDENT", {
        incidentId: incident.id,
        note
      });
      reset();
    } finally {
      setBusy(false);
    }
  };
  const doFinalise = async () => {
    setBusy(true);
    try {
      await dispatch("FINALISE_INCIDENT", {
        incidentId: incident.id,
        note
      });
      reset();
    } finally {
      setBusy(false);
    }
  };
  const doReopen = async () => {
    setBusy(true);
    try {
      await dispatch("REOPEN_INCIDENT", {
        incidentId: incident.id
      });
    } finally {
      setBusy(false);
    }
  };
  const doTask = async () => {
    if (vehiclesSel.size === 0) return;
    setBusy(true);
    try {
      for (const v of vehiclesSel) await dispatch("NOTIFY_VEHICLE", {
        vehicle: v,
        incidentId: incident.id
      });
      reset();
    } finally {
      setBusy(false);
    }
  };
  const toggleVehicle = v => setVehiclesSel(prev => {
    const n = new Set(prev);
    n.has(v) ? n.delete(v) : n.add(v);
    return n;
  });
  const STATUS_ACTIONS = {
    "New": ["Acknowledge", "Reject", "Task", "Complete", "Cancel"],
    "Active": ["Reject", "Task", "Complete", "Cancel"],
    "Rejected": ["Acknowledge"],
    "Tasked": ["Task"],
    "Cancelled": ["Reopen"],
    "Complete": ["Reopen", "Cancel", "Finalise"],
  };
  const shown = new Set(STATUS_ACTIONS[incident.status] || []);
  return /*#__PURE__*/React.createElement(DetailSection, {
    title: "Actions",
    theme: theme
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 12
    }
  }, shown.has("Acknowledge") && /*#__PURE__*/React.createElement("button", {
    style: btnStyle,
    onClick: doAcknowledge,
    disabled: busy
  }, "Acknowledge"), shown.has("Reject") && /*#__PURE__*/React.createElement("button", {
    style: btnStyle,
    onClick: () => setOpen(open === "reject" ? null : "reject")
  }, "Reject"), /*#__PURE__*/React.createElement("button", {
    style: {
      ...btnStyle,
      opacity: incident.reconnoitered ? 0.5 : 1,
      cursor: incident.reconnoitered ? "default" : "pointer"
    },
    disabled: incident.reconnoitered || busy,
    onClick: doRecce
  }, incident.reconnoitered ? "Recce'd ✓" : "Recce'd"), shown.has("Task") && /*#__PURE__*/React.createElement("button", {
    style: btnStyle,
    onClick: () => setOpen(open === "task" ? null : "task")
  }, "Task"), shown.has("Complete") && /*#__PURE__*/React.createElement("button", {
    style: btnStyle,
    onClick: () => setOpen(open === "complete" ? null : "complete")
  }, "Complete"), shown.has("Cancel") && /*#__PURE__*/React.createElement("button", {
    style: btnStyle,
    onClick: () => setOpen(open === "cancel" ? null : "cancel")
  }, "Cancel"), shown.has("Reopen") && /*#__PURE__*/React.createElement("button", {
    style: btnStyle,
    onClick: doReopen,
    disabled: busy
  }, "Reopen"), shown.has("Finalise") && !hasUnresolved && /*#__PURE__*/React.createElement("button", {
    style: btnStyle,
    onClick: () => setOpen(open === "finalise" ? null : "finalise")
  }, "Finalise")), open === "reject" && /*#__PURE__*/React.createElement("div", {
    style: {
      background: theme.panelAlt,
      border: `1px solid ${theme.border}`,
      borderRadius: 8,
      padding: 12,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(PillSelect, {
    options: REJECT_REASONS,
    value: reason,
    onChange: setReason,
    theme: theme
  }), reason === "Other" && /*#__PURE__*/React.createElement("textarea", {
    value: note,
    onChange: e => setNote(e.target.value),
    rows: 2,
    placeholder: "Reason",
    style: {
      width: "100%",
      marginTop: 8,
      background: theme.panel,
      border: `1px solid ${theme.border}`,
      borderRadius: 6,
      padding: 8,
      color: theme.text,
      fontFamily: theme.fontUi,
      fontSize: 13,
      boxSizing: "border-box"
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: doReject,
    disabled: !reason || busy,
    style: {
      marginTop: 8,
      background: theme.accent,
      color: theme.accentText,
      border: "none",
      borderRadius: 6,
      padding: "8px 16px",
      fontFamily: theme.fontUi,
      fontWeight: 700,
      fontSize: 12.5,
      cursor: "pointer"
    }
  }, "Confirm Reject")), open === "cancel" && /*#__PURE__*/React.createElement("div", {
    style: {
      background: theme.panelAlt,
      border: `1px solid ${theme.border}`,
      borderRadius: 8,
      padding: 12,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(PillSelect, {
    options: CANCEL_REASONS,
    value: reason,
    onChange: setReason,
    theme: theme
  }), reason === "Other" && /*#__PURE__*/React.createElement("textarea", {
    value: note,
    onChange: e => setNote(e.target.value),
    rows: 2,
    placeholder: "Reason",
    style: {
      width: "100%",
      marginTop: 8,
      background: theme.panel,
      border: `1px solid ${theme.border}`,
      borderRadius: 6,
      padding: 8,
      color: theme.text,
      fontFamily: theme.fontUi,
      fontSize: 13,
      boxSizing: "border-box"
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: doCancel,
    disabled: !reason || busy,
    style: {
      marginTop: 8,
      background: theme.accent,
      color: theme.accentText,
      border: "none",
      borderRadius: 6,
      padding: "8px 16px",
      fontFamily: theme.fontUi,
      fontWeight: 700,
      fontSize: 12.5,
      cursor: "pointer"
    }
  }, "Confirm Cancel")), open === "complete" && /*#__PURE__*/React.createElement("div", {
    style: {
      background: theme.panelAlt,
      border: `1px solid ${theme.border}`,
      borderRadius: 8,
      padding: 12,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("textarea", {
    value: note,
    onChange: e => setNote(e.target.value),
    rows: 2,
    placeholder: "Completion note (optional)",
    style: {
      width: "100%",
      background: theme.panel,
      border: `1px solid ${theme.border}`,
      borderRadius: 6,
      padding: 8,
      color: theme.text,
      fontFamily: theme.fontUi,
      fontSize: 13,
      boxSizing: "border-box"
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: doComplete,
    disabled: busy,
    style: {
      marginTop: 8,
      background: theme.accent,
      color: theme.accentText,
      border: "none",
      borderRadius: 6,
      padding: "8px 16px",
      fontFamily: theme.fontUi,
      fontWeight: 700,
      fontSize: 12.5,
      cursor: "pointer"
    }
  }, "Confirm Complete")), open === "finalise" && /*#__PURE__*/React.createElement("div", {
    style: {
      background: theme.panelAlt,
      border: `1px solid ${theme.border}`,
      borderRadius: 8,
      padding: 12,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("textarea", {
    value: note,
    onChange: e => setNote(e.target.value),
    rows: 2,
    placeholder: "Finalisation note (optional)",
    style: {
      width: "100%",
      background: theme.panel,
      border: `1px solid ${theme.border}`,
      borderRadius: 6,
      padding: 8,
      color: theme.text,
      fontFamily: theme.fontUi,
      fontSize: 13,
      boxSizing: "border-box"
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: doFinalise,
    disabled: busy,
    style: {
      marginTop: 8,
      background: theme.accent,
      color: theme.accentText,
      border: "none",
      borderRadius: 6,
      padding: "8px 16px",
      fontFamily: theme.fontUi,
      fontWeight: 700,
      fontSize: 12.5,
      cursor: "pointer"
    }
  }, "Confirm Finalise")), open === "task" && /*#__PURE__*/React.createElement("div", {
    style: {
      background: theme.panelAlt,
      border: `1px solid ${theme.border}`,
      borderRadius: 8,
      padding: 12,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      flexWrap: "wrap",
      marginBottom: 8
    }
  }, VEHICLES.map(v => /*#__PURE__*/React.createElement("button", {
    key: v,
    onClick: () => toggleVehicle(v),
    style: {
      padding: "6px 11px",
      borderRadius: 6,
      cursor: "pointer",
      fontFamily: theme.fontMono,
      fontWeight: 600,
      fontSize: 11.5,
      background: vehiclesSel.has(v) ? theme.accent : theme.panel,
      color: vehiclesSel.has(v) ? theme.accentText : theme.textMuted,
      border: `1px solid ${vehiclesSel.has(v) ? theme.accent : theme.border}`
    }
  }, v))), /*#__PURE__*/React.createElement("button", {
    onClick: doTask,
    disabled: vehiclesSel.size === 0 || busy,
    style: {
      background: theme.accent,
      color: theme.accentText,
      border: "none",
      borderRadius: 6,
      padding: "8px 16px",
      fontFamily: theme.fontUi,
      fontWeight: 700,
      fontSize: 12.5,
      cursor: "pointer"
    }
  }, "Confirm Task")));
}

// ---------------------------------------------------------------
// TEAMS
// ---------------------------------------------------------------
function TeamsSection({
  state,
  incident,
  theme
}) {
  const active = [];
  VEHICLES.forEach(v => {
    const vs = state.vehicleStates?.[v];
    if (!vs) return;
    const inQueue = (vs.queue || []).some(j => j.id === incident.id) || (vs.incomingQueue || []).some(j => j.id === incident.id);
    if (inQueue) {
      const phase = vs.progress?.[incident.id]?.phase || "Tasked";
      active.push({
        vehicle: v,
        status: phase,
        teamStatus: vs.teamStatus?.label
      });
    }
  });
  const completed = (state.completedJobs || []).filter(c => c.job?.id === incident.id);
  const calledOff = (state.calledOffJobs || []).filter(c => c.job?.id === incident.id);
  const rowStyle = {
    fontFamily: theme.fontUi,
    fontSize: 13,
    color: theme.text,
    padding: "6px 0",
    borderBottom: `1px solid ${theme.tableRowBorder}`
  };
  return /*#__PURE__*/React.createElement(DetailSection, {
    title: "Teams",
    theme: theme
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: theme.fontUi,
      fontSize: 11,
      fontWeight: 700,
      color: theme.textFaint,
      textTransform: "uppercase",
      marginBottom: 4
    }
  }, "Active Teams"), active.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: theme.fontUi,
      fontSize: 12.5,
      color: theme.textGhost,
      marginBottom: 10
    }
  }, "None.") : active.map(a => /*#__PURE__*/React.createElement("div", {
    key: a.vehicle,
    style: rowStyle
  }, /*#__PURE__*/React.createElement("strong", null, a.vehicle), " — ", a.status, a.teamStatus ? ` (${a.teamStatus})` : "")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: theme.fontUi,
      fontSize: 11,
      fontWeight: 700,
      color: theme.textFaint,
      textTransform: "uppercase",
      margin: "12px 0 4px"
    }
  }, "Completed Teams"), completed.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: theme.fontUi,
      fontSize: 12.5,
      color: theme.textGhost,
      marginBottom: 10
    }
  }, "None.") : completed.map((c, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: rowStyle
  }, /*#__PURE__*/React.createElement("strong", null, c.vehicle), c.formData?.note ? ` — ${c.formData.note}` : "")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: theme.fontUi,
      fontSize: 11,
      fontWeight: 700,
      color: theme.textFaint,
      textTransform: "uppercase",
      margin: "12px 0 4px"
    }
  }, "Called Off Teams"), calledOff.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: theme.fontUi,
      fontSize: 12.5,
      color: theme.textGhost
    }
  }, "None.") : calledOff.map((c, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: rowStyle
  }, /*#__PURE__*/React.createElement("strong", null, c.vehicle), c.reason ? ` — ${c.reason}` : "")));
}

// ---------------------------------------------------------------
// PROVIDERS & MAP -- placeholders, both intentionally disabled.
// ---------------------------------------------------------------
const PROVIDER_STATUS_ORDER = ["Requested", "Referred", "Complete", "Cancelled"];
const PROVIDER_STATUS_COLORS = {
  Requested: "#7C8791",
  Referred: "#E8B23C",
  Complete: "#3FA34D",
  Cancelled: "#D9463D"
};
function hasActiveTeamsClient(state, incidentId) {
  return Object.values(state.vehicleStates || {}).some(v => (v.queue || []).some(j => j.id === incidentId) || (v.incomingQueue || []).some(j => j.id === incidentId));
}

// Converts an ISO string to the value a datetime-local input needs, and back.
function isoToLocalInput(iso) {
  const d = iso ? new Date(iso) : new Date();
  const pad = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function localInputToIso(val) {
  const d = new Date(val);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}
function ModalShell({
  theme,
  title,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100,
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: theme.panel,
      border: `1px solid ${theme.border}`,
      borderRadius: 10,
      padding: 20,
      maxWidth: 440,
      width: "100%",
      maxHeight: "90vh",
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "Oswald, sans-serif",
      fontSize: 17,
      fontWeight: 700,
      color: theme.text,
      marginBottom: 14
    }
  }, title), children));
}
function ModalField({
  label,
  theme,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: theme.fontUi,
      fontSize: 12,
      fontWeight: 700,
      color: theme.textFaint,
      textTransform: "uppercase",
      letterSpacing: "0.03em",
      marginBottom: 6
    }
  }, label), children);
}
function ModalButtons({
  theme,
  onCancel,
  cancelLabel,
  actions
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap",
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onCancel,
    style: {
      flex: 1,
      minWidth: 90,
      background: "none",
      border: `1px solid ${theme.border}`,
      borderRadius: 6,
      color: theme.textMuted,
      fontFamily: theme.fontUi,
      fontWeight: 600,
      fontSize: 13,
      padding: "10px 0",
      cursor: "pointer"
    }
  }, cancelLabel || "Cancel"), actions.map((a, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: a.onClick,
    disabled: a.disabled,
    style: {
      flex: 2,
      minWidth: 120,
      background: a.disabled ? theme.panelAlt : a.color || theme.accent,
      color: a.disabled ? theme.textGhost : a.textColor || theme.accentText,
      border: "none",
      borderRadius: 6,
      fontFamily: theme.fontUi,
      fontWeight: 700,
      fontSize: 13,
      padding: "10px 0",
      cursor: a.disabled ? "not-allowed" : "pointer"
    }
  }, a.label)));
}
function AttachProviderModal({
  incident,
  theme,
  dispatch,
  onClose
}) {
  const [agency, setAgency] = useState("");
  const [reference, setReference] = useState("");
  const [details, setDetails] = useState("");
  const [saving, setSaving] = useState(false);
  const save = async () => {
    if (!agency.trim()) return;
    setSaving(true);
    try {
      await dispatch("ATTACH_PROVIDER", {
        incidentId: incident.id,
        agency: agency.trim(),
        reference: reference.trim(),
        details: details.trim()
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };
  return /*#__PURE__*/React.createElement(ModalShell, {
    theme: theme,
    title: "Attach New Provider | Provider"
  }, /*#__PURE__*/React.createElement(ModalField, {
    label: "Agency/Company",
    theme: theme
  }, /*#__PURE__*/React.createElement("input", {
    value: agency,
    onChange: e => setAgency(e.target.value),
    placeholder: "Agency / Provider Name",
    style: inputStyle(theme)
  })), /*#__PURE__*/React.createElement(ModalField, {
    label: "Reference",
    theme: theme
  }, /*#__PURE__*/React.createElement("input", {
    value: reference,
    onChange: e => setReference(e.target.value),
    placeholder: "Agency / Provider Reference",
    style: inputStyle(theme)
  })), /*#__PURE__*/React.createElement(ModalField, {
    label: "Details",
    theme: theme
  }, /*#__PURE__*/React.createElement("textarea", {
    value: details,
    onChange: e => setDetails(e.target.value),
    rows: 3,
    style: {
      ...inputStyle(theme),
      resize: "vertical"
    }
  })), /*#__PURE__*/React.createElement(ModalButtons, {
    theme: theme,
    onCancel: onClose,
    actions: [{
      label: saving ? "Saving…" : "Save Provider",
      onClick: save,
      disabled: !agency.trim() || saving
    }]
  }));
}
function CancelProviderModal({
  provider,
  theme,
  dispatch,
  onClose
}) {
  const [busy, setBusy] = useState(false);
  const confirm = async () => {
    setBusy(true);
    try {
      await dispatch("CANCEL_PROVIDER", {
        incidentId: provider.incidentId,
        providerId: provider.id
      });
      onClose();
    } finally {
      setBusy(false);
    }
  };
  return /*#__PURE__*/React.createElement(ModalShell, {
    theme: theme,
    title: "Confirm Provider Cancellation"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: theme.fontUi,
      fontSize: 14,
      color: theme.textMuted,
      marginBottom: 16
    }
  }, "Are you sure you want to cancel the provider: ", provider.agency, "?"), /*#__PURE__*/React.createElement(ModalButtons, {
    theme: theme,
    onCancel: onClose,
    cancelLabel: "NO",
    actions: [{
      label: "YES",
      onClick: confirm,
      disabled: busy,
      color: "#D9463D",
      textColor: "#fff"
    }]
  }));
}
function ReferProviderModal({
  provider,
  theme,
  dispatch,
  onClose
}) {
  const [note, setNote] = useState("");
  const [timestamp, setTimestamp] = useState(isoToLocalInput());
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    try {
      await dispatch("REFER_PROVIDER", {
        incidentId: provider.incidentId,
        providerId: provider.id,
        note,
        timestamp: localInputToIso(timestamp)
      });
      onClose();
    } finally {
      setBusy(false);
    }
  };
  return /*#__PURE__*/React.createElement(ModalShell, {
    theme: theme,
    title: "Refer Incident | Provider"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: theme.fontUi,
      fontSize: 14,
      fontWeight: 600,
      color: theme.text,
      marginBottom: 14
    }
  }, provider.agency, provider.reference ? ` (ref: ${provider.reference})` : ""), /*#__PURE__*/React.createElement(ModalField, {
    label: "Details",
    theme: theme
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: theme.fontUi,
      fontSize: 13,
      color: theme.textFaint
    }
  }, provider.details || "—")), /*#__PURE__*/React.createElement(ModalField, {
    label: "Note",
    theme: theme
  }, /*#__PURE__*/React.createElement("textarea", {
    value: note,
    onChange: e => setNote(e.target.value),
    rows: 3,
    placeholder: "Details here",
    style: {
      ...inputStyle(theme),
      resize: "vertical"
    }
  })), /*#__PURE__*/React.createElement(ModalField, {
    label: "Timestamp",
    theme: theme
  }, /*#__PURE__*/React.createElement("input", {
    type: "datetime-local",
    value: timestamp,
    onChange: e => setTimestamp(e.target.value),
    style: inputStyle(theme)
  })), /*#__PURE__*/React.createElement(ModalButtons, {
    theme: theme,
    onCancel: onClose,
    actions: [{
      label: busy ? "Referring…" : "Refer to Supplier",
      onClick: submit,
      disabled: busy
    }]
  }));
}
function CompleteProviderModal({
  incident,
  state,
  provider,
  theme,
  dispatch,
  onClose
}) {
  const [details, setDetails] = useState("");
  const [timestamp, setTimestamp] = useState(isoToLocalInput());
  const [busy, setBusy] = useState(false);
  const canCompleteIncident = !hasActiveTeamsClient(state, incident.id);
  const completeProvider = async () => {
    setBusy(true);
    try {
      await dispatch("COMPLETE_PROVIDER", {
        incidentId: provider.incidentId,
        providerId: provider.id,
        details,
        timestamp: localInputToIso(timestamp)
      });
      onClose();
    } finally {
      setBusy(false);
    }
  };
  const completeProviderAndIncident = async () => {
    setBusy(true);
    try {
      await dispatch("COMPLETE_PROVIDER_AND_INCIDENT", {
        incidentId: provider.incidentId,
        providerId: provider.id,
        details,
        timestamp: localInputToIso(timestamp)
      });
      onClose();
    } finally {
      setBusy(false);
    }
  };
  const actions = [{
    label: busy ? "Saving…" : "Complete Provider",
    onClick: completeProvider,
    disabled: busy
  }];
  if (canCompleteIncident) actions.push({
    label: "Complete Provider & Incident",
    onClick: completeProviderAndIncident,
    disabled: busy,
    color: "#3FA34D",
    textColor: "#0d1114"
  });
  return /*#__PURE__*/React.createElement(ModalShell, {
    theme: theme,
    title: "Complete Provider | Incident"
  }, /*#__PURE__*/React.createElement(ModalField, {
    label: "Agency / Company",
    theme: theme
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: theme.fontUi,
      fontSize: 13.5,
      color: theme.text
    }
  }, provider.agency)), /*#__PURE__*/React.createElement(ModalField, {
    label: "Reference",
    theme: theme
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: theme.fontUi,
      fontSize: 13.5,
      color: theme.text
    }
  }, provider.reference || "—")), /*#__PURE__*/React.createElement(ModalField, {
    label: "Details",
    theme: theme
  }, /*#__PURE__*/React.createElement("textarea", {
    value: details,
    onChange: e => setDetails(e.target.value),
    rows: 3,
    placeholder: "Details Here",
    style: {
      ...inputStyle(theme),
      resize: "vertical"
    }
  })), /*#__PURE__*/React.createElement(ModalField, {
    label: "Timestamp",
    theme: theme
  }, /*#__PURE__*/React.createElement("input", {
    type: "datetime-local",
    value: timestamp,
    onChange: e => setTimestamp(e.target.value),
    style: inputStyle(theme)
  })), /*#__PURE__*/React.createElement(ModalButtons, {
    theme: theme,
    onCancel: onClose,
    actions: actions
  }));
}
function ProvidersSection({
  incident,
  providers,
  state,
  theme,
  dispatch
}) {
  const [attaching, setAttaching] = useState(false);
  const [modal, setModal] = useState(null); // { type: 'cancel'|'refer'|'complete', provider }

  const openModal = (type, provider) => setModal({
    type,
    provider: {
      ...provider,
      incidentId: incident.id
    }
  });
  const closeModal = () => setModal(null);
  const statusButtonStyle = (provider, status) => {
    const isCurrent = provider.status === status;
    const terminal = provider.status === "Complete" || provider.status === "Cancelled";
    const disabled = isCurrent || terminal;
    const color = PROVIDER_STATUS_COLORS[status];
    return {
      style: {
        padding: "6px 12px",
        borderRadius: 6,
        fontFamily: theme.fontUi,
        fontWeight: 700,
        fontSize: 11.5,
        background: isCurrent ? color : "none",
        color: isCurrent ? "#0d1114" : disabled ? theme.textGhost : color,
        border: `1px solid ${isCurrent ? color : disabled ? theme.border : color + "88"}`,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled && !isCurrent ? 0.5 : 1
      },
      disabled,
      onClick: () => {
        if (disabled) return;
        if (status === "Cancelled") openModal("cancel", provider);else if (status === "Referred") openModal("refer", provider);else if (status === "Complete") openModal("complete", provider);
      }
    };
  };
  return /*#__PURE__*/React.createElement(DetailSection, {
    title: "Providers",
    theme: theme
  }, providers.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
      marginBottom: 14
    }
  }, providers.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    style: {
      background: theme.panelAlt,
      border: `1px solid ${theme.border}`,
      borderRadius: 8,
      padding: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: theme.fontUi,
      fontWeight: 700,
      fontSize: 13.5,
      color: theme.text,
      marginBottom: 2
    }
  }, p.agency, p.reference ? ` (ref: ${p.reference})` : ""), p.details && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: theme.fontUi,
      fontSize: 12,
      color: theme.textFaint,
      marginBottom: 8
    }
  }, p.details), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 6
    }
  }, PROVIDER_STATUS_ORDER.map(status => {
    const btn = statusButtonStyle(p, status);
    return /*#__PURE__*/React.createElement("button", {
      key: status,
      style: btn.style,
      disabled: btn.disabled,
      onClick: btn.onClick
    }, status);
  }))))), /*#__PURE__*/React.createElement("button", {
    onClick: () => setAttaching(true),
    style: {
      background: "none",
      border: `1px solid ${theme.border}`,
      borderRadius: 6,
      color: theme.textMuted,
      fontFamily: theme.fontUi,
      fontWeight: 600,
      fontSize: 12.5,
      padding: "8px 14px",
      cursor: "pointer"
    }
  }, "Attach Provider"), attaching && /*#__PURE__*/React.createElement(AttachProviderModal, {
    incident: incident,
    theme: theme,
    dispatch: dispatch,
    onClose: () => setAttaching(false)
  }), modal?.type === "cancel" && /*#__PURE__*/React.createElement(CancelProviderModal, {
    provider: modal.provider,
    theme: theme,
    dispatch: dispatch,
    onClose: closeModal
  }), modal?.type === "refer" && /*#__PURE__*/React.createElement(ReferProviderModal, {
    provider: modal.provider,
    theme: theme,
    dispatch: dispatch,
    onClose: closeModal
  }), modal?.type === "complete" && /*#__PURE__*/React.createElement(CompleteProviderModal, {
    incident: incident,
    state: state,
    provider: modal.provider,
    theme: theme,
    dispatch: dispatch,
    onClose: closeModal
  }));
}
function MapSection({
  theme
}) {
  return /*#__PURE__*/React.createElement(DetailSection, {
    title: "Map",
    theme: theme
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    disabled: true,
    style: {
      background: "none",
      border: `1px solid ${theme.border}`,
      borderRadius: 6,
      color: theme.textGhost,
      fontFamily: theme.fontUi,
      fontWeight: 600,
      fontSize: 12.5,
      padding: "8px 14px",
      cursor: "not-allowed",
      opacity: 0.5
    }
  }, "On"), /*#__PURE__*/React.createElement("button", {
    disabled: true,
    style: {
      background: "none",
      border: `1px solid ${theme.border}`,
      borderRadius: 6,
      color: theme.textGhost,
      fontFamily: theme.fontUi,
      fontWeight: 600,
      fontSize: 12.5,
      padding: "8px 14px",
      cursor: "not-allowed",
      opacity: 0.5
    }
  }, "Off")));
}

// ---------------------------------------------------------------
// ADD A NEW NOTE
// ---------------------------------------------------------------
function AddNoteForm({
  incident,
  theme,
  dispatch
}) {
  const [tab, setTab] = useState(Object.keys(NOTE_TAG_GROUPS)[0]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const [actionRequired, setActionRequired] = useState(true);
  const [saving, setSaving] = useState(false);
  const hasActionTag = selectedTags.some(t => ACTION_ITEM_TAGS.has(t));
  const toggleTag = t => setSelectedTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  const save = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      await dispatch("ADD_NOTE", {
        incidentId: incident.id,
        tags: selectedTags,
        subject: subject.trim() || null,
        text: text.trim(),
        actionRequired: hasActionTag ? actionRequired : false
      });
      setSelectedTags([]);
      setSubject("");
      setText("");
      setActionRequired(true);
    } finally {
      setSaving(false);
    }
  };
  return /*#__PURE__*/React.createElement(DetailSection, {
    title: "Add A New Note",
    theme: theme
  }, /*#__PURE__*/React.createElement("div", {
    className: "tag-picker-tabs",
    style: {
      marginBottom: 10
    }
  }, Object.keys(NOTE_TAG_GROUPS).map(g => /*#__PURE__*/React.createElement("button", {
    key: g,
    onClick: () => setTab(g),
    style: {
      padding: "6px 12px",
      borderRadius: 6,
      cursor: "pointer",
      fontFamily: theme.fontUi,
      fontWeight: 600,
      fontSize: 12,
      background: tab === g ? theme.accent : "none",
      color: tab === g ? theme.accentText : theme.textMuted,
      border: `1px solid ${tab === g ? theme.accent : theme.border}`
    }
  }, g))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 6,
      marginBottom: 14
    }
  }, NOTE_TAG_GROUPS[tab].filter(t => !selectedTags.includes(t)).map(t => /*#__PURE__*/React.createElement("button", {
    key: t,
    onClick: () => toggleTag(t),
    style: {
      padding: "5px 10px",
      borderRadius: 5,
      cursor: "pointer",
      fontFamily: theme.fontUi,
      fontSize: 12,
      background: theme.panelAlt,
      color: tagColor(t),
      border: `1px solid ${tagColor(t)}55`
    }
  }, t))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: theme.fontUi,
      fontSize: 11,
      fontWeight: 700,
      color: theme.textFaint,
      textTransform: "uppercase",
      marginBottom: 6
    }
  }, "Selected Tags"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 6,
      marginBottom: 14,
      minHeight: 20
    }
  }, selectedTags.length === 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: theme.fontUi,
      fontSize: 12,
      color: theme.textGhost
    }
  }, "None selected."), selectedTags.map(t => /*#__PURE__*/React.createElement("span", {
    key: t,
    onClick: () => toggleTag(t),
    style: {
      padding: "5px 10px",
      borderRadius: 5,
      cursor: "pointer",
      fontFamily: theme.fontUi,
      fontSize: 12,
      fontWeight: 600,
      color: "#fff",
      background: tagColor(t)
    }
  }, t, " ×"))), hasActionTag && /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      fontFamily: theme.fontUi,
      fontSize: 13,
      color: theme.textMuted,
      marginBottom: 14,
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: actionRequired,
    onChange: e => setActionRequired(e.target.checked)
  }), "Action Required"), /*#__PURE__*/React.createElement(FormRow, {
    label: "Subject",
    theme: theme
  }, /*#__PURE__*/React.createElement("input", {
    value: subject,
    onChange: e => setSubject(e.target.value),
    style: inputStyle(theme)
  })), /*#__PURE__*/React.createElement(FormRow, {
    label: "Text",
    theme: theme
  }, /*#__PURE__*/React.createElement("textarea", {
    value: text,
    onChange: e => setText(e.target.value),
    rows: 3,
    style: {
      ...inputStyle(theme),
      resize: "vertical"
    }
  })), /*#__PURE__*/React.createElement("button", {
    onClick: save,
    disabled: !text.trim() || saving,
    style: {
      marginTop: 8,
      background: text.trim() ? theme.accent : theme.panelAlt,
      color: text.trim() ? theme.accentText : theme.textGhost,
      border: "none",
      borderRadius: 6,
      padding: "10px 18px",
      fontFamily: theme.fontUi,
      fontWeight: 700,
      fontSize: 13,
      cursor: text.trim() ? "pointer" : "not-allowed"
    }
  }, saving ? "Saving…" : "Save Note"));
}

// ---------------------------------------------------------------
// MAIN SCREEN
// ---------------------------------------------------------------
function IncidentDetailScreen({
  state,
  theme,
  navigate,
  dispatch,
  slug
}) {
  const incident = (state?.allIncidents || []).find(inc => {
    const digits = shortId(inc.id).replace(/[^0-9]/g, "");
    return String(parseInt(digits, 10)) === slug;
  });
  const statusColors = theme.name === "dark" ? STATUS_COLORS_DARK : STATUS_COLORS_LIGHT;
  if (!state) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 40,
        textAlign: "center",
        fontFamily: theme.fontUi,
        color: theme.textFaint
      }
    }, "Loading…");
  }
  if (!incident) {
    return /*#__PURE__*/React.createElement("div", {
      className: "page-wrap-full",
      style: {
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: theme.fontUi,
        color: theme.textFaint,
        marginBottom: 16
      }
    }, "Incident not found."), /*#__PURE__*/React.createElement(Link, {
      to: "/Jobs",
      navigate: navigate,
      style: {
        color: theme.accent,
        fontFamily: theme.fontUi,
        fontWeight: 600
      }
    }, "← Back to Incident Register"));
  }
  const timeline = state.incidentTimelines?.[incident.id] || [];
  const notes = state.incidentNotes?.[incident.id] || [];
  const providers = state.incidentProviders?.[incident.id] || [];
  const tags = Array.isArray(incident.tags) ? incident.tags : [];
  const priColor = priorityDisplayColor(incident, theme);
  const statColor = statusColors[incident.status] || theme.textFaint;
  const hqZone = HQ_ZONE_NAMES[incident.assignedHQ];
  return /*#__PURE__*/React.createElement("div", {
    className: "page-wrap-full"
  }, /*#__PURE__*/React.createElement(Link, {
    to: "/Jobs",
    navigate: navigate,
    style: {
      color: theme.textFaint,
      fontFamily: theme.fontUi,
      fontSize: 13,
      fontWeight: 600,
      display: "inline-block",
      marginBottom: 16
    }
  }, "← Back to Incident Register"), /*#__PURE__*/React.createElement("div", {
    className: "incident-header",
    style: {
      background: priColor + "18",
      borderBottom: `2px solid ${priColor}`
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "incident-header-title",
    style: {
      fontFamily: "Oswald, sans-serif",
      fontWeight: 700,
      color: theme.text,
      margin: 0
    }
  }, "Incident ", shortId(incident.id), " Details"), /*#__PURE__*/React.createElement("div", {
    className: "incident-header-meta"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: theme.fontMono,
      fontSize: 12,
      color: theme.textFaint
    }
  }, incident.taskedAt ? formatDT(incident.taskedAt) : ""), /*#__PURE__*/React.createElement(Chip, {
    label: (incident.status || "").toUpperCase(),
    color: statColor,
    theme: theme
  }))), /*#__PURE__*/React.createElement("div", {
    className: "incident-detail-body",
    style: {
      background: theme.panel,
      border: `1px solid ${theme.border}`,
      borderTop: "none"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(DetailSection, {
    title: "Incident Details",
    theme: theme
  }, tags.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 6,
      marginBottom: 10
    }
  }, tags.map(t => /*#__PURE__*/React.createElement("span", {
    key: t,
    style: {
      background: theme.panelAlt,
      border: `1px solid ${theme.border}`,
      color: theme.textMuted,
      fontSize: 11.5,
      padding: "3px 9px",
      borderRadius: 5,
      fontFamily: theme.fontUi
    }
  }, t))), /*#__PURE__*/React.createElement(DetailRow, {
    label: "Situation On Scene",
    value: incident.situationOnScene,
    theme: theme
  }), /*#__PURE__*/React.createElement(DetailRow, {
    label: "Response Required",
    value: incident.priority,
    theme: theme
  }), /*#__PURE__*/React.createElement(DetailRow, {
    label: "Recce'd",
    value: incident.reconnoitered ? "Yes" : "No",
    theme: theme
  }), /*#__PURE__*/React.createElement(DetailRow, {
    label: "Referring Agency",
    value: incident.referringAgency ? incident.referringAgency + (incident.agencyRef ? ` (ref: ${incident.agencyRef})` : "") : null,
    theme: theme
  })), /*#__PURE__*/React.createElement(DetailSection, {
    title: "Incident Location",
    theme: theme
  }, /*#__PURE__*/React.createElement(DetailRow, {
    label: "Address",
    value: incident.addr,
    theme: theme
  }), /*#__PURE__*/React.createElement(DetailRow, {
    label: "Extra Info",
    value: incident.additionalAddressInfo,
    theme: theme
  }), /*#__PURE__*/React.createElement(DetailRow, {
    label: "Lat/Long",
    value: incident.lat || incident.long ? `${incident.lat || ""} / ${incident.long || ""}` : null,
    theme: theme
  }), /*#__PURE__*/React.createElement(DetailRow, {
    label: "HQ",
    value: incident.assignedHQ ? `${incident.assignedHQ}${hqZone ? ` (${hqZone})` : ""}` : null,
    theme: theme
  }), /*#__PURE__*/React.createElement(DetailRow, {
    label: "Permission to Enter",
    value: incident.permissionToEnter,
    theme: theme
  }), /*#__PURE__*/React.createElement(DetailRow, {
    label: "How to Enter",
    value: incident.howToEnter,
    theme: theme
  })), /*#__PURE__*/React.createElement(DetailSection, {
    title: "Caller Details",
    theme: theme
  }, /*#__PURE__*/React.createElement(DetailRow, {
    label: "Requesting Agency",
    value: incident.requestingAgency ? incident.requestingAgency + (incident.requestingAgencyRef ? ` (ref: ${incident.requestingAgencyRef})` : "") : null,
    theme: theme
  }), /*#__PURE__*/React.createElement(DetailRow, {
    label: "Number",
    value: incident.callersNumber,
    theme: theme
  }), /*#__PURE__*/React.createElement(DetailRow, {
    label: "Name",
    value: incident.callersName,
    theme: theme
  }), /*#__PURE__*/React.createElement(DetailRow, {
    label: "Incident Contact",
    value: incident.incidentContactCalling,
    theme: theme
  })), incident.incidentContactCalling === "No" && /*#__PURE__*/React.createElement(DetailSection, {
    title: "Incident Contact Details",
    theme: theme
  }, /*#__PURE__*/React.createElement(DetailRow, {
    label: "Name",
    value: incident.contactName,
    theme: theme
  }), /*#__PURE__*/React.createElement(DetailRow, {
    label: "Number",
    value: incident.contactNumber,
    theme: theme
  })), /*#__PURE__*/React.createElement(JobHistorySection, {
    state: state,
    incident: incident,
    theme: theme,
    navigate: navigate
  }), /*#__PURE__*/React.createElement(NotesSection, {
    incident: incident,
    notes: notes,
    theme: theme,
    dispatch: dispatch
  }), /*#__PURE__*/React.createElement(ActionsSection, {
    incident: incident,
    notes: notes,
    theme: theme,
    dispatch: dispatch
  }), /*#__PURE__*/React.createElement(TeamsSection, {
    state: state,
    incident: incident,
    theme: theme
  }), /*#__PURE__*/React.createElement(PhotosSection, {
    incident: incident,
    theme: theme,
    dispatch: dispatch
  }), /*#__PURE__*/React.createElement(ProvidersSection, {
    incident: incident,
    providers: providers,
    state: state,
    theme: theme,
    dispatch: dispatch
  }), /*#__PURE__*/React.createElement(MapSection, {
    theme: theme
  }), /*#__PURE__*/React.createElement(AddNoteForm, {
    incident: incident,
    theme: theme,
    dispatch: dispatch
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, timeline.length > 0 && /*#__PURE__*/React.createElement(DetailSection, {
    title: "Time Line",
    theme: theme
  }, timeline.slice(0, 40).map((e, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      borderBottom: `1px solid ${theme.tableRowBorder}`,
      padding: "9px 0",
      fontSize: 13,
      fontFamily: theme.fontUi,
      wordBreak: "break-word"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      color: (theme.name === "dark" ? STATUS_COLORS_DARK : STATUS_COLORS_LIGHT)[e.status] || theme.textMuted
    }
  }, e.status), e.note ? ` — ${e.note}` : "", /*#__PURE__*/React.createElement("div", {
    style: {
      color: theme.textGhost,
      fontSize: 11,
      marginTop: 2
    }
  }, e.time ? formatDT(e.time) : "", " ", timeSince(incident.taskedAt, e.time))))))));
}
function App() {
  const {
    state,
    connected,
    error,
    dispatch
  } = useServerState(SERVER_URL);
  const {
    path,
    navigate
  } = useRouter();
  const [themeName, setThemeName] = useState(() => localStorage.getItem("beacon_theme") || "dark");
  const theme = THEMES[themeName];
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeName);
  }, [themeName]);
  const toggleTheme = () => {
    const next = themeName === "dark" ? "light" : "dark";
    setThemeName(next);
    localStorage.setItem("beacon_theme", next);
  };
  let page;
  const jobDetailMatch = path.match(/^\/Jobs\/(\d+)$/);
  if (jobDetailMatch) page = /*#__PURE__*/React.createElement(IncidentDetailScreen, {
    state: state,
    theme: theme,
    navigate: navigate,
    dispatch: dispatch,
    slug: jobDetailMatch[1]
  });else if (path === "/Jobs") page = /*#__PURE__*/React.createElement(JobsRegisterScreen, {
    state: state,
    theme: theme,
    navigate: navigate
  });else if (path === "/Jobs/Create") page = /*#__PURE__*/React.createElement(CreateIncidentScreen, {
    dispatch: dispatch,
    theme: theme,
    navigate: navigate,
    state: state
  });else if (path === "/Jobs/Tasking") page = /*#__PURE__*/React.createElement(ComingSoon, {
    title: "Tasking",
    theme: theme
  });else page = /*#__PURE__*/React.createElement(Dashboard, {
    state: state,
    navigate: navigate,
    theme: theme
  });
  return /*#__PURE__*/React.createElement(ThemeContext.Provider, {
    value: theme
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      background: theme.bg
    }
  }, /*#__PURE__*/React.createElement(TopNav, {
    path: path,
    navigate: navigate,
    theme: theme,
    toggleTheme: toggleTheme
  }), /*#__PURE__*/React.createElement(ConnectionBar, {
    connected: connected,
    error: error,
    theme: theme
  }), !state ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 60,
      textAlign: "center",
      fontFamily: theme.fontUi,
      color: theme.textFaint,
      fontSize: 13
    }
  }, "Loading…") : page));
}
const root = createRoot(document.getElementById("root"));
root.render(/*#__PURE__*/React.createElement(App, null));

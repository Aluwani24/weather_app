import ThemeToggle from "../components/ThemeToggle";
import UnitToggle from "../components/UnitToggle";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { Settings, Units } from "../types";

export default function Settings() {
  const [settings, setSettings] = useLocalStorage<Settings>("settings", {
    theme: "light",
    units: "metric",
    view: "hourly",
    notificationsEnabled: false
  });

  function toggleTheme() {
    setSettings({ ...settings, theme: settings.theme === "light" ? "dark" : "light" });
  }

  function setUnits(u: Units) {
    setSettings({ ...settings, units: u });
  }

  async function requestNotifications() {
    if (!("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    setSettings({ ...settings, notificationsEnabled: perm === "granted" });
  }

  return (
    <div className="container">
      <div className="header">
        <h1 style={{ margin: 0 }}>Settings</h1>
        <a className="button ghost clickable" href="/">← Back</a>
      </div>

      <div className="grid">
        <div className="card">
          <h3>Theme</h3>
          <ThemeToggle theme={settings.theme} onToggle={toggleTheme} />
        </div>
        <div className="card">
          <h3>Units</h3>
          <UnitToggle units={settings.units} onChange={setUnits} />
        </div>
        <div className="card">
          <h3>Notifications</h3>
          <p className="subtle">Enable alerts for severe weather (local notifications).</p>
          <div className="row">
            <button className="button" onClick={requestNotifications}>
              {settings.notificationsEnabled ? "Enabled ✅" : "Enable"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

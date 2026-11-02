import { useEffect, useMemo, useState } from "react";
import dashboardStyles from "./dashboard.css?inline";

const initialProfile = { name: "Your account", email: "", phone: "" };
const navigation = [
  { page: "home", label: "Home", icon: "⌂" },
  { page: "history", label: "History", icon: "◷" },
  { page: "wallet", label: "Wallet", icon: "▣" },
  { page: "profile", label: "Profile", icon: "♙" },
];
const networks = [
  { name: "MTN", symbol: "●", color: "#f1bd22" },
  { name: "Airtel", symbol: "◉", color: "#ed5154" },
  { name: "Glo", symbol: "●", color: "#36a766" },
  { name: "9mobile", symbol: "◉", color: "#277963" },
];
const transactionFilters = ["All", "Airtime", "Data", "TV", "Electricity"];
const quickAmounts = ["₦100", "₦200", "₦500", "₦1,000", "₦2,000"];
const serviceMeta = {
  airtime: { title: "Airtime", kind: "Airtime" },
  data: { title: "Buy Data", kind: "Data" },
  "sme-data": { title: "Buy Data", kind: "Data" },
  tv: { title: "TV Subscription", kind: "TV" },
  electricity: { title: "Electricity", kind: "Electricity" },
};

function readLegacyProfile() {
  const name = document.getElementById("dashboard-user-name")?.textContent?.trim();
  const email = document.getElementById("dashboard-user-email")?.textContent?.trim();
  return {
    name: name && name !== "Your account" ? name : initialProfile.name,
    email: email && email !== "Preview workspace" ? email : "",
    phone: "",
  };
}

function readLegacyWorkspace() {
  const name = document.getElementById("dashboard-workspace-name")?.textContent?.trim();
  const path = document.getElementById("dashboard-workspace-path")?.textContent?.trim();
  return {
    name: name || "My Rektina.sub space",
    path: path || "Both",
  };
}

function formatDomain(value) {
  return value.trim().toLowerCase().replace(/\.$/, "");
}

function isValidDomain(value) {
  if (value.length > 253 || !value.includes(".") || value.includes("://")) return false;
  return value.split(".").every((label) =>
    label.length > 0 &&
    label.length <= 63 &&
    /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label),
  );
}

export default function DashboardExperience({ sectionProps, legacyChildren }) {
  const [page, setPage] = useState("home");
  const [profile, setProfile] = useState(readLegacyProfile);
  const [workspace, setWorkspace] = useState(readLegacyWorkspace);
  const [transactions, setTransactions] = useState([]);
  const [toast, setToast] = useState("");
  const [active, setActive] = useState(false);
  const [editProfileBack, setEditProfileBack] = useState("settings");
  const [savedDomain, setSavedDomain] = useState("");
  const [domainInput, setDomainInput] = useState("");
  const [domainError, setDomainError] = useState("");
  const [filter, setFilter] = useState("All");
  const [modal, setModal] = useState("");
  const [preferences, setPreferences] = useState({ emailUpdates: false, orderUpdates: true, theme: "light" });

  useEffect(() => {
    const dashboard = document.getElementById("dashboard-page");
    if (!dashboard) return undefined;
    const syncDashboard = () => {
      setActive(dashboard.classList.contains("active"));
      setProfile(readLegacyProfile());
      setWorkspace(readLegacyWorkspace());
    };
    const observer = new MutationObserver(syncDashboard);
    observer.observe(dashboard, { attributes: true, attributeFilter: ["class"] });
    syncDashboard();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const notify = (message) => setToast(message);
  const navigate = (nextPage) => {
    setPage(nextPage);
    setModal("");
    setToast("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const filteredTransactions = useMemo(
    () => filter === "All" ? transactions : transactions.filter((item) => item.kind === filter),
    [filter, transactions],
  );

  const submitPurchase = (purchase) => {
    setTransactions((items) => [{
      ...purchase,
      id: `${Date.now()}-${items.length}`,
      time: new Date().toLocaleString(),
      status: "Preview",
    }, ...items]);
    setModal("order");
  };

  const saveDomain = (event) => {
    event.preventDefault();
    const domain = formatDomain(domainInput);
    if (!isValidDomain(domain)) {
      setDomainError("Enter a domain such as example.com, without a URL or email address.");
      return;
    }
    setSavedDomain(domain);
    setDomainInput(domain);
    setDomainError("");
    notify("Domain saved in this browser preview. DNS verification is not connected.");
  };

  const saveProfile = (updatedProfile) => {
    setProfile(updatedProfile);
    navigate("profile");
    notify("Profile changes are saved for this preview session only.");
  };

  const saveWorkspace = (updatedWorkspace) => {
    setWorkspace(updatedWorkspace);
    navigate("settings");
    notify("Workspace changes are saved for this preview session only.");
  };

  const updatePreference = (key, value) => {
    setPreferences((current) => ({ ...current, [key]: value }));
  };

  const confirmLogout = () => {
    setModal("");
    setPage("home");
    window.history.pushState(null, "", "#signin");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const openDeveloper = () => navigate("developer");
  return (
    <section {...sectionProps} className={`${sectionProps.className || ""} react-dashboard-shell`}>
      <style>{dashboardStyles}</style>
      <div className={`rektina-app ${preferences.theme === "dark" ? "is-dark" : ""}`}>
        <DashboardHeader profile={profile} navigate={navigate} notify={notify} />
        <div className="rektina-content" key={page}>
          {!active && <LandingPreview />}
          {active && page === "home" && <HomePage profile={profile} workspace={workspace} transactions={transactions} savedDomain={savedDomain} navigate={navigate} />}
          {active && serviceMeta[page] && <PurchasePage type={page} onBack={() => navigate("home")} onSubmit={submitPurchase} />}
          {active && page === "history" && <HistoryPage transactions={filteredTransactions} filter={filter} setFilter={setFilter} onBack={() => navigate("home")} />}
          {active && page === "wallet" && <WalletPage navigate={navigate} onAction={setModal} />}
          {active && page === "profile" && <ProfilePage profile={profile} navigate={navigate} onEdit={() => { setEditProfileBack("profile"); navigate("edit-profile"); }} />}
          {active && page === "settings" && <SettingsPage navigate={navigate} workspace={workspace} saveWorkspace={saveWorkspace} preferences={preferences} updatePreference={updatePreference} notify={notify} onLogout={() => setModal("logout")} onAccountInformation={() => { setEditProfileBack("settings"); navigate("account-information"); }} />}
          {active && page === "account-information" && <AccountInformationPage profile={profile} workspace={workspace} onBack={() => navigate("settings")} onEdit={() => { setEditProfileBack("account-information"); navigate("edit-profile"); }} />}
          {active && page === "change-password" && <ChangePasswordPage onBack={() => navigate("settings")} notify={notify} />}
          {active && page === "privacy" && <PrivacySecurityPage onBack={() => navigate("settings")} />}
          {active && page === "support" && <HelpSupportPage onBack={() => navigate("settings")} />}
          {active && page === "about" && <AboutPage onBack={() => navigate("settings")} />}
          {active && page === "edit-profile" && <EditProfilePage profile={profile} onBack={() => navigate(editProfileBack)} onSave={saveProfile} />}
          {active && page === "security" && <SecurityPage onBack={() => navigate("settings")} notify={notify} />}
          {active && page === "developer" && <DeveloperPage savedDomain={savedDomain} domainInput={domainInput} setDomainInput={setDomainInput} domainError={domainError} saveDomain={saveDomain} navigate={navigate} notify={notify} />}
          {active && page === "usage" && <UsagePage onBack={() => navigate("developer")} />}
          {active && page === "notifications" && <NotificationsPage onBack={() => navigate("settings")} preferences={preferences} updatePreference={updatePreference} />}
        </div>
        {active && !["edit-profile", "security"].includes(page) && <BottomNavigation page={page} navigate={navigate} />}
        {toast && <div className="rektina-toast" role="status">{toast}</div>}
        {modal && <ActionDialog type={modal} onClose={() => setModal("")} onComplete={notify} onLogout={confirmLogout} />}
      </div>
      <div className="legacy-dashboard-compat" hidden aria-hidden="true">{legacyChildren}</div>
    </section>
  );
}

function LandingPreview() {
  return (
    <div className="dashboard-loading">
      <span className="dashboard-loading-mark">R</span>
      <strong>Your Rektina.sub workspace</strong>
      <p>Sign in or create an account to open your dashboard.</p>
      <a className="rd-button rd-button-primary" href="#signin">Sign in</a>
    </div>
  );
}

function DashboardHeader({ profile, navigate, notify }) {
  const initials = profile.name === "Your account" ? "R" : profile.name.split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "R";
  return (
    <header className="rektina-topbar">
      <button className="rektina-brand" onClick={() => navigate("home")} aria-label="Rektina.sub dashboard home">
        <span className="rektina-brand-mark">R</span>
      </button>
      <div className="rektina-top-actions">
        <button className="rd-icon-button" aria-label="Notifications" onClick={() => navigate("notifications")}>♧</button>
        <button className="rd-avatar rd-avatar-small" aria-label="Open profile" onClick={() => navigate("profile")}>{initials}</button>
        <button className="rd-notice-link" onClick={() => notify("This dashboard preview does not send payments or emails.")}>Preview</button>
      </div>
    </header>
  );
}

function PageHeader({ title, onBack, eyebrow }) {
  return (
    <div className="rd-page-heading">
      <button className="rd-back-button" onClick={onBack} aria-label="Go back">‹</button>
      <div>{eyebrow && <span className="rd-eyebrow">{eyebrow}</span>}<h1>{title}</h1></div>
    </div>
  );
}

function PreviewNotice({ children = "Preview only — live products, prices and payments are not connected." }) {
  return <div className="rd-preview-notice"><span>i</span><p>{children}</p></div>;
}

function HomePage({ profile, workspace, transactions, savedDomain, navigate }) {
  const firstName = profile.name.split(/\s+/)[0];
  const services = [
    ["Airtime", "▣", "airtime"],
    ["Data", "◉", "data"],
    ["TV Subscription", "▱", "tv"],
    ["Electricity", "ϟ", "electricity"],
    ["SME Data", "▤", "sme-data"],
    ["More", "•••", "more"],
  ];
  return (
    <>
      <section className="rd-welcome-card">
        <div className="rd-welcome-copy"><span>{workspace.name.toUpperCase()}</span><h1>Good morning, {firstName === "Your" ? "there" : firstName}</h1><p>Top up, stay connected, and keep building.</p></div>
        <div className="rd-balance-row"><div><span>Wallet balance</span><strong>Not connected</strong></div><button className="rd-button rd-button-light" onClick={() => navigate("wallet")}>Open Wallet</button></div>
      </section>
      <PreviewNotice>Interactive design preview. Purchases, wallet funding, email sending and DNS checks are not connected to live services.</PreviewNotice>
      <section className="rd-services" aria-label="Services">
        {services.map(([label, icon, target]) => <button className="rd-service" key={label} onClick={() => target === "more" ? navigate("developer") : navigate(target)}><span className={`rd-service-icon service-${target}`}>{icon}</span><span>{label}</span></button>)}
      </section>
      <section className="rd-domain-summary">
        <div className="rd-section-title"><div><span className="rd-eyebrow">DEVELOPER WORKSPACE</span><h2>Email sending domain</h2></div><span className="rd-status rd-status-muted">{savedDomain ? "SETUP NEEDED" : "NOT CONNECTED"}</span></div>
        <p>{savedDomain ? `${savedDomain} is saved here, but DNS verification has not been run.` : "Add a domain you own to start the sender-verification setup."}</p>
        <button className="rd-text-button" onClick={() => navigate("developer")}>{savedDomain ? "Continue domain setup" : "Set up email domain"} <span>→</span></button>
      </section>
      <div className="rd-section-title rd-section-spaced"><div><h2>Recent activity</h2><p>{transactions.length ? "Preview actions from this session" : "Your activity will appear here"}</p></div><button className="rd-text-button" onClick={() => navigate("history")}>View all <span>→</span></button></div>
      <TransactionList transactions={transactions.slice(0, 3)} />
    </>
  );
}

function PurchasePage({ type, onBack, onSubmit }) {
  const meta = serviceMeta[type];
  const [network, setNetwork] = useState("MTN");
  const [tab, setTab] = useState(type === "airtime" ? "Buy Airtime" : type === "sme-data" ? "SME Data" : type === "data" ? "Data" : type === "tv" ? "DStv" : "Prepaid");
  const [recipient, setRecipient] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [plan, setPlan] = useState("");
  const [provider, setProvider] = useState("");
  const [amount, setAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [payment, setPayment] = useState("Wallet balance");
  const tabs = type === "airtime" ? ["Buy Airtime", "Data Bonus"] : type === "data" || type === "sme-data" ? ["Data", "Airtime + Data", "SME Data"] : type === "tv" ? ["DStv", "GOtv", "StarTimes", "Showmax"] : ["Prepaid", "Postpaid"];
  const providerOptions = ["Ikeja Electric", "Eko Electric", "IBEDC", "Abuja Electric", "Other provider"];
  const isDataPurchase = type === "data" || type === "sme-data";
  const isTopUp = type === "airtime" || isDataPurchase;
  const destinationLabel = type === "tv" ? "Smart card number" : "Meter number";
  const amountValue = amount === "Custom" ? customAmount : amount.replace(/[^\d]/g, "");
  const submit = (event) => {
    event.preventDefault();
    onSubmit({
      kind: meta.kind,
      title: `${meta.title} preview`,
      detail: `${isTopUp ? network : type === "tv" ? provider || tab : provider || "Provider not selected"} · ${isDataPurchase || type === "airtime" && tab === "Data Bonus" ? `${plan} · ` : ""}${isTopUp ? recipient : identifier}`,
      amount: amountValue ? `₦${Number(amountValue).toLocaleString("en-NG")}` : "Quote required",
    });
  };

  return (
    <section className="rd-form-page">
      <PageHeader title={meta.title} onBack={onBack} />
      <form className="rd-card rd-purchase-form" onSubmit={submit}>
        <div className="rd-tabs">{tabs.map((label) => <button type="button" key={label} className={tab === label ? "is-selected" : ""} onClick={() => { setTab(label); if (type === "tv") setProvider(label); }}>{label}</button>)}</div>
        {isTopUp && <>
          <FieldLabel>Select network</FieldLabel>
          <div className="rd-network-grid">{networks.map((item) => <button className={`rd-network ${network === item.name ? "is-selected" : ""}`} type="button" key={item.name} onClick={() => setNetwork(item.name)}><span style={{ color: item.color }}>{item.symbol}</span>{item.name}</button>)}</div>
        </>}
        {type === "electricity" && <>
          <FieldLabel>Select electricity provider</FieldLabel>
          <select required value={provider} onChange={(event) => setProvider(event.target.value)}><option value="" disabled>Choose a provider</option>{providerOptions.map((item) => <option key={item} value={item}>{item} · preview</option>)}</select>
        </>}
        {(isDataPurchase || type === "airtime" && tab === "Data Bonus") && <label className="rd-field">{type === "airtime" ? "Bonus offer" : "Data plan"}<select required value={plan} onChange={(event) => setPlan(event.target.value)}><option value="" disabled>Select a plan</option>{["1 GB · illustrative", "2 GB · illustrative", "5 GB · illustrative", "10 GB · illustrative"].map((item) => <option key={item}>{item}</option>)}</select></label>}
        {type === "tv" && <label className="rd-field">Subscription package<select required value={plan} onChange={(event) => setPlan(event.target.value)}><option value="" disabled>Choose a package</option>{[`${provider || tab} package · preview`, "Enter package after provider connection"].map((item) => <option key={item}>{item}</option>)}</select></label>}
        {(type === "tv" || type === "electricity") && <label className="rd-field">{destinationLabel}<input value={identifier} onChange={(event) => setIdentifier(event.target.value)} inputMode="numeric" placeholder={type === "tv" ? "Enter smart card number" : "Enter meter number"} required /></label>}
        {(isTopUp || type === "tv") && <label className="rd-field">Phone number {type === "tv" && <span>(optional)</span>}<div className="rd-phone-input"><span>+234</span><input value={recipient} onChange={(event) => setRecipient(event.target.value)} inputMode="tel" placeholder="Enter phone number" required={isTopUp} /></div></label>}
        {(type === "airtime" || type === "electricity") && <>
          <FieldLabel>Amount</FieldLabel>
          <div className="rd-amount-grid">{(type === "airtime" ? quickAmounts : ["₦500", "₦1,000", "₦2,000", "₦5,000"]).map((item) => <button key={item} type="button" className={amount === item ? "is-selected" : ""} onClick={() => { setAmount(item); setCustomAmount(""); }}>{item}</button>)}</div>
          <div className="rd-custom-amount"><button type="button" className={amount === "Custom" ? "is-selected" : ""} onClick={() => setAmount("Custom")}>Custom</button><input type="number" min="50" value={customAmount} onChange={(event) => { setCustomAmount(event.target.value); setAmount("Custom"); }} placeholder="Enter amount" required={amount === "Custom"} /></div>
        </>}
        <FieldLabel>Payment method</FieldLabel>
        <div className="rd-payment-options">{["Wallet balance", "Bank transfer"].map((item) => <label key={item}><input type="radio" name="payment-method" checked={payment === item} onChange={() => setPayment(item)} />{item}{item === "Wallet balance" && <small>not connected</small>}</label>)}</div>
        <div className="rd-price-note"><span>Current price</span><strong>Live quote unavailable</strong><small>Final prices must come from the connected provider catalogue before confirmation.</small></div>
        <PreviewNotice>Submitting creates a local preview record only. It will not charge a wallet or contact a provider.</PreviewNotice>
        <button className="rd-button rd-button-primary rd-button-wide" type="submit">Create purchase preview <span>→</span></button>
      </form>
    </section>
  );
}

function FieldLabel({ children }) { return <div className="rd-field-label">{children}</div>; }

function HistoryPage({ transactions, filter, setFilter, onBack }) {
  return (
    <section>
      <PageHeader title="Transaction History" onBack={onBack} />
      <div className="rd-card rd-history-card">
        <div className="rd-tabs rd-history-filters">{transactionFilters.map((item) => <button key={item} className={filter === item ? "is-selected" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div>
        <TransactionList transactions={transactions} />
      </div>
    </section>
  );
}

function TransactionList({ transactions }) {
  if (!transactions.length) return <div className="rd-empty"><span>◷</span><strong>No transactions yet</strong><p>Purchases you create in the preview will appear here.</p></div>;
  return <div className="rd-transaction-list">{transactions.map((item) => <article className="rd-transaction-row" key={item.id}><span className={`rd-transaction-mark kind-${item.kind.toLowerCase()}`}>{item.kind === "Electricity" ? "ϟ" : item.kind === "TV" ? "▤" : item.kind === "Data" ? "◉" : "▣"}</span><div className="rd-transaction-copy"><strong>{item.title}</strong><span>{item.detail}</span><small>{item.time}</small></div><div className="rd-transaction-value"><strong>{item.amount}</strong><span className="rd-status rd-status-muted">{item.status}</span></div></article>)}</div>;
}

function WalletPage({ navigate, onAction }) {
  return (
    <section>
      <PageHeader title="Wallet" onBack={() => navigate("home")} />
      <div className="rd-wallet-card"><div><span>Wallet balance</span><strong>Not connected</strong><small>Balance appears after a secure wallet integration.</small></div><button className="rd-button rd-button-dark" onClick={() => onAction("fund")}>Fund Wallet</button></div>
      <div className="rd-wallet-actions"><button onClick={() => onAction("fund")}><span>♧</span><strong>Fund Wallet</strong></button><button onClick={() => onAction("withdraw")}><span>⇧</span><strong>Withdraw</strong></button><button onClick={() => onAction("transfer")}><span>⇄</span><strong>Transfer</strong></button><button onClick={() => navigate("history")}><span>▣</span><strong>Transaction History</strong></button></div>
      <PreviewNotice>Wallet balance and transfers require a connected payment provider and ledger. No funds can be moved in this preview.</PreviewNotice>
    </section>
  );
}

function ProfilePage({ profile, navigate, onEdit }) {
  const menu = [
    ["My Orders", "▣", "history"],
    ["Wallet", "▤", "wallet"],
    ["Email API & Domains", "✉", "developer"],
    ["Notifications", "♧", "notifications"],
    ["Settings", "⚙", "settings"],
    ["Help & Support", "?", "settings"],
  ];
  const initials = profile.name === "Your account" ? "R" : profile.name.split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "R";
  return (
    <section>
      <div className="rd-profile-card"><span className="rd-avatar rd-avatar-large">{initials}</span><div className="rd-profile-identity"><strong>{profile.name}</strong><span>{profile.email || "Email not connected"}</span></div><button className="rd-text-button" onClick={onEdit}>Edit Profile</button></div>
      <div className="rd-menu-list">{menu.map(([label, icon, destination]) => <button key={label} onClick={() => navigate(destination)}><span className="rd-menu-icon">{icon}</span><span>{label}</span><span className="rd-chevron">›</span></button>)}</div>
    </section>
  );
}

function SettingsPage({ navigate, workspace, saveWorkspace, preferences, updatePreference, notify, onLogout, onAccountInformation }) {
  const [workspaceName, setWorkspaceName] = useState(workspace.name);
  return (
    <section>
      <PageHeader title="Settings" onBack={() => navigate("profile")} />
      <div className="rd-menu-list">
        <SettingsLink label="Account Information" icon="♙" hint="View and maintain account details" onClick={onAccountInformation} />
        <SettingsLink label="Change Password" icon="♧" hint="Update your login password" onClick={() => navigate("change-password")} />
        <SettingsLink label="Notification Settings" icon="♧" hint="Choose your alerts" onClick={() => navigate("notifications")} />
        <div className="rd-setting-row"><span className="rd-menu-icon">◐</span><span className="rd-setting-copy"><strong>Appearance</strong><small>Choose the dashboard theme.</small></span><select aria-label="Appearance" value={preferences.theme} onChange={(event) => updatePreference("theme", event.target.value)}><option value="light">Light</option><option value="dark">Dark</option></select></div>
        <SettingsLink label="Email domain & API" icon="✉" hint="Manage sending domains and API setup" onClick={() => navigate("developer")} />
        <SettingsLink label="Privacy & Security" icon="♙" hint="Review sensitive account controls" onClick={() => navigate("privacy")} />
        <SettingsLink label="Help & Support" icon="?" hint="Browse help center and contact options" onClick={() => navigate("support")} />
        <SettingsLink label="About Rektina.sub" icon="ⓘ" hint="Learn what the platform does" onClick={() => navigate("about")} />
      </div>
      <form className="rd-card rd-workspace-settings" onSubmit={(event) => { event.preventDefault(); saveWorkspace({ ...workspace, name: workspaceName.trim() || workspace.name }); notify("Workspace settings saved for this preview session."); }}>
        <div className="rd-section-title"><div><span className="rd-eyebrow">WORKSPACE</span><h2>Workspace information</h2></div></div>
        <label className="rd-field">Workspace name<input value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} maxLength={48} required /></label>
        <label className="rd-field">Account type<input value={workspace.path} readOnly /></label>
        <button className="rd-button rd-button-outline" type="submit">Save workspace</button>
        <small className="rd-field-help">Changes are local to this preview session.</small>
      </form>
      <div className="rd-card rd-account-note"><strong>Account preview</strong><p>Profile changes are kept in this browser session. Authentication and account settings are not connected to a live service.</p></div>
      <section className="rd-card rd-logout-section">
        <div><strong>Log out</strong><p>End this preview session and return to the sign-in screen.</p></div>
        <button className="rd-button rd-button-logout" type="button" onClick={onLogout}>Log out of Rektina.sub</button>
      </section>
    </section>
  );
}

function AccountInformationPage({ profile, workspace, onBack, onEdit }) {
  const initials = profile.name === "Your account" ? "R" : profile.name.split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "R";
  return (
    <section>
      <PageHeader title="Account Information" onBack={onBack} />
      <div className="rd-card rd-info-card">
        <div className="rd-profile-card rd-profile-inline">
          <span className="rd-avatar rd-avatar-large">{initials}</span>
          <div className="rd-profile-identity">
            <strong>{profile.name}</strong>
            <span>{profile.email || "Email not connected"}</span>
          </div>
        </div>
        <div className="rd-detail-grid">
          <div><span>Workspace</span><strong>{workspace.name}</strong></div>
          <div><span>Account type</span><strong>{workspace.path}</strong></div>
          <div><span>Phone</span><strong>{profile.phone || "Not provided"}</strong></div>
          <div><span>Email</span><strong>{profile.email || "Not provided"}</strong></div>
        </div>
        <button className="rd-button rd-button-primary rd-button-wide" type="button" onClick={onEdit}>Edit account details</button>
      </div>
      <PreviewNotice>Preview-only account data saved in this browser session. No live identity backend is connected.</PreviewNotice>
    </section>
  );
}

function ChangePasswordPage({ onBack, notify }) {
  const [values, setValues] = useState({ current: "", next: "", confirm: "" });
  const submit = (event) => {
    event.preventDefault();
    if (!values.current || !values.next || !values.confirm) {
      notify("Please fill in all password fields.");
      return;
    }
    if (values.next !== values.confirm) {
      notify("New password and confirmation do not match.");
      return;
    }
    notify("Password change is only simulated in this preview. No account backend is connected.");
    setValues({ current: "", next: "", confirm: "" });
  };
  return (
    <section>
      <PageHeader title="Change Password" onBack={onBack} />
      <form className="rd-card rd-form-card" onSubmit={submit}>
        <label className="rd-field">Current password<input type="password" value={values.current} onChange={(event) => setValues((current) => ({ ...current, current: event.target.value }))} placeholder="Enter your current password" required /></label>
        <label className="rd-field">New password<input type="password" value={values.next} onChange={(event) => setValues((current) => ({ ...current, next: event.target.value }))} placeholder="Choose a new password" required /></label>
        <label className="rd-field">Confirm new password<input type="password" value={values.confirm} onChange={(event) => setValues((current) => ({ ...current, confirm: event.target.value }))} placeholder="Repeat your new password" required /></label>
        <button className="rd-button rd-button-primary rd-button-wide" type="submit">Update password</button>
      </form>
      <PreviewNotice>Password updates happen only after a connected account service is configured.</PreviewNotice>
    </section>
  );
}

function PrivacySecurityPage({ onBack }) {
  const [settings, setSettings] = useState({ signIn: true, activity: true, privateMode: false });
  const toggle = (key) => setSettings((current) => ({ ...current, [key]: !current[key] }));
  return (
    <section>
      <PageHeader title="Privacy & Security" onBack={onBack} />
      <div className="rd-menu-list">
        <div className="rd-setting-row"><span className="rd-menu-icon">◔</span><span className="rd-setting-copy"><strong>Require sign-in confirmation</strong><small>Ask for step-up confirmation before sensitive actions.</small></span><label className="rd-switch"><input type="checkbox" checked={settings.signIn} onChange={() => toggle("signIn")} aria-label="Require sign-in confirmation" /><span /></label></div>
        <div className="rd-setting-row"><span className="rd-menu-icon">▣</span><span className="rd-setting-copy"><strong>Activity visibility</strong><small>Display recent login and usage activity inside the dashboard.</small></span><label className="rd-switch"><input type="checkbox" checked={settings.activity} onChange={() => toggle("activity")} aria-label="Activity visibility" /><span /></label></div>
        <div className="rd-setting-row"><span className="rd-menu-icon">⌁</span><span className="rd-setting-copy"><strong>Private mode</strong><small>Hide personal account data from shared device previews.</small></span><label className="rd-switch"><input type="checkbox" checked={settings.privateMode} onChange={() => toggle("privateMode")} aria-label="Private mode" /><span /></label></div>
      </div>
      <div className="rd-card rd-info-card">
        <div className="rd-section-title"><div><span className="rd-eyebrow">SECURITY NOTES</span><h2>Preview protection</h2></div></div>
        <ul className="rd-list-soft">
          <li>No real passwords, API keys, or tokens are stored in this browser preview.</li>
          <li>Session information stays local to this device until the page is refreshed or the browser data is cleared.</li>
          <li>Production security controls must be handled by the connected authentication and security service.</li>
        </ul>
      </div>
    </section>
  );
}

function HelpSupportPage({ onBack }) {
  return (
    <section>
      <PageHeader title="Help & Support" onBack={onBack} />
      <div className="rd-card rd-info-card">
        <div className="rd-section-title"><div><span className="rd-eyebrow">SUPPORT</span><h2>Need help?</h2></div></div>
        <div className="rd-support-grid">
          <article><strong>Email</strong><span>support@rektina.sub</span><small>Replies within 1 business day in the live product.</small></article>
          <article><strong>Chat</strong><span>Live help in the app</span><small>Available after account sign-in and workspace activation.</small></article>
          <article><strong>Docs</strong><span>Knowledge base</span><small>Product guides, setup steps and troubleshooting articles.</small></article>
        </div>
      </div>
      <div className="rd-card rd-info-card">
        <div className="rd-section-title"><div><span className="rd-eyebrow">FAQ</span><h2>Common questions</h2></div></div>
        <ul className="rd-list-soft">
          <li><strong>How do I top up airtime?</strong><br />Open Home, choose Airtime, confirm the number and plan, then review the preview before checking out.</li>
          <li><strong>Can I send live emails from this preview?</strong><br />No. This screen is a visual design preview and intentionally blocks live transactions and email sending.</li>
          <li><strong>Where are my saved settings?</strong><br />The preview stores local preferences in this browser session only.</li>
        </ul>
      </div>
    </section>
  );
}

function AboutPage({ onBack }) {
  return (
    <section>
      <PageHeader title="About Rektina.sub" onBack={onBack} />
      <div className="rd-card rd-info-card">
        <div className="rd-section-title"><div><span className="rd-eyebrow">PLATFORM</span><h2>Digital essentials, built for momentum.</h2></div></div>
        <p className="rd-help-copy">Rektina.sub brings everyday essentials and developer infrastructure together in one workspace. Customers can top up airtime or data while teams can manage sending domains, usage, and product messaging operations.</p>
        <div className="rd-support-grid">
          <article><strong>For personal use</strong><span>Airtime, data and account management</span><small>Everything you need to stay connected.</small></article>
          <article><strong>For developers</strong><span>Email APIs, domains and delivery visibility</span><small>Operational clarity for product teams.</small></article>
          <article><strong>For growth</strong><span>Clear workflows and preview-safe controls</span><small>Built to move from idea to launch.</small></article>
        </div>
      </div>
      <PreviewNotice>Rektina.sub is presented as a design preview. Live payments, email delivery and authentication services remain disconnected until the production backend is configured.</PreviewNotice>
    </section>
  );
}

function SettingsLink({ label, icon, hint, onClick }) {
  return <button className="rd-settings-link" onClick={onClick}><span className="rd-menu-icon">{icon}</span><span className="rd-setting-copy"><strong>{label}</strong>{hint && <small>{hint}</small>}</span><span className="rd-chevron">›</span></button>;
}

function EditProfilePage({ profile, onBack, onSave }) {
  const [values, setValues] = useState(profile);
  const change = (field) => (event) => setValues((current) => ({ ...current, [field]: event.target.value }));
  const initials = values.name === "Your account" ? "R" : values.name.split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "R";
  return (
    <section className="rd-form-page">
      <PageHeader title="Edit Profile" onBack={onBack} />
      <div className="rd-edit-avatar"><span className="rd-avatar rd-avatar-large">{initials}</span><span>Profile photo changes are not connected</span></div>
      <form className="rd-card rd-edit-form" onSubmit={(event) => { event.preventDefault(); onSave(values); }}>
        <label className="rd-field">Full name<input value={values.name === "Your account" ? "" : values.name} onChange={change("name")} autoComplete="name" placeholder="Your name" required /></label>
        <label className="rd-field">Phone number<input value={values.phone} onChange={change("phone")} type="tel" autoComplete="tel" placeholder="+234 800 000 0000" /></label>
        <label className="rd-field">Email address<input value={values.email} onChange={change("email")} type="email" autoComplete="email" placeholder="you@example.com" /></label>
        <PreviewNotice>Changes are saved for this browser session only; they are not sent to an account service.</PreviewNotice>
        <button className="rd-button rd-button-primary rd-button-wide" type="submit">Save Changes</button>
      </form>
    </section>
  );
}

function SecurityPage({ onBack, notify }) {
  const choices = [
    ["Change Password", "Update your login password.", "♙"],
    ["Two-Factor Authentication", "Add an extra layer of security.", "▣"],
    ["Login Activity", "Review recent account sign-ins.", "◷"],
  ];
  return (
    <section>
      <PageHeader title="Security Settings" onBack={onBack} />
      <div className="rd-card rd-security-list">{choices.map(([title, detail, icon]) => <button key={title} onClick={() => notify(`${title} requires the connected account service.`)}><span className="rd-menu-icon">{icon}</span><span className="rd-setting-copy"><strong>{title}</strong><small>{detail}</small></span><span className="rd-chevron">›</span></button>)}</div>
      <PreviewNotice>Security settings are display-only until account authentication and session services are connected.</PreviewNotice>
    </section>
  );
}

function DeveloperPage({ savedDomain, domainInput, setDomainInput, domainError, saveDomain, navigate, notify }) {
  return (
    <section className="rd-developer-page">
      <PageHeader title="Email API & domains" onBack={() => navigate("home")} eyebrow="DEVELOPER WORKSPACE" />
      <PreviewNotice>Production email sending remains blocked until a sender is verified by the connected email provider.</PreviewNotice>
      <section className="rd-card rd-domain-card">
        <div className="rd-section-title"><div><span className="rd-eyebrow">SENDER AUTHENTICATION</span><h2>Sending domain</h2></div><span className="rd-status rd-status-muted">{savedDomain ? "NOT VERIFIED" : "NOT CONFIGURED"}</span></div>
        <p className="rd-help-copy">Use a domain you control for your sender addresses. Domain ownership and DNS records must be verified before production email is allowed.</p>
        <form className="rd-domain-form" onSubmit={saveDomain} noValidate>
          <label className="rd-field">Your email sending domain<input value={domainInput} onChange={(event) => setDomainInput(event.target.value)} inputMode="url" autoCapitalize="none" autoCorrect="off" placeholder="example.com" aria-describedby="domain-help domain-error" /></label>
          <small id="domain-help" className="rd-field-help">Enter a domain name only — not an email address, URL, or provider you do not control.</small>
          {domainError && <p id="domain-error" className="rd-inline-error" role="alert">{domainError}</p>}
          <button className="rd-button rd-button-primary" type="submit">Save domain for setup</button>
        </form>
        {savedDomain && <div className="rd-domain-saved"><span className="rd-status rd-status-muted">SETUP REQUIRED</span><strong>{savedDomain}</strong><p>Saved locally only. No DNS lookup has been performed and this domain is not authorized to send yet.</p></div>}
        <div className="rd-checklist">
          <DnsStep number="01" title="Add your domain" detail={savedDomain ? `${savedDomain} is saved in this preview.` : "Enter a domain you own above."} complete={Boolean(savedDomain)} />
          <DnsStep number="02" title="Publish provider-issued SPF and DKIM records" detail="The email provider must issue the exact DNS record names and values for your workspace." />
          <DnsStep number="03" title="Configure DMARC for your sending policy" detail="Choose an appropriate policy after provider guidance; a DNS record has not been generated." />
          <DnsStep number="04" title="Verify DNS ownership" detail="Verification requires a connected provider check. No verification can run in this preview." />
        </div>
        <div className="rd-dns-caution"><strong>No DNS values are fabricated</strong><p>SPF, DKIM and DMARC records are provider- and domain-specific. This preview intentionally does not show copyable DNS records or claim the domain is verified.</p></div>
        <button className="rd-button rd-button-outline rd-disabled-action" type="button" disabled onClick={() => notify("Connect the email provider to receive DNS records and verify this domain.")}>Check DNS records <span>Provider connection required</span></button>
      </section>
      <section className="rd-card rd-api-card">
        <div className="rd-section-title"><div><span className="rd-eyebrow">SERVER-SIDE ONLY</span><h2>API credentials</h2></div><span className="rd-status rd-status-muted">NO KEYS</span></div>
        <p className="rd-help-copy">API keys must be issued by the authenticated backend, scoped to a workspace, and revealed only once. Never put a live key in browser code or a URL.</p>
        <div className="rd-empty rd-api-empty"><span>⌘</span><strong>No API keys available</strong><p>Key creation is unavailable until the secure API-key service is connected.</p></div>
        <button className="rd-button rd-button-outline rd-disabled-action" type="button" disabled>Create API key <span>Backend required</span></button>
        <button className="rd-text-button" onClick={() => navigate("usage")}>View usage &amp; request status <span>→</span></button>
      </section>
      <section className="rd-card rd-api-card">
        <div className="rd-section-title"><div><span className="rd-eyebrow">EMAIL API</span><h2>Send a test message</h2></div><span className="rd-status rd-status-muted">DISABLED</span></div>
        <p className="rd-help-copy">Email submission requires a verified sender, a server-side API key, usage limits and a connected provider. No email is sent from this preview.</p>
        <button className="rd-button rd-button-outline rd-disabled-action" type="button" disabled onClick={() => notify("A verified domain and connected email API are required.")}>Compose test email <span>Not connected</span></button>
        <div className="rd-code-label">Illustrative server-side request · placeholder only</div>
        <pre className="rd-code-block"><code>{`POST /v1/emails
Authorization: Bearer $REKTINA_API_KEY
Idempotency-Key: <unique-operation-id>

{
  "from": "notifications@${savedDomain || "verified-domain.example"}",
  "to": ["recipient@example.net"],
  "subject": "Your receipt",
  "text": "Your order has been received."
}`}</code></pre>
        <p className="rd-field-help">Use only an actual verified sender and a server-side secret. Provider acceptance does not guarantee inbox delivery.</p>
      </section>
    </section>
  );
}

function DnsStep({ number, title, detail, complete = false }) {
  return <div className="rd-dns-step"><span className={`rd-step-number ${complete ? "is-complete" : ""}`}>{complete ? "✓" : number}</span><div><strong>{title}</strong><small>{detail}</small></div><span className={`rd-step-status ${complete ? "is-complete" : ""}`}>{complete ? "Saved" : "Waiting"}</span></div>;
}

function UsagePage({ onBack }) {
  return (
    <section>
      <PageHeader title="Email API usage" onBack={onBack} eyebrow="METERING" />
      <PreviewNotice>Usage data comes from the backend and is not available in this browser preview.</PreviewNotice>
      <div className="rd-stat-grid"><StatCard label="Email requests" value="Not connected" detail="No live usage data" /><StatCard label="Billing period" value="Not configured" detail="Pricing is not published" /></div>
      <div className="rd-card rd-usage-empty"><div className="rd-empty"><span>▥</span><strong>No usage data</strong><p>Request counts, delivery status and billing attribution will appear after the API, provider and metering services are connected.</p></div></div>
    </section>
  );
}

function StatCard({ label, value, detail }) {
  return <article className="rd-stat-card"><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>;
}

function NotificationsPage({ onBack, preferences, updatePreference }) {
  return (
    <section>
      <PageHeader title="Notification Settings" onBack={onBack} />
      <div className="rd-menu-list">
        <div className="rd-setting-row"><span className="rd-menu-icon">▣</span><span className="rd-setting-copy"><strong>Order status updates</strong><small>Choose whether order-status alerts are enabled in this preview.</small></span><label className="rd-switch"><input type="checkbox" checked={preferences.orderUpdates} onChange={(event) => updatePreference("orderUpdates", event.target.checked)} aria-label="Order status updates" /><span /></label></div>
        <div className="rd-setting-row"><span className="rd-menu-icon">✉</span><span className="rd-setting-copy"><strong>Email activity updates</strong><small>Local preference only; no email notifications are sent.</small></span><label className="rd-switch"><input type="checkbox" checked={preferences.emailUpdates} onChange={(event) => updatePreference("emailUpdates", event.target.checked)} aria-label="Email activity updates" /><span /></label></div>
      </div>
      <PreviewNotice>Preferences are kept in this page session only. Notification delivery is not connected.</PreviewNotice>
    </section>
  );
}

function BottomNavigation({ page, navigate }) {
  return <nav className="rd-bottom-nav" aria-label="Dashboard navigation">{navigation.map((item) => <button key={item.page} className={page === item.page || item.page === "home" && ["airtime", "data", "tv", "electricity", "developer", "usage", "settings", "edit-profile", "security", "notifications"].includes(page) ? "is-active" : ""} onClick={() => navigate(item.page)} aria-current={page === item.page ? "page" : undefined}><span>{item.icon}</span>{item.label}</button>)}</nav>;
}

function ActionDialog({ type, onClose, onComplete, onLogout }) {
  const action = { fund: "Fund wallet", withdraw: "Withdraw", transfer: "Transfer", order: "Order preview created", logout: "Log out?" }[type] || "Wallet action";
  const isOrder = type === "order";
  const isLogout = type === "logout";
  return (
    <div className="rd-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="rd-modal" role="dialog" aria-modal="true" aria-labelledby="rd-modal-title">
        <button className="rd-modal-close" onClick={onClose} aria-label="Close dialog">×</button>
        <span className="rd-modal-icon">{isOrder ? "✓" : "₦"}</span>
        <h2 id="rd-modal-title">{action}</h2>
        <p>{isLogout ? "You’ll return to the Rektina.sub sign-in screen." : isOrder ? "This purchase has only been added to your local preview history. No payment was made and no provider was contacted." : "Wallet services are not connected. No money can be deposited, withdrawn or transferred in this preview."}</p>
        {!isOrder && !isLogout && <PreviewNotice>Use the connected payment service to handle real funds. Do not enter card or banking credentials here.</PreviewNotice>}
        {isLogout ? <div className="rd-modal-actions"><button className="rd-button rd-button-outline rd-button-wide" onClick={onClose}>Cancel</button><button className="rd-button rd-button-logout rd-button-wide" onClick={onLogout}>Log out</button></div> : <button className="rd-button rd-button-primary rd-button-wide" onClick={() => { onClose(); if (isOrder) onComplete("Preview saved to transaction history. No payment was processed."); }}>Done</button>}
      </section>
    </div>
  );
}

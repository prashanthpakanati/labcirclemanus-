import { useMemo, useState } from "react";
import { Activity, ArrowLeft, ArrowRight, BadgeCheck, CalendarDays, Check, ChevronDown, CircleHelp, Clock3, FlaskConical, HeartPulse, House, MapPin, Microscope, Minus, Plus, ScanLine, Search, ShieldCheck, ShoppingBag, Sparkles, UserRound, WalletCards } from "lucide-react";
import { categoriesFor, createDemoBooking, demoQuoteMinor, formatDemoRupees, readDemoBookings, saveDemoBooking, services, visibleServices, type DemoBooking, type ServiceKind } from "./domain";

type View = "home" | "book" | "activity" | "reports" | "account";

const today = new Date();
const localDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const displayDate = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
const dateOptions = [0, 1, 2, 3, 4].map(offset => {
  const value = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
  return { value: localDate(value), label: offset === 0 ? "Today" : offset === 1 ? "Tomorrow" : value.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) };
});

function App() {
  const [view, setView] = useState<View>("home");
  const [kind, setKind] = useState<ServiceKind>("blood");
  const [step, setStep] = useState(1);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const [locality, setLocality] = useState("Indiranagar");
  const [pinCode, setPinCode] = useState("560038");
  const [visitDate, setVisitDate] = useState(dateOptions[1]?.value ?? localDate(tomorrow));
  const [timeSlot, setTimeSlot] = useState("08:00 – 10:00 AM");
  const [bookings, setBookings] = useState<DemoBooking[]>(() => readDemoBookings());
  const [confirmed, setConfirmed] = useState<DemoBooking | null>(null);

  const selected = useMemo(() => services.filter(item => item.kind === kind && cart.includes(item.id)), [cart, kind]);
  const currentItems = useMemo(() => visibleServices(kind, query, category), [kind, query, category]);
  const newestBooking = bookings[0];
  const categories = categoriesFor(kind);

  const navigate = (next: View) => {
    setView(next);
    setToast("");
    if (next === "book") {
      setStep(1);
      setConfirmed(null);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const startBooking = (nextKind: ServiceKind) => {
    setKind(nextKind);
    setCategory("All");
    setQuery("");
    setView("book");
    setStep(1);
    setConfirmed(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const toggleItem = (id: string) => {
    setCart(current => current.includes(id) ? current.filter(itemId => itemId !== id) : [...current, id]);
    const name = services.find(item => item.id === id)?.name;
    setToast(cart.includes(id) ? `${name} removed from your selection` : `${name} added to your selection`);
    window.setTimeout(() => setToast(""), 2600);
  };
  const confirmBooking = () => {
    const selectedIds = selected.map(item => item.id);
    const booking = createDemoBooking({
      kind,
      itemIds: selected.map(item => item.id),
      itemNames: selected.map(item => item.name),
      locality: locality.trim(),
      pinCode,
      visitDate,
      timeSlot,
      illustrativeTotalMinor: demoQuoteMinor(selectedIds),
    });
    const next = saveDemoBooking(booking);
    setBookings(next);
    setCart(current => current.filter(id => !selectedIds.includes(id)));
    setConfirmed(booking);
    setStep(1);
    setView("activity");
    setToast("Demo booking saved on this device only");
    window.setTimeout(() => setToast(""), 3000);
  };

  return <div className="app-shell">
    <aside className="rail" aria-label="Primary navigation">
      <button className="brand" onClick={() => navigate("home")} aria-label="Labcircle home">
        <span className="brand-mark"><span /></span><span className="brand-word">labcircle<span>.</span></span>
      </button>
      <div className="rail-label">YOUR SPACE</div>
      <nav className="rail-nav">
        <NavItem icon={<House size={18} />} label="Overview" active={view === "home"} onClick={() => navigate("home")} />
        <NavItem icon={<CalendarDays size={18} />} label="Book a visit" active={view === "book"} onClick={() => navigate("book")} />
        <NavItem icon={<Activity size={18} />} label="My bookings" active={view === "activity"} onClick={() => navigate("activity")} count={bookings.length || undefined} />
        <NavItem icon={<FileIcon />} label="My reports" active={view === "reports"} onClick={() => navigate("reports")} />
      </nav>
      <div className="rail-spacer" />
      <div className="help-card"><span className="help-icon"><CircleHelp size={17} /></span><strong>Need a hand?</strong><p>We’ll help you find your next step.</p><button onClick={() => setToast("Support is not connected in this demo.")}>Contact support <ArrowRight size={13} /></button></div>
      <NavItem icon={<UserRound size={18} />} label="My profile" active={view === "account"} onClick={() => navigate("account")} />
      <div className="rail-foot"><span className="live-dot" /> Prototype mode <span className="rail-version">v0.1</span></div>
    </aside>

    <main className="main-area">
      <header className="topbar">
        <div className="mobile-brand"><button className="brand" onClick={() => navigate("home")} aria-label="Labcircle home"><span className="brand-mark"><span /></span><span className="brand-word">labcircle<span>.</span></span></button></div>
        <div className="crumb"><span>Patient space</span><span className="crumb-slash">/</span><strong>{viewLabel(view)}</strong><span className="demo-tag"><span /> DEMO</span></div>
        <div className="top-actions"><button className="location-pill" onClick={() => setToast("Locality is editable during booking.")}><MapPin size={15} /><span>{locality}, Bengaluru</span><ChevronDown size={14} /></button><button className="avatar" onClick={() => navigate("account")} aria-label="Open profile">S</button></div>
      </header>

      <div className="page-wrap">
        {view === "home" && <HomeView onBook={startBooking} onNavigate={navigate} bookings={bookings} newest={newestBooking} />}
        {view === "book" && <BookingView kind={kind} setKind={value => { setKind(value); setCategory("All"); setQuery(""); }} step={step} setStep={setStep} query={query} setQuery={setQuery} category={category} setCategory={setCategory} categories={categories} currentItems={currentItems} cart={cart} selected={selected} toggleItem={toggleItem} locality={locality} setLocality={setLocality} pinCode={pinCode} setPinCode={setPinCode} visitDate={visitDate} setVisitDate={setVisitDate} timeSlot={timeSlot} setTimeSlot={setTimeSlot} onConfirm={confirmBooking} />}
        {view === "activity" && <ActivityView bookings={bookings} confirmed={confirmed} onBook={() => startBooking("blood")} />}
        {view === "reports" && <ReportsView />}
        {view === "account" && <AccountView onToast={setToast} />}
      </div>
      <footer className="site-foot"><span>© 2026 Labcircle demo</span><span>Not a live healthcare or booking service</span><button onClick={() => setToast("This demo does not collect or store real health information.")}>Privacy & safety</button></footer>
    </main>

    <nav className="mobile-dock" aria-label="Mobile navigation">
      <MobileNavItem icon={<House size={18} />} label="Home" active={view === "home"} onClick={() => navigate("home")} />
      <MobileNavItem icon={<CalendarDays size={18} />} label="Book" active={view === "book"} onClick={() => navigate("book")} />
      <MobileNavItem icon={<Activity size={18} />} label="Visits" active={view === "activity"} onClick={() => navigate("activity")} />
      <MobileNavItem icon={<UserRound size={18} />} label="Profile" active={view === "account"} onClick={() => navigate("account")} />
    </nav>
    {toast && <div className="toast" role="status"><Check size={15} />{toast}</div>}
  </div>;
}

function FileIcon() { return <WalletCards size={18} />; }
function viewLabel(view: View) { return ({ home: "Overview", book: "Book a visit", activity: "My bookings", reports: "My reports", account: "My profile" })[view]; }

function NavItem({ icon, label, active, onClick, count }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void; count?: number }) {
  return <button className={`nav-item ${active ? "active" : ""}`} onClick={onClick}>{icon}<span>{label}</span>{count !== undefined && <small>{count}</small>}</button>;
}
function MobileNavItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return <button className={active ? "active" : ""} onClick={onClick}>{icon}<span>{label}</span></button>;
}

function HomeView({ onBook, onNavigate, bookings, newest }: { onBook: (kind: ServiceKind) => void; onNavigate: (view: View) => void; bookings: DemoBooking[]; newest?: DemoBooking }) {
  const [search, setSearch] = useState("");
  const found = search.trim() ? visibleServices("blood", search).slice(0, 4) : [];
  return <div className="home-page">
    <div className="welcome-line"><div><p className="eyebrow"><Sparkles size={13} /> YOUR HEALTH, IN YOUR HANDS</p><h1>Good care starts<br /><em>with a clear next step.</em></h1><p className="welcome-copy">Find the test or scan you need, then arrange a visit that fits your day.</p></div><div className="welcome-date"><span className="date-icon"><CalendarDays size={18} /></span><span><small>TODAY</small><strong>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</strong></span></div></div>

    <section className="booking-launcher" aria-labelledby="booking-heading">
      <div className="launcher-top"><div><span className="section-kicker">BOOK YOUR WAY</span><h2 id="booking-heading">What can we help you book?</h2></div><span className="step-hint"><span>01</span> Choose a service</span></div>
      <div className="service-options">
        <button className="service-option blood-option" onClick={() => onBook("blood")}><span className="service-icon"><FlaskConical size={22} /></span><span className="service-text"><strong>Blood tests at home</strong><small>Sample collection at your doorstep</small></span><span className="service-arrow"><ArrowRight size={17} /></span><span className="option-ornament" /></button>
        <button className="service-option scan-option" onClick={() => onBook("scan")}><span className="service-icon"><ScanLine size={22} /></span><span className="service-text"><strong>Scan & imaging</strong><small>Choose an imaging visit</small></span><span className="service-arrow"><ArrowRight size={17} /></span><span className="option-ornament scan-ornament" /></button>
      </div>
      <div className="quick-search"><Search size={18} /><input aria-label="Search blood tests" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search a test, e.g. thyroid or vitamin D" /><span className="search-shortcut">⌘ K</span>{found.length > 0 && <div className="search-results">{found.map(item => <button key={item.id} onClick={() => onBook("blood")}><span><strong>{item.name}</strong><small>{item.category} · add during booking</small></span><ArrowRight size={15} /></button>)}</div>}</div>
    </section>

    <section className="explainer-section" aria-labelledby="explainer-heading">
      <div className="explainer-copy"><span className="section-kicker">A 30-SECOND WALKTHROUGH</span><h2 id="explainer-heading">See the patient journey, step by step.</h2><p>A short look at service discovery, preparation notes, visit details and the clearly labeled demo quote.</p><span className="explainer-note"><ShieldCheck size={14} /> Prototype only · No real booking or payment</span></div>
      <div className="explainer-player"><video controls preload="metadata" playsInline poster="/labcircle-patient-demo-poster.png" aria-label="30-second Labcircle patient demo video"><source src="/labcircle-patient-demo.mp4" type="video/mp4" />Your browser does not support the video element.</video></div>
    </section>

    <div className="home-grid">
      <section className="next-card"><div className="card-heading"><div><span className="section-kicker">YOUR CARE CIRCLE</span><h2>Next on your list</h2></div><button className="text-link" onClick={() => onNavigate("activity")}>All bookings <ArrowRight size={14} /></button></div>
        {newest ? <BookingMini booking={newest} /> : <div className="empty-visit"><span className="empty-illustration"><CalendarDays size={22} /></span><div><strong>A little room for what’s next</strong><p>Your upcoming visits will appear here after you confirm a demo booking.</p></div><button className="plain-action" onClick={() => onBook("blood")}>Explore tests <ArrowRight size={14} /></button></div>}
      </section>
      <section className="trust-card"><span className="trust-mark"><ShieldCheck size={19} /></span><span className="section-kicker">BUILT AROUND YOU</span><h2>Care should feel<br />easy to navigate.</h2><p>Clear steps. Helpful preparation notes. A simple view of the visits you’ve saved.</p><div className="trust-footer"><span><Check size={13} /> Your pace</span><span><Check size={13} /> Your place</span><span><Check size={13} /> Your choice</span></div></section>
    </div>

    <section className="popular-section"><div className="section-title-row"><div><span className="section-kicker">A GOOD PLACE TO START</span><h2>Popular blood tests</h2></div><button className="text-link" onClick={() => onBook("blood")}>Browse all tests <ArrowRight size={14} /></button></div><div className="popular-grid">{services.filter(item => item.kind === "blood").slice(0, 3).map(item => <article className="popular-card" key={item.id}><span className="popular-icon"><Activity size={18} /></span><span className="popular-category">{item.category}</span><strong>{item.name}</strong><small>{item.detail}</small><div className="popular-bottom"><span>Preparation guidance included</span><button onClick={() => onBook("blood")} aria-label={`Explore ${item.name}`}><ArrowRight size={15} /></button></div></article>)}</div></section>

    <div className="privacy-note"><span><HeartPulse size={17} /></span><p><strong>A note on this demo</strong> Catalogue, availability and prices are examples only. No appointment or payment is created, and this app is not medical advice.</p><button onClick={() => onNavigate("reports")}>How it works <ArrowRight size={14} /></button></div>
    <div className="home-stats"><div><span>{bookings.length.toString().padStart(2, "0")}</span><small>Demo visits saved</small></div><i /><div><span>24/7</span><small>Access to this prototype</small></div><i /><div><span>100%</span><small>Designed around clarity</small></div></div>
  </div>;
}

function BookingView(props: {
  kind: ServiceKind; setKind: (kind: ServiceKind) => void; step: number; setStep: (step: number) => void; query: string; setQuery: (value: string) => void; category: string; setCategory: (value: string) => void; categories: string[]; currentItems: typeof services; cart: string[]; selected: typeof services; toggleItem: (id: string) => void; locality: string; setLocality: (value: string) => void; pinCode: string; setPinCode: (value: string) => void; visitDate: string; setVisitDate: (value: string) => void; timeSlot: string; setTimeSlot: (value: string) => void; onConfirm: () => void;
}) {
  const { kind, setKind, step, setStep, query, setQuery, category, setCategory, categories, currentItems, cart, selected, toggleItem, locality, setLocality, pinCode, setPinCode, visitDate, setVisitDate, timeSlot, setTimeSlot, onConfirm } = props;
  const [error, setError] = useState("");
  const validAddress = locality.trim().length >= 2 && /^\d{6}$/.test(pinCode);
  const canContinue = step === 1 ? selected.length > 0 : step === 2 ? validAddress && Boolean(visitDate) && Boolean(timeSlot) : true;
  const continueStep = () => {
    setError("");
    if (step === 1 && selected.length === 0) return setError("Choose at least one service to continue.");
    if (step === 2 && !validAddress) return setError("Enter a locality and a valid 6-digit demo PIN code.");
    setStep(Math.min(3, step + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goBack = () => { setError(""); setStep(Math.max(1, step - 1)); };
  return <div className="booking-page">
    <div className="booking-heading"><button className="back-link" onClick={goBack} disabled={step === 1}><ArrowLeft size={15} /> {step === 1 ? "Back to overview" : "Previous step"}</button><span className="section-kicker">A FEW SIMPLE STEPS</span><h1>Let’s plan your visit.</h1><p>Choose what you need, then review the details before saving a demo.</p></div>
    <div className="progress-track" aria-label={`Step ${step} of 3`}><div className={`progress-item ${step >= 1 ? "current" : ""} ${step > 1 ? "complete" : ""}`}><span>{step > 1 ? <Check size={14} /> : "1"}</span><div><strong>Choose service</strong><small>Find what you need</small></div></div><i className={step > 1 ? "filled" : ""} /><div className={`progress-item ${step >= 2 ? "current" : ""} ${step > 2 ? "complete" : ""}`}><span>{step > 2 ? <Check size={14} /> : "2"}</span><div><strong>Visit details</strong><small>Where and when</small></div></div><i className={step > 2 ? "filled" : ""} /><div className={`progress-item ${step >= 3 ? "current" : ""}`}><span>3</span><div><strong>Review</strong><small>Check before saving</small></div></div></div>
    {step === 1 && <>
      <div className="kind-switch" role="tablist" aria-label="Service type"><button role="tab" aria-selected={kind === "blood"} className={kind === "blood" ? "selected" : ""} onClick={() => setKind("blood")}><FlaskConical size={16} /> Blood tests</button><button role="tab" aria-selected={kind === "scan"} className={kind === "scan" ? "selected" : ""} onClick={() => setKind("scan")}><ScanLine size={16} /> Scan & imaging</button></div>
      <div className="catalogue-layout"><div className="catalogue-main"><div className="catalogue-header"><div><span className="section-kicker">{kind === "blood" ? "HOME SAMPLE COLLECTION" : "IMAGING CENTRE VISIT"}</span><h2>{kind === "blood" ? "Choose blood tests" : "Choose a scan"}</h2><p>{kind === "blood" ? "Select one or more services for your visit." : "Select the imaging service you want to schedule."}</p></div><span className="price-hidden"><ShieldCheck size={14} /> Price at review</span></div>
        <label className="catalogue-search"><Search size={17} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search by test or category" aria-label="Search catalogue" />{query && <button aria-label="Clear search" onClick={() => setQuery("")}>×</button>}</label>
        <div className="category-row" aria-label="Filter by category">{categories.map(item => <button className={category === item ? "on" : ""} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div>
        <div className="service-list">{currentItems.map(item => { const isSelected = cart.includes(item.id); return <article className={`catalogue-card ${isSelected ? "chosen" : ""}`} key={item.id}><span className="catalogue-card-icon">{item.kind === "blood" ? <Microscope size={19} /> : <ScanLine size={19} />}</span><div className="catalogue-card-copy"><span className="popular-category">{item.category} <i /> {item.duration}</span><h3>{item.name}</h3><p>{item.detail}</p><details><summary>Preparation guidance</summary><p>{item.preparation}</p></details></div><button className={`select-service ${isSelected ? "is-selected" : ""}`} onClick={() => toggleItem(item.id)} aria-label={`${isSelected ? "Remove" : "Add"} ${item.name}`}>{isSelected ? <><Check size={14} /> Added</> : <><Plus size={15} /> Add</>}</button></article>; })}{currentItems.length === 0 && <div className="empty-catalogue"><Search size={22} /><strong>No matches yet</strong><span>Try another test name or category.</span></div>}</div>
      </div><aside className="selection-card"><div className="selection-head"><span className="basket-icon"><ShoppingBag size={17} /></span><span><strong>Your selection</strong><small>{selected.length} {selected.length === 1 ? "service" : "services"}</small></span></div>{selected.length === 0 ? <div className="selection-empty"><span className="selection-plus"><Plus size={16} /></span><p>Your chosen services will appear here.</p></div> : <div className="selection-list">{selected.map(item => <div className="selection-item" key={item.id}><span>{item.name}</span><button aria-label={`Remove ${item.name}`} onClick={() => toggleItem(item.id)}><Minus size={14} /></button></div>)}</div>}<div className="selection-note"><ShieldCheck size={15} /><span>We show an illustrative quote at review. No browse-stage prices.</span></div><button className="primary-btn full" disabled={selected.length === 0} onClick={continueStep}>Continue <ArrowRight size={16} /></button></aside></div>
    </>}
    {step === 2 && <div className="visit-layout"><section className="form-card"><span className="section-kicker">VISIT DETAILS</span><h2>{kind === "blood" ? "Where should we meet you?" : "Where would you like to visit?"}</h2><p>{kind === "blood" ? "Enter an example locality for this prototype." : "Choose a locality for this sample partner-centre visit."}</p>{kind === "scan" && <div className="centre-choice"><span className="centre-icon"><ScanLine size={18} /></span><span><strong>Sample imaging centre</strong><small>Demo partner · Bengaluru · Not live inventory</small></span><BadgeCheck size={17} /></div>}<div className="field-row"><label>Locality<input value={locality} onChange={event => setLocality(event.target.value)} placeholder="e.g. Indiranagar" autoComplete="address-level2" /></label><label>PIN code<input value={pinCode} onChange={event => setPinCode(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6 digits" inputMode="numeric" autoComplete="postal-code" maxLength={6} /></label></div><div className="field-label"><CalendarDays size={16} /> <strong>Choose a visit day</strong></div><div className="date-options">{dateOptions.map(option => <button key={option.value} className={visitDate === option.value ? "selected" : ""} onClick={() => setVisitDate(option.value)}><small>{option.label}</small><strong>{new Date(`${option.value}T12:00:00`).toLocaleDateString("en-IN", { day: "numeric" })}</strong></button>)}</div><div className="field-label"><Clock3 size={16} /> <strong>Available demo time</strong></div><div className="slot-options">{["08:00 – 10:00 AM", "10:00 AM – 12:00 PM", "02:00 – 04:00 PM"].map(slot => <button key={slot} className={timeSlot === slot ? "selected" : ""} onClick={() => setTimeSlot(slot)}><Clock3 size={14} />{slot}</button>)}</div><p className="availability-note"><span className="live-dot" /> Example slots only · not connected to a lab or scan centre.</p></section><aside className="side-summary"><span className="section-kicker">YOUR SELECTION</span><h3>{selected.length} {selected.length === 1 ? "service" : "services"}</h3>{selected.map(item => <p className="summary-item" key={item.id}><Check size={14} /> {item.name}</p>)}<div className="summary-divider" /><p className="summary-muted">A final illustrative quote appears on the next step. No prices are shown while browsing.</p></aside></div>}
    {step === 3 && <div className="review-layout"><section className="review-card"><div className="review-title"><span className="review-check"><Check size={20} /></span><div><span className="section-kicker">TAKE A MOMENT TO CHECK</span><h2>Review your visit</h2><p>This is a demo quote, not a live offer.</p></div></div><div className="review-block"><div className="review-block-title"><span><FlaskConical size={16} /> Selected services</span><button onClick={() => setStep(1)}>Edit</button></div>{selected.map(item => <div className="review-line" key={item.id}><span>{item.name}</span><span>{formatDemoRupees(item.demoPriceMinor)} <small>demo</small></span></div>)}</div><div className="review-block"><div className="review-block-title"><span><MapPin size={16} /> Visit details</span><button onClick={() => setStep(2)}>Edit</button></div><div className="review-line"><span>{kind === "blood" ? "Home collection" : "Imaging centre"}</span><strong>{locality}, {pinCode}</strong></div><div className="review-line"><span>Date & time</span><strong>{displayDate(visitDate)} · {timeSlot}</strong></div></div><div className="demo-total"><span>Illustrative total <small>Sample-only quote</small></span><strong>{formatDemoRupees(demoQuoteMinor(selected.map(item => item.id)))}</strong></div><div className="demo-warning"><ShieldCheck size={17} /><p><strong>Prototype only.</strong> The price and availability are examples. Nothing will be charged or sent to a provider; this does not reserve a real appointment.</p></div></section><aside className="confirm-card"><span className="section-kicker">READY WHEN YOU ARE</span><h3>Save this demo visit?</h3><p>We’ll store it in this browser only so you can see how the booking list works.</p><button className="primary-btn full" disabled={!canContinue} onClick={onConfirm}>Save demo booking <ArrowRight size={16} /></button><button className="quiet-btn full" onClick={() => setStep(2)}><ArrowLeft size={14} /> Back to visit details</button><div className="no-payment"><ShieldCheck size={14} /> No payment · No real booking</div></aside></div>}
    {error && <p className="form-error" role="alert">{error}</p>}
    {step < 3 && <div className="step-footer"><span><ShieldCheck size={15} /> Demo flow · nothing is submitted</span><button className="primary-btn" onClick={continueStep} disabled={!canContinue}>Continue to {step === 1 ? "visit details" : "review"} <ArrowRight size={16} /></button></div>}
    <div className="booking-disclaimer"><CircleHelp size={15} /><span>Preparation notes are general examples. Always follow instructions from your clinician and the actual testing provider.</span></div>
  </div>;
}

function BookingMini({ booking }: { booking: DemoBooking }) {
  return <div className="visit-mini"><span className={`visit-kind-icon ${booking.kind}`} >{booking.kind === "blood" ? <FlaskConical size={19} /> : <ScanLine size={19} />}</span><div className="visit-mini-copy"><span className="status-chip"><i /> DEMO VISIT</span><strong>{booking.itemNames.join(", ")}</strong><small>{new Date(`${booking.visitDate}T12:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} · {booking.timeSlot}</small></div><ArrowRight className="mini-arrow" size={17} /></div>;
}

function ActivityView({ bookings, confirmed, onBook }: { bookings: DemoBooking[]; confirmed: DemoBooking | null; onBook: () => void }) {
  return <div className="secondary-page"><div className="secondary-heading"><span className="section-kicker">YOUR VISIT TIMELINE</span><h1>Bookings, at a glance.</h1><p>A simple place to see the demo visits you’ve saved on this device.</p></div>{confirmed && <div className="success-banner"><span><Check size={18} /></span><div><strong>Demo booking saved</strong><p>Reference {confirmed.id} · Only stored in this browser. No provider was contacted.</p></div></div>}{bookings.length === 0 ? <div className="empty-state large"><span className="empty-illustration"><CalendarDays size={24} /></span><h2>No visits saved yet</h2><p>Your demo bookings will appear here. Start with a test or imaging service.</p><button className="primary-btn" onClick={onBook}>Explore services <ArrowRight size={15} /></button></div> : <div className="booking-history">{bookings.map((booking, index) => <article className="history-card" key={booking.id}><div className="history-marker"><span>{index === 0 ? <Check size={15} /> : index + 1}</span><i /></div><div className="history-content"><div className="history-top"><span className="status-chip"><i /> SAVED DEMO</span><small>Ref {booking.id}</small></div><h2>{booking.itemNames.join(", ")}</h2><p>{booking.kind === "blood" ? "Home sample collection" : "Imaging centre visit"} · {booking.locality}, {booking.pinCode}</p><div className="history-details"><span><CalendarDays size={14} /> {new Date(`${booking.visitDate}T12:00:00`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}</span><span><Clock3 size={14} /> {booking.timeSlot}</span><span className="history-price">{formatDemoRupees(booking.illustrativeTotalMinor)} <small>demo</small></span></div><div className="timeline-note"><span /> Saved in browser · not sent to a provider</div></div></article>)}</div>}<div className="next-step-card"><span className="next-step-icon"><Sparkles size={18} /></span><div><strong>Ready to plan another visit?</strong><p>Browse the demo catalogue and follow the same steps.</p></div><button className="secondary-btn" onClick={onBook}>Start booking <ArrowRight size={15} /></button></div></div>;
}

function ReportsView() {
  return <div className="secondary-page"><div className="secondary-heading"><span className="section-kicker">YOUR HEALTH RECORDS</span><h1>Reports, when they’re ready.</h1><p>In a live service, reports would appear here after a provider securely releases them.</p></div><div className="reports-empty"><div className="report-art"><div className="report-sheet"><span /><span /><span /><i /></div><div className="report-lock"><ShieldCheck size={19} /></div></div><span className="section-kicker">NO REPORTS IN THIS DEMO</span><h2>Your records stay yours.</h2><p>This prototype does not collect, upload, or display medical reports. Secure report access needs patient identity checks, private storage and audited access controls before launch.</p><div className="privacy-pill"><ShieldCheck size={14} /> Private by design · Not connected to a records system</div></div><div className="info-strip"><span><CircleHelp size={16} /></span><p><strong>For a real launch:</strong> Use private object storage, role-based access, time-limited downloads and a complete access audit trail. Never expose report URLs in a public page.</p></div></div>;
}

function AccountView({ onToast }: { onToast: (message: string) => void }) {
  return <div className="secondary-page"><div className="secondary-heading"><span className="section-kicker">YOUR PROFILE</span><h1>A space that’s yours.</h1><p>Account and household tools are a planned part of the live product.</p></div><div className="profile-card"><div className="profile-avatar">S</div><div><span className="section-kicker">DEMO PROFILE</span><h2>Sample patient</h2><p>No real account is signed in.</p></div><span className="profile-status"><span /> Browser demo</span></div><div className="account-grid"><button className="account-tile" onClick={() => onToast("Saved addresses are not connected in this prototype.")}><span className="tile-icon"><MapPin size={18} /></span><strong>Saved addresses</strong><small>Coming with secure accounts</small><ArrowRight size={15} /></button><button className="account-tile" onClick={() => onToast("Family profiles are planned for a later release.")}><span className="tile-icon"><UserRound size={18} /></span><strong>Family profiles</strong><small>Manage visits for your household</small><ArrowRight size={15} /></button><button className="account-tile" onClick={() => onToast("Notification preferences are not connected in this demo.")}><span className="tile-icon"><CalendarDays size={18} /></span><strong>Visit reminders</strong><small>Set preferences for updates</small><ArrowRight size={15} /></button><button className="account-tile" onClick={() => onToast("Security and consent controls need a live account service.")}><span className="tile-icon"><ShieldCheck size={18} /></span><strong>Privacy & consent</strong><small>Review how your information is used</small><ArrowRight size={15} /></button></div><div className="info-strip"><span><ShieldCheck size={16} /></span><p>Use sample information only. This prototype stores demo bookings in local browser storage; it does not create an account or transmit personal data.</p></div></div>;
}

export default App;

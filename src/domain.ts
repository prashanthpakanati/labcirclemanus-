export type ServiceKind = "blood" | "scan";
export type BookingStatus = "confirmed-demo";

export interface ServiceItem {
  id: string;
  kind: ServiceKind;
  name: string;
  category: string;
  detail: string;
  preparation: string;
  demoPriceMinor: number;
  duration: string;
}

export interface DemoBooking {
  id: string;
  createdAt: string;
  kind: ServiceKind;
  itemIds: string[];
  itemNames: string[];
  locality: string;
  pinCode: string;
  visitDate: string;
  timeSlot: string;
  status: BookingStatus;
  illustrativeTotalMinor: number;
}

export const services: ServiceItem[] = [
  { id: "cbc", kind: "blood", name: "Complete blood count", category: "Wellness", detail: "A common screening panel", preparation: "Preparation depends on your clinician's instructions. Confirm before collection.", demoPriceMinor: 45000, duration: "10 min" },
  { id: "lipid", kind: "blood", name: "Lipid profile", category: "Heart health", detail: "Cholesterol and triglycerides", preparation: "Fasting may be requested for some tests. Follow your clinician or lab's exact instructions.", demoPriceMinor: 65000, duration: "10 min" },
  { id: "thyroid", kind: "blood", name: "Thyroid profile", category: "Hormones", detail: "T3, T4 and TSH panel", preparation: "Tell the collection team about medicines as directed by your clinician. Do not stop medication on your own.", demoPriceMinor: 72000, duration: "10 min" },
  { id: "vitd", kind: "blood", name: "Vitamin D", category: "Nutrition", detail: "25-hydroxy vitamin D", preparation: "Usually no special preparation; confirm provider instructions before your visit.", demoPriceMinor: 85000, duration: "10 min" },
  { id: "hba1c", kind: "blood", name: "HbA1c", category: "Wellness", detail: "Average blood sugar marker", preparation: "Usually no fasting is needed; follow your clinician's instructions.", demoPriceMinor: 58000, duration: "10 min" },
  { id: "lft", kind: "blood", name: "Liver function tests", category: "Wellness", detail: "Liver enzyme panel", preparation: "Preparation varies. Confirm with the lab or clinician before collection.", demoPriceMinor: 69000, duration: "10 min" },
  { id: "usg-abdomen", kind: "scan", name: "Ultrasound — abdomen", category: "Ultrasound", detail: "Imaging visit at a partner centre", preparation: "Some scans require preparation. The imaging centre must confirm your instructions before booking.", demoPriceMinor: 95000, duration: "30 min" },
  { id: "xray-chest", kind: "scan", name: "X-ray — chest", category: "X-ray", detail: "Imaging visit at a partner centre", preparation: "Tell the imaging provider if you may be pregnant. Follow centre-specific instructions.", demoPriceMinor: 80000, duration: "20 min" },
  { id: "mri-knee", kind: "scan", name: "MRI — knee", category: "MRI", detail: "Imaging visit at a partner centre", preparation: "Tell the imaging centre about implants, devices or possible pregnancy before the scan.", demoPriceMinor: 420000, duration: "45 min" },
  { id: "ct-head", kind: "scan", name: "CT — head", category: "CT scan", detail: "Imaging visit at a partner centre", preparation: "The imaging centre will confirm contrast and preparation requirements before the visit.", demoPriceMinor: 360000, duration: "30 min" },
];

export function visibleServices(kind: ServiceKind, query = "", category = "All"): ServiceItem[] {
  const normalized = query.trim().toLocaleLowerCase();
  return services.filter(item => item.kind === kind)
    .filter(item => category === "All" || item.category === category)
    .filter(item => !normalized || `${item.name} ${item.category} ${item.detail}`.toLocaleLowerCase().includes(normalized));
}

export function categoriesFor(kind: ServiceKind): string[] {
  return ["All", ...new Set(services.filter(item => item.kind === kind).map(item => item.category))];
}

export function demoQuoteMinor(itemIds: string[]): number {
  const selected = new Set(itemIds);
  if (selected.size === 0) return 0;
  // This intentionally illustrates the checkout boundary only; it is not a server price.
  return services.filter(item => selected.has(item.id)).reduce((total, item) => total + item.demoPriceMinor, 0);
}

export function formatDemoRupees(minor: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(minor / 100);
}

const BOOKING_KEY = "labcircle-demo-bookings-v1";

export function readDemoBookings(storage: Pick<Storage, "getItem"> = localStorage): DemoBooking[] {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(BOOKING_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed as DemoBooking[] : [];
  } catch {
    return [];
  }
}

export function saveDemoBooking(booking: DemoBooking, storage: Pick<Storage, "getItem" | "setItem"> = localStorage): DemoBooking[] {
  const next = [booking, ...readDemoBookings(storage)];
  storage.setItem(BOOKING_KEY, JSON.stringify(next));
  return next;
}

export function createDemoBooking(input: Omit<DemoBooking, "id" | "createdAt" | "status">, now = new Date()): DemoBooking {
  return { ...input, id: `DEMO-${now.getTime().toString(36).toUpperCase()}`, createdAt: now.toISOString(), status: "confirmed-demo" };
}

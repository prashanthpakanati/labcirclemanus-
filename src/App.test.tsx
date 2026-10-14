import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

function openBloodBooking() {
  render(<App />);
  fireEvent.click(screen.getByRole("button", { name: /blood tests at home/i }));
}

describe("Labcircle patient demo journey", () => {
  it("keeps prices hidden until review and saves only a local demo booking", () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    openBloodBooking();
    expect(document.body.textContent).not.toContain("₹");
    fireEvent.click(screen.getByRole("button", { name: "Add Complete blood count" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue to visit details" }));

    const pin = screen.getByLabelText("PIN code");
    fireEvent.change(pin, { target: { value: "12345" } });
    expect(screen.getByRole("button", { name: "Continue to review" }).hasAttribute("disabled")).toBe(true);
    fireEvent.change(pin, { target: { value: "560038" } });
    fireEvent.click(screen.getByRole("button", { name: "Continue to review" }));

    expect(document.body.textContent).toContain("Illustrative total");
    expect(document.body.textContent).toContain("₹450");
    expect(document.body.textContent).toContain("No payment");
    fireEvent.click(screen.getByRole("button", { name: /save demo booking/i }));

    expect(document.body.textContent).toContain("Demo booking saved");
    expect(localStorage.getItem("labcircle-demo-bookings-v1")).toContain('"status":"confirmed-demo"');
    expect(localStorage.getItem("labcircle-demo-bookings-v1")).toContain("Complete blood count");
  });

  it("does not mix blood tests into a scan visit when switching service type", () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    openBloodBooking();
    fireEvent.click(screen.getByRole("button", { name: "Add Complete blood count" }));
    fireEvent.click(screen.getByRole("tab", { name: /scan & imaging/i }));
    fireEvent.click(screen.getByRole("button", { name: "Add MRI — knee" }));
    expect(document.body.textContent).toContain("MRI — knee");
    expect(document.body.textContent).not.toContain("Complete blood count");
  });

  it("embeds the labeled 30-second walkthrough with accessible playback controls", () => {
    render(<App />);
    const video = document.querySelector("video");
    expect(video?.getAttribute("aria-label")).toContain("30-second Labcircle patient demo video");
    expect(video?.hasAttribute("controls")).toBe(true);
    expect(video?.getAttribute("poster")).toBe("/labcircle-patient-demo-poster.png");
    expect(video?.querySelector("source")?.getAttribute("src")).toBe("/labcircle-patient-demo.mp4");
  });
});

#!/usr/bin/env python3
"""Render a silent 30-second Labcircle website walkthrough from the running demo.

Usage: python3 scripts/render_site_video.py --url http://127.0.0.1:4173
Requires Python Playwright, Pillow, Chromium, ffmpeg and ffprobe.
"""
from __future__ import annotations

import argparse
import re
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageFilter
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
W, H = 1280, 720
SCENES = [
    ("Finding a test", "should feel clear.", "A calmer starting point for blood tests and imaging visits.", "Overview"),
    ("Two clear ways", "to get started.", "Choose a home blood test or explore scan & imaging.", "Discover services"),
    ("Know what", "to expect.", "Preparation guidance sits beside the service you choose.", "Preparation notes"),
    ("Plan around", "your day.", "Choose a locality, sample date and a time for your demo visit.", "Visit details"),
    ("Review before", "you decide.", "An illustrative quote appears at review — never while browsing.", "Checkout review"),
    ("Your next step,", "all in one place.", "Saved demo visits are easy to revisit. No real booking or payment is created.", "Booking timeline"),
]


def font_path(family: str) -> str:
    return subprocess.check_output(["fc-match", "-f", "%{file}", family], text=True).strip()


def make_fonts():
    sans = font_path("Noto Sans")
    serif = font_path("Noto Serif")
    bold = font_path("Noto Sans:style=Bold")
    return {
        "brand": ImageFont.truetype(bold, 23),
        "label": ImageFont.truetype(bold, 11),
        "title": ImageFont.truetype(serif, 49),
        "body": ImageFont.truetype(sans, 17),
        "small": ImageFont.truetype(sans, 11),
        "tiny": ImageFont.truetype(bold, 9),
        "cta": ImageFont.truetype(bold, 12),
    }


def capture_app_states(base_url: str, work: Path) -> list[Path]:
    screenshots = work / "screens"
    screenshots.mkdir(parents=True, exist_ok=True)
    paths = [screenshots / f"state-{index:02d}.png" for index in range(1, 7)]

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path="/usr/bin/chromium", headless=True, args=["--no-sandbox", "--disable-dev-shm-usage"])
        page = browser.new_page(viewport={"width": 1280, "height": 720}, device_scale_factor=1)
        page.goto(base_url, wait_until="domcontentloaded", timeout=45000)
        page.wait_for_timeout(900)
        page.add_style_tag(content=".explainer-section { display: none !important; }")
        page.screenshot(path=str(paths[0]), animations="disabled")

        page.get_by_role("button", name=re.compile("Blood tests at home", re.I)).click()
        page.wait_for_timeout(250)
        page.screenshot(path=str(paths[1]), animations="disabled")

        page.get_by_role("button", name="Add Complete blood count").click()
        page.locator("details summary").first.click()
        page.wait_for_timeout(200)
        page.screenshot(path=str(paths[2]), animations="disabled")

        page.get_by_role("button", name="Continue to visit details").click()
        page.wait_for_timeout(250)
        page.screenshot(path=str(paths[3]), animations="disabled")

        page.get_by_role("button", name="Continue to review").click()
        page.wait_for_timeout(250)
        page.screenshot(path=str(paths[4]), animations="disabled")

        page.get_by_role("button", name=re.compile("Save demo booking", re.I)).click()
        page.wait_for_timeout(300)
        page.screenshot(path=str(paths[5]), animations="disabled")

        # Check that the patient home can render at a narrow mobile width without horizontal overflow.
        mobile = browser.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=1)
        mobile.goto(base_url, wait_until="domcontentloaded", timeout=45000)
        mobile.wait_for_timeout(500)
        dimensions = mobile.evaluate("({viewport: window.innerWidth, document: document.documentElement.scrollWidth})")
        if dimensions["document"] > dimensions["viewport"]:
            raise RuntimeError(f"Mobile layout overflows horizontally: {dimensions}")
        mobile.screenshot(path=str(work / "mobile-home.png"), animations="disabled")
        browser.close()
    return paths


def make_scene(screenshot_path: Path, index: int, work: Path, fonts: dict[str, ImageFont.FreeTypeFont]) -> Path:
    bg = Image.new("RGB", (W, H), (247, 249, 245))
    draw = ImageDraw.Draw(bg, "RGBA")
    # Soft editorial wash and a quiet, brand-colored orbit behind the product frame.
    for x, y, r, color in [(1160, 80, 250, (212, 232, 218, 75)), (1290, 610, 300, (234, 239, 199, 55)), (35, 670, 200, (223, 239, 231, 35))]:
        draw.ellipse((x-r, y-r, x+r, y+r), fill=color)
    draw.ellipse((887, 68, 1285, 466), outline=(49, 120, 92, 30), width=2)
    draw.ellipse((904, 85, 1268, 449), outline=(49, 120, 92, 23), width=1)

    # Custom orbit-and-dot wordmark treatment.
    draw.ellipse((73, 49, 101, 77), outline=(23, 106, 87, 255), width=3)
    draw.ellipse((83, 59, 91, 67), fill=(214, 232, 109, 255))
    draw.ellipse((95, 47, 103, 55), fill=(247, 249, 245, 255), outline=(23, 106, 87, 255), width=2)
    draw.text((112, 48), "labcircle", font=fonts["brand"], fill=(32, 41, 37, 255))
    draw.text((113 + int(draw.textlength("labcircle", font=fonts["brand"])), 48), ".", font=fonts["brand"], fill=(23, 106, 87, 255))
    draw.text((967, 58), "PATIENT BOOKING PROTOTYPE", font=fonts["tiny"], fill=(91, 112, 97, 255))
    draw.ellipse((947, 61, 954, 68), fill=(160, 184, 94, 255))

    number = f"0{index + 1}"
    draw.rounded_rectangle((77, 158, 111, 192), radius=12, fill=(232, 243, 236, 255))
    draw.text((86, 169), number, font=fonts["tiny"], fill=(23, 106, 87, 255))
    draw.text((122, 168), "FIND A TEST  ·  PLAN A VISIT", font=fonts["label"], fill=(23, 106, 87, 255))

    line1, line2, body, stage = SCENES[index]
    title_y = 225
    draw.text((77, title_y), line1, font=fonts["title"], fill=(38, 52, 44, 255))
    draw.text((77, title_y + 62), line2, font=fonts["title"], fill=(23, 106, 87, 255))
    # Deliberately short copy: enough reading time at a glance.
    words = body.split()
    lines: list[str] = []
    current = ""
    for word in words:
        trial = f"{current} {word}".strip()
        if ImageDraw.Draw(bg).textlength(trial, font=fonts["body"]) > 380 and current:
            lines.append(current)
            current = word
        else:
            current = trial
    if current:
        lines.append(current)
    draw.multiline_text((80, 365), "\n".join(lines), font=fonts["body"], fill=(107, 120, 111, 255), spacing=8)

    # The recorded prototype is presented in a clean browser window.
    x0, y0, x1, y1 = 510, 137, 1216, 583
    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rounded_rectangle((x0+3, y0+9, x1+3, y1+9), radius=21, fill=(33, 62, 48, 36))
    shadow = shadow.filter(ImageFilter.GaussianBlur(14))
    bg = Image.alpha_composite(bg.convert("RGBA"), shadow).convert("RGB")
    draw = ImageDraw.Draw(bg, "RGBA")
    draw.rounded_rectangle((x0, y0, x1, y1), radius=19, fill=(255, 255, 255, 255), outline=(222, 231, 222, 255), width=1)
    draw.rounded_rectangle((x0+1, y0+1, x1-1, y0+36), radius=18, fill=(252, 253, 251, 255))
    draw.rectangle((x0+1, y0+20, x1-1, y0+37), fill=(252, 253, 251, 255))
    for dot_x, color in [(x0+19, (222, 143, 130, 255)), (x0+32, (231, 196, 111, 255)), (x0+45, (143, 190, 151, 255))]:
        draw.ellipse((dot_x, y0+14, dot_x+7, y0+21), fill=color)
    draw.rounded_rectangle((x0+88, y0+9, x1-18, y0+27), radius=7, fill=(244, 247, 243, 255))
    draw.text((x0+104, y0+11), f"labcircle  /  {stage.lower()}", font=fonts["tiny"], fill=(127, 143, 132, 255))

    shot = Image.open(screenshot_path).convert("RGB")
    fitted = ImageOps.fit(shot, (x1-x0-20, y1-y0-48), method=Image.Resampling.LANCZOS, centering=(0.5, 0.42))
    bg.paste(fitted, (x0+10, y0+38))
    draw = ImageDraw.Draw(bg, "RGBA")
    draw.rounded_rectangle((x0+10, y0+38, x1-10, y1-10), radius=9, outline=(223, 231, 224, 255), width=1)

    # Trust boundary is visible throughout rather than buried in the final frame.
    draw.rounded_rectangle((78, 504, 356, 539), radius=16, fill=(255, 255, 255, 220), outline=(223, 231, 220, 220), width=1)
    draw.ellipse((91, 516, 100, 525), fill=(149, 173, 103, 255))
    draw.text((109, 514), "EXAMPLE DATA · NOT A LIVE SERVICE", font=fonts["tiny"], fill=(111, 123, 112, 255))

    # A restrained scene counter acts as a progress cue.
    for i in range(6):
        color = (23, 106, 87, 255) if i == index else (211, 221, 214, 255)
        width = 34 if i == index else 17
        px = 80 + i * 25
        draw.rounded_rectangle((px, 607, px + width, 611), radius=2, fill=color)
    if index == 5:
        draw.rounded_rectangle((78, 557, 306, 596), radius=10, fill=(23, 106, 87, 255))
        draw.text((94, 569), "EXPLORE THE PATIENT DEMO  →", font=fonts["cta"], fill=(255, 255, 255, 255))
    draw.text((79, 667), "LABCIRCLE  ·  SAMPLE CATALOGUE, TIMES AND PRICES", font=fonts["tiny"], fill=(133, 145, 136, 255))
    draw.text((1005, 667), "NO REAL BOOKING OR PAYMENT", font=fonts["tiny"], fill=(133, 145, 136, 255))

    result = work / f"scene-{index+1:02d}.png"
    bg.save(result, optimize=True)
    return result


def render_video(scene_paths: list[Path], output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    inputs: list[str] = []
    for scene in scene_paths:
        inputs.extend(["-loop", "1", "-framerate", "30", "-i", str(scene)])
    per_clip = 163 / 30
    fade = 0.5
    filters: list[str] = []
    for i in range(6):
        filters.append(
            f"[{i}:v]trim=duration={per_clip:.8f},setpts=PTS-STARTPTS," \
            f"zoompan=z='min(1+on*0.00015,1.025)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s={W}x{H}:fps=30,setsar=1,format=yuv420p[v{i}]"
        )
    current = "v0"
    for i in range(1, 6):
        next_name = f"x{i}"
        offset = i * (per_clip - fade)
        filters.append(f"[{current}][v{i}]xfade=transition=fade:duration={fade}:offset={offset:.8f}[{next_name}]")
        current = next_name
    command = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-filter_complex_threads", "1", *inputs,
               "-filter_complex", ";".join(filters), "-map", f"[{current}]", "-t", "30", "-r", "30",
               "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p", "-an", "-movflags", "+faststart", str(output)]
    subprocess.run(command, check=True)
    probe = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", str(output)], text=True).strip()
    duration = float(probe)
    if abs(duration - 30.0) > 0.1:
        raise RuntimeError(f"Expected a 30-second video, got {duration:.3f} seconds")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://127.0.0.1:4173")
    parser.add_argument("--work-dir", default="/tmp/labcircle-site-video")
    args = parser.parse_args()
    work = Path(args.work_dir).resolve()
    work.mkdir(parents=True, exist_ok=True)
    fonts = make_fonts()
    screenshots = capture_app_states(args.url, work)
    slides = [make_scene(screenshot, index, work, fonts) for index, screenshot in enumerate(screenshots)]
    poster = ROOT / "public" / "labcircle-patient-demo-poster.png"
    Image.open(slides[0]).save(poster, optimize=True)
    output = ROOT / "public" / "labcircle-patient-demo.mp4"
    render_video(slides, output)
    print(f"Video: {output}")
    print(f"Poster: {poster}")
    print("Duration: 30.000 seconds | 1280x720 | 30 fps | H.264 | silent")
    print("Mobile overflow check: passed at 390x844")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
SpriteForge LLM Script-to-Production Generator (with Auto-Validation & Self-Repair)
Converts a plain-English idea OR story script into a validated SpriteForge ProductionScript JSON
using a local OpenAI-compatible or Ollama LLM (Qwen / Hermes) + live catalog Master Prompt.
"""

import argparse
import json
import os
import re
import subprocess
import tempfile
from pathlib import Path
from typing import Any, Dict

import requests


def strip_json_fences(raw: str) -> str:
    cleaned = raw.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)```", cleaned)
    if match:
        return match.group(1).strip()
    return cleaned


def build_master_prompt(
    idea_or_story: str,
    aspect: str,
    fps: int,
    duration: int,
    tone: str,
    style: str = "2.5d_parallax",
    character_type: str = "cartoon",
    backgrounds: str = "",
    camera_style: str = "dynamic",
) -> str:
    root = Path(__file__).resolve().parent.parent
    cmd = [
        "npx",
        "tsx",
        str(root / "tools/print_director_prompt.ts"),
        "--idea",
        idea_or_story,
        "--aspect",
        aspect,
        "--duration",
        str(duration),
        "--tone",
        tone,
        "--style",
        style,
        "--character-type",
        character_type,
        "--camera-style",
        camera_style,
    ]
    if backgrounds:
        cmd.extend(["--backgrounds", backgrounds])
    proc = subprocess.run(
        cmd,
        cwd=str(root),
        capture_output=True,
        text=True,
        check=True,
    )
    return proc.stdout


def call_llm(endpoint: str, model: str, messages: list[dict[str, str]]) -> str:
    resp = requests.post(
        endpoint,
        json={
            "model": model,
            "messages": messages,
            "temperature": 0.35,
        },
        timeout=180,
    )
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"]


def validate_json_file(json_path: Path) -> tuple[bool, str]:
    root = Path(__file__).resolve().parent.parent
    proc = subprocess.run(
        ["npx", "tsx", str(root / "tools/validate_production.ts"), str(json_path)],
        cwd=str(root),
        capture_output=True,
        text=True,
    )
    return proc.returncode == 0, (proc.stdout + "\n" + proc.stderr).strip()


def ask_interactive_preferences(
    default_character_type: str,
    default_style: str,
    default_backgrounds: str,
    default_camera_style: str,
    default_aspect: str,
    default_tone: str,
) -> tuple[str, str, str, str, str, str]:
    print("\n=== SpriteForge CinemaToon 2.5D Creative Direction ===")
    print("1) Auto-Director Camera Style:")
    print("   [1] Cinematic Auto-Director (wide, over-the-shoulder, closeups, reaction cuts)")
    print("   [2] Podcast Multi-Cam (angled closeups + split-screen peak reactions)")
    print("   [3] Dynamic Pan/Zoom")
    print("   [4] Steady Editorial")
    cam_choice = input(f"Choose camera [1/2/3/4, default={default_camera_style}]: ").strip()
    camera_style = {
        "1": "dramatic",
        "2": "podcast",
        "3": "dynamic",
        "4": "steady",
    }.get(cam_choice, cam_choice or default_camera_style)
    if camera_style not in ("dramatic", "podcast", "dynamic", "steady"):
        camera_style = default_camera_style

    print("\n2) Preferred Background Scenes (comma-separated, or Enter for auto):")
    print("   Outdoor: neighborhood_street, forest_trail, city_street, rooftop_night")
    print("   Indoor:  cozy_living_room, cafe_diner, office_desk, laboratory, police_precinct,")
    print("            classroom, podcast_studio, tv_studio, studio_backdrop")
    bg_choice = input(f"Backgrounds [{default_backgrounds or 'auto'}]: ").strip() or default_backgrounds

    aspect_choice = input(f"\n3) Aspect Ratio [16:9 / 9:16, default={default_aspect}]: ").strip() or default_aspect
    if aspect_choice not in ("16:9", "9:16"):
        aspect_choice = default_aspect

    tone_choice = input(f"4) Tone [suspense/comedy/action/drama/explainer, default={default_tone}]: ").strip() or default_tone
    if tone_choice not in ("comedy", "suspense", "action", "drama", "explainer"):
        tone_choice = default_tone

    return default_character_type, default_style, bg_choice, camera_style, aspect_choice, tone_choice


def generate_production(
    idea_text: str,
    aspect_ratio: str,
    fps: int,
    duration: int,
    tone: str,
    endpoint: str,
    model: str,
    style: str = "2.5d_parallax",
    character_type: str = "cartoon",
    backgrounds: str = "",
    camera_style: str = "dynamic",
    max_retries: int = 2,
) -> Dict[str, Any]:
    master_prompt = build_master_prompt(
        idea_text,
        aspect_ratio,
        fps,
        duration,
        tone,
        style=style,
        character_type=character_type,
        backgrounds=backgrounds,
        camera_style=camera_style,
    )
    messages: list[dict[str, str]] = [
        {
            "role": "system",
            "content": "Output ONLY valid raw JSON matching ProductionScript v1.0.0. No markdown fences or prose.",
        },
        {"role": "user", "content": master_prompt},
    ]

    last_err = ""
    for attempt in range(max_retries + 1):
        raw = call_llm(endpoint, model, messages)
        cleaned = strip_json_fences(raw)
        try:
            parsed = json.loads(cleaned)
        except json.JSONDecodeError as exc:
            last_err = f"JSON parse error: {exc}"
            messages.append({"role": "assistant", "content": raw})
            messages.append({
                "role": "user",
                "content": f"Your output failed JSON parsing ({last_err}). Output ONLY valid raw JSON.",
            })
            continue

        parsed["schemaVersion"] = "1.0.0"
        parsed["aspectRatio"] = aspect_ratio
        parsed["fps"] = fps
        parsed["renderStyle"] = style
        parsed["characterType"] = character_type
        if camera_style == "podcast" or "podcast_studio" in backgrounds:
            parsed["cameraMode"] = "podcast"
        elif camera_style in ("dramatic", "dynamic"):
            parsed["cameraMode"] = "cinematic"
        else:
            parsed["cameraMode"] = "standard"

        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as tmp:
            tmp.write(json.dumps(parsed, indent=2))
            tmp_path = Path(tmp.name)

        try:
            ok, report = validate_json_file(tmp_path)
        finally:
            tmp_path.unlink(missing_ok=True)

        if ok:
            return parsed

        last_err = report
        if attempt < max_retries:
            messages.append({"role": "assistant", "content": json.dumps(parsed)})
            messages.append({
                "role": "user",
                "content": f"Validation failed with:\n{report}\nFix ONLY those errors and output the complete corrected JSON.",
            })

    raise RuntimeError(f"Failed to produce valid ProductionScript JSON after retries:\n{last_err}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate validated SpriteForge ProductionScript JSON from plain English idea or script")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--idea", help="Plain-English video idea string")
    group.add_argument("--script", help="Path to plain-text story/script file")
    parser.add_argument("--output", required=True, help="Output .production.json path")
    parser.add_argument("--aspect", default="16:9", choices=["16:9", "9:16"])
    parser.add_argument("--fps", type=int, default=30, choices=[30, 60])
    parser.add_argument("--duration", type=int, default=30, help="Target total duration in seconds")
    parser.add_argument("--tone", default="suspense", choices=["comedy", "suspense", "action", "drama", "explainer"])
    parser.add_argument("--style", default="2.5d_parallax", choices=["2d_storybook", "2.5d_parallax", "studio_clean"])
    parser.add_argument("--character-type", default="cartoon", choices=["cartoon", "stickman"], help="Character rig type (defaults to CinemaToon cartoon)")
    parser.add_argument("--backgrounds", default="", help="Comma-separated preferred background IDs")
    parser.add_argument("--camera-style", default="dramatic", choices=["dramatic", "dynamic", "steady", "podcast"])
    parser.add_argument("--interactive", action="store_true", help="Prompt interactively for camera style, backgrounds, aspect & tone")
    parser.add_argument("--model", default=os.getenv("SPRITEFORGE_LLM_MODEL", "qwen2.5:14b"))
    parser.add_argument(
        "--endpoint",
        default=os.getenv("SPRITEFORGE_LLM_ENDPOINT", "http://localhost:11434/v1/chat/completions"),
    )
    args = parser.parse_args()

    character_type = args.character_type
    style = args.style
    backgrounds = args.backgrounds
    camera_style = args.camera_style
    aspect = args.aspect
    tone = args.tone
    if args.interactive:
        character_type, style, backgrounds, camera_style, aspect, tone = ask_interactive_preferences(
            character_type, style, backgrounds, camera_style, aspect, tone
        )

    idea_text = args.idea if args.idea else Path(args.script).read_text(encoding="utf-8")
    result = generate_production(
        idea_text=idea_text,
        aspect_ratio=aspect,
        fps=args.fps,
        duration=args.duration,
        tone=tone,
        endpoint=args.endpoint,
        model=args.model,
        style=style,
        character_type=character_type,
        backgrounds=backgrounds,
        camera_style=camera_style,
    )

    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(f"Generated & validated ProductionScript JSON: {out_path}")


if __name__ == "__main__":
    main()

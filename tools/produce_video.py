#!/usr/bin/env python3
"""
SpriteForge End-to-End Video Production Orchestrator
Runs:
  1. Text script -> ProductionScript JSON (Qwen / Hermes) [or uses --json directly]
  2. Kokoro TTS + Whisper word timing + Rhubarb lip-sync -> enriched JSON + WAV files
  3. Remotion CLI render -> final MP4 (16:9 or 9:16)
"""

import argparse
import subprocess
import sys
from pathlib import Path


def run(cmd: list[str], cwd: Path | None = None) -> None:
    print(f"> {' '.join(cmd)}")
    subprocess.run(cmd, cwd=str(cwd) if cwd else None, check=True)


def main() -> None:
    parser = argparse.ArgumentParser(description="End-to-End SpriteForge Video Producer")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--idea", help="Plain-English video idea string")
    group.add_argument("--script", help="Path to plain-text story script")
    group.add_argument("--json", help="Skip LLM step and use an existing .production.json")
    parser.add_argument("--output", default="out/final_video.mp4", help="Output MP4 path")
    parser.add_argument("--aspect", default="16:9", choices=["16:9", "9:16"])
    parser.add_argument("--fps", type=int, default=30, choices=[30, 60])
    parser.add_argument("--duration", type=int, default=30, help="Target duration in seconds when using --idea or --script")
    parser.add_argument("--tone", default="suspense", choices=["comedy", "suspense", "action", "drama", "explainer"])
    parser.add_argument("--style", default="2.5d_parallax", choices=["2d_storybook", "2.5d_parallax", "studio_clean"])
    parser.add_argument("--character-type", default="cartoon", choices=["cartoon", "stickman"], help="Character type (cartoon or stickman)")
    parser.add_argument("--backgrounds", default="", help="Comma-separated preferred background scene IDs")
    parser.add_argument("--camera-style", default="dynamic", choices=["dynamic", "steady", "dramatic", "podcast"])
    parser.add_argument("--interactive", action="store_true", help="Ask creative direction questions (character type, style, camera & backgrounds) before generating")
    parser.add_argument("--skip-audio", action="store_true", help="Skip Kokoro/Whisper/Rhubarb audio synthesis")
    args = parser.parse_args()

    root = Path(__file__).resolve().parent.parent
    work_dir = root / "out"
    work_dir.mkdir(parents=True, exist_ok=True)

    draft_json = work_dir / "draft.production.json"
    enriched_json = work_dir / "enriched.production.json"

    if args.idea or args.script:
        input_flag = ["--idea", args.idea] if args.idea else ["--script", args.script]
        cmd = [
            sys.executable,
            str(root / "tools/script_to_production.py"),
            *input_flag,
            "--output",
            str(draft_json),
            "--aspect",
            args.aspect,
            "--fps",
            str(args.fps),
            "--duration",
            str(args.duration),
            "--tone",
            args.tone,
            "--style",
            args.style,
            "--character-type",
            args.character_type,
            "--camera-style",
            args.camera_style,
        ]
        if args.backgrounds:
            cmd.extend(["--backgrounds", args.backgrounds])
        if args.interactive:
            cmd.append("--interactive")
        run(cmd, cwd=root)
    else:
        draft_json = Path(args.json).resolve()

    final_json = draft_json
    if not args.skip_audio:
        run(
            [
                sys.executable,
                str(root / "tools/audio_pipeline.py"),
                "--input",
                str(draft_json),
                "--output",
                str(enriched_json),
                "--public-dir",
                str(root / "public"),
            ],
            cwd=root,
        )
        final_json = enriched_json

    out_mp4 = (root / args.output).resolve() if not Path(args.output).is_absolute() else Path(args.output)
    run(
        [
            "node",
            "render.mjs",
            "--input",
            str(final_json),
            "--output",
            str(out_mp4),
        ],
        cwd=root / "apps/renderer",
    )
    print(f"Finished video saved to: {out_mp4}")


if __name__ == "__main__":
    main()

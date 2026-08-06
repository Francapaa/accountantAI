# cli.py — CLI de corrida one-shot de la ingestión (uv run ingest).
"""One-shot ingestion CLI.

Usage:
  uv run python -m app.ingestion.cli
  uv run python -m app.ingestion.cli --dry-run
"""

import argparse
import logging

from app.ingestion.loader import load_seeds
from app.ingestion.pipeline import run


def main() -> None:
    parser = argparse.ArgumentParser(description="AccountantAI normativa ingestion")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the curated seed list without fetching anything.",
    )
    parser.add_argument(
        "-v", "--verbose", action="store_true", help="Enable INFO logging."
    )
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.INFO if args.verbose else logging.WARNING,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )

    if args.dry_run:
        seeds = load_seeds()
        print(f"Curated seeds: {len(seeds)}")
        for seed in seeds:
            flags = " [index+discovery]" if seed.index else ""
            print(f"  - {seed.document_type:<12} {seed.title} ({seed.url}){flags}")
        return

    summary = run()
    print(
        f"Done: processed={summary.processed} skipped={summary.skipped} "
        f"changed={summary.changed} discovered={summary.discovered} "
        f"tombstoned={summary.tombstoned} failed={summary.failed}"
    )
    for url, reason in summary.failures:
        print(f"  FAIL {url}: {reason}")


if __name__ == "__main__":
    main()

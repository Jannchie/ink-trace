#!/usr/bin/env bash
set -euo pipefail

repo="${1:-}"
workflow="${2:-release.yml}"
environment="${3:-npm}"

if [[ -z "$repo" ]]; then
  echo "Usage: pnpm trust:github <owner/repo> [workflow-file] [environment]" >&2
  echo "Example: pnpm trust:github Jannchie/ink-trace release.yml npm" >&2
  exit 1
fi

packages=(
  "@ink-trace/core"
  "@ink-trace/react"
  "@ink-trace/vue"
)

for package in "${packages[@]}"; do
  npm trust github "$package" \
    --repo "$repo" \
    --file "$workflow" \
    --env "$environment" \
    --yes
done

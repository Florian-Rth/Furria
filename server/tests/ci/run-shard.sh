#!/usr/bin/env bash
# Runs inside the backend tests image from server/: builds, checks (shard 0 only) and runs every
# fourth integration test class, sorted by name, against Testcontainers on the host's Docker.
set -euo pipefail

shard="$1"
shards=4

dotnet tool restore
dotnet build

if [ "$shard" -eq 0 ]; then
  dotnet csharpier check .
  dotnet test tests/Furria.Tests.Analyzers.Tests --no-build
fi

mapfile -t classes < <(
  dotnet run --project tests/Furria.Api.Tests --no-build -- -list classes \
    | grep '^Furria\.' | sort | awk -v shard="$shard" -v shards="$shards" 'NR % shards == shard'
)
if [ "${#classes[@]}" -eq 0 ]; then
  echo "No test classes found for shard $shard." >&2
  exit 1
fi

filters=()
for class in "${classes[@]}"; do filters+=(-class "$class"); done
dotnet run --project tests/Furria.Api.Tests --no-build -- "${filters[@]}"

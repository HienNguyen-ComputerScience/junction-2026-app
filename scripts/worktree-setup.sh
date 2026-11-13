#!/usr/bin/env bash
# Links gitignored local files (like .env.local) from the main checkout into a T3 Code worktree.
# Silent when there is nothing to do. Never fails the session.
main="$(git worktree list --porcelain 2>/dev/null | sed -n 's/^worktree //p' | head -n 1)"
here="$(git rev-parse --show-toplevel 2>/dev/null)"
[ -n "$main" ] && [ -n "$here" ] && [ "$main" != "$here" ] || exit 0
for f in .env.local; do
  if [ -e "$main/$f" ] && [ ! -e "$here/$f" ]; then
    ln -s "$main/$f" "$here/$f" 2>/dev/null || cp "$main/$f" "$here/$f"
    echo "Linked $f from the main checkout."
  fi
done
exit 0

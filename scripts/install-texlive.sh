#!/usr/bin/env bash
# Install a small, frozen TeX Live 2025 with just the packages in cv/texlive-packages.txt.
# TeX Live 2025 is pinned on purpose: it has Source Sans Pro (TL 2026 replaced it with Source Sans 3,
# which changes the CV's line breaks and has no euro sign), and a frozen release never changes under us.
# Usage: scripts/install-texlive.sh [TEXDIR]   (default ~/texlive; then add $TEXDIR/bin/x86_64-linux to PATH)
set -euo pipefail
TEXDIR="${1:-$HOME/texlive}"
REPO="${TEXLIVE_REPO:-https://ftp.math.utah.edu/pub/tex/historic/systems/texlive/2025/tlnet-final}"
PKGS="$(dirname "$0")/../cv/texlive-packages.txt"
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
curl -fsSL --retry 3 "$REPO/install-tl-unx.tar.gz" | tar -xz -C "$tmp" --strip-components=1
cat > "$tmp/profile" <<PROFILE
selected_scheme scheme-infraonly
TEXDIR $TEXDIR
TEXMFLOCAL $TEXDIR/texmf-local
TEXMFSYSVAR $TEXDIR/texmf-var
TEXMFSYSCONFIG $TEXDIR/texmf-config
TEXMFHOME $TEXDIR/texmf-home
tlpdbopt_install_docfiles 0
tlpdbopt_install_srcfiles 0
tlpdbopt_autobackup 0
instopt_adjustpath 0
PROFILE
perl "$tmp/install-tl" -repository "$REPO" -profile "$tmp/profile" -no-interaction > "$tmp/install.log" 2>&1 || { tail -30 "$tmp/install.log"; exit 1; }
"$TEXDIR/bin/x86_64-linux/tlmgr" --repository "$REPO" install $(grep -v '^\s*#' "$PKGS")
echo "TeX Live installed in $TEXDIR"

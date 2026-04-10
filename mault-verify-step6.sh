#!/usr/bin/env bash
set -uo pipefail

PASS_COUNT=0
FAIL_COUNT=0
PENDING_COUNT=0
CHECK_RESULTS=()
TOTAL_CHECKS=12

PROOF_DIR=".mault"
PROOF_FILE="$PROOF_DIR/verify-step6.proof"

record_result() { CHECK_RESULTS+=("CHECK $1: $2 - $3"); }
print_pass()    { echo "[PASS]    CHECK $1: $2"; PASS_COUNT=$((PASS_COUNT + 1)); record_result "$1" "PASS" "$2"; }
print_fail()    { echo "[FAIL]    CHECK $1: $2"; FAIL_COUNT=$((FAIL_COUNT + 1)); record_result "$1" "FAIL" "$2"; }
print_pending() { echo "[PENDING] CHECK $1: $2"; PENDING_COUNT=$((PENDING_COUNT + 1)); record_result "$1" "PENDING" "$2"; }

if [ -f "$PROOF_FILE" ]; then
  PROOF_SHA=$(grep '^GitSHA:' "$PROOF_FILE" | awk '{print $2}')
  CURRENT_SHA=$(git rev-parse --short HEAD 2>/dev/null)
  if [ "$PROOF_SHA" != "$CURRENT_SHA" ]; then
    echo "Stale proof detected. Deleting."
    rm -f "$PROOF_FILE"
  fi
fi

detect_default_branch() {
  local branch
  branch=$(gh repo view --json defaultBranchRef -q '.defaultBranchRef.name' 2>/dev/null) || true
  if [ -n "$branch" ]; then echo "$branch"; return; fi
  if git show-ref --verify --quiet refs/heads/main 2>/dev/null; then echo "main"
  elif git show-ref --verify --quiet refs/heads/master 2>/dev/null; then echo "master"
  else echo "main"; fi
}
DEFAULT_BRANCH=$(detect_default_branch)

detect_stacks() {
  local stacks=""
  [ -f "package.json" ] && stacks="${stacks}node "
  [ -f "pyproject.toml" ] || [ -f "requirements.txt" ] || [ -f "setup.py" ] && stacks="${stacks}python "
  [ -f "go.mod" ] && stacks="${stacks}go "
  echo "$stacks" | xargs
}
STACKS=$(detect_stacks)

echo "========================================"
echo "  MAULT Step 6 Pre-commit Verification"
echo "  Stacks: ${STACKS:-none}"
echo "  Default branch: $DEFAULT_BRANCH"
echo "========================================"
echo ""

# CHECK 1: Step 5 prerequisite
check_1() {
  if [ -f ".mault/verify-step5.proof" ]; then
    local token
    token=$(grep '^Token:' .mault/verify-step5.proof | awk '{print $2}') || true
    print_pass 1 "Step 5 proof exists (${token:-unknown})"
  else
    print_fail 1 "Step 5 not complete."
  fi
}

# CHECK 2: pre-commit CLI installed
check_2() {
  if command -v pre-commit >/dev/null 2>&1; then
    local ver
    ver=$(pre-commit --version 2>&1) || true
    print_pass 2 "pre-commit installed ($ver)"
  else
    print_fail 2 "pre-commit not installed. Run: pip install pre-commit"
  fi
}

# CHECK 3: Config file exists
check_3() {
  if [ -f ".pre-commit-config.yaml" ]; then
    print_pass 3 ".pre-commit-config.yaml exists"
  else
    print_fail 3 "No .pre-commit-config.yaml found"
  fi
}

# CHECK 4: Git hook installed
check_4() {
  if [ -f ".git/hooks/pre-commit" ] && [ -x ".git/hooks/pre-commit" ]; then
    print_pass 4 "Git pre-commit hook installed and executable"
  else
    print_fail 4 "Git pre-commit hook not installed. Run: pre-commit install"
  fi
}

# CHECK 5: Hooks pass on all files
check_5() {
  local output exit_code
  output=$(pre-commit run --all-files 2>&1)
  exit_code=$?
  if [ "$exit_code" -eq 0 ]; then
    print_pass 5 "All hooks pass on all files"
  else
    print_fail 5 "Hooks fail on all-files run (exit $exit_code)"
  fi
}

# CHECK 6: Config has 3+ hooks
check_6() {
  local hook_count
  hook_count=$(grep -c '^\s*-\s*id:' .pre-commit-config.yaml 2>/dev/null || echo 0)
  if [ "$hook_count" -ge 3 ]; then
    print_pass 6 "$hook_count hooks configured"
  else
    print_fail 6 "Only $hook_count hooks. Need at least 3."
  fi
}

# CHECK 7: Secrets prevention hook
check_7() {
  if grep -q 'detect-secrets\|check-added-large-files\|secret' .pre-commit-config.yaml 2>/dev/null; then
    print_pass 7 "Secrets prevention hook configured"
  else
    print_fail 7 "No secrets prevention hook found"
  fi
}

# CHECK 8: Handshake commit exists
check_8() {
  if git log --all --oneline --grep="mault-step6" 2>/dev/null | head -1 | grep -q "mault-step6"; then
    print_pass 8 "Handshake commit with [mault-step6] found"
  else
    print_pending 8 "No handshake commit with [mault-step6] marker found"
  fi
}

# CHECK 9: validate-pr-title CI job
check_9() {
  local ci_file
  ci_file=$(ls .github/workflows/ci.yml .github/workflows/ci.yaml 2>/dev/null | head -1) || true
  if [ -n "$ci_file" ] && grep -q 'validate-pr-title' "$ci_file" 2>/dev/null; then
    print_pass 9 "validate-pr-title CI job exists"
  else
    print_fail 9 "validate-pr-title CI job missing"
  fi
}

# CHECK 10: validate-branch-name CI job
check_10() {
  local ci_file
  ci_file=$(ls .github/workflows/ci.yml .github/workflows/ci.yaml 2>/dev/null | head -1) || true
  if [ -n "$ci_file" ] && grep -q 'validate-branch-name' "$ci_file" 2>/dev/null; then
    print_pass 10 "validate-branch-name CI job exists"
  else
    print_fail 10 "validate-branch-name CI job missing"
  fi
}

# CHECK 11: New checks in branch protection
check_11() {
  local owner repo
  owner=$(gh repo view --json owner -q '.owner.login' 2>/dev/null) || true
  repo=$(gh repo view --json name -q '.name' 2>/dev/null) || true
  if [ -z "$owner" ] || [ -z "$repo" ]; then
    print_fail 11 "Cannot determine repo owner/name"
    return
  fi
  local has_pr_title has_branch_name
  has_pr_title=$(gh api "repos/${owner}/${repo}/branches/${DEFAULT_BRANCH}/protection/required_status_checks" -q '[.contexts[] | select(test("validate-pr-title"))] | length' 2>/dev/null) || true
  has_branch_name=$(gh api "repos/${owner}/${repo}/branches/${DEFAULT_BRANCH}/protection/required_status_checks" -q '[.contexts[] | select(test("validate-branch-name"))] | length' 2>/dev/null) || true
  if [ "${has_pr_title:-0}" -ge 1 ] && [ "${has_branch_name:-0}" -ge 1 ]; then
    print_pass 11 "validate-pr-title and validate-branch-name in branch protection"
  else
    print_fail 11 "New checks not in branch protection (pr-title: ${has_pr_title:-0}, branch-name: ${has_branch_name:-0})"
  fi
}

# CHECK 12: Handshake issue
check_12() {
  local issue_url
  issue_url=$(gh issue list --search "[MAULT] Production Readiness: Step 6" --json url -q '.[0].url' 2>/dev/null) || true
  if [ -z "$issue_url" ]; then
    issue_url=$(gh issue list --state closed --search "[MAULT] Production Readiness: Step 6" --json url -q '.[0].url' 2>/dev/null) || true
  fi
  if [ -n "$issue_url" ]; then
    print_pass 12 "Handshake issue: ${issue_url}"
  else
    print_pending 12 "No handshake issue found"
  fi
}

check_1; check_2; check_3; check_4; check_5; check_6; check_7; check_8; check_9; check_10; check_11; check_12

echo ""
echo "========================================"
echo "  PASS: ${PASS_COUNT}/${TOTAL_CHECKS}  FAIL: ${FAIL_COUNT}/${TOTAL_CHECKS}  PENDING: ${PENDING_COUNT}/${TOTAL_CHECKS}"
echo "========================================"

if [ "$FAIL_COUNT" -eq 0 ] && [ "$PENDING_COUNT" -eq 0 ]; then
  local sha epoch iso token
  sha=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
  epoch=$(date +%s)
  iso=$(date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date +"%Y-%m-%dT%H:%M:%S")
  token="MAULT-STEP6-${sha}-${epoch}-${TOTAL_CHECKS}/${TOTAL_CHECKS}"
  mkdir -p "$PROOF_DIR"
  {
    echo "MAULT-STEP6-PROOF"
    echo "=================="
    echo "Timestamp: $epoch"
    echo "DateTime: $iso"
    echo "GitSHA: $sha"
    echo "Checks: ${TOTAL_CHECKS}/${TOTAL_CHECKS} PASS"
    for r in "${CHECK_RESULTS[@]}"; do echo "  $r"; done
    echo "=================="
    echo "Token: $token"
  } > "$PROOF_FILE"
  echo ""
  echo "Proof file written: $PROOF_FILE"
  echo "Token: $token"
  echo "ALL CHECKS PASSED. Step 6 Pre-commit Framework is complete."
  exit 0
elif [ "$FAIL_COUNT" -gt 0 ]; then
  rm -f "$PROOF_FILE"
  echo "${FAIL_COUNT} check(s) FAILED."
  exit 1
else
  rm -f "$PROOF_FILE"
  echo "${PENDING_COUNT} check(s) PENDING."
  exit 1
fi

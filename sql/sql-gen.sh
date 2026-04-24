#!/usr/bin/env bash

BASE_DIR="/run/media/hwakins/Program Codes/Javascript_/unseen-nepal/unseen-nepal-frontend/sql"
cd "$BASE_DIR" || exit

# -----------------------------
# helper: write header
# -----------------------------
write_header() {
    local file=$1
    cat << EOF > "$file"
/*
  AUTO-GENERATED FILE: $file
  Generated at: $(date -u)
*/

EOF
}

# -----------------------------
# helper: append file safely
# -----------------------------
append_file() {
    local file=$1
    local output=$2

    if [ -f "$file" ]; then
        echo "-- FILE: $file" >> "$output"
        cat "$file" >> "$output"
        printf "\n\n" >> "$output"
    fi
}

# -----------------------------
# helper: append directory
# -----------------------------
append_dir() {
    local dir=$1
    local pattern=$2
    local output=$3

    for FILE in $(find "$dir" -maxdepth 1 -name "$pattern" | sort); do
        append_file "$FILE" "$output"
    done
}

# =========================================================
# 1. FULL SCHEMA (ORDERED - SOURCE OF TRUTH)
# =========================================================
echo "Generating full-schema.sql..."

FULL_SCHEMA="full-schema.sql"
write_header "$FULL_SCHEMA"

# Base schema
append_dir "schema" "extensions.sql" "$FULL_SCHEMA"
append_dir "schema" "users.sql" "$FULL_SCHEMA"
append_dir "schema" "guides.sql" "$FULL_SCHEMA"
append_dir "schema" "stories.sql" "$FULL_SCHEMA"
append_dir "schema" "bookings.sql" "$FULL_SCHEMA"
append_dir "schema" "destinations.sql" "$FULL_SCHEMA"
append_dir "schema" "packages.sql" "$FULL_SCHEMA"
append_dir "schema" "photos.sql" "$FULL_SCHEMA"

# Triggers
append_dir "triggers" "common-triggers.sql" "$FULL_SCHEMA"
append_dir "triggers" "auth-triggers.sql" "$FULL_SCHEMA"
append_dir "triggers" "guide-triggers.sql" "$FULL_SCHEMA"
append_dir "triggers" "story-triggers.sql" "$FULL_SCHEMA"

# RPC
append_dir "rpc" "*.sql" "$FULL_SCHEMA"

# RLS
append_dir "rls" "*.sql" "$FULL_SCHEMA"

echo "✔ full-schema.sql generated"

# =========================================================
# 2. PER-FOLDER FILES
# =========================================================
echo "Generating per-folder files..."

for dir in schema triggers rpc rls; do
    output="full-${dir}.sql"
    write_header "$output"
    append_dir "$dir" "*.sql" "$output"
    echo "✔ $output generated"
done

# =========================================================
# 3. FULL COPY-PASTE (STRICT ORDER)
# =========================================================
echo "Generating full-copy-paste.sql..."

COPY_FILE="full-copy-paste.sql"
write_header "$COPY_FILE"

# IMPORTANT: reuse SAME ORDER as full-schema
append_dir "schema" "extensions.sql" "$COPY_FILE"
append_dir "schema" "users.sql" "$COPY_FILE"
append_dir "schema" "guides.sql" "$COPY_FILE"
append_dir "schema" "stories.sql" "$COPY_FILE"
append_dir "schema" "bookings.sql" "$COPY_FILE"
append_dir "schema" "destinations.sql" "$COPY_FILE"
append_dir "schema" "packages.sql" "$COPY_FILE"
append_dir "schema" "photos.sql" "$COPY_FILE"

append_dir "triggers" "common-triggers.sql" "$COPY_FILE"
append_dir "triggers" "auth-triggers.sql" "$COPY_FILE"
append_dir "triggers" "guide-triggers.sql" "$COPY_FILE"
append_dir "triggers" "story-triggers.sql" "$COPY_FILE"

append_dir "rpc" "*.sql" "$COPY_FILE"
append_dir "rls" "*.sql" "$COPY_FILE"

echo "✔ full-copy-paste.sql generated"

cd - > /dev/null || exit
echo "🎉 All files generated successfully!"
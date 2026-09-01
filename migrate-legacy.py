#!/usr/bin/env python3
"""
Legacy MySQL SQL dump → PostgreSQL migration.
Parses the dump line-by-line for reliability.
"""
import os, re, shutil, subprocess

SQL_DUMP = "/Users/sinamoh/Desktop/yarijoonew1404/odtjonaf_yarijoo(11).sql"

def pg_exec(sql):
    r = subprocess.run(
        ["docker", "exec", "-i", "webfarda_postgres",
         "psql", "-U", "yarijoo", "-d", "yarijoo_v2", "-c", sql],
        capture_output=True, text=True
    )
    return r

def pg_batch(stmts):
    if not stmts:
        return
    all_sql = "\n".join(stmts)
    subprocess.run(
        ["docker", "exec", "-i", "webfarda_postgres",
         "psql", "-U", "yarijoo", "-d", "yarijoo_v2"],
        input=all_sql, capture_output=True, text=True
    )

def qv(v):
    if v is None: return "NULL"
    if isinstance(v, (int, float)): return str(v)
    return "'" + str(v).replace("'", "''")[:2000] + "'"

def parse_values_line(line: str):
    """Parse a single `(val1, val2, ...)` line from a MySQL dump."""
    s = line.strip()
    if s.startswith("("):
        s = s[1:]
    if s.endswith(");") or s.endswith("),"):
        s = s[:-1]
    if s.endswith(")"):
        s = s[:-1]

    vals, curr, in_str, i = [], "", False, 0
    while i < len(s):
        c = s[i]
        if c == "'" and (i == 0 or s[i-1] != "\\"):
            in_str = not in_str
            curr += c
        elif not in_str and c == ",":
            vals.append(_convert(curr.strip()))
            curr = ""
        else:
            curr += c
        i += 1
    vals.append(_convert(curr.strip()))
    return vals

def _convert(s):
    if s == "NULL": return None
    if s.startswith("'") and s.endswith("'"):
        inner = s[1:-1]
        inner = inner.replace("\\'", "'").replace("\\\\","\\").replace("\\n","\n").replace("\\r","").replace("\\t","\t")
        return inner
    try: return int(s)
    except: pass
    try: return float(s)
    except: pass
    return s

# ─── Read dump ──────────────────────────────────────────────────────────────
print("📖 Parsing SQL dump (line-by-line)...")
table_data: dict[str, list[dict]] = {}
current_table = None
current_cols  = []

with open(SQL_DUMP, "rb") as f:
    for raw_line in f:
        try:
            line = raw_line.decode("utf-8", errors="replace").rstrip()
        except:
            continue

        # Detect INSERT INTO `table` (col1, col2) VALUES
        m = re.match(r"INSERT INTO `(\w+)` \(([^)]+)\) VALUES", line)
        if m:
            current_table = m.group(1)
            current_cols  = [c.strip().strip("`") for c in m.group(2).split(",")]
            if current_table not in table_data:
                table_data[current_table] = []
            continue

        # Detect value row
        if current_table and line.strip().startswith("("):
            try:
                vals = parse_values_line(line)
                if len(vals) == len(current_cols):
                    table_data[current_table].append(dict(zip(current_cols, vals)))
            except:
                pass
            # stop reading rows when line ends with ; (last batch row)
            if line.strip().endswith(";"):
                current_table = None
            continue

        # blank lines / other SQL reset context
        if not line.strip().startswith("(") and not line.strip().startswith("--"):
            current_table = None

for t, rows in table_data.items():
    if rows:
        print(f"   {t}: {len(rows)} rows")

# ─── Blog Posts ─────────────────────────────────────────────────────────────
print("\n📝 Inserting blog posts...")
stmts = []
for r in table_data.get("blog_posts", []):
    title = str(r.get("title","") or "")[:255]
    slug  = str(r.get("slug","") or "")[:255]
    if not title or not slug: continue
    status = "PUBLISHED" if str(r.get("status","")) in ("1","published","active") else "DRAFT"
    content = str(r.get("content","") or r.get("description","") or "")
    excerpt = str(r.get("description","") or "")[:500]
    img = r.get("image")
    cover_image = f"/{img}" if img else None
    published_at = str(r.get("publish_at") or r.get("created_at") or "2024-01-01")[:19]
    views = int(r.get("view_count") or 0)

    stmts.append(
        f"INSERT INTO blog_posts (title, slug, content, excerpt, cover_image, status, "
        f"views_count, is_premium, created_at, updated_at) VALUES ("
        f"{qv(title)},{qv(slug)},{qv(content)},{qv(excerpt)},{qv(cover_image)},"
        f"'{status}',{views},false,{qv(published_at[:19])},NOW()"
        f") ON CONFLICT (slug) DO NOTHING;"
    )

pg_batch(stmts)
print(f"   → {len(stmts)} blog posts inserted")

# ─── Books ──────────────────────────────────────────────────────────────────
print("\n📚 Inserting books...")
stmts = []
seen_slugs = set()
for r in table_data.get("books", []):
    title = str(r.get("title","") or "")[:255]
    if not title: continue
    slug = str(r.get("slug","") or "")[:255]
    if not slug:
        slug = re.sub(r"[^\w\-]", "-", title.lower())[:80]
    if slug in seen_slugs:
        slug = slug + f"-{r.get('id','')}"
    seen_slugs.add(slug)
    author = str(r.get("author","نامشخص") or "نامشخص")[:255]
    desc   = str(r.get("des","") or r.get("description","") or "")[:1000]
    img    = r.get("cover")
    cover  = f"/{img}" if img else None
    price  = float(r.get("price") or 0)
    views  = int(r.get("views_count") or 0)

    stmts.append(
        f"INSERT INTO books (title, slug, author, description, cover_image, price, "
        f"status, views_count, created_at, updated_at) VALUES ("
        f"{qv(title)},{qv(slug)},{qv(author)},{qv(desc)},{qv(cover)},"
        f"{price},'PUBLISHED',{views},NOW(),NOW()"
        f") ON CONFLICT (slug) DO NOTHING;"
    )

pg_batch(stmts)
print(f"   → {len(stmts)} books inserted")

# ─── Shop Products ──────────────────────────────────────────────────────────
print("\n🛍 Inserting shop products...")
stmts = []
seen_slugs = set()
for r in table_data.get("shop_products", []):
    title = str(r.get("title","") or r.get("name","") or "")[:255]
    if not title: continue
    slug = str(r.get("slug","") or "")[:255]
    if not slug:
        slug = re.sub(r"[^\w\-]", "-", title.lower())[:80]
    if slug in seen_slugs:
        slug = slug + f"-{r.get('id','')}"
    seen_slugs.add(slug)
    img   = r.get("image") or r.get("cover")
    cover = f"/uploads/shop/{img}" if img else None
    price = float(r.get("price") or 0)
    stock = int(r.get("stock") or r.get("quantity") or 10)
    desc  = str(r.get("description","") or "")[:500]

    stmts.append(
        f"INSERT INTO products (title, slug, description, price, cover_image, "
        f"stock_quantity, status, created_at, updated_at) VALUES ("
        f"{qv(title)},{qv(slug)},{qv(desc)},{price},{qv(cover)},"
        f"{stock},'ACTIVE',NOW(),NOW()"
        f") ON CONFLICT (slug) DO NOTHING;"
    )

pg_batch(stmts)
print(f"   → {len(stmts)} products inserted")

# ─── Copy images ─────────────────────────────────────────────────────────────
print("\n🖼  Copying shop images...")
src = "/Users/sinamoh/Desktop/yarijoonew1404/public/Uploads/shop"
dst = "/Users/sinamoh/Desktop/yarijoonew1404/yarijoo-v2/frontend/public/uploads/shop"
os.makedirs(dst, exist_ok=True)
count = 0
for fn in os.listdir(src):
    s = os.path.join(src, fn)
    d = os.path.join(dst, fn)
    if os.path.isfile(s) and not os.path.exists(d):
        shutil.copy2(s, d)
        count += 1
print(f"   → {count} images copied to frontend/public/uploads/shop/")

# ─── Verify ──────────────────────────────────────────────────────────────────
print("\n📊 Verification:")
for table in ["blog_posts", "books", "products"]:
    r = pg_exec(f"SELECT COUNT(*) FROM {table};")
    print(f"   {table}: {r.stdout.strip()}")

print("\n✅ Done!")

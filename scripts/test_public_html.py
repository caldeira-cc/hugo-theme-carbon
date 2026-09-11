#!/usr/bin/env python3
import os
import sys
import argparse
from html.parser import HTMLParser
import urllib.parse

KNOWN_SUBDOMAINS = {
    'cesar.caldeira.cc',
    'blog.caldeira.cc',
    'apps.caldeira.cc',
    'games.caldeira.cc',
    'carbon.caldeira.cc',
    'assets.caldeira.cc',
    'docs.caldeira.cc',
    'style.caldeira.cc',
    'theme.caldeira.cc',
    'orcid.caldeira.cc',
    'observador.caldeira.cc',
    'localhost',
    '127.0.0.1'
}

class HTMLLinkCollector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        for attr, value in attrs:
            if attr in ('href', 'src') and value:
                self.links.append((tag, attr, value))

def audit_directory(target_dir, is_root=False):
    target_dir = os.path.abspath(target_dir)
    if not os.path.exists(target_dir):
        print(f"Directory does not exist: {target_dir}")
        return 0

    print(f"\n==================================================")
    print(f"Scanning static build in: {target_dir}")
    print(f"==================================================")

    html_files = []
    for root, _, files in os.walk(target_dir):
        for f in files:
            if f.endswith('.html'):
                html_files.append(os.path.join(root, f))

    print(f"Found {len(html_files)} HTML files to audit.")
    
    broken_links = []
    checked_targets = {}
    
    for file_path in html_files:
        rel_html_path = os.path.relpath(file_path, target_dir)
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        parser = HTMLLinkCollector()
        parser.feed(content)

        for tag, attr, link in parser.links:
            if link.startswith('#') or link.startswith('mailto:') or link.startswith('tel:') or link.startswith('javascript:'):
                continue

            parsed = urllib.parse.urlparse(link)
            
            # If external or cross-subdomain link, skip disk check
            if parsed.scheme in ('http', 'https'):
                continue

            target_path = urllib.parse.unquote(parsed.path)
            if not target_path:
                continue

            # Strip leading slash
            clean_path = target_path.lstrip('/')
            
            # Check if clean_path exists in target_dir or static fallback
            if clean_path in checked_targets:
                exists = checked_targets[clean_path]
            else:
                target_disk = os.path.join(target_dir, clean_path)
                exists = False
                if os.path.exists(target_disk):
                    exists = True
                elif os.path.exists(target_disk + ".html"):
                    exists = True
                elif os.path.isdir(target_disk) and os.path.exists(os.path.join(target_disk, "index.html")):
                    exists = True
                elif clean_path in ("", "/"):
                    exists = os.path.exists(os.path.join(target_dir, "index.html"))
                elif os.path.exists(os.path.join(os.path.dirname(target_dir), "assets", clean_path)):
                    # Shared asset lookup in sibling public/assets
                    exists = True
                
                checked_targets[clean_path] = exists

            if not exists:
                broken_links.append({
                    "source": rel_html_path,
                    "tag": tag,
                    "attr": attr,
                    "link": link,
                    "target": clean_path
                })

    print(f"Audit complete for {os.path.basename(target_dir)}. Checked targets: {len(checked_targets)}")
    print(f"Broken links found: {len(broken_links)}")

    if broken_links:
        print("\nBroken Links Summary:")
        grouped = {}
        for b in broken_links:
            grouped.setdefault(b["link"], []).append(b["source"])

        for link, sources in grouped.items():
            print(f"  ❌ Broken: '{link}' referenced in {len(sources)} files (e.g. {sources[0]})")
        return len(broken_links)
    else:
        print(f"✅ ZERO broken internal links found in {os.path.basename(target_dir)} build!")
        return 0

def main():
    parser = argparse.ArgumentParser(description="Multi-Subdomain Static Link Integrity Auditor")
    parser.add_argument("--dir", dest="directory", default=None, help="Target build directory (e.g. public/cesar)")
    args = parser.parse_args()

    if args.directory:
        sys.exit(audit_directory(args.directory))
    else:
        # If no dir given, audit all available sub-sites in public/
        base_public = os.path.abspath("public")
        sub_dirs = [os.path.join(base_public, d) for d in ['cesar', 'blog', 'apps', 'carbon'] if os.path.exists(os.path.join(base_public, d))]
        if not sub_dirs:
            if os.path.exists(base_public):
                sub_dirs = [base_public]
            else:
                print("No build outputs found in public/. Run build first.")
                sys.exit(1)

        total_errors = 0
        for s in sub_dirs:
            total_errors += audit_directory(s)

        if total_errors > 0:
            print(f"\n❌ FAILED: Total {total_errors} broken link instances across subdomains.")
            sys.exit(1)
        else:
            print("\n🎉 ALL SUBDOMAINS PASSED LINK AUDIT WITH ZERO ERRORS!")
            sys.exit(0)

if __name__ == '__main__':
    main()

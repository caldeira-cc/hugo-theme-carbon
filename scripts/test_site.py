import urllib.request
import urllib.parse
from html.parser import HTMLParser
import sys

BASE_URL = "http://localhost:1314"

class LinkExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        for attr, value in attrs:
            if attr in ('href', 'src') and value:
                self.links.append(value)

def crawl_site():
    visited = set()
    to_visit = ["/"]
    errors = []
    external_links = []
    
    print(f"Starting crawl of {BASE_URL}...")
    
    while to_visit:
        current_path = to_visit.pop(0)
        
        # Clean path
        parsed = urllib.parse.urlparse(current_path)
        path = parsed.path
        if not path:
            path = "/"
            
        if path in visited:
            continue
            
        visited.add(path)
        url = urllib.parse.urljoin(BASE_URL, path)
        
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=5) as response:
                status = response.getcode()
                content_type = response.headers.get_content_type()
                
                if status != 200:
                    errors.append(f"HTTP {status} at {path}")
                    print(f"  [ERROR] {path} returned {status}")
                    continue
                else:
                    print(f"  [OK] {path} ({content_type})")
                    
                if "html" in content_type:
                    html_content = response.read().decode('utf-8', errors='ignore')
                    parser = LinkExtractor()
                    parser.feed(html_content)
                    
                    for link in parser.links:
                        # Normalize link
                        link_parsed = urllib.parse.urlparse(link)
                        
                        if link.startswith('#') or link.startswith('mailto:') or link.startswith('tel:') or link.startswith('javascript:'):
                            continue
                            
                        if link_parsed.netloc and link_parsed.netloc not in ("127.0.0.1:1314", "localhost:1314"):
                            external_links.append(link)
                            continue
                            
                        norm_path = link_parsed.path
                        if not norm_path:
                            continue
                            
                        # Ignore query params for crawl tracking if not needed
                        if norm_path not in visited and norm_path not in to_visit:
                            # Only crawl same host
                            to_visit.append(norm_path)
                            
        except urllib.error.HTTPError as e:
            errors.append(f"HTTPError {e.code} at {path}")
            print(f"  [ERROR] {path} -> HTTP {e.code}")
        except Exception as e:
            errors.append(f"Error {e} at {path}")
            print(f"  [ERROR] {path} -> {e}")

    print("\n" + "="*50)
    print(f"Crawl Complete: {len(visited)} internal paths visited.")
    print(f"Errors found: {len(errors)}")
    if errors:
        print("\nERRORS:")
        for err in errors:
            print(f"  - {err}")
    else:
        print("\nAll internal links returned HTTP 200 OK!")
    print("="*50)
    
    return len(errors)

if __name__ == "__main__":
    sys.exit(crawl_site())

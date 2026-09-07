#!/usr/bin/env python3
"""
fetch-carbon-components.py

Downloads and unpacks official IBM Carbon Design System v11 React & Styles packages
from npm registry / GitHub into local project directories (resources/carbon-components/
and static/lib/carbon-components/).

Maintains local-first invariants and updates licensing records.
"""

import os
import sys
import json
import ssl
import shutil
import tarfile
import urllib.request

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
RESOURCES_DIR = os.path.join(ROOT_DIR, "resources", "carbon-components")
STATIC_LIB_DIR = os.path.join(ROOT_DIR, "static", "lib", "carbon-components")
LICENSES_DIR = os.path.join(ROOT_DIR, "static", "licenses")

PACKAGES = [
    {
        "name": "@carbon/react",
        "tarball_name": "carbon-react.tgz",
        "description": "IBM Carbon Design System v11 React Component Library"
    },
    {
        "name": "@carbon/styles",
        "tarball_name": "carbon-styles.tgz",
        "description": "IBM Carbon Design System v11 SCSS & CSS Design Tokens"
    }
]

def ensure_dirs():
    os.makedirs(RESOURCES_DIR, exist_ok=True)
    os.makedirs(STATIC_LIB_DIR, exist_ok=True)
    os.makedirs(LICENSES_DIR, exist_ok=True)

def fetch_package_info(pkg_name):
    url = f"https://registry.npmjs.org/{pkg_name}"
    ctx = ssl._create_unverified_context()
    req = urllib.request.Request(url, headers={"User-Agent": "Antigravity-Hugo-Carbon/2.0"})
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            latest = data.get("dist-tags", {}).get("latest")
            version_data = data.get("versions", {}).get(latest, {})
            tarball_url = version_data.get("dist", {}).get("tarball")
            license_spdx = version_data.get("license", "Apache-2.0")
            return {
                "version": latest,
                "tarball_url": tarball_url,
                "license": license_spdx,
                "metadata": {
                    "name": pkg_name,
                    "version": latest,
                    "description": version_data.get("description", ""),
                    "homepage": version_data.get("homepage", "https://carbondesignsystem.com"),
                    "repository": version_data.get("repository", {}),
                }
            }
    except Exception as e:
        print(f"Error fetching metadata for {pkg_name}: {e}")
        return None

def download_and_extract(pkg_name, info):
    tarball_url = info["tarball_url"]
    version = info["version"]
    safe_name = pkg_name.replace("@", "").replace("/", "-")
    target_extract_dir = os.path.join(RESOURCES_DIR, safe_name)
    os.makedirs(target_extract_dir, exist_ok=True)
    
    tarball_path = os.path.join(RESOURCES_DIR, f"{safe_name}-{version}.tgz")
    
    print(f"Downloading {pkg_name}@{version} from {tarball_url}...")
    ctx = ssl._create_unverified_context()
    req = urllib.request.Request(tarball_url, headers={"User-Agent": "Antigravity-Hugo-Carbon/2.0"})
    with urllib.request.urlopen(req, context=ctx, timeout=60) as resp, open(tarball_path, "wb") as f:
        f.write(resp.read())
    
    print(f"Extracting {tarball_path} to {target_extract_dir}...")
    with tarfile.open(tarball_path, "r:gz") as tar:
        tar.extractall(path=target_extract_dir)
        
    print(f"Successfully extracted {pkg_name}@{version}.")
    return target_extract_dir

def copy_manifest_and_catalog(pkg_extract_dirs):
    catalog = {
        "title": "IBM Carbon Design System v11 Component Catalog",
        "source": "https://react.carbondesignsystem.com / https://github.com/carbon-design-system/carbon",
        "license": "Apache-2.0",
        "packages": {}
    }
    
    for pkg_name, extract_path in pkg_extract_dirs.items():
        package_json_path = os.path.join(extract_path, "package", "package.json")
        if os.path.exists(package_json_path):
            with open(package_json_path, "r", encoding="utf-8") as f:
                pkg_data = json.load(f)
                catalog["packages"][pkg_name] = {
                    "version": pkg_data.get("version"),
                    "description": pkg_data.get("description"),
                    "license": pkg_data.get("license", "Apache-2.0"),
                    "main": pkg_data.get("main"),
                    "module": pkg_data.get("module"),
                    "types": pkg_data.get("types")
                }
    
    catalog_path = os.path.join(STATIC_LIB_DIR, "carbon-catalog.json")
    with open(catalog_path, "w", encoding="utf-8") as f:
        json.dump(catalog, f, indent=2)
    print(f"Written Carbon catalog metadata to {catalog_path}")

def main():
    ensure_dirs()
    print("Fetching Carbon Design System v11 React and Styles packages...")
    pkg_extract_dirs = {}
    
    for pkg in PACKAGES:
        pkg_name = pkg["name"]
        info = fetch_package_info(pkg_name)
        if info:
            extract_dir = download_and_extract(pkg_name, info)
            pkg_extract_dirs[pkg_name] = extract_dir
        else:
            print(f"Failed to fetch package {pkg_name}")
            
    copy_manifest_and_catalog(pkg_extract_dirs)
    print("Carbon component archive complete.")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Cloudflare Pages & Dashboard Manager for Hugo-Carbon Ecosystem
Manages projects: carbon, cesar, blog, apps, games
Supports Cloudflare v4 REST API and Wrangler CLI
"""

import os
import sys
import json
import argparse
import subprocess
import urllib.request
import urllib.error
from pathlib import Path

CONFIG_MATRIX = {
    "carbon": {
        "repo": "hugo-theme-carbon",
        "root_dir": "exampleSite",
        "build_command": "[ -d node_modules ] || ln -sf ../node_modules node_modules; hugo --gc --minify && python3 ../scripts/encrypt.py --dir public",
        "destination_dir": "public",
        "public_dir": "exampleSite/public",
        "custom_domain": "carbon.caldeira.cc",
        "env_vars": {"HUGO_VERSION": "0.149.0"},
    },
    "cesar": {
        "repo": "cesar-caldeira-cc",
        "root_dir": "",
        "build_command": "([ -d ../hugo-theme-carbon ] || git clone --depth 1 https://github.com/caldeira-cc/hugo-theme-carbon.git ../hugo-theme-carbon) && hugo --gc --minify",
        "destination_dir": "public",
        "public_dir": "cesar-caldeira-cc/public",
        "custom_domain": "cesar.caldeira.cc",
        "env_vars": {"HUGO_VERSION": "0.149.0"},
    },
    "blog": {
        "repo": "blog-caldeira-cc",
        "root_dir": "",
        "build_command": "([ -d ../hugo-theme-carbon ] || git clone --depth 1 https://github.com/caldeira-cc/hugo-theme-carbon.git ../hugo-theme-carbon) && hugo --gc --minify",
        "destination_dir": "public",
        "public_dir": "blog-caldeira-cc/public",
        "custom_domain": "blog.caldeira.cc",
        "env_vars": {"HUGO_VERSION": "0.149.0"},
    },
    "apps": {
        "repo": "apps-caldeira-cc",
        "root_dir": "",
        "build_command": "([ -d ../hugo-theme-carbon ] || git clone --depth 1 https://github.com/caldeira-cc/hugo-theme-carbon.git ../hugo-theme-carbon) && hugo --gc --minify",
        "destination_dir": "public",
        "public_dir": "apps-caldeira-cc/public",
        "custom_domain": "apps.caldeira.cc",
        "env_vars": {"HUGO_VERSION": "0.149.0"},
    },
    "games": {
        "repo": "games-caldeira-cc",
        "root_dir": "",
        "build_command": "([ -d ../hugo-theme-carbon ] || git clone --depth 1 https://github.com/caldeira-cc/hugo-theme-carbon.git ../hugo-theme-carbon) && hugo --gc --minify",
        "destination_dir": "public",
        "public_dir": "games-caldeira-cc/public",
        "custom_domain": "games.caldeira.cc",
        "env_vars": {"HUGO_VERSION": "0.149.0"},
    },
}

def find_workspace_root():
    current = Path(__file__).resolve().parent
    while current != current.parent:
        if (current / "AGENTS.md").exists() or (current / "hugo-theme-carbon").exists():
            return current
        current = current.parent
    return Path.cwd()

def load_env_file():
    root = find_workspace_root()
    env_paths = [
        root / ".env.cloudflare",
        root / ".env",
        root / "hugo-theme-carbon" / ".env.cloudflare",
        root / "hugo-theme-carbon" / ".env",
    ]
    for p in env_paths:
        if p.is_file():
            try:
                with open(p, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            k = k.strip()
                            v = v.strip().strip("'\"")
                            if k not in os.environ:
                                os.environ[k] = v
            except Exception:
                pass

load_env_file()

def get_credentials():
    token = os.environ.get("CLOUDFLARE_API_TOKEN")
    account_id = os.environ.get("CLOUDFLARE_ACCOUNT_ID")
    return token, account_id

def cf_api_request(endpoint, method="GET", data=None):
    token, account_id = get_credentials()
    if not token:
        raise RuntimeError("Missing CLOUDFLARE_API_TOKEN. Set it in environment or .env.cloudflare file.")
    
    url = f"https://api.cloudflare.com/client/v4{endpoint}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "User-Agent": "Hugo-Carbon-Deployer/1.0"
    }
    
    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        try:
            parsed = json.loads(err_msg)
            errors = parsed.get("errors", [])
            messages = [err.get("message", str(err)) for err in errors]
            raise RuntimeError(f"Cloudflare API Error ({e.code}): {'; '.join(messages)}")
        except Exception:
            raise RuntimeError(f"Cloudflare API Error ({e.code}): {err_msg}")

def resolve_account_id(account_id):
    if account_id:
        return account_id
    res = cf_api_request("/accounts")
    if res.get("success") and res.get("result"):
        accounts = res["result"]
        if len(accounts) == 1:
            return accounts[0]["id"]
        names = [f"{a['name']} ({a['id']})" for a in accounts]
        raise RuntimeError(f"Multiple accounts found. Please set CLOUDFLARE_ACCOUNT_ID. Available: {', '.join(names)}")
    raise RuntimeError("Could not determine Cloudflare Account ID. Please set CLOUDFLARE_ACCOUNT_ID.")

def cmd_login(args):
    print("Launching interactive Wrangler authentication...")
    subprocess.run(["npx", "wrangler", "login"], check=False)

def cmd_whoami(args):
    token, account_id = get_credentials()
    if token:
        print("✓ Checking authentication via CLOUDFLARE_API_TOKEN...")
        try:
            res = cf_api_request("/user/tokens/verify")
            status = res.get("result", {}).get("status", "unknown")
            print(f"  Token Status: {status}")
            acc_id = resolve_account_id(account_id)
            print(f"  Account ID:   {acc_id}")
        except Exception as e:
            print(f"  API verification error: {e}")
    print("\nRunning Wrangler whoami:")
    subprocess.run(["npx", "wrangler", "whoami"], check=False)

def cmd_list(args):
    token, account_id = get_credentials()
    if token:
        acc_id = resolve_account_id(account_id)
        res = cf_api_request(f"/accounts/{acc_id}/pages/projects")
        projects = res.get("result", [])
        print(f"\n{'PROJECT':<12} {'DOMAINS':<28} {'ROOT DIR':<14} {'LATEST DEPLOYMENT':<18}")
        print("=" * 76)
        for p in projects:
            name = p.get("name", "")
            domains = ", ".join(p.get("domains", []))[:26]
            root_dir = p.get("build_config", {}).get("root_dir", "/") or "/"
            latest = p.get("latest_deployment", {})
            status = latest.get("stage", {}).get("status", "") if latest else "none"
            print(f"{name:<12} {domains:<28} {root_dir:<14} {status:<18}")
    else:
        print("CLOUDFLARE_API_TOKEN not found, delegating to Wrangler CLI:")
        subprocess.run(["npx", "wrangler", "pages", "project", "list"], check=False)

def cmd_get(args):
    token, account_id = get_credentials()
    if not token:
        print("CLOUDFLARE_API_TOKEN is required for detailed project inspection.")
        sys.exit(1)
    acc_id = resolve_account_id(account_id)
    res = cf_api_request(f"/accounts/{acc_id}/pages/projects/{args.project}")
    p = res.get("result", {})
    if args.json:
        print(json.dumps(p, indent=2))
        return
    
    print(f"\n==================================================")
    print(f"Cloudflare Pages Project: {p.get('name')}")
    print(f"==================================================")
    print(f"ID:              {p.get('id')}")
    print(f"Subdomain:       {p.get('subdomain')}")
    print(f"Domains:         {', '.join(p.get('domains', []))}")
    
    bc = p.get("build_config", {})
    print(f"\n[Build Configuration]")
    print(f"Root Directory:   {bc.get('root_dir') or '/'}")
    print(f"Build Command:    {bc.get('build_command')}")
    print(f"Destination Dir:  {bc.get('destination_dir')}")
    
    dc = p.get("deployment_configs", {}).get("production", {})
    env_vars = dc.get("env_vars", {})
    print(f"\n[Production Environment Variables]")
    for k, v in env_vars.items():
        val = v.get("value") if isinstance(v, dict) else v
        print(f"  {k} = {val}")
    
    ld = p.get("latest_deployment")
    if ld:
        print(f"\n[Latest Deployment]")
        print(f"ID:       {ld.get('id')}")
        print(f"Created:  {ld.get('created_on')}")
        print(f"URL:      {ld.get('url')}")
        stages = ld.get("stages", [])
        for s in stages:
            print(f"  - {s.get('name')}: {s.get('status')}")

def cmd_sync(args):
    token, account_id = get_credentials()
    if not token:
        print("CLOUDFLARE_API_TOKEN is required to sync settings.")
        print("Create one at: https://dash.cloudflare.com/profile/api-tokens")
        print("Permissions needed: Account > Cloudflare Pages > Edit")
        sys.exit(1)
    
    acc_id = resolve_account_id(account_id)
    target_projects = [args.project] if args.project else list(CONFIG_MATRIX.keys())
    
    print(f"\nSynchronizing Cloudflare Pages project settings ({len(target_projects)} targets)...")
    for proj_name in target_projects:
        cfg = CONFIG_MATRIX.get(proj_name)
        if not cfg:
            print(f"⚠ Unknown project '{proj_name}', skipping.")
            continue
        
        print(f"\n--- Project: {proj_name} ---")
        try:
            res = cf_api_request(f"/accounts/{acc_id}/pages/projects/{proj_name}")
            current = res.get("result", {})
            current_bc = current.get("build_config", {}) or {}
            
            needs_update = False
            patch_data = {"build_config": {}, "deployment_configs": {"production": {"env_vars": {}}}}
            
            # Check root_dir
            curr_root = current_bc.get("root_dir") or ""
            if curr_root != cfg["root_dir"]:
                print(f"  • Root Dir: '{curr_root}' -> '{cfg['root_dir']}'")
                patch_data["build_config"]["root_dir"] = cfg["root_dir"]
                needs_update = True
            
            # Check build_command
            curr_cmd = current_bc.get("build_command") or ""
            if curr_cmd != cfg["build_command"]:
                print(f"  • Build Command updated to: '{cfg['build_command']}'")
                patch_data["build_config"]["build_command"] = cfg["build_command"]
                needs_update = True
                
            # Check destination_dir
            curr_dest = current_bc.get("destination_dir") or ""
            if curr_dest != cfg["destination_dir"]:
                print(f"  • Destination Dir: '{curr_dest}' -> '{cfg['destination_dir']}'")
                patch_data["build_config"]["destination_dir"] = cfg["destination_dir"]
                needs_update = True
                
            # Check env_vars
            prod_env = current.get("deployment_configs", {}).get("production", {}).get("env_vars", {}) or {}
            curr_hugo = prod_env.get("HUGO_VERSION", {})
            curr_hugo_val = curr_hugo.get("value") if isinstance(curr_hugo, dict) else curr_hugo
            if curr_hugo_val != cfg["env_vars"]["HUGO_VERSION"]:
                print(f"  • HUGO_VERSION: '{curr_hugo_val}' -> '{cfg['env_vars']['HUGO_VERSION']}'")
                patch_data["deployment_configs"]["production"]["env_vars"]["HUGO_VERSION"] = {
                    "value": cfg["env_vars"]["HUGO_VERSION"]
                }
                needs_update = True

            if needs_update:
                if not args.dry_run:
                    cf_api_request(f"/accounts/{acc_id}/pages/projects/{proj_name}", method="PATCH", data=patch_data)
                    print(f"  ✅ Successfully updated settings for '{proj_name}'.")
                else:
                    print(f"  [DRY-RUN] Would patch: {json.dumps(patch_data)}")
            else:
                print(f"  ✓ In sync with architectural invariants.")
        except Exception as e:
            print(f"  ❌ Error: {e}")

def cmd_deployments(args):
    token, account_id = get_credentials()
    if token:
        acc_id = resolve_account_id(account_id)
        res = cf_api_request(f"/accounts/{acc_id}/pages/projects/{args.project}/deployments")
        deps = res.get("result", [])
        print(f"\nRecent deployments for '{args.project}':")
        print(f"{'ID':<38} {'ENV':<12} {'STATUS':<12} {'CREATED':<22} {'URL'}")
        print("=" * 105)
        for d in deps[:10]:
            dep_id = d.get("id", "")
            env = d.get("environment", "")
            stages = d.get("latest_stage", {}) or {}
            status = stages.get("status", "")
            created = d.get("created_on", "")[:19].replace("T", " ")
            url = d.get("url", "")
            print(f"{dep_id:<38} {env:<12} {status:<12} {created:<22} {url}")
    else:
        subprocess.run(["npx", "wrangler", "pages", "deployment", "list", "--project-name", args.project], check=False)

def cmd_deploy(args):
    root = find_workspace_root()
    cfg = CONFIG_MATRIX.get(args.project)
    if not cfg:
        print(f"Unknown project '{args.project}'. Available: {list(CONFIG_MATRIX.keys())}")
        sys.exit(1)
    
    deploy_path = root / cfg["public_dir"]
    if not deploy_path.is_dir() or not any(deploy_path.iterdir()):
        print(f"Target directory '{deploy_path}' is empty or does not exist.")
        print(f"Building project first with build-all.sh...")
        subprocess.run([str(root / "hugo-theme-carbon" / "scripts" / "build-all.sh")], check=True)
    
    print(f"\nDeploying '{deploy_path}' to Cloudflare Pages project '{args.project}'...")
    cmd = [
        "npx", "wrangler", "pages", "deploy",
        str(deploy_path),
        "--project-name", args.project,
        "--commit-dirty=true"
    ]
    if args.branch:
        cmd.extend(["--branch", args.branch])
    subprocess.run(cmd, check=False)

def main():
    parser = argparse.ArgumentParser(description="Hugo-Carbon Cloudflare Pages Management CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)
    
    # login
    subparsers.add_parser("login", help="Authenticate with Cloudflare via Wrangler interactive OAuth")
    
    # whoami
    subparsers.add_parser("whoami", help="Display Cloudflare auth status and account details")
    
    # list
    subparsers.add_parser("list", help="List all Cloudflare Pages projects")
    
    # get
    get_p = subparsers.add_parser("get", help="Get project configuration and latest deployment")
    get_p.add_argument("project", choices=list(CONFIG_MATRIX.keys()), help="Project name")
    get_p.add_argument("--json", action="store_true", help="Output raw JSON")
    
    # sync
    sync_p = subparsers.add_parser("sync", help="Audit & sync build configuration according to architectural matrix")
    sync_p.add_argument("project", nargs="?", choices=list(CONFIG_MATRIX.keys()), help="Optional single project")
    sync_p.add_argument("--dry-run", action="store_true", help="Preview changes without patching API")
    
    # deployments
    dep_p = subparsers.add_parser("deployments", help="List recent deployments for a project")
    dep_p.add_argument("project", choices=list(CONFIG_MATRIX.keys()), help="Project name")
    
    # deploy
    deploy_p = subparsers.add_parser("deploy", help="Directly deploy local public build via Wrangler")
    deploy_p.add_argument("project", choices=list(CONFIG_MATRIX.keys()), help="Project name")
    deploy_p.add_argument("--branch", help="Deploy as branch / preview")

    args = parser.parse_args()
    
    cmds = {
        "login": cmd_login,
        "whoami": cmd_whoami,
        "list": cmd_list,
        "get": cmd_get,
        "sync": cmd_sync,
        "deployments": cmd_deployments,
        "deploy": cmd_deploy,
    }
    
    try:
        cmds[args.command](args)
    except KeyboardInterrupt:
        print("\nAborted.")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

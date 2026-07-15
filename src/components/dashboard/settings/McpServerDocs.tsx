import { useState } from "react";
import { Copy, Check, ExternalLink, Server, Lock, Terminal, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProjectUrl } from "@/lib/useProjectUrl";

function CopyBtn({ value }: { value: string }) {
  const [ok, setOk] = useState(false);
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setOk(true);
        setTimeout(() => setOk(false), 1500);
      }}
      className="h-7 px-2"
    >
      {ok ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  );
}

function Code({ children }: { children: string }) {
  return (
    <div className="group relative rounded-md border bg-muted/40 p-3">
      <pre className="overflow-x-auto whitespace-pre text-xs leading-relaxed">
        <code>{children}</code>
      </pre>
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100">
        <CopyBtn value={children} />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border bg-card px-3 py-2">
      <div className="min-w-0">
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        <div className="truncate font-mono text-xs">{value}</div>
      </div>
      <CopyBtn value={value} />
    </div>
  );
}

const TOOLS: { name: string; kind: "read" | "write"; blurb: string }[] = [
  { name: "whoami", kind: "read", blurb: "Return the identity of the currently authenticated MCP caller." },
  { name: "list_leads", kind: "read", blurb: "List leads visible to the signed-in user (RLS space-scoped)." },
  { name: "get_lead", kind: "read", blurb: "Fetch a single lead by id with recent conversations." },
  { name: "list_conversations", kind: "read", blurb: "List recent conversations, optionally filtered by lead." },
  { name: "list_campaigns", kind: "read", blurb: "List drip campaigns and their delivery stats." },
];

export function McpServerDocs() {
  const mcpUrl = useProjectUrl("/mcp");
  const consentUrl = useProjectUrl("/.lovable/oauth/consent");
  const wellKnown = useProjectUrl("/.well-known/oauth-protected-resource");
  const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "";
  const issuer = `https://${projectRef}.supabase.co/auth/v1`;

  const claudeConfig = JSON.stringify(
    {
      mcpServers: {
        "admissions-pro": {
          url: mcpUrl,
          transport: "http",
        },
      },
    },
    null,
    2,
  );

  const cursorConfig = JSON.stringify(
    {
      mcpServers: {
        "admissions-pro": { url: mcpUrl },
      },
    },
    null,
    2,
  );

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Server className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold">MCP Server</h2>
          <Badge variant="secondary" className="ml-2">Live</Badge>
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Connect Claude, ChatGPT, Cursor, Codex, or any Model Context Protocol client to this
          workspace. Callers sign in with their own Admissions Pro account via OAuth 2.1, and every
          tool runs as that user with row-level security enforced.
        </p>
      </header>

      {/* Endpoints */}
      <Card className="space-y-3 p-5">
        <h3 className="text-sm font-semibold">Endpoints</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          <Row label="MCP endpoint (Streamable HTTP)" value={mcpUrl} />
          <Row label="OAuth issuer" value={issuer} />
          <Row label="Protected-resource metadata" value={wellKnown} />
          <Row label="Consent page" value={consentUrl} />
        </div>
        <p className="text-xs text-muted-foreground">
          The endpoint is same-origin on this app's domain. Clients discover the OAuth
          authorization server automatically via <code>/.well-known/oauth-protected-resource</code>.
        </p>
      </Card>

      {/* Auth */}
      <Card className="space-y-3 p-5">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Authentication — OAuth 2.1 + Dynamic Client Registration</h3>
        </div>
        <ol className="ml-4 list-decimal space-y-1 text-sm text-muted-foreground">
          <li>The client fetches <code>/.well-known/oauth-protected-resource</code> and discovers the Supabase authorization server.</li>
          <li>The client dynamically registers itself (RFC 7591) — no manual client ID/secret needed.</li>
          <li>The user is redirected to sign in and lands on the consent screen at <code>/.lovable/oauth/consent</code>.</li>
          <li>On approval, the client receives an access token and calls <code>/mcp</code> with <code>Authorization: Bearer &lt;token&gt;</code>.</li>
          <li>Each tool call runs as that user; PostgreSQL RLS scopes data to their space and role.</li>
        </ol>
        <p className="text-xs text-muted-foreground">
          Access tokens carry no OAuth scopes; authorization is enforced by role
          (super_admin / admin / agent) and RLS policies. Session tokens copied from the app
          (<code>signInWithPassword</code>) are rejected — only tokens issued through the OAuth
          flow are accepted.
        </p>
      </Card>

      {/* Tools */}
      <Card className="space-y-3 p-5">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Available tools</h3>
        </div>
        <div className="divide-y">
          {TOOLS.map((t) => (
            <div key={t.name} className="flex items-start justify-between gap-3 py-2">
              <div>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-medium">{t.name}</code>
                  <Badge variant={t.kind === "read" ? "secondary" : "default"} className="h-5 text-[10px]">
                    {t.kind === "read" ? "read-only" : "write"}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{t.blurb}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Tools live in <code>src/lib/mcp/tools/</code>. Add a new file, export a{" "}
          <code>defineTool</code>, and register it in <code>src/lib/mcp/index.ts</code>.
        </p>
      </Card>

      {/* Client configs */}
      <Card className="space-y-4 p-5">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Client setup</h3>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium">Claude Desktop / Claude Code — <code>claude_desktop_config.json</code></div>
          <Code>{claudeConfig}</Code>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium">Cursor / Codex — <code>~/.cursor/mcp.json</code></div>
          <Code>{cursorConfig}</Code>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium">ChatGPT / any Streamable-HTTP MCP client</div>
          <p className="text-xs text-muted-foreground">
            Paste this URL into the client's "Add MCP server" dialog. It will handle the OAuth
            flow automatically:
          </p>
          <Code>{mcpUrl}</Code>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium">Manual probe (after signing in with an OAuth-issued token)</div>
          <Code>{`curl -X POST '${mcpUrl}' \\
  -H 'Content-Type: application/json' \\
  -H 'Accept: application/json, text/event-stream' \\
  -H 'Authorization: Bearer <ACCESS_TOKEN>' \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`}</Code>
        </div>
      </Card>

      {/* Governance */}
      <Card className="space-y-3 p-5">
        <h3 className="text-sm font-semibold">Access, roles, and audit</h3>
        <ul className="ml-4 list-disc space-y-1 text-sm text-muted-foreground">
          <li>Anyone with a platform account (super_admin, admin, or agent) can complete the OAuth flow.</li>
          <li>Data access is enforced by RLS: users only see rows in spaces they belong to.</li>
          <li>Privileged operations (user management, spaces, workspaces) are super-admin-gated at the RLS layer.</li>
          <li>Revoke access by disabling the user in <em>Settings → Users</em>. Their MCP tokens stop working within one refresh cycle.</li>
          <li>OAuth server configuration is managed by Lovable Cloud. Existing clients keep working across app deploys.</li>
        </ul>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button size="sm" variant="outline" asChild>
            <a href={wellKnown} target="_blank" rel="noreferrer">
              Inspect metadata <ExternalLink className="ml-1 h-3.5 w-3.5" />
            </a>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href="https://modelcontextprotocol.io/specification/2025-06-18/basic/transports" target="_blank" rel="noreferrer">
              MCP spec <ExternalLink className="ml-1 h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </Card>
    </div>
  );
}

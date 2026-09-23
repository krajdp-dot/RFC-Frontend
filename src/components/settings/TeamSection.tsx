"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Can } from "@/components/auth/Can";
import { useAuth } from "@/contexts/AuthContext";
import { fetchApi } from "@/lib/fetchApi";
import { PERMISSIONS, ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/permissions";
import { UserCog, Plus, ShieldCheck, Check } from "lucide-react";

type Member = {
  membershipId: string;
  userId: string;
  name?: string;
  email?: string;
  phone?: string;
  role: string;
  active: boolean;
  disabledAt?: string | null;
};

type RoleSummary = { role: string; permissions: string[] };

const ROLE_OPTIONS = ["OWNER", "MANAGER", "STAFF"];

export function TeamSection() {
  const { user, can, refresh } = useAuth();

  const [members, setMembers] = useState<Member[]>([]);
  const [roles, setRoles] = useState<RoleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showRoles, setShowRoles] = useState(false);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", role: "STAFF" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [memberList, roleList] = await Promise.all([
        fetchApi("/users"),
        can(PERMISSIONS.ROLES_VIEW) ? fetchApi("/users/roles") : Promise.resolve([]),
      ]);
      setMembers(Array.isArray(memberList) ? memberList : []);
      setRoles(Array.isArray(roleList) ? roleList : []);
    } catch (err: any) {
      setError(err.message || "Could not load the team list.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openInvite() {
    setForm({ name: "", email: "", phone: "", password: "", role: "STAFF" });
    setFormError("");
    setInviteOpen(true);
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!form.name.trim() || !form.email.trim() || form.password.length < 8) {
      setFormError("Name, email and a password of at least 8 characters are all required.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      await fetchApi("/users", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          password: form.password,
          role: form.role,
        }),
      });
      setInviteOpen(false);
      await load();
    } catch (err: any) {
      setFormError(err.message || "Could not add this person.");
    } finally {
      setSubmitting(false);
    }
  }

  async function changeRole(member: Member, role: string) {
    if (role === member.role) return;
    setBusyId(member.membershipId);
    setError("");
    try {
      await fetchApi(`/users/${member.membershipId}/role`, {
        method: "PUT",
        body: JSON.stringify({ role }),
      });
      await load();
      if (member.userId === user?.id) await refresh();
    } catch (err: any) {
      setError(err.message || "Could not change that role.");
    } finally {
      setBusyId(null);
    }
  }

  async function toggleAccess(member: Member) {
    setBusyId(member.membershipId);
    setError("");
    try {
      await fetchApi(`/users/${member.membershipId}/${member.active ? "disable" : "enable"}`, {
        method: "PUT",
      });
      await load();
    } catch (err: any) {
      setError(err.message || "Could not update that person's access.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="bg-card border rounded-xl overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center bg-muted/20">
        <div>
          <div className="flex items-center space-x-2">
            <UserCog className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Team</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Who can sign in to this business, and what each of them can do
          </p>
        </div>
        <Can permission={PERMISSIONS.USERS_INVITE}>
          <Button size="sm" variant="outline" className="h-8 gap-1" onClick={openInvite}>
            <Plus className="h-3.5 w-3.5" /> Add Person
          </Button>
        </Can>
      </div>

      {error && (
        <div className="px-4 py-3 text-sm text-destructive border-b bg-destructive/5">{error}</div>
      )}

      <div className="p-0">
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground text-center">Loading the team...</div>
        ) : members.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground text-center">
            Nobody else has access yet.
          </div>
        ) : (
          members.map((member, index) => {
            const isSelf = member.userId === user?.id;
            const busy = busyId === member.membershipId;
            return (
              <div key={member.membershipId}>
                {index > 0 && <div className="border-t" />}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-muted/30">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{member.name || member.email}</span>
                      {isSelf && (
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground border rounded px-1.5 py-0.5">
                          you
                        </span>
                      )}
                      {!member.active && (
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                          Access revoked
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{member.email}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Can
                      permission={PERMISSIONS.USERS_EDIT}
                      fallback={
                        <span className="text-sm font-medium">{ROLE_LABELS[member.role] ?? member.role}</span>
                      }
                    >
                      <select
                        className="flex h-8 rounded-md border border-input bg-background px-2 text-[13px] disabled:opacity-50"
                        value={member.role}
                        disabled={busy || isSelf}
                        title={isSelf ? "You can't change your own role" : undefined}
                        onChange={(e) => changeRole(member, e.target.value)}
                      >
                        {ROLE_OPTIONS.map((role) => (
                          <option key={role} value={role}>
                            {ROLE_LABELS[role] ?? role}
                          </option>
                        ))}
                      </select>
                    </Can>

                    <Can permission={PERMISSIONS.USERS_DISABLE}>
                      <Button
                        size="sm"
                        variant={member.active ? "outline" : "default"}
                        className="h-8 text-[13px]"
                        disabled={busy || isSelf}
                        title={isSelf ? "You can't revoke your own access" : undefined}
                        onClick={() => toggleAccess(member)}
                      >
                        {busy ? "Saving..." : member.active ? "Revoke access" : "Restore access"}
                      </Button>
                    </Can>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Can permission={PERMISSIONS.ROLES_VIEW}>
        <div className="border-t">
          <button
            onClick={() => setShowRoles((v) => !v)}
            className="w-full flex items-center gap-2 p-4 text-sm text-muted-foreground hover:bg-muted/30 transition-colors"
          >
            <ShieldCheck className="h-4 w-4" />
            {showRoles ? "Hide what each role can do" : "See what each role can do"}
          </button>

          {showRoles && (
            <div className="px-4 pb-4 grid gap-3 sm:grid-cols-3">
              {roles.map((entry) => (
                <div key={entry.role} className="border rounded-lg p-3">
                  <p className="text-sm font-medium">{ROLE_LABELS[entry.role] ?? entry.role}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {ROLE_DESCRIPTIONS[entry.role] ?? ""}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    {entry.permissions.length} permissions
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Can>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Person</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleInvite} className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              This creates the account straight away and sets their first password — there is no
              email invite yet, so pass the password on yourself and have them change it.
            </p>
            <div>
              <label className="text-sm font-medium mb-1 block">Name</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Sunil Kumar"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="name@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Phone (optional)</label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">First password</label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="At least 8 characters"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Role</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role] ?? role}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">{ROLE_DESCRIPTIONS[form.role]}</p>
            </div>
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Adding..." : "Add Person"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}

"use client";

import { useState, useActionState, useEffect } from "react";
import { Pencil, Trash2, X, Check } from "lucide-react";
import { updateUserRole, deleteUser } from "@/app/actions/users";
import { ROLE_LABELS } from "@/lib/rbac";
import type { UserRole } from "@/lib/rbac";
import { useActionToast } from "@/hooks/useActionToast";

interface Props {
  user: { id: number; name: string; email: string; role: UserRole };
  totalActivity: number;
  isSelf: boolean;
  roleLabel: string;
}

export function UserEditRow({ user, totalActivity, isSelf, roleLabel }: Props) {
  const [editing, setEditing]   = useState(false);
  const [editState, editAction, editPending] = useActionState(updateUserRole, undefined);
  const [delState,  delAction,  delPending]  = useActionState(deleteUser, undefined);

  useActionToast(editState, { success: "사용자 정보가 수정되었습니다." });
  useActionToast(delState,  { success: "사용자가 삭제되었습니다." });

  useEffect(() => {
    if (editState && "success" in editState) setEditing(false);
  }, [editState]);

  const roleBadgeColor: Record<UserRole, string> = {
    ADMIN:    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    OPERATOR: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    VIEWER:   "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  };

  return (
    <tr className="hover:bg-muted/20 transition-colors">
      <td className="px-4 py-3">
        <p className="font-semibold text-[13px] text-foreground">{user.name}</p>
        <p className="text-[11px] font-mono text-muted-foreground mt-0.5">{user.email}</p>
        {isSelf && <span className="text-[10px] font-semibold text-blue-600">(나)</span>}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${roleBadgeColor[user.role]}`}>
          {roleLabel}
        </span>
      </td>
      <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">{totalActivity}</td>
      <td className="px-4 py-3 text-right">
        {isSelf ? (
          <span className="text-[11px] text-muted-foreground">—</span>
        ) : editing ? (
          <form action={editAction} className="inline-flex items-center gap-2">
            <input type="hidden" name="userId" value={user.id} />
            <input
              name="name"
              defaultValue={user.name}
              className="rounded border border-border bg-background px-2 py-1 text-[12px] w-24 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <select
              name="role"
              defaultValue={user.role}
              className="rounded border border-border bg-background px-2 py-1 text-[12px] focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {(Object.entries(ROLE_LABELS) as [string, string][]).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {editState && "message" in editState && (
              <span className="text-[11px] text-destructive">{editState.message}</span>
            )}
            <button type="submit" disabled={editPending} className="text-emerald-600 hover:text-emerald-700 disabled:opacity-50">
              <Check className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => setEditing(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          </form>
        ) : (
          <div className="inline-flex items-center gap-2">
            <button
              onClick={() => setEditing(true)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="편집"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            {totalActivity === 0 && (
              <form action={delAction} className="inline">
                <input type="hidden" name="userId" value={user.id} />
                {delState && "message" in delState && (
                  <span className="text-[11px] text-destructive mr-1">{delState.message}</span>
                )}
                <button
                  type="submit"
                  disabled={delPending}
                  onClick={(e) => {
                    if (!confirm(`'${user.name}' 사용자를 삭제하시겠습니까?`)) e.preventDefault();
                  }}
                  className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                  title="삭제"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </form>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}

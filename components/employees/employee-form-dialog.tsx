"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

import { initialFormActionState } from "@/app/_actions/form-state";
import { upsertEmployeeAction } from "@/app/_actions/employees";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FieldMessage, Input, Label, Select, Textarea } from "@/components/ui/form-controls";
import type { EmployeeRecord } from "@/types";

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit">
      {pending ? "Saving..." : isEditing ? "Save Changes" : "Create Employee"}
    </Button>
  );
}

function EmployeeFormContent({
  item,
  onSuccess,
}: {
  item?: EmployeeRecord;
  onSuccess: () => void;
}) {
  const [state, action] = useActionState(upsertEmployeeAction, initialFormActionState);

  useEffect(() => {
    if (state.status === "success") {
      onSuccess();
    }
  }, [onSuccess, state.status]);

  return (
    <form action={action} className="space-y-6">
      <input name="id" type="hidden" value={item?.id ?? ""} />
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input defaultValue={item?.fullName} id="fullName" name="fullName" />
          <FieldMessage message={state.fieldErrors?.fullName} />
        </div>
        <div>
          <Label htmlFor="nickname">Nickname</Label>
          <Input defaultValue={item?.nickname ?? ""} id="nickname" name="nickname" />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input defaultValue={item?.phone ?? ""} id="phone" name="phone" />
        </div>
        <div>
          <Label htmlFor="position">Position</Label>
          <Input defaultValue={item?.position} id="position" name="position" />
          <FieldMessage message={state.fieldErrors?.position} />
        </div>
        <div>
          <Label htmlFor="dailyRate">Daily rate</Label>
          <Input
            defaultValue={item?.dailyRate ?? 0}
            id="dailyRate"
            min="0"
            name="dailyRate"
            step="0.01"
            type="number"
          />
          <FieldMessage message={state.fieldErrors?.dailyRate} />
        </div>
        <div>
          <Label htmlFor="role">Role</Label>
          <Select defaultValue={item?.role ?? "EMPLOYEE"} id="role" name="role">
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="EMPLOYEE">Employee</option>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="status">Status</Label>
          <Select defaultValue={item?.status ?? "ACTIVE"} id="status" name="status">
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="note">Note</Label>
        <Textarea defaultValue={item?.note ?? ""} id="note" name="note" />
      </div>

      {state.message ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {state.message}
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-3">
        <Button onClick={onSuccess} type="button" variant="secondary">
          Cancel
        </Button>
        <SubmitButton isEditing={Boolean(item)} />
      </div>
    </form>
  );
}

export function EmployeeFormDialog({
  buttonVariant = "primary",
  item,
  triggerLabel,
}: {
  buttonVariant?: "primary" | "secondary";
  item?: EmployeeRecord;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [instanceKey, setInstanceKey] = useState(0);

  function openDialog() {
    setInstanceKey((value) => value + 1);
    setOpen(true);
  }

  return (
    <>
      <Button onClick={openDialog} size={item ? "sm" : "md"} type="button" variant={buttonVariant}>
        {triggerLabel ?? (item ? "Edit" : "Add Employee")}
      </Button>
      <Dialog
        description="Manage role, rate, status, and contact details for the selected employee."
        onClose={() => setOpen(false)}
        open={open}
        title={item ? "Edit employee profile" : "Create employee profile"}
        width="lg"
      >
        <EmployeeFormContent key={instanceKey} item={item} onSuccess={() => setOpen(false)} />
      </Dialog>
    </>
  );
}

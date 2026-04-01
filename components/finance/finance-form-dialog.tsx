"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

import { initialFormActionState } from "@/app/_actions/form-state";
import { upsertFinanceAction } from "@/app/_actions/finance";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FieldMessage, Input, Label, Select, Textarea } from "@/components/ui/form-controls";
import type { EmployeeOption, FinanceRecord } from "@/types";

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit">
      {pending ? "Saving..." : isEditing ? "Save Changes" : "Add Finance"}
    </Button>
  );
}

function FinanceFormContent({
  employees,
  item,
  onSuccess,
}: {
  employees: EmployeeOption[];
  item?: FinanceRecord;
  onSuccess: () => void;
}) {
  const [state, action] = useActionState(upsertFinanceAction, initialFormActionState);

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
          <Label htmlFor="employeeId">Employee</Label>
          <Select defaultValue={item?.employeeId ?? ""} id="employeeId" name="employeeId">
            <option value="">Select an employee</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.nickname || employee.fullName}
              </option>
            ))}
          </Select>
          <FieldMessage message={state.fieldErrors?.employeeId} />
        </div>
        <div>
          <Label htmlFor="date">Date</Label>
          <Input defaultValue={item?.dateKey} id="date" name="date" type="date" />
          <FieldMessage message={state.fieldErrors?.date} />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="workReference">Work or job reference</Label>
          <Input
            defaultValue={item?.workReference}
            id="workReference"
            name="workReference"
            placeholder="Client site inspection"
          />
          <FieldMessage message={state.fieldErrors?.workReference} />
        </div>
        <div>
          <Label htmlFor="dailyWage">Daily wage / income</Label>
          <Input
            defaultValue={item?.dailyWage ?? 0}
            id="dailyWage"
            min="0"
            name="dailyWage"
            step="0.01"
            type="number"
          />
          <FieldMessage message={state.fieldErrors?.dailyWage} />
        </div>
        <div>
          <Label htmlFor="bonus">Bonus</Label>
          <Input
            defaultValue={item?.bonus ?? 0}
            id="bonus"
            min="0"
            name="bonus"
            step="0.01"
            type="number"
          />
          <FieldMessage message={state.fieldErrors?.bonus} />
        </div>
        <div>
          <Label htmlFor="deduction">Deduction</Label>
          <Input
            defaultValue={item?.deduction ?? 0}
            id="deduction"
            min="0"
            name="deduction"
            step="0.01"
            type="number"
          />
          <FieldMessage message={state.fieldErrors?.deduction} />
        </div>
        <div>
          <Label htmlFor="advancePayment">Advance payment</Label>
          <Input
            defaultValue={item?.advancePayment ?? 0}
            id="advancePayment"
            min="0"
            name="advancePayment"
            step="0.01"
            type="number"
          />
          <FieldMessage message={state.fieldErrors?.advancePayment} />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="paymentStatus">Payment status</Label>
          <Select
            defaultValue={item?.paymentStatus ?? "PENDING"}
            id="paymentStatus"
            name="paymentStatus"
          >
            <option value="PENDING">Pending</option>
            <option value="PARTIAL">Partial</option>
            <option value="PAID">Paid</option>
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

export function FinanceFormDialog({
  buttonVariant = "primary",
  employees,
  item,
  triggerLabel,
}: {
  buttonVariant?: "primary" | "secondary";
  employees: EmployeeOption[];
  item?: FinanceRecord;
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
        {triggerLabel ?? (item ? "Edit" : "Add Finance")}
      </Button>
      <Dialog
        description="Track daily wages, bonuses, deductions, advances, and payment state."
        onClose={() => setOpen(false)}
        open={open}
        title={item ? "Edit finance record" : "Create finance record"}
      >
        <FinanceFormContent
          key={instanceKey}
          employees={employees}
          item={item}
          onSuccess={() => setOpen(false)}
        />
      </Dialog>
    </>
  );
}

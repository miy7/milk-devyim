"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

import { initialFormActionState } from "@/app/_actions/form-state";
import { upsertWorkPlanAction } from "@/app/_actions/work-plans";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FieldMessage, Input, Label, Select, Textarea } from "@/components/ui/form-controls";
import type { EmployeeOption, WorkPlanListItem } from "@/types";

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit">
      {pending ? "Saving..." : isEditing ? "Save Changes" : "Create Plan"}
    </Button>
  );
}

function WorkPlanFormContent({
  employees,
  item,
  onSuccess,
}: {
  employees: EmployeeOption[];
  item?: WorkPlanListItem;
  onSuccess: () => void;
}) {
  const [state, action] = useActionState(upsertWorkPlanAction, initialFormActionState);

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
          <Label htmlFor="title">Title</Label>
          <Input defaultValue={item?.title} id="title" name="title" />
          <FieldMessage message={state.fieldErrors?.title} />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select defaultValue={item?.status ?? "PENDING"} id="status" name="status">
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="date">Date</Label>
          <Input defaultValue={item?.dateKey} id="date" name="date" type="date" />
          <FieldMessage message={state.fieldErrors?.date} />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input defaultValue={item?.location ?? ""} id="location" name="location" />
        </div>
        <div>
          <Label htmlFor="startTime">Start time</Label>
          <Input defaultValue={item?.startTime} id="startTime" name="startTime" type="time" />
          <FieldMessage message={state.fieldErrors?.startTime} />
        </div>
        <div>
          <Label htmlFor="endTime">End time</Label>
          <Input defaultValue={item?.endTime} id="endTime" name="endTime" type="time" />
          <FieldMessage message={state.fieldErrors?.endTime} />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea defaultValue={item?.description} id="description" name="description" />
        <FieldMessage message={state.fieldErrors?.description} />
      </div>

      <div>
        <Label htmlFor="note">Operational note</Label>
        <Textarea defaultValue={item?.note ?? ""} id="note" name="note" />
      </div>

      <div>
        <Label>Assigned employees</Label>
        <div className="grid gap-3 rounded-[24px] border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-2">
          {employees.map((employee) => {
            const isSelected = item?.assignedEmployees.some(
              (assignedEmployee) => assignedEmployee.id === employee.id,
            );

            return (
              <label
                key={employee.id}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3"
              >
                <input
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-black/40 text-white"
                  defaultChecked={isSelected}
                  name="employeeIds"
                  type="checkbox"
                  value={employee.id}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-white">
                    {employee.nickname || employee.fullName}
                  </span>
                  <span className="block text-xs text-zinc-500">{employee.position}</span>
                </span>
              </label>
            );
          })}
        </div>
        <FieldMessage message={state.fieldErrors?.employeeIds} />
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

export function WorkPlanFormDialog({
  buttonVariant = "primary",
  employees,
  item,
  triggerLabel,
}: {
  buttonVariant?: "primary" | "secondary";
  employees: EmployeeOption[];
  item?: WorkPlanListItem;
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
        {triggerLabel ?? (item ? "Edit" : "Add Plan")}
      </Button>
      <Dialog
        description="Create or update a work plan with timing, staffing, and operating notes."
        onClose={() => setOpen(false)}
        open={open}
        title={item ? "Edit work plan" : "Create work plan"}
      >
        <WorkPlanFormContent
          key={instanceKey}
          employees={employees}
          item={item}
          onSuccess={() => setOpen(false)}
        />
      </Dialog>
    </>
  );
}

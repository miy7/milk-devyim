"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

function ConfirmSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit" variant="danger">
      {pending ? "Deleting..." : "Delete"}
    </Button>
  );
}

export function DeleteConfirmDialog({
  action,
  description,
  fieldName = "id",
  title,
  triggerLabel = "Delete",
  value,
}: {
  action: (formData: FormData) => void | Promise<void>;
  description: string;
  fieldName?: string;
  title: string;
  triggerLabel?: string;
  value: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm" type="button" variant="danger">
        {triggerLabel}
      </Button>
      <Dialog
        description={description}
        onClose={() => setOpen(false)}
        open={open}
        title={title}
        width="lg"
      >
        <form action={action} className="flex flex-col gap-6">
          <input name={fieldName} type="hidden" value={value} />
          <p className="text-sm leading-7 text-zinc-400">
            This action updates live operational data and cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button onClick={() => setOpen(false)} type="button" variant="secondary">
              Cancel
            </Button>
            <ConfirmSubmitButton />
          </div>
        </form>
      </Dialog>
    </>
  );
}

"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import { HOUSES } from "../data/houses";
import { updateStudentProfile } from "../services";

export default function ProfileUpdateModal({
  open,
  onClose,
  studentData,
  onSuccess,
}) {
  const [house, setHouse] = useState(studentData?.house || "");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!house) return;

    setSaving(true);
    const result = await updateStudentProfile(studentData?.admNo, { house });
    setSaving(false);

    if (result?.status === 200) {
      onSuccess?.(result.data);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogTitle>Update Profile</DialogTitle>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">House</label>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen} modal={true}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={popoverOpen}
                  className="w-full justify-between"
                >
                  {house || "Select house..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0"
                align="start"
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <Command>
                  <CommandInput placeholder="Search house..." />
                  <CommandList className="max-h-[200px] overflow-y-auto">
                    <CommandEmpty>No house found.</CommandEmpty>
                    <CommandGroup>
                      {HOUSES.map((h) => (
                        <CommandItem
                          key={h}
                          value={h}
                          onSelect={(value) => {
                            setHouse(value.toUpperCase());
                            setPopoverOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              house === h ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {h}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!house || saving}>
              {saving ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { updateStudentProfile, fetchAllStudentClasses, fetchStudentData } from "../services";
import { updateEntry } from "../student-update-entry/services";

export default function ProfileUpdateModal({
  open,
  onClose,
  studentData,
  onSuccess,
}) {
  const [fName, setFName] = useState("");
  const [sName, setSName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [house, setHouse] = useState("");
  const [markAsActive, setMarkAsActive] = useState(false);
  const [housePopoverOpen, setHousePopoverOpen] = useState(false);
  const [classPopoverOpen, setClassPopoverOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState([]);

  // Fetch available classes when modal opens
  useEffect(() => {
    if (open) {
      fetchAllStudentClasses().then(setClasses);
    }
  }, [open]);

  // Reset state when modal opens with new student data
  useEffect(() => {
    if (open) {
      setFName(studentData?.fName || "");
      setSName(studentData?.sName || "");
      setStudentClass(studentData?.class || "");
      setHouse(studentData?.house || "");
      setMarkAsActive(false);
    }
  }, [open, studentData]);

  const isGraduated = !!studentData?.graduationYear;

  const handleSave = async () => {
    const wantsUngraduate = markAsActive && isGraduated;

    const entryChanged =
      fName !== (studentData?.fName || "") ||
      sName !== (studentData?.sName || "") ||
      studentClass !== (studentData?.class || "") ||
      wantsUngraduate;

    const houseChanged = house && house !== studentData?.house;

    if (!entryChanged && !houseChanged) {
      onClose();
      return;
    }

    setSaving(true);

    const promises = [];

    if (entryChanged) {
      const entryData = {
        admNo: studentData?.admNo,
        fName,
        sName,
        studentClass,
      };
      if (wantsUngraduate) {
        entryData.graduationYear = null;
      }
      promises.push(updateEntry(entryData));
    }

    if (houseChanged) {
      promises.push(updateStudentProfile(studentData?.admNo, { house }));
    }

    const results = await Promise.all(promises);

    const allSucceeded = results.every((r) => r != null);
    if (allSucceeded) {
      const refreshed = await fetchStudentData(studentData?.admNo);
      setSaving(false);
      onSuccess?.(refreshed);
      onClose();
    } else {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogTitle>Update Profile</DialogTitle>
        <DialogDescription className="sr-only">
          Update student profile information
        </DialogDescription>

        <div className="space-y-4 pt-2">
          {/* Mark as Active - only show for graduated students */}
          {isGraduated && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-lg">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={markAsActive}
                  onChange={(e) => setMarkAsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Mark as active student
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Remove &quot;Graduated {studentData?.graduationYear}&quot; status
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* First Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">First Name</label>
            <input
              type="text"
              value={fName}
              onChange={(e) => setFName(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="First name"
            />
          </div>

          {/* Second Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Second Name</label>
            <input
              type="text"
              value={sName}
              onChange={(e) => setSName(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Second name"
            />
          </div>

          {/* Class */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Class</label>
            <Popover open={classPopoverOpen} onOpenChange={setClassPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={classPopoverOpen}
                  className="w-full justify-between"
                >
                  {studentClass || "Select class..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0"
                align="start"
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <Command>
                  <CommandInput placeholder="Search class..." />
                  <CommandList className="max-h-[200px] overflow-y-auto">
                    <CommandEmpty>No class found.</CommandEmpty>
                    <CommandGroup>
                      {classes.map((c) => (
                        <CommandItem
                          key={c}
                          value={c}
                          onSelect={(value) => {
                            setStudentClass(value);
                            setClassPopoverOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              studentClass === c ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {c}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* House */}
          <div className="space-y-2">
            <label className="text-sm font-medium">House</label>
            <Popover open={housePopoverOpen} onOpenChange={setHousePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={housePopoverOpen}
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
                            setHousePopoverOpen(false);
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
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

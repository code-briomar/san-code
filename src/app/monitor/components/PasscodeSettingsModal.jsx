"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KeyRound, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { updateMonitorPasscode } from "../services";
import { toast } from "sonner";

export default function PasscodeSettingsModal({ isOpen, onClose, currentPasscode, onPasscodeUpdated }) {
  const [newPasscode, setNewPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!newPasscode || newPasscode.trim().length < 4) {
      setErrorMsg("New passcode must be at least 4 characters long.");
      return;
    }

    if (newPasscode.trim() !== confirmPasscode.trim()) {
      setErrorMsg("Confirmation passcode does not match.");
      return;
    }

    setLoading(true);
    try {
      await updateMonitorPasscode(currentPasscode, newPasscode.trim());
      toast.success("Monitor passcode updated successfully!");
      if (onPasscodeUpdated) {
        onPasscodeUpdated(newPasscode.trim());
      }
      setNewPasscode("");
      setConfirmPasscode("");
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Failed to update passcode.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-zinc-900 dark:text-white">
                Update Monitor Passcode
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                Change the access credentials used to unlock this monitoring dashboard
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              New Passcode
            </label>
            <Input
              type="password"
              placeholder="Enter new passcode (min. 4 chars)"
              value={newPasscode}
              onChange={(e) => setNewPasscode(e.target.value)}
              disabled={loading}
              className="text-sm font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Confirm New Passcode
            </label>
            <Input
              type="password"
              placeholder="Confirm new passcode"
              value={confirmPasscode}
              onChange={(e) => setConfirmPasscode(e.target.value)}
              disabled={loading}
              className="text-sm font-mono"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Updating...
                </>
              ) : (
                "Save New Passcode"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

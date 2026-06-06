"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Key, Clock, Plus, Trash2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { base_api } from "@/lib/base_api";

export default function NurseSettings() {
  const [passcode, setPasscode] = useState("");
  const [newPasscode, setNewPasscode] = useState("");
  const [schedule, setSchedule] = useState([]);
  
  // Form values
  const [dayOfWeek, setDayOfWeek] = useState("Monday");
  const [startTime, setStartTime] = useState("07:00");
  const [endTime, setEndTime] = useState("08:00");
  const [slotName, setSlotName] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      // 1. Fetch passcode
      const passRes = await base_api.get("/nurse/settings/passcode");
      setPasscode(passRes.data?.passcode || "staff123");
      setNewPasscode(passRes.data?.passcode || "staff123");

      // 2. Fetch slots
      const schedRes = await base_api.get("/nurse/schedule");
      setSchedule(schedRes.data?.schedule || []);
    } catch (err) {
      setErrorMsg("Failed to load settings. Make sure new database migrations are executed.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePasscode = async (e) => {
    e.preventDefault();
    if (!newPasscode) return;
    
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await base_api.post("/nurse/settings/passcode", { passcode: newPasscode });
      if (res.data?.status === "success") {
        setPasscode(newPasscode);
        setSuccessMsg(res.data.message);
        setTimeout(() => setSuccessMsg(""), 2500);
      }
    } catch (err) {
      setErrorMsg("Failed to update passcode.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!dayOfWeek || !startTime || !endTime || !slotName) {
      setErrorMsg("Please fill in all slot details.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await base_api.post("/nurse/schedule", {
        dayOfWeek,
        startTime: startTime + ":00", // append seconds
        endTime: endTime + ":00",
        slotName,
        description
      });
      if (res.data?.status === "success") {
        setSuccessMsg("Operating hour slot added successfully.");
        // reset form
        setSlotName("");
        setDescription("");
        // reload schedule
        const schedRes = await base_api.get("/nurse/schedule");
        setSchedule(schedRes.data?.schedule || []);
        setTimeout(() => setSuccessMsg(""), 2500);
      }
    } catch (err) {
      setErrorMsg("Failed to add schedule slot.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlot = async (id) => {
    if (!confirm("Are you sure you want to delete this operating slot?")) return;
    
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await base_api.delete(`/nurse/schedule/${id}`);
      if (res.data?.status === "success") {
        setSuccessMsg(res.data.message);
        // reload schedule
        const schedRes = await base_api.get("/nurse/schedule");
        setSchedule(schedRes.data?.schedule || []);
        setTimeout(() => setSuccessMsg(""), 2500);
      }
    } catch (err) {
      setErrorMsg("Failed to delete slot.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Messages */}
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm dark:bg-red-950/20 dark:border-red-900 dark:text-red-200">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm dark:bg-green-950/20 dark:border-green-900 dark:text-green-200 flex items-center gap-1.5 animate-in fade-in duration-200">
          <CheckCircle2 className="h-4.5 w-4.5 text-green-600" />
          {successMsg}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Left column: Passcode settings */}
        <div className="md:col-span-1 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Key className="h-4.5 w-4.5 text-blue-600" />
                Teacher Verification Lock
              </CardTitle>
              <CardDescription>
                Passcode that teachers must input to verify student logs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePasscode} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-500">Current Passcode</label>
                  <Input value={passcode} disabled className="bg-slate-50 font-mono text-center tracking-wider" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-500">New Passcode</label>
                  <Input 
                    value={newPasscode} 
                    onChange={(e) => setNewPasscode(e.target.value)} 
                    disabled={loading}
                    placeholder="e.g. staff123"
                    className="font-mono text-center tracking-wider"
                    required 
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Passcode"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Add Slot Form */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-blue-600" />
                Add Operating Slot
              </CardTitle>
              <CardDescription>Configure a daily check-up window.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddSlot} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-500">Day of Week</label>
                  <select 
                    value={dayOfWeek} 
                    onChange={(e) => setDayOfWeek(e.target.value)} 
                    className="w-full rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 text-sm"
                  >
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-500">Slot Name</label>
                  <Input 
                    placeholder="e.g. Morning Checkup" 
                    value={slotName} 
                    onChange={(e) => setSlotName(e.target.value)} 
                    required 
                  />
                </div>
                <div className="grid gap-3 grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-slate-500">Start Time</label>
                    <Input 
                      type="time" 
                      value={startTime} 
                      onChange={(e) => setStartTime(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-slate-500">End Time</label>
                    <Input 
                      type="time" 
                      value={endTime} 
                      onChange={(e) => setEndTime(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-500">Description</label>
                  <Input 
                    placeholder="e.g. Doses distribution" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white flex gap-1">
                  <Plus className="h-4 w-4" /> Add Slot
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Slots list table */}
        <div className="md:col-span-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Nurse Custom Operating Slots</CardTitle>
              <CardDescription>
                Registered daily slots where students are evaluated and medication is dispatched.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {schedule.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">No custom operating slots configured. Default schedule is active.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Day</TableHead>
                        <TableHead>Slot Name</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="w-[40px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schedule.map((slot) => (
                        <TableRow key={slot.id}>
                          <TableCell className="font-semibold text-xs text-slate-700 dark:text-zinc-300">{slot.day_of_week}</TableCell>
                          <TableCell className="font-semibold text-sm">{slot.slot_name}</TableCell>
                          <TableCell className="font-mono text-xs text-slate-600 dark:text-zinc-400">
                            {slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}
                          </TableCell>
                          <TableCell className="text-xs text-slate-500">{slot.description || "—"}</TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteSlot(slot.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
}

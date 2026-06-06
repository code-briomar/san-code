"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pill, AlertTriangle, History, PlusCircle, CheckCircle2, ChevronDown, ChevronRight, X, Loader2, Search } from "lucide-react";
import { restockMedication } from "./services";

export default function MedicationInventory({ inventory = [], logs = [], onRefresh }) {
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedMedId, setSelectedMedId] = useState("");
  const [medSearchQuery, setMedSearchQuery] = useState("");
  const [batchNo, setBatchNo] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [expandedMeds, setExpandedMeds] = useState({});

  const toggleExpand = (id) => {
    setExpandedMeds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Stats calculations
  const totalMeds = inventory.length;
  
  const lowStockMeds = useMemo(() => {
    return inventory.filter(m => m.current_stock <= m.reorder_level).length;
  }, [inventory]);

  const expiredSoonMeds = useMemo(() => {
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
    
    return inventory.filter(med => 
      (med.batches || []).some(b => new Date(b.expiry_date) <= ninetyDaysFromNow)
    ).length;
  }, [inventory]);

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMedId || !batchNo || !quantity || !expiryDate) {
      setErrorMsg("Please fill in all restocking fields.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await restockMedication(selectedMedId, batchNo, quantity, expiryDate);
      if (res.status === "success") {
        setSuccessMsg(res.message);
        // Reset form
        setBatchNo("");
        setQuantity("");
        setExpiryDate("");
        setMedSearchQuery("");
        // Reload data from parent dashboard
        if (onRefresh) await onRefresh();
        
        setTimeout(() => {
          setShowRestockModal(false);
          setSuccessMsg("");
        }, 1500);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Failed to submit restocking record. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getMedicationNameById = (id) => {
    const med = inventory.find(m => m.id === id);
    return med ? med.name : "Unknown Medication";
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    const d = new Date(timestamp);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Registered Medicines</CardTitle>
            <Pill className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMeds}</div>
            <p className="text-xs text-slate-500 mt-1">Total items in catalog</p>
          </CardContent>
        </Card>

        <Card className={lowStockMeds > 0 ? "border-amber-300 dark:border-amber-900" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className={lowStockMeds > 0 ? "h-4 w-4 text-amber-500 animate-pulse" : "h-4 w-4 text-slate-400"} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{lowStockMeds}</div>
            <p className="text-xs text-slate-500 mt-1">Medicines below reorder level</p>
          </CardContent>
        </Card>

        <Card className={expiredSoonMeds > 0 ? "border-rose-300 dark:border-rose-950" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Expiring Batches</CardTitle>
            <AlertTriangle className={expiredSoonMeds > 0 ? "h-4 w-4 text-rose-500" : "h-4 w-4 text-slate-400"} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{expiredSoonMeds}</div>
            <p className="text-xs text-slate-500 mt-1">Expiring within 90 days</p>
          </CardContent>
        </Card>
      </div>

      {/* 2. Restocking Trigger Button */}
      <div className="flex justify-end no-print">
        <Button 
          onClick={() => {
            setSelectedMedId("");
            setMedSearchQuery("");
            setShowRestockModal(true);
          }} 
          className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <PlusCircle className="h-4 w-4" />
          Restock Medication
        </Button>
      </div>

      {/* 3. Main Split Inventory / Logs View */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Left Side: Inventory Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Current Medication Inventory</CardTitle>
            <CardDescription>Click a medicine row to expand batch details, or use Restock to add supply.</CardDescription>
          </CardHeader>
          <CardContent>
            {inventory.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-6">No inventory data available.</p>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30px]"></TableHead>
                      <TableHead>Medication Name</TableHead>
                      <TableHead className="text-right">Current Stock</TableHead>
                      <TableHead className="text-right">Reorder Level</TableHead>
                      <TableHead className="text-right">Status & Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.map((med) => {
                      const isLowStock = med.current_stock <= med.reorder_level;
                      const hasExpiring = (med.batches || []).some(b => {
                        const ninetyDaysFromNow = new Date();
                        ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
                        return new Date(b.expiry_date) <= ninetyDaysFromNow;
                      });
                      const isOpen = !!expandedMeds[med.id];

                      return (
                        <React.Fragment key={med.id}>
                          <TableRow 
                            className="cursor-pointer hover:bg-slate-50/50 dark:hover:bg-zinc-900/50"
                            onClick={() => toggleExpand(med.id)}
                          >
                            <TableCell className="p-2">
                              {isOpen ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                            </TableCell>
                            <TableCell className="font-semibold text-sm">
                              <div>{med.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">Aliases: {(med.alias || []).join(", ")}</div>
                            </TableCell>
                            <TableCell className="text-right font-mono font-medium">{med.current_stock} {med.unit}</TableCell>
                            <TableCell className="text-right font-mono text-slate-500">{med.reorder_level} {med.unit}</TableCell>
                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex justify-end items-center gap-3">
                                <div className="flex gap-1.5">
                                  {isLowStock && (
                                    <Badge variant="destructive" className="text-[10px] py-0 px-1.5">
                                      Low Stock
                                    </Badge>
                                  )}
                                  {hasExpiring && (
                                    <Badge className="bg-amber-500 text-white hover:bg-amber-600 text-[10px] py-0 px-1.5">
                                      Expiring
                                    </Badge>
                                  )}
                                  {!isLowStock && !hasExpiring && (
                                    <Badge className="bg-green-600 text-white hover:bg-green-700 text-[10px] py-0 px-1.5">
                                      Healthy
                                    </Badge>
                                  )}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs border-slate-200 text-slate-700 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 hover:bg-slate-100"
                                  onClick={() => {
                                    setSelectedMedId(med.id);
                                    setMedSearchQuery("");
                                    setShowRestockModal(true);
                                  }}
                                >
                                  Restock
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          
                          {/* Expanded Batches List */}
                          {isOpen && (
                            <TableRow className="bg-slate-50/30 dark:bg-zinc-900/20">
                              <TableCell colSpan={5} className="p-3">
                                <div className="pl-6 border-l-2 border-slate-200 dark:border-zinc-800 space-y-2">
                                  <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Active Batches</p>
                                  {(med.batches || []).length === 0 ? (
                                    <p className="text-xs text-slate-500">No active batches available. Please restock.</p>
                                  ) : (
                                    <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                                      {med.batches.map((batch) => {
                                        const ninetyDaysFromNow = new Date();
                                        ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
                                        const isExpiringSoon = new Date(batch.expiry_date) <= ninetyDaysFromNow;

                                        return (
                                          <div 
                                            key={batch.id} 
                                            className={`p-2 rounded border text-xs flex flex-col justify-between ${
                                              isExpiringSoon 
                                                ? "border-amber-200 bg-amber-50/20 dark:border-amber-900/40" 
                                                : "border-slate-100 bg-white dark:border-zinc-850 dark:bg-zinc-900"
                                            }`}
                                          >
                                            <div className="flex justify-between font-semibold">
                                              <span>Batch: {batch.batch_no}</span>
                                              <span className="font-mono">{batch.quantity} {med.unit}</span>
                                            </div>
                                            <div className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400 flex justify-between">
                                              <span>Expires: {formatDate(batch.expiry_date)}</span>
                                              {isExpiringSoon && <span className="text-amber-600 dark:text-amber-400 font-medium font-sans">Expiring</span>}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Side: Transaction logs */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <History className="h-5 w-5 text-slate-500" />
              Recent Activity Audit
            </CardTitle>
            <CardDescription>Dispensation & restocking history.</CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-6">No recent audit logs.</p>
            ) : (
              <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                {logs.map((log) => {
                  const isRestock = log.change_type === "restock";
                  const changeColor = isRestock 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-red-600 dark:text-red-400";
                  
                  return (
                    <div 
                      key={log.id} 
                      className="p-3 rounded-lg border border-slate-100 dark:border-zinc-800/80 bg-slate-50/20 dark:bg-zinc-900/10 space-y-1"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-xs text-slate-800 dark:text-zinc-200">
                          {getMedicationNameById(log.medication_id)}
                        </span>
                        <span className={`font-mono text-xs font-bold ${changeColor}`}>
                          {isRestock ? "+" : ""}{log.quantity_changed}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span className="capitalize text-[9px] font-bold">{log.change_type}</span>
                        <span>{formatDate(log.timestamp)}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                        By: {log.recorded_by}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 4. Restock Modal Dialog Form */}
      {showRestockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 no-print animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200 bg-white dark:bg-zinc-950">
            <button 
              onClick={() => setShowRestockModal(false)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
            >
              <X className="h-5 w-5" />
            </button>
            <CardHeader>
              <CardTitle>Restock Medication</CardTitle>
              <CardDescription>Register a new supply batch and update inventory.</CardDescription>
            </CardHeader>
            <CardContent>
              {errorMsg && (
                <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-800 rounded text-xs dark:bg-red-950/20 dark:border-red-900 dark:text-red-200">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="mb-4 p-2.5 bg-green-50 border border-green-200 text-green-800 rounded text-xs dark:bg-green-950/20 dark:border-green-900 dark:text-green-200 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleRestockSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-500">Select Medication</label>
                  {selectedMedId && (
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" /> Selected: {getMedicationNameById(selectedMedId)}
                    </div>
                  )}
                  {/* Search query input */}
                  <div className="relative mb-2">
                    <Input
                      placeholder="Type to search medicine catalog..."
                      value={medSearchQuery}
                      onChange={(e) => setMedSearchQuery(e.target.value)}
                      disabled={isLoading}
                      className="text-xs h-9 pl-8"
                    />
                    <Search className="absolute left-2.5 top-3 h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <select
                    className="w-full rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 text-sm"
                    value={selectedMedId}
                    onChange={(e) => setSelectedMedId(e.target.value)}
                    disabled={isLoading}
                    required
                  >
                    <option value="">-- Select Medicine --</option>
                    {inventory
                      .filter(m => m.name.toLowerCase().includes(medSearchQuery.toLowerCase()))
                      .map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-500">Batch Number</label>
                  <Input
                    placeholder="e.g. B-2026-06"
                    value={batchNo}
                    onChange={(e) => setBatchNo(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="grid gap-3 grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-slate-500">Restock Quantity</label>
                    <Input
                      type="number"
                      placeholder="e.g. 100"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-slate-500">Expiry Date</label>
                    <Input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowRestockModal(false)}
                    disabled={isLoading}
                    className="w-1/3 text-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading} className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Submit Restock"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ShieldCheck, Phone, Mail, FileText, Key, LogOut, HeartHandshake, CalendarDays, Wallet } from "lucide-react";
import { requestOTP, verifyOTP, fetchChildHistory, initiateMpesaStkPush, verifyMpesaPayment } from "./services";

export default function ParentPortal() {
  // Authentication states
  const [admNo, setAdmNo] = useState("");
  const [parentContact, setParentContact] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [token, setToken] = useState(null);
  
  // M-Pesa Paywall states
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState("");
  const [mpesaPhoneNumber, setMpesaPhoneNumber] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [manualMpesaCode, setManualMpesaCode] = useState("");
  
  // Data states
  const [records, setRecords] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);

  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Check if token exists in session/local storage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("parent_token");
    const savedAdmNo = localStorage.getItem("parent_child_adm");
    if (savedToken && savedAdmNo) {
      setToken(savedToken);
      setAdmNo(savedAdmNo);
      loadRecords(savedToken);
    }
  }, []);

  const loadRecords = async (authToken) => {
    setIsLoading(true);
    setErrorMsg("");
    setPaymentRequired(false);
    try {
      const data = await fetchChildHistory(authToken);
      if (data.status === "success") {
        setRecords(data.records || []);
        setStudentInfo(data.studentInfo);
      }
    } catch (err) {
      if (err.response?.status === 402) {
        setPaymentRequired(true);
        setErrorMsg(""); // It's a redirect to paywall
      } else {
        setErrorMsg(err.response?.data?.error || "Failed to fetch student records. Please verify code again.");
        handleLogout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!admNo || !parentContact) {
      setErrorMsg("Please fill in both child Admission Number and parent contact details.");
      return;
    }
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await requestOTP(admNo, parentContact);
      if (res.status === "success") {
        setOtpSent(true);
        setSuccessMsg(res.message || "Verification code sent to parent phone/email.");
        
        // Pre-populate M-Pesa phone number if they input a phone number
        if (/^\+?\d{9,15}$/.test(parentContact.trim())) {
          setMpesaPhoneNumber(parentContact.trim());
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Failed to send verification code. Please check details and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) {
      setErrorMsg("Please enter the 6-digit verification code.");
      return;
    }
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await verifyOTP(admNo, parentContact, otp);
      if (res.status === "success" && res.token) {
        localStorage.setItem("parent_token", res.token);
        localStorage.setItem("parent_child_adm", admNo);
        setToken(res.token);
        await loadRecords(res.token);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "OTP verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMpesaPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!mpesaPhoneNumber) {
      setErrorMsg("Please enter your M-Pesa phone number.");
      return;
    }

    setPaymentLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const currentAdm = admNo || localStorage.getItem("parent_child_adm");
      const res = await initiateMpeskPush(currentAdm); // Helper mapping
      
      // Call actual service
      const response = await initiateMpesaStkPush(currentAdm, mpesaPhoneNumber);
      if (response.status === "success") {
        setCheckoutRequestId(response.checkoutRequestId);
        setSuccessMsg(response.message || "STK Push sent! Please check your phone for a PIN prompt.");
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Failed to initiate M-Pesa payment. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleMpesaVerifySubmit = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await verifyMpesaPayment(checkoutRequestId, manualMpesaCode);
      if (res.status === "success" && res.token) {
        localStorage.setItem("parent_token", res.token);
        setToken(res.token);
        setPaymentRequired(false);
        setSuccessMsg("Payment verified! Fetching student records...");
        await loadRecords(res.token);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Payment verification failed. If you paid, please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  // Dummy fallback helper mapping for unused inline function parameter
  const initiateMpeskPush = (adm) => {
    return { status: "success" };
  };

  const handleLogout = () => {
    localStorage.removeItem("parent_token");
    localStorage.removeItem("parent_child_adm");
    setToken(null);
    setRecords([]);
    setStudentInfo(null);
    setOtpSent(false);
    setOtp("");
    setPaymentRequired(false);
    setCheckoutRequestId("");
    setMpesaPhoneNumber("");
    setManualMpesaCode("");
    setErrorMsg("");
    setSuccessMsg("");
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "—";
    const d = new Date(timestamp);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 py-10 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <div>
              <h1 id="parent-portal-title" className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                sanCode Parent Portal
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Secure access to your child's school clinic history
              </p>
            </div>
          </div>
          {token && (
            <Button
              id="parent-logout-btn"
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="mt-4 md:mt-0 gap-1.5"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          )}
        </header>

        {/* Errors & Alerts */}
        {errorMsg && (
          <div id="parent-error-alert" className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm dark:bg-red-950/30 dark:border-red-900 dark:text-red-200">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div id="parent-success-alert" className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm dark:bg-green-950/30 dark:border-green-900 dark:text-green-200">
            {successMsg}
          </div>
        )}

        {/* Phase 1: Authentication View */}
        {!token && (
          <div className="grid gap-6 md:grid-cols-2 max-w-2xl mx-auto pt-8">
            <Card className="md:col-span-2 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShieldCheck className="h-5 w-5 text-blue-500" />
                  Parent Verification
                </CardTitle>
                <CardDescription>
                  Enter your child's Admission Number and your registered phone number or email address.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!otpSent ? (
                  <form onSubmit={handleRequestOTP} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase text-slate-500">Student Admission Number</label>
                      <Input
                        id="parent-adm-no-input"
                        placeholder="e.g. 15583"
                        type="number"
                        value={admNo}
                        onChange={(e) => setAdmNo(e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase text-slate-500">Registered Phone or Email</label>
                      <div className="relative">
                        <Input
                          id="parent-contact-input"
                          placeholder="e.g. 0712345678 or parent@email.com"
                          type="text"
                          value={parentContact}
                          onChange={(e) => setParentContact(e.target.value)}
                          disabled={isLoading}
                          required
                          className="pl-9"
                        />
                        <div className="absolute left-3 top-3 text-slate-400">
                          <Phone className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                    <Button id="parent-send-otp-btn" type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700">
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Verification Code"
                      )}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div className="space-y-2 text-center pb-2">
                      <p className="text-sm text-slate-600 dark:text-zinc-400">
                        A verification code has been sent to <strong>{parentContact}</strong>.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase text-slate-500">6-Digit Verification Code</label>
                      <div className="relative">
                        <Input
                          id="parent-otp-input"
                          placeholder="Enter OTP (e.g. 654321)"
                          type="text"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          disabled={isLoading}
                          required
                          className="pl-9 text-center font-mono tracking-widest text-lg"
                        />
                        <div className="absolute left-3 top-3 text-slate-400">
                          <Key className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        id="parent-back-btn"
                        type="button"
                        variant="outline"
                        onClick={() => setOtpSent(false)}
                        disabled={isLoading}
                        className="w-1/3"
                      >
                        Back
                      </Button>
                      <Button id="parent-verify-otp-btn" type="submit" disabled={isLoading} className="w-2/3 bg-blue-600 hover:bg-blue-700">
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          "Verify & Continue"
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Phase 1.5: Paywall View */}
        {token && paymentRequired && (
          <div className="max-w-md mx-auto pt-8">
            <Card className="shadow-lg border-blue-200 dark:border-zinc-800">
              <CardHeader className="text-center pb-3">
                <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 dark:bg-zinc-900 flex items-center justify-center mb-2">
                  <Wallet className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>M-Pesa Access Payment</CardTitle>
                <CardDescription>
                  To secure parent medical lookup, a fee of <strong>KES 50.00</strong> is required per session access.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!checkoutRequestId ? (
                  <form onSubmit={handleMpesaPaymentSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase text-slate-500">M-Pesa Phone Number</label>
                      <div className="relative">
                        <Input
                          placeholder="e.g. 0712345678"
                          value={mpesaPhoneNumber}
                          onChange={(e) => setMpesaPhoneNumber(e.target.value)}
                          disabled={paymentLoading}
                          required
                          className="pl-9 font-mono"
                        />
                        <div className="absolute left-3 top-3 text-slate-400">
                          <Phone className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleLogout}
                        disabled={paymentLoading}
                        className="w-1/3"
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={paymentLoading} className="w-2/3 bg-green-600 hover:bg-green-700">
                        {paymentLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Triggering...
                          </>
                        ) : (
                          "Pay KES 50.00"
                        )}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleMpesaVerifySubmit} className="space-y-4">
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs dark:bg-amber-950/20 dark:border-amber-900 dark:text-amber-200 space-y-1">
                      <p className="font-semibold">Simulated STK Push Sent!</p>
                      <p>1. Check the server backend console to retrieve/simulate the confirmation.</p>
                      <p>2. Enter a mock M-Pesa receipt code below (or leave blank to auto-generate one) and click verify.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase text-slate-500">M-Pesa Transaction Code (Optional)</label>
                      <Input
                        placeholder="e.g. SGF345DFFG"
                        value={manualMpesaCode}
                        onChange={(e) => setManualMpesaCode(e.target.value)}
                        disabled={paymentLoading}
                        className="font-mono text-center tracking-widest text-sm"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCheckoutRequestId("")}
                        disabled={paymentLoading}
                        className="w-1/3"
                      >
                        Back
                      </Button>
                      <Button type="submit" disabled={paymentLoading} className="w-2/3 bg-blue-600 hover:bg-blue-700">
                        {paymentLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          "Verify Payment"
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Phase 2: Active Session Logs Timeline */}
        {token && !paymentRequired && (
          <div className="space-y-6">
            
            {/* Student metadata header */}
            {studentInfo && (
              <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/20 dark:bg-blue-950/10">
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center font-bold text-lg">
                    {studentInfo.fName?.[0]}
                    {studentInfo.sName?.[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-slate-50">
                      {studentInfo.fName} {studentInfo.sName}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-zinc-400">
                      Class: <strong>{studentInfo.class}</strong> &middot; Admission No: <strong>{admNo || localStorage.getItem("parent_child_adm")}</strong>
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Visits log list */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Clinic Visit History
                </CardTitle>
                <CardDescription>
                  Real-time history of clinic visits registered for this student.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : records.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 dark:text-zinc-400">
                    No visit records found for this student.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[180px]">Date</TableHead>
                          <TableHead className="w-[100px]">Temp</TableHead>
                          <TableHead>Complain</TableHead>
                          <TableHead>Ailment</TableHead>
                          <TableHead>Medication Administered</TableHead>
                          <TableHead className="text-right">Referral Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {records.map((r, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium text-xs text-slate-700 dark:text-zinc-300">
                              <span className="flex items-center gap-1.5">
                                <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                                {formatDate(r.timestamp)}
                              </span>
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {r.tempReading ? `${r.tempReading}°C` : "—"}
                            </TableCell>
                            <TableCell className="max-w-[150px] truncate text-sm" title={r.complain}>
                              {r.complain || "—"}
                            </TableCell>
                            <TableCell className="font-medium text-sm">
                              {r.ailment || "—"}
                            </TableCell>
                            <TableCell className="text-sm font-medium text-slate-800 dark:text-zinc-200">
                              {r.medication || "None"}
                            </TableCell>
                            <TableCell className="text-right">
                              {r.going_to_hospital === 1 ? (
                                <Badge variant="destructive" className="text-xs">
                                  Referred to Hospital
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  Managed at Clinic
                                </Badge>
                              )}
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
        )}

      </div>
    </div>
  );
}

"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  ArrowUpRightFromSquare,
  Check,
  ChevronsUpDown,
  Dot,
  Loader,
  LucideLoader,
  Pencil,
  PenSquare,
  Plus,
  X,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  createNewStaffRecord,
  fetchstaffData,
  fetchStaffMemberData,
} from "./services";
import { toast } from "sonner";
import { devMode } from "@/lib/dev_mode";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchStaffData } from "../view_summary/services";
import { ailments } from "./ailments";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export default function Students() {
  const router = useRouter();
  const [loading, setLoading] = useState();
  const [addNewStaffRecord, setAddNewStaffRecord] = useState(false);
  const [staffData, setStaffData] = useState();
  const [idNo, setIDNo] = useState();
  const [directingTo, setDirectingTo] = useState();
  const [open, setOpen] = useState(false);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      id_number: idNo,
    },
    validationSchema: Yup.object({
      id_number: Yup.string().required("ID Number is required"),
    }),
    onSubmit: async (values, formikHelpers) => {
      setLoading(true);
      // Fetch Staff data with the provided admission number
      const staff_data = await fetchStaffMemberData(values.id_number);

      if (staff_data?.data.length === 0) {
        toast("Staff member not found. Add their record to the system?", {
          action: {
            label: "Yes",
            onClick: async () => {
              setIDNo(values.id_number);
              setAddNewStaffRecord(true);
            },
          },
          cancel: {
            label: "No",
            onClick: () => {
              // -> Cancel.
            },
          },
          duration: 600000,
          toastOptions: {
            autoClose: false,
          },
        });
        setLoading(false);

        // Display prompt to add to database
        // setPageLoading(false);
        formikHelpers.resetForm();
        return;
      }

      if (devMode) console.log(staff_data.data);

      setTimeout(() => {
        setStaffData(staff_data.data[0]);
        setLoading(false);
      }, 1000);
    },
  });

  const formik_new_staff_record = useFormik({
    enableReinitialize: true,
    initialValues: {
      id_number: "",
      fName: "",
      sName: "",
    },
    validationSchema: Yup.object({
      fName: Yup.string().required("Temperature Reading is required"),
      sName: Yup.string().required("Staff member complain required"),
    }),
    onSubmit: async (values, formikHelpers) => {
      setLoading(true);
      // Fetch Staff data with the provided admission number
      const staff_data = await createNewStaffRecord(
        values.id_number,
        values.fName,
        values.sName
      );

      if (staff_data?.status === null || staff_data?.status === undefined) {
        toast.error(
          "Problem inserting this staff member to the system. Please try again later."
        );
        setLoading(false);
        formikHelpers.resetForm();
        return;
      }

      if (devMode) console.log(staff_data);
      setTimeout(() => {
        toast.success("Staff member has been added to the system.");
        setLoading(false);
        setAddNewStaffRecord(false);
      }, 1000);
    },
  });

  // Function : Direct to required page
  const directToPage = (link, directingTo) => {
    setDirectingTo(directingTo);
    setLoading(true);
    setTimeout(() => {
      const searchParams = new URLSearchParams({
        id_number: staffData?.idNo,
      });
      router.push(`${link}?${searchParams.toString()}`);
      setLoading(false);
      return;
    }, 1000);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      {/* Title bar */}
      <div className="z-10 max-w-5xl w-full items-center font-mono text-sm lg:flex lg:justify-between">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          <code className="font-mono font-bold">&nbsp;Staff</code>
        </p>

        <Link
          href={"/"}
          className="text-blue-500 underline font-semibold text-lg"
        >
          Home
        </Link>
      </div>

      {/* Form : 1. Get record by id number*/}
      <div className="sm:mb-32 ">
        <div className="border-b border-gray-300 pb-6 pt-8 lg:rounded-xl lg:p-8 lg:border">
          {!staffData && !addNewStaffRecord && (
            <>
              <span className="font-mono text-xs md:text-base">
                Search for staff's id number
              </span>
              <div className="flex flex-col lg:flex-row lg:space-x-2 lg:items-center">
                <Input
                  name={"id_number"}
                  value={formik.values.id_number}
                  type="text"
                  autoComplete={false}
                  placeholder="e.g 42073535"
                  className="my-5 outline outline-gray-200 outline-[1px] focus:outline-red-500"
                  onChange={formik.handleChange}
                />
                <Button
                  variant="outline"
                  className={"flex space-x-1 items-center justify-center"}
                  type="button"
                  onClick={formik.handleSubmit}
                >
                  {loading && <LucideLoader className="w-6 h-6 animate-spin" />}
                  {!loading && (
                    <>
                      <span>Search</span>
                      <span>
                        <ArrowRight className="w-3 h-4" />
                      </span>
                    </>
                  )}
                </Button>
              </div>
              <Link
                href={"/view_summary"}
                target="_blank"
                className={"text-[#039be5] underline flex gap-2 items-center"}
              >
                {"View Summary"}
                <ArrowUpRightFromSquare className={"w-5 h-5"} />
              </Link>
            </>
          )}

          {!staffData && addNewStaffRecord && (
            <>
              <span className="font-mono text-xs md:text-base flex space-x-2 items-center">
                <Plus className="w-5 h-5" />
                {"Add New Staff Record"}
              </span>
              <div className="flex flex-col">
                <Separator className={"m-2"} />
                <div className="">
                  <label
                    forname={"id_number"}
                    className={"text-xs md:text-base"}
                  >
                    ID Number
                  </label>
                  <Input
                    name={"id_number"}
                    value={idNo}
                    disabled
                    type="text"
                    placeholder="e.g 4145689"
                    className="my-5 outline outline-gray-200 outline-[1px] focus:outline-red-500"
                    onChange={formik_new_staff_record.handleChange}
                  />
                </div>
                <div className="">
                  <label
                    forname={"temp_reading"}
                    className={"text-xs md:text-base"}
                  >
                    First Name
                  </label>
                  <Input
                    name={"fName"}
                    value={formik_new_staff_record.values.fName}
                    type="text"
                    placeholder="e.g Alex"
                    className="my-5 outline outline-gray-200 outline-[1px] focus:outline-red-500"
                    onChange={formik_new_staff_record.handleChange}
                  />
                </div>
                <div className="">
                  <label
                    forname={"complain"}
                    className={"text-xs md:text-base"}
                  >
                    Second Name
                  </label>
                  <Input
                    name={"sName"}
                    value={formik_new_staff_record.values.sName}
                    type="text"
                    placeholder="e.g Tobiko"
                    className="my-5 outline outline-gray-200 outline-[1px] focus:outline-red-500"
                    onChange={formik_new_staff_record.handleChange}
                  />
                </div>
                <Button
                  variant="outline"
                  className={
                    "flex space-x-1 items-center justify-center bg-green-500 text-white"
                  }
                  type="button"
                  onClick={formik_new_staff_record.handleSubmit}
                  disabled={!formik_new_staff_record.isValid}
                >
                  {loading && <LucideLoader className="w-6 h-6 animate-spin" />}
                  {!loading && (
                    <>
                      <span>Submit</span>
                      <span>
                        <ArrowRight className="w-3 h-4" />
                      </span>
                    </>
                  )}
                </Button>
                <Separator className={"m-2"} />
                <div>
                  {formik_new_staff_record?.errors?.fName && (
                    <div className={"flex text-sm text-rose-500"}>
                      <p className={"flex items-center"}>
                        <Dot className={"w-5 h-5"} />
                        {formik_new_staff_record?.errors?.fName}
                      </p>
                    </div>
                  )}
                  {formik_new_staff_record?.errors?.sName && (
                    <div className={"flex text-sm text-rose-500"}>
                      <p className={"flex items-center"}>
                        <Dot className={"w-5 h-5"} />
                        {formik_new_staff_record?.errors?.sName}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* {!staffData && addNewStaffRecord && (
            <>
              <span className="font-mono text-xs md:text-base flex space-x-2 items-center">
                <Plus className="w-5 h-5" />
                {"Add New Staff Record"}
              </span>
              <div className="flex flex-col">
                <Separator className={"m-2"} />
                <div className="">
                  <label
                    forname={"id_number"}
                    className={"text-xs md:text-base"}
                  >
                    ID Number
                  </label>
                  <Input
                    name={"id_number"}
                    value={idNo}
                    disabled
                    type="text"
                    placeholder="e.g 4145689"
                    className="my-5 outline outline-gray-200 outline-[1px] focus:outline-red-500"
                    onChange={formik_new_staff_record.handleChange}
                  />
                </div>
                <div className="">
                  <label
                    forname={"temp_reading"}
                    className={"text-xs md:text-base"}
                  >
                    Temperature Reading
                  </label>
                  <Input
                    name={"tempReading"}
                    value={formik_new_staff_record.values.tempReading}
                    type="text"
                    autoComplete={false}
                    placeholder="e.g 35.6"
                    className="my-5 outline outline-gray-200 outline-[1px] focus:outline-red-500"
                    onChange={formik_new_staff_record.handleChange}
                  />
                </div>
                <div className="">
                  <label
                    forname={"complain"}
                    className={"text-xs md:text-base"}
                  >
                    Complains
                  </label>
                  <Textarea
                    defaultValue={formik_new_staff_record.values.complain}
                    onChange={formik_new_staff_record.handleChange}
                    placeholder={"e.g Headache"}
                    name={"complain"}
                  />
                </div>
                <div className="flex flex-col">
                  <label forname={"ailment"} className={"text-xs md:text-base"}>
                    Ailment
                  </label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-[200px] justify-between"
                      >
                        <span className=" text-ellipsis overflow-hidden">
                          {formik_new_staff_record.values.ailment
                            ? ailments.find(
                                (ailment) =>
                                  ailment.disease ===
                                  formik_new_staff_record.values.ailment
                              )?.disease
                            : "Select ailment..."}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Search ailment..." />
                        <CommandList>
                          <CommandEmpty>No such ailment found.</CommandEmpty>
                          <CommandGroup>
                            {ailments.map((ailment) => (
                              <CommandItem
                                key={ailment.disease}
                                onSelect={(currentValue) => {
                                  formik_new_staff_record.setFieldValue(
                                    "ailment",
                                    currentValue ===
                                      formik_new_staff_record.values.ailment
                                      ? ""
                                      : currentValue
                                  );

                                  setOpen(false);
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    formik_new_staff_record.values.ailment ===
                                    ailment.disease
                                      ? "opacity-100"
                                      : "opacity-0"
                                  }`}
                                />
                                {ailment.disease}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="">
                  <label
                    forname={"medication"}
                    className={"text-xs md:text-base"}
                  >
                    Medication
                  </label>
                  <Input
                    name={"medication"}
                    value={formik_new_staff_record.values.medication}
                    type="text"
                    autoComplete={false}
                    placeholder="e.g PCM"
                    className="my-5 outline outline-gray-200 outline-[1px] focus:outline-red-500"
                    onChange={formik_new_staff_record.handleChange}
                  />
                </div>
                <Button
                  variant="outline"
                  className={
                    "flex space-x-1 items-center justify-center bg-green-500 text-white"
                  }
                  type="submit"
                  onClick={formik_new_staff_record.handleSubmit}
                  disabled={!formik.isValid}
                >
                  {loading && <LucideLoader className="w-6 h-6 animate-spin" />}
                  {!loading && (
                    <>
                      <span>Submit</span>
                      <span>
                        <ArrowRight className="w-3 h-4" />
                      </span>
                    </>
                  )}
                </Button>
                <Separator className={"m-2"} />
                <div>
                  {formik_new_staff_record?.errors?.tempReading && (
                    <div className={"flex text-sm text-rose-500"}>
                      <p className={"flex items-center"}>
                        <Dot className={"w-5 h-5"} />
                        {formik_new_staff_record?.errors?.tempReading}
                      </p>
                    </div>
                  )}
                  {formik_new_staff_record?.errors?.ailment && (
                    <div className={"flex text-sm text-rose-500"}>
                      <p className={"flex items-center"}>
                        <Dot className={"w-5 h-5"} />
                        {formik_new_staff_record?.errors?.ailment}
                      </p>
                    </div>
                  )}
                  {formik_new_staff_record?.errors?.complain && (
                    <div className={"flex text-sm text-rose-500"}>
                      <p className={"flex items-center"}>
                        <Dot className={"w-5 h-5"} />
                        {formik_new_staff_record?.errors?.complain}
                      </p>
                    </div>
                  )}
                  {formik_new_staff_record?.errors?.medication && (
                    <div className={"flex text-sm text-rose-500"}>
                      <p className={"flex items-center"}>
                        <Dot className={"w-5 h-5"} />
                        {formik_new_staff_record?.errors?.medication}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )} */}

          {staffData && (
            <>
              <div className="font-mono flex items-center space-x-1">
                <span>{staffData?.idNo}</span>
                <ArrowRight className={"w-5 h-5"} />
                <span className="flex space-x-2">
                  {staffData?.fName}&nbsp;
                  {staffData?.sName}
                </span>
              </div>
              <Separator className={"my-2"} />
              <div className={"font-mono my-3"}>
                <div className="flex flex-col space-y-2">
                  <span className="underline">Temperature Reading</span>
                  <span
                    className={`${
                      staffData?.tempReading > 37
                        ? "text-rose-500"
                        : "text-green-500"
                    }`}
                  >
                    {staffData?.tempReading}
                  </span>
                </div>
              </div>
              <div className={"font-mono my-3"}>
                <div className="flex flex-col space-y-2">
                  <span className="underline">Complains</span>
                  <span>{staffData?.complain}</span>
                </div>
              </div>
              <div className={"font-mono my-3"}>
                <div className="flex flex-col space-y-2">
                  <span className="underline">Ailment</span>
                  <span>{staffData?.ailment}</span>
                </div>
              </div>
              <div className={"font-mono my-3"}>
                <div className="flex flex-col space-y-2">
                  <span className="underline">Medication(s)</span>
                  <span>{staffData?.medication}</span>
                </div>
              </div>
              <div className={"font-mono my-3 w-full"}>
                <div className="flex md:space-x-2 flex-col md:flex-row space-y-2 md:space-y-0">
                  <Button
                    variant={"outline"}
                    className={"flex items-center space-x-2"}
                    onClick={() =>
                      directToPage("/staff/new_record", "new_record")
                    }
                  >
                    <>
                      {!loading && <Plus className="w-4 h-4" />}
                      <span>New Record</span>
                    </>

                    {loading && directingTo == "new_record" && (
                      <Loader className="w-4 h-4 animate-spin" />
                    )}
                  </Button>

                  <Button
                    variant={"outline"}
                    className={"flex items-center space-x-2 w-full"}
                    onClick={() =>
                      directToPage("/staff/update_record", "update_record")
                    }
                  >
                    <Pencil className="w-5 h-5" />
                    <span>Update Record</span>
                    {loading && directingTo == "update_record" && (
                      <Loader className="w-4 h-4 animate-spin" />
                    )}
                  </Button>
                  <Button
                    variant={"destructive"}
                    className={"flex items-center space-x-2"}
                    onClick={() => setStaffData(null)}
                  >
                    <X className="w-5 h-5" />
                    <span>Cancel</span>
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

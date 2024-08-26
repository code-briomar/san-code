import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Dot, Plus } from "lucide-react";
import React from "react";

const NonBusherian = () => {
  // const formik_new_staff_record = useFormik({
  //   enableReinitialize: true,
  //   initialValues: {
  //     id_number: idNo,
  //     fName: "",
  //     sName: "",
  //   },
  //   validationSchema: Yup.object({
  //     fName: Yup.string().required("Temperature Reading is required"),
  //     sName: Yup.string().required("Staff member complain required"),
  //   }),
  //   onSubmit: async (values, formikHelpers) => {
  //     setLoading(true);
  //     // Fetch Staff data with the provided admission number
  //     const staff_data = await createNewStaffRecord(
  //       values.id_number,
  //       values.fName,
  //       values.sName
  //     );

  //     if (staff_data?.status === null || staff_data?.status === undefined) {
  //       toast.error(
  //         "Problem inserting this staff member to the system. Please try again later."
  //       );
  //       setLoading(false);
  //       formikHelpers.resetForm();
  //       return;
  //     }

  //     if (devMode) console.log(staff_data);
  //     setTimeout(() => {
  //       toast.success("Staff member has been added to the system.");
  //       setLoading(false);
  //       setAddNewStaffRecord(false);
  //     }, 1000);
  //   },
  // });
  return (
    <>
      <span className="font-mono text-xs md:text-base flex space-x-2 text-center">
        <Plus className="w-5 h-5" />
        {"Add New Staff Record"}
      </span>
      <div className="flex flex-col justify-center items-center px-1">
        <Separator className={"m-2"} />
        <div className="">
          <label forname={"id_number"} className={"text-xs md:text-base"}>
            ID Number
          </label>
          <Input
            name={"id_number"}
            // value={idNo}
            disabled
            type="text"
            placeholder="e.g 4145689"
            className="my-5 outline outline-gray-200 outline-[1px] focus:outline-red-500"
            // onChange={formik_new_staff_record.handleChange}
          />
        </div>
        <div className="">
          <label forname={"temp_reading"} className={"text-xs md:text-base"}>
            First Name
          </label>
          <Input
            name={"fName"}
            // value={formik_new_staff_record.values.fName}
            type="text"
            placeholder="e.g Alex"
            className="my-5 outline outline-gray-200 outline-[1px] focus:outline-red-500"
            // onChange={formik_new_staff_record.handleChange}
          />
        </div>
        <div className="">
          <label forname={"complain"} className={"text-xs md:text-base"}>
            Second Name
          </label>
          <Input
            name={"sName"}
            // value={formik_new_staff_record.values.sName}
            type="text"
            placeholder="e.g Tobiko"
            className="my-5 outline outline-gray-200 outline-[1px] focus:outline-red-500"
            // onChange={formik_new_staff_record.handleChange}
          />
        </div>
        <Button
          variant="outline"
          className={
            "flex space-x-1 items-center justify-center bg-green-500 text-white"
          }
          type="button"
          // onClick={formik_new_staff_record.handleSubmit}
          // disabled={!formik_new_staff_record.isValid}
        >
          {/* {loading && <LucideLoader className="w-6 h-6 animate-spin" />}
          {!loading && (
            <>
              <span>Submit</span>
              <span>
                <ArrowRight className="w-3 h-4" />
              </span>
            </>
          )} */}
        </Button>
        <Separator className={"m-2"} />
        <div>
          {/* {formik_new_staff_record?.errors?.fName && ( */}
          <div className={"flex text-sm text-rose-500"}>
            <p className={"flex items-center"}>
              <Dot className={"w-5 h-5"} />
              {/* {formik_new_staff_record?.errors?.fName} */}
            </p>
          </div>
          {/* )} */}
          {/* {formik_new_staff_record?.errors?.sName && ( */}
          <div className={"flex text-sm text-rose-500"}>
            <p className={"flex items-center"}>
              <Dot className={"w-5 h-5"} />
              {/* {formik_new_staff_record?.errors?.sName} */}
            </p>
          </div>
          {/* )} */}
        </div>
      </div>
    </>
  );
};

export default NonBusherian;

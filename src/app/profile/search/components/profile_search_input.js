import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { devMode } from "@/lib/dev_mode";
import { useFormik } from "formik";
import { ArrowRight, Dot, LucideLoader } from "lucide-react";
import * as Yup from "yup";
import { fetchStudentData } from "../services";

const ProfileSearchInput = ({ setStudents, setLoading, loading }) => {
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      search: "",
    },
    validationSchema: Yup.object({
      search: Yup.string().required("Admission Number is required"),
    }),
    onSubmit: async (values, formikHelpers) => {
      setLoading(true);
      // Fetch Student data with the provided admission number
      const student_data = await fetchStudentData(values?.search);
      // console.log(student_data);
      // if (student_data.length === 0) {
      //   toast("Student not found. Add their record to the system?", {
      //     action: {
      //       label: "Yes",
      //       onClick: async () => {
      //         // Redirect to add new student
      //       },
      //     },
      //     cancel: {
      //       label: "No",
      //       onClick: () => {
      //         // -> Cancel.
      //       },
      //     },
      //     duration: 600000,
      //     toastOptions: {
      //       autoClose: false,
      //     },
      //   });
      //   setLoading(false);

      //   // Display prompt to add to database
      //   // setPageLoading(false);
      //   formikHelpers.resetForm();
      //   return;
      // }

      if (devMode) console.log(student_data);

      setTimeout(() => {
        setStudents(student_data);
        setLoading(false);
      }, 1000);
    },
  });
  return (
    <>
      <div className="w-1/3 h-full p-8">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="search">Admission Number</Label>
            <Input
              type="search"
              id="search"
              name={"search"}
              value={formik.values.search}
              onChange={formik.handleChange}
              placeholder="e.g 13256"
              className={"border-[#9C9C9C] border-2 no-outline"}
            />
          </div>
          <Button
            variant="outline"
            className={
              "flex space-x-1 items-center justify-center bg-green-500 mt-5"
            }
            type="submit"
            onClick={formik.handleSubmit}
            disabled={!formik.isValid}
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
        <div className="text-gray-500 text-xs my-2">
          Press <kbd className="px-1 border-2 border-gray-300 rounded">Enter</kbd>{" "}
          to search
        </div>
        {formik?.errors?.search && (
          <div className={"flex text-sm text-rose-500"}>
            <p className={"flex items-center"}>
              <Dot className={"w-5 h-5"} />
              {formik?.errors?.search}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfileSearchInput;

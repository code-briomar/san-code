"use client";
import { devMode } from "@/lib/dev_mode";
import Link from "next/link";
import { useState } from "react";
// React-router-dom
import readXlsxFile from "read-excel-file";
import { uploadStudentsExcelData } from "./services";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader, X } from "lucide-react";
import { useRouter } from "next/navigation";
export default function App() {
  const router = useRouter();
  const [excelInfo, setExcelInfo] = useState([]);
  const [admNos, setAdmNos] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleUpload = (e) => {
    readXlsxFile(e.target.files[0]).then((rows) => {
      const admissionNumbers = [];
      for (let i = 1; i < rows.length && i < 5; i++) {
        const admissionNumber = rows[i][4]; // Assuming the admission number is in column 4
        admissionNumbers.push(admissionNumber);
      }
      setAdmNos(admissionNumbers);

      const modifiedRows = rows
        .slice(1)
        .map((row) => [row[0], row[1], ...row.slice(4)]);

      if (devMode) console.log(rows);
      setExcelInfo(rows);
    });
  };

  const uploadExcelFile = async () => {
    try {
      const response = await uploadStudentsExcelData(excelInfo);

      if (devMode) console.log(response);
      if (response.status === 201) {
        if (devMode) console.log(response?.data);
        toast.success(response?.data?.message);

        // // Reset
        // setAdmNos([]);
        // setExcelInfo([]);

        // // Clear the input field
        // document.getElementById("picture").value = "";

        // // Clear the table
        // const table = document.querySelector("table");
        // table.innerHTML = "";

        // // Redirect
        // router.push("/students");
      } else {
        if (devMode)
          console.error("An error occurred while fetching data:", response);
        toast.error("An error occurred while fetching data");
      }
    } catch (error) {
      console.error("An error occurred while fetching data:", error);
      alert("An error occurred while fetching data");
    }
  };

  const columnMapping = {
    firstName: 0,
    secondName: 1,
    thirdName: 2,
    fourthName: 3,
    studentClass: 6,
  };

  let tableContent;

  if (admNos.length > 0 && excelInfo) {
    tableContent = admNos.map((admissionNumber, index) => (
      <tr key={index}>
        <td>{excelInfo[index + 1]?.[columnMapping.firstName]}</td>
        <td>{excelInfo[index + 1]?.[columnMapping.secondName]}</td>
        <td>{excelInfo[index + 1]?.[columnMapping.thirdName]}</td>
        <td>{excelInfo[index + 1]?.[columnMapping.fourthName]}</td>
        <td>{excelInfo[index + 1]?.[columnMapping.studentClass]}</td>
      </tr>
    ));
  } else {
    tableContent = (
      <tr>
        <td colSpan="6">No data to display.</td>
      </tr>
    );
  }

  //Demonstration Image URL
  return (
    <div className="container mx-auto mt-10 text-center">
      <div className="flex justify-between">
        <h4 className="text-2xl font-bold my-4">
          Upload an Excel file with student details:
        </h4>
        <Link href={"/"} className="text-blue-500 underline">
          Home
        </Link>
      </div>

      {/* <GoBackButton destination={"/"} /> */}
      <p className="mb-4">
        The Excel file must adhere to the following column order:
        <strong>First Name, Second Name, Adm No., Class</strong>
      </p>
      <img
        src={"/demonstration.png"}
        alt="Demonstration IMG"
        className="mx-auto mb-4"
      />
      <div className="file-field input-field mb-4">
        <div className="flex flex-col p-8">
          <Label htmlFor="picture" className={"m-2"}>
            Upload Excel File with student details:
          </Label>
          <Input
            id="picture"
            type="file"
            className={`
            border border-gray-300 p-2 rounded w-full
            admNos.length > 0 ? "bg-green-500" : "bg-white"
          `}
            onChange={handleUpload}
          />
        </div>
      </div>

      <div className="flex gap-4 items-center">
        {admNos.length > 0 && (
          <>
            <Button
              className="bg-green-500 text-white px-4 py-2 rounded mt-4"
              variant={"outline"}
              onClick={uploadExcelFile}
            >
              {loading && <Loader className="mr-2" size={20} />}
              Submit Excel File
            </Button>
            <Button
              className="bg-red-500 text-white px-4 py-2 rounded mt-4"
              variant={"outline"}
              onClick={() => {
                // Reset
                setAdmNos([]);
                setExcelInfo([]);

                // Clear the input field
                document.getElementById("picture").value = "";

                // Clear the table
                const table = document.querySelector("table");
                table.innerHTML = "";
              }}
            >
              <X className="mr-2" size={20} />
              Cancel
            </Button>
          </>
        )}
      </div>

      {admNos.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">
            Preview of the excel file:
          </h3>
          <table className="min-w-full bg-white">
            <thead>
              <tr>{/* NO Assumptions */}</tr>
            </thead>
            <tbody>{tableContent}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

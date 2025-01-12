"use client";
import { Loader } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import ProfileSearchInput from "./components/profile_search_input";

const ProfileSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [students, setStudents] = useState();
  const [formattedDate, setFormattedDate] = useState("");

  const loadPage = async () => {
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    loadPage();
  }, []);

  // Enter key pressed to submit form.
  const handleKeyPressed = (e) => {
    if (e.key === "Enter") {
      formik.handleSubmit();
    }
  };

  useEffect(() => {
    // Refresh the cards and results after

    // Convert to Date object
    const date = new Date(students?.timestamp);

    // Extract day, month, and year
    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1; // Month is zero-indexed (0-11)
    const year = date.getUTCFullYear();

    // Format the date as "day - month - year"
    const formattedDate = `${day} - ${month} - ${year}`;

    setFormattedDate(formattedDate); // Output: 20 - 12 - 2023
  }, [students]);

  return (
    <div className="m-10">
      <div className="flex items-center justify-between">
        <h3 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">
          Profile Search
        </h3>

        <Link href={"/"} className="mt-8 text-blue-500 underline">
          Home
        </Link>
      </div>
      <div className="h-[82vh] w-full flex items-center justify-center">
        {isLoading && <Loader className="w-5 h-5 animate-spin" />}

        <>
          {/* Search Input */}
          <ProfileSearchInput
            setLoading={setIsLoading}
            setStudents={setStudents}
            loading={isLoading}
          />
          {!isLoading && students ? (
            <div className="w-3/4">
              <div className="flex gap-6">
                <div
                  className={
                    "w-1/3 h-full flex flex-col px-6 py-4 max-w-[250px] shadow-lg border-black rounded-lg "
                  }
                >
                  <img src={"/user.svg"} alt="user_profile_placeholder" />
                  <div>
                    <h2 className={"font-bold"}>
                      {`${students?.fName} ${students?.sName}`}
                    </h2>
                    <div className={"flex items-center"}>
                      <img
                        src={"/student-fill.svg"}
                        alt="student-fill"
                        className={"w-6"}
                      />
                      <span>{`${students?.class}`}</span>
                    </div>
                    <div className={"flex items-center"}>
                      <img
                        src={"/clock-fill.svg"}
                        alt="clock-fill"
                        className={"w-6"}
                      />
                      <span>{`${formattedDate}`}</span>
                    </div>
                  </div>
                </div>

                <div className="w-2/3 h-full">
                  <h1 className="w-full flex items-start font-bold">History</h1>

                  <div className="p-4 bg-transparent rounded-lg mt-4">
                    <p>
                      <strong>Record ID:</strong> {students?.recordID}
                    </p>
                    <p>
                      <strong>Admission Number:</strong> {students?.admNo}
                    </p>
                    <p>
                      <strong>Name:</strong>{" "}
                      {`${students?.fName} ${students?.sName}`}
                    </p>
                    <p>
                      <strong>Class:</strong> {`${students?.class}`}
                    </p>
                    <p>
                      <strong>Temperature Reading:</strong>{" "}
                      {students?.tempReading}
                    </p>
                    <p>
                      <strong>Complaint:</strong> {students?.complain}
                    </p>
                    <p>
                      <strong>Ailment:</strong> {students?.ailment}
                    </p>
                    <p>
                      <strong>Medication:</strong> {students?.medication}
                    </p>
                    <p>
                      <strong>Last time here:</strong> {formattedDate}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-3/4"></div>
          )}
        </>
      </div>
    </div>
  );
};

export default ProfileSearch;

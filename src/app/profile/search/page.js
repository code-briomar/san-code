"use client";
import { Loader } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import ProfileSearchInput from "./components/profile_search_input";

const ProfileSearch = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loadPage = async () => {
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    loadPage();
  }, []);

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
        {!isLoading && (
          <>
            {/* Search Input */}
            <ProfileSearchInput />

            <div className="w-3/4 h-full bg-rose-500">
              <h1 className="w-full flex items-start bg-green-500">
                35 results
              </h1>

              <div className="grid col-span-3 gap-4">
                <div className={"w-full"}>
                  <Image
                    src={"./public/user.svg"}
                    width={"300"}
                    height={"400"}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileSearch;

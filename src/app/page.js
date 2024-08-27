"use client";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    console.log(
      "%c This project is developed by Briomar",
      "Github: https://github.com/code-briomar",
      "background: #222; color: #bada55"
    );
  }, []);
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        {/* Title bar */}
        <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
          <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
            Manage student health records with
            <code className="font-mono font-bold">&nbsp;SanCode</code>
          </p>
          <div className="fixed flex flex-column bottom-0 left-0 flex h-48 w-full items-center px-10 justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
            <a
              className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
              href="https://lomogantech.co.ke"
              target="_blank"
              rel="noopener noreferrer"
            >
              By{" "}
              <Image
                src="/lomogan-logo.ico"
                alt="Vercel Logo"
                className="rounded-lg"
                width={100}
                height={24}
                priority
              />
            </a>
            <p className="lg:mx-1 pointer-events-none text-xs md:text-sm opacity-50 lg:pointer-events-auto">
              LomoganTech
            </p>
          </div>
        </div>

        {/* Links : students, staff, report and analytics, upload student details */}
        <div className="md:my-32 sm:mb-32 grid text-center lg:w-full lg:mb-0 lg:grid-cols-5 lg:text-left">
          <a
            href="/students"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          >
            <h2 className={`mb-3 text-2xl font-semibold`}>
              Students{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                <ArrowRight className="w-5 h-5" />
              </span>
            </h2>
            <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
              Manage student health records.
            </p>
          </a>

          <a
            href="/staff"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800 hover:dark:bg-opacity-30"
          >
            <h2 className={`mb-3 text-2xl font-semibold`}>
              Staff{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                <ArrowRight className="w-5 h-5" />
              </span>
            </h2>
            <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
              Manage staff health records.
            </p>
          </a>

          <a
            href="/report"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          >
            <h2 className={`mb-3 text-2xl font-semibold`}>
              Report{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                <ArrowRight className="w-5 h-5" />
              </span>
            </h2>
            <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
              View generated reports of the student and staff records.
            </p>
          </a>
          <a
            href="/analytics"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          >
            <h2 className={`mb-3 text-2xl font-semibold`}>
              Analytics{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                <ArrowRight className="w-5 h-5" />
              </span>
            </h2>
            <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
              View generated analytics of the student and staff records.
            </p>
          </a>

          <a
            href="/upload-students"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          >
            <h2 className={`mb-3 text-2xl font-semibold`}>
              Upload Student Details{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                <ArrowRight className="w-5 h-5" />
              </span>
            </h2>
            <p className={`m-0 max-w-[30ch] text-sm opacity-50 text-balance`}>
              Upload new students to the system to easily track their health
              records.
            </p>
          </a>
        </div>
      </main>
    </>
  );
}

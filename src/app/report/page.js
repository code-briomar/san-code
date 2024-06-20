import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ailments } from "../staff/ailments";
import Link from "next/link";

const Report = () => {
  const diseases = [
    "Diarrhoea",
    "Tuberculosis",
    "Dysentery (Bloody Diarrhoea)",
    "Cholera",
    "Meningococcal Meningitis",
    "Other Meningitis",
    "Tetanus",
    "Poliomyelitis (AFP)",
    "Chicken Pox",
    "Measles",
    "Hepatitis",
    "Mumps",
    "Fevers",
    "Suspected Malaria",
    "Confirmed Malaria (Only Positive Cases)",
    "Malaria in Pregnancy",
    "Typhoid Fever",
    "Sexually Transmitted Infections",
  ];

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <>
      <div className="m-10">
        <div className="flex items-center justify-between">
          <h3 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">
            Official Report
          </h3>

          <Link href={"/"} className="text-blue-500 underline">
            Home
          </Link>
        </div>
        <Table className="table-auto border-collapse border">
          <TableHeader className="bg-gray-200">
            <TableRow>
              <TableCell className="border border-gray-300">
                Diseases (First Cases Only)
              </TableCell>
              {days.map((day) => (
                <TableCell key={day} className="border border-gray-300">
                  {day}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {ailments.map((ailment) => (
              <TableRow key={ailment.disease}>
                <TableCell className="border border-gray-300 p-1 min-w-[300px]">
                  {ailment.disease}
                </TableCell>
                {days.map((day) => (
                  <TableCell key={day} className="border border-gray-300">
                    0
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default Report;

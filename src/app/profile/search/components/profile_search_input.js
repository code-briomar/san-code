import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";

const ProfileSearchInput = () => {
  return (
    <>
      <div className="w-1/3 h-full p-8">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="email">Admission Number</Label>
            <Input
              type="email"
              id="email"
              placeholder="e.g 13256"
              className={"border-[#9C9C9C] border-2 no-outline"}
            />
          </div>
          <Button
            type="submit"
            className={
              "mt-5 flex items-center justify-center space-x-2 bg-transparent border border-2 hover:border-black text-black hover:bg-transparent border-[#9C9C9C]"
            }
          >
            <span>Search</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-gray-500 text-xs my-2">
          Press <kbd className="px-1 border border-gray-300 rounded">Enter</kbd>{" "}
          to search
        </div>
      </div>
    </>
  );
};

export default ProfileSearchInput;

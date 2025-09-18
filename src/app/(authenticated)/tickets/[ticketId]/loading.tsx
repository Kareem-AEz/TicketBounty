import React from "react";
import Spinner from "@/components/spinner";

function loading() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Spinner />
    </div>
  );
}

export default loading;

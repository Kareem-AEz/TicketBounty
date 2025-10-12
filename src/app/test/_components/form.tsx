import React from "react";
import SubmitButton from "@/components/form/submit-button";

export function FormTest() {
  const action = async (formData: FormData) => {
    "use server";
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log(formData);
  };

  return (
    <form action={action}>
      <input type="text" name="name" />
      <SubmitButton>Submit</SubmitButton>
    </form>
  );
}

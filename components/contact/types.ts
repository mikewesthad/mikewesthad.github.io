/**
 * Patch in non-exported types from @formspree, so that things play nicely
 * with type safety in TS.
 */

import React from "react";
import { useForm } from "@formspree/react";

interface ErrorPayload {
  field?: string;
  code: string | null;
  message: string;
}

type useFormReturn = ReturnType<typeof useForm>;

declare type FormEvent = React.FormEvent<HTMLFormElement>;

declare type SubmitHandler = useFormReturn[1];

declare type UseFormState = useFormReturn[0];

export type { ErrorPayload, FormEvent, SubmitHandler, UseFormState };

/**
 * Patch in non-exported types from @formspree, so that things play nicely
 * with type safety in TS.
 */

import React from "react";
import { SubmissionResponse, SubmissionData } from "@formspree/core/forms";

interface ErrorPayload {
  field?: string;
  code: string | null;
  message: string;
}

declare type FormEvent = React.FormEvent<HTMLFormElement>;

declare type SubmitHandler = (
  submissionData: FormEvent | SubmissionData
) => Promise<SubmissionResponse>;

declare type UseFormState = {
  submitting: boolean;
  succeeded: boolean;
  errors: ErrorPayload[];
};

export type { ErrorPayload, FormEvent, SubmitHandler, UseFormState };

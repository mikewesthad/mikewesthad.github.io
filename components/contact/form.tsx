import { ValidationError } from "@formspree/react";
import cn from "classnames";
import { SubmitHandler, UseFormState } from "./types";
import css from "./form.module.scss";

interface FormProps {
  state: UseFormState;
  handleSubmit: SubmitHandler;
}

function Form({ state, handleSubmit }: FormProps) {
  return (
    <form className={css.form} onSubmit={handleSubmit}>
      <fieldset disabled={state.submitting}>
        <div className={css.row}>
          <label htmlFor="name">Name</label>
          <input required type="text" name="name" id="name" />
          <ValidationError prefix="Name" field="name" errors={state.errors} />
        </div>
        <div className={css.row}>
          <label htmlFor="email">Email</label>
          <input required type="email" name="email" id="email" />
          <ValidationError prefix="Email" field="email" errors={state.errors} />
        </div>
        <div className={css.row}>
          <label htmlFor="message">Message</label>
          <textarea required rows={4} name="message" id="message" />
          <ValidationError prefix="Message" field="message" errors={state.errors} />
        </div>
        <div className={css.row}>
          <button type="submit" disabled={state.submitting}>
            {state.submitting ? "Sending..." : "Send →"}
          </button>
        </div>
        {state.succeeded && (
          <div className={cn(css.row, css.successMessage)}>
            <p>Message successfully sent! Thanks for reaching out.</p>
          </div>
        )}
      </fieldset>
    </form>
  );
}

export default Form;
export type { FormProps };

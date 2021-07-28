import * as React from "react";
import { useForm, ValidationError } from "@formspree/react";
import PageTitle from "../components/page-title";
import Container from "../components/container/container";

type FormProps = {
  state: any;
  handleSubmit: any;
};

const Form = ({ state, handleSubmit }: FormProps) => {
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name</label>
        <input required type="text" name="name" id="name" />
        <ValidationError prefix="Name" field="name" errors={state.errors} />
      </div>
      <div>
        <label htmlFor="email">Email</label>
        <input required type="email" name="email" id="email" />
        <ValidationError prefix="Email" field="email" errors={state.errors} />
      </div>
      <div>
        <label htmlFor="message">Message</label>
        <textarea required rows={4} name="message" id="message" />
        <ValidationError prefix="Message" field="message" errors={state.errors} />
      </div>
      <button type="submit" disabled={state.submitting}>
        {state.submitting ? "Submitting..." : "Submit →"}
      </button>
    </form>
  );
};

const ContactPage = () => {
  const [state, handleSubmit] = useForm("mqkwbzyb");

  return (
    <Container>
      <PageTitle>Contact</PageTitle>
      <main>
        <h1>Get in Touch</h1>
        <p>
          Looking to run a workshop on creative coding? Have a creative vision you want to bring to
          life? Or, maybe you just want to say hello? Drop me a line.
        </p>
        {state.succeeded ? (
          <p>Message sent! Thanks for reaching out.</p>
        ) : (
          <Form state={state} handleSubmit={handleSubmit} />
        )}
      </main>
    </Container>
  );
};

export default ContactPage;

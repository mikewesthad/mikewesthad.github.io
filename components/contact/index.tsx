import { useForm } from "@formspree/react";
import PageTitle from "components/page-title";
import Section from "components/container/section";
import Form from "./form";

interface ContactProps {}

function Contact({}: ContactProps) {
  const [state, handleSubmit] = useForm("mqkwbzyb");

  return (
    <main>
      <PageTitle>Contact</PageTitle>
      <Section>
        <h1>Get in Touch</h1>
        <p>
          Looking to run a workshop on creative coding? Have a creative vision you want to bring to
          life? Or, maybe you just want to say hello? Drop me a line.
        </p>
        <Form state={state} handleSubmit={handleSubmit} />
      </Section>
    </main>
  );
}

export default Contact;
export type { ContactProps };

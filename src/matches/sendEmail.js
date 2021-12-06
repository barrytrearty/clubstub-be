import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async (content, receiverEmail) => {
  const msg = {
    to: receiverEmail,
    from: "btrearty@gmail.com",
    subject: "GAA Tickets",
    text: `${content}`,
    html: `<strong>${content}</strong>`,
  };
  await sgMail.send(msg);
};

import nodemailer from "nodemailer";

const hasSmtpConfig = () => process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

export const sendEmail = async ({ to, subject, html, text }) => {
  if (!hasSmtpConfig()) {
    console.log(`Email skipped: ${subject} -> ${to}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
    text
  });
};

export const sendOrderEmail = async (user, order, subject) => {
  await sendEmail({
    to: user.email,
    subject,
    text: `Your order ${order._id} is now ${order.status}.`,
    html: `<p>Hello ${user.name},</p><p>Your order <strong>${order._id}</strong> is now <strong>${order.status}</strong>.</p>`
  });
};

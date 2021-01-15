const nodemailer = require("nodemailer");
const config = require("config");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "lipoveckadmsh@gmail.com",
    pass: config.get("emailPassword"),
  },
});

const buildResetPasswordTemplate = (user, url) => {
  const from = "lipoveckadmsh@gmail.com";
  const to = user.email;
  const subject = "Music School - reset password";
  const html = `
  <p>Hello ${user.name || user.email},</p>
  <p>We heard that you lost your password. Sorry about that!</p>
  <p>But don’t worry! You can use the following link to reset your password:</p>
  <a href="${url}">${url}</a>
  <p>If you don’t use this link within 10 minutes, it will expire.</p>
  <p>If you didn't send request to reset your password just ingore this Email.</p>
  `;

  return { from, to, subject, html };
};

module.exports = {
  transporter,
  buildResetPasswordTemplate,
};

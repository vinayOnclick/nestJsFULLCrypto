import * as nodeMailer from 'nodemailer';
import * as SendGrid from 'nodemailer-sendgrid-transport';
export class NodeMailer {
  static initializeTransport() {
    return nodeMailer.createTransport(
      SendGrid({
        service: process.env.mailer_service,
        auth: {
          api_key: process.env.API_KEY,
        },
      }),
    );
  }

  static async sendEmail(data: {
    from: string;
    to: string;
    subject: string;
    html: string;
  }): Promise<any> {
    try {
      const sent=await NodeMailer.initializeTransport().sendMail({
        from: process.env.API_USER,
        to: data.to,
        subject: data.subject,
        html: data.html,
      });
    console.log(sent)
return sent
    } catch (error) {
      console.log(error);
    }

  }
}

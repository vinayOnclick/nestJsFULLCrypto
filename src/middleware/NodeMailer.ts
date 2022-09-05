import * as nodeMailer from 'nodemailer';
import * as SendGrid from 'nodemailer-sendgrid-transport';
import configVinay from 'src/config/configVinay';
export class NodeMailer
{
    static initializeTransport()
   {
       return nodeMailer.createTransport(SendGrid({
           service: configVinay.mailer_service,
           auth:{

               api_key: configVinay.API_KEY
           }
           }

       ));
   }

  static async sendEmail(data:{from:string,to:string,subject:string,html:string}):Promise<any>
   {
       return await NodeMailer.initializeTransport().sendMail({
           from:configVinay.USER,
           to:data.to,
           subject:data.subject,
           html:data.html
       })
   }
}



   
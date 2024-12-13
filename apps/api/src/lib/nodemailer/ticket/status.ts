import handlebars from "handlebars";
import { prisma } from "../../../prisma";
import { createTransportProvider } from "../transport";

export async function sendTicketStatus(ticket: any) {
  const email = await prisma.email.findFirst();

  if (email) {
    const transport = await createTransportProvider();

    const testhtml = await prisma.emailTemplate.findFirst({
      where: {
        type: "ticket_status_changed",
      },
    });

    var template = handlebars.compile(testhtml?.html);
    const subject = testhtml?.subject || "Default Subject";
    var replacements = {
      title: ticket.title,
      status: ticket.isComplete ? "COMPLETED" : "OUTSTANDING",
    };
    var htmlToSend = template(replacements);

    await transport
      .sendMail({
        from: email?.reply, 
        to: ticket.email,
        subject: subject.replace('{title}', ticket.title).replace('{ticket.Number}', ticket.Number).replace('{ticket.status}',
          ticket.isComplete ? "COMPLETED" : "OUTSTANDING"
        ),
        text: `Hello there, Issue #${ticket.Number}, now has a status of ${
          ticket.isComplete ? "COMPLETED" : "OUTSTANDING"
        }`,
        html: htmlToSend,
      })
      .then((info: any) => {
        console.log("Message sent: %s", info.messageId);
      })
      .catch((err: any) => console.log(err));
  }
}

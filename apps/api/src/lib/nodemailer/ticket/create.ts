import handlebars from "handlebars";
import { prisma } from "../../../prisma";
import { createTransportProvider } from "../transport";

export async function sendTicketCreate(ticket: any) {
  try {
    const email = await prisma.email.findFirst();

    if (email) {
      const transport = await createTransportProvider();

      const testhtml = await prisma.emailTemplate.findFirst({
        where: {
          type: "ticket_created",
        },
      });

      var template = handlebars.compile(testhtml?.html);
      const subject = testhtml?.subject || "Default Subject";
      var replacements = {
        id: ticket.id,
      };
      var htmlToSend = template(replacements);

      await transport
        .sendMail({
          from: email?.reply,
          to: ticket.email,
          subject: subject.replace('{id}', ticket.id),
          text: `Hello there, Issue #${ticket.id}, which you reported on ${ticket.createdAt}, has now been created and logged`,
          html: htmlToSend,
        })
        .then((info: any) => {
          console.log("Message sent: %s", info.messageId);
        })
        .catch((err: any) => console.log(err));
    }
  } catch (error) {
    console.log(error);
  }
}

import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface IdentifyPayload {
  email?: string;
  phoneNumber?: string;
}

export const handleIdentify = async ({ email, phoneNumber }: IdentifyPayload) => {
  if (!email && !phoneNumber) {
    throw new Error('At least email or phoneNumber must be provided');
  }

  const orConditions: Prisma.ContactWhereInput[] = [];
  if (email) orConditions.push({ email });
  if (phoneNumber) orConditions.push({ phoneNumber });

  const matchingContacts = await prisma.contact.findMany({
    where: {
      OR: orConditions,
    },
    orderBy: { createdAt: 'asc' },
  });

  if (matchingContacts.length === 0) {
    const newContact = await prisma.contact.create({
      data: {
        email: email || '',
        phoneNumber: phoneNumber || '',
        linkPrecedence: 'primary',
        deletedAt: null,
      },
    });
    return {
      primaryContatctId: newContact.id,
      emails: [newContact.email].filter(Boolean),
      phoneNumbers: [newContact.phoneNumber].filter(Boolean),
      secondaryContactIds: [],
    };
  }

  let contactMap = new Map<string, any>();
  for (const contact of matchingContacts) {
    const rootId = contact.linkPrecedence === 'primary' ? contact.id : contact.linkedId!;
    const related = await prisma.contact.findMany({
      where: {
        OR: [
          { id: rootId },
          { linkedId: rootId },
        ],
      },
    });
    related.forEach(c => contactMap.set(c.id, c));
  }
  let allContacts = [...contactMap.values()].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  let primary = allContacts.find(c => c.linkPrecedence === 'primary') || allContacts[0];

  const hasEmail = allContacts.some(c => c.email === email);
  const hasPhone = allContacts.some(c => c.phoneNumber === phoneNumber);
  const bothPresent = allContacts.some(c => c.email === email && c.phoneNumber === phoneNumber);

  if (!bothPresent && (hasEmail || hasPhone)) {

    const newContact = await prisma.contact.create({
      data: {
        email: email || '',
        phoneNumber: phoneNumber || '',
        linkPrecedence: 'secondary',
        linkedId: primary.id,
        deletedAt: null,
      },
    });
    allContacts.push(newContact);
  }

  const primaries = allContacts.filter(c => c.linkPrecedence === 'primary');
  if (primaries.length > 1) {
    primaries.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const oldestPrimary = primaries[0];
    for (let i = 1; i < primaries.length; i++) {
      const toSecondary = primaries[i];
      await prisma.contact.update({
        where: { id: toSecondary.id },
        data: {
          linkPrecedence: 'secondary',
          linkedId: oldestPrimary.id,
        },
      });
      await prisma.contact.updateMany({
        where: { linkedId: toSecondary.id },
        data: { linkedId: oldestPrimary.id },
      });
    }
    primary = oldestPrimary;
    allContacts = await prisma.contact.findMany({
      where: {
        OR: [
          { id: primary.id },
          { linkedId: primary.id },
        ],
      },
    });
  }

  const emails = Array.from(new Set(allContacts.map(c => c.email).filter(Boolean)));
  const phoneNumbers = Array.from(new Set(allContacts.map(c => c.phoneNumber).filter(Boolean)));
  const secondaryContactIds = allContacts.filter(c => c.linkPrecedence === 'secondary').map(c => c.id);

  return {
    primaryContatctId: primary.id,
    emails,
    phoneNumbers,
    secondaryContactIds,
  };
};

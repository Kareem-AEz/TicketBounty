import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/client";
import { MembershipRole } from "@/generated/enums";

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const patchOneMemberOrganizations = async () => {
  console.log(
    `${colors.cyan}→ Starting patch for one-member organizations...${colors.reset}`,
  );

  const organizations = await prisma.organization.findMany({
    where: {},
    include: {
      memberships: true,
    },
  });

  let patchedCount = 0;

  for (const organization of organizations) {
    if (organization.memberships.length === 1) {
      console.log(
        `${colors.yellow}[PATCHING]${colors.reset} Organization ${organization.id} has one member`,
      );
      await prisma.membership.update({
        where: {
          userId_organizationId: {
            userId: organization.memberships[0].userId,
            organizationId: organization.id,
          },
        },
        data: {
          membershipRole: MembershipRole.ADMIN,
        },
      });
      patchedCount++;
    }
  }

  console.log(
    `${colors.green}✓ SUMMARY${colors.reset} Patched ${patchedCount} organization${patchedCount !== 1 ? "s" : ""} that had only one member.`,
  );
};

patchOneMemberOrganizations()
  .then(() => {
    console.log(
      `${colors.green}✓ DONE${colors.reset} Successfully patched one-member organizations`,
    );
    process.exit(0);
  })
  .catch((error) => {
    console.error(
      `${colors.red}✗ ERROR${colors.reset} Failed to patch one-member organizations:`,
      error,
    );
    process.exit(1);
  });

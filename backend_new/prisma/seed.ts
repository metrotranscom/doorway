import { PrismaClient } from '@prisma/client';
import { amiChartFactory } from './seed-helpers/ami-chart-factory';
import { jurisdictionFactory } from './seed-helpers/jurisdiction-factory';
import { listingFactory } from './seed-helpers/listing-factory';
import { reservedCommunityTypeFactory } from './seed-helpers/reserved-community-type-factory';
import { unitTypeFactory } from './seed-helpers/unit-type-factory';

const prisma = new PrismaClient();
async function main() {
  const jurisdiction = await prisma.jurisdictions.create({
    data: jurisdictionFactory(0),
  });
  const amiChart = await prisma.amiChart.create({
    data: amiChartFactory(10, jurisdiction.id),
  });
  const reservedCommunityType = await prisma.reservedCommunityTypes.create({
    data: reservedCommunityTypeFactory(6, jurisdiction.id),
  });

  const unitTypeIds: string[] = [];
  for (let i = 0; i < 7; i++) {
    const res = await prisma.unitTypes.create({
      data: unitTypeFactory(i),
    });
    unitTypeIds.push(res.id);
  }

  for (let i = 0; i < 5; i++) {
    await prisma.listings.create({
      data: listingFactory(
        i,
        jurisdiction.id,
        amiChart.id,
        reservedCommunityType.id,
        unitTypeIds[i],
      ),
    });
  }
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

import subprocess
import sys

script = '''
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const school = await prisma.school.findFirst({ where: { subdomain: 'blessinghope' } });
  if (!school) { console.log('School not found'); return; }
  const schoolId = school.id;
  console.log('School ID:', schoolId);

  const junior = await prisma.feePackage.upsert({
    where: { schoolId_name: { schoolId, name: 'Junior Package' } },
    update: {},
    create: { schoolId, name: 'Junior Package', description: 'Junior (N1) monthly plan', annualFee: 240000, installmentType: 'MONTHLY', installmentCount: 12, installmentAmount: 20000, siblingDiscountEnabled: true, siblingDiscountPercentage: 10 },
  });
  console.log('Junior Package:', junior.id);

  const middle = await prisma.feePackage.upsert({
    where: { schoolId_name: { schoolId, name: 'Middle Package' } },
    update: {},
    create: { schoolId, name: 'Middle Package', description: 'Middle (N2) monthly plan', annualFee: 240000, installmentType: 'MONTHLY', installmentCount: 12, installmentAmount: 20000, siblingDiscountEnabled: true, siblingDiscountPercentage: 10 },
  });
  console.log('Middle Package:', middle.id);

  const senior = await prisma.feePackage.upsert({
    where: { schoolId_name: { schoolId, name: 'Senior Package' } },
    update: {},
    create: { schoolId, name: 'Senior Package', description: 'Senior (N3) monthly plan', annualFee: 240000, installmentType: 'MONTHLY', installmentCount: 12, installmentAmount: 20000, siblingDiscountEnabled: true, siblingDiscountPercentage: 10 },
  });
  console.log('Senior Package:', senior.id);

  const hostel = await prisma.feePackage.upsert({
    where: { schoolId_name: { schoolId, name: 'Hostel Package' } },
    update: {},
    create: { schoolId, name: 'Hostel Package', description: 'Hostel accommodation for pre-primary', annualFee: 390000, installmentType: 'MONTHLY', installmentCount: 12, installmentAmount: 32500, hostelAvailable: true },
  });
  console.log('Hostel Package:', hostel.id);

  const primary = await prisma.feePackage.upsert({
    where: { schoolId_name: { schoolId, name: 'Primary Package' } },
    update: {},
    create: { schoolId, name: 'Primary Package', description: 'Primary termly plan', annualFee: 500000, installmentType: 'QUARTERLY', installmentCount: 4, installmentAmount: 125000, hostelAvailable: true, hostelAnnualFee: 390000, hostelInstallment: 97500 },
  });
  console.log('Primary Package:', primary.id);

  await prisma.feePackage.deleteMany({ where: { schoolId, name: 'Nursery Monthly' } });
  console.log('Deleted Nursery Monthly package');

  const classList = await prisma.class.findMany({ where: { isActive: true } });
  const classMap = {}; classList.forEach(c => { classMap[c.name] = c.id; });
  console.log('Classes:', classMap);

  const junior = await prisma.feePackage.findFirst({ where: { schoolId, name: 'Junior Package' } });
  const middle = await prisma.feePackage.findFirst({ where: { name: 'Middle Package', schoolId } });
  const senior = await prisma.feePackage.findFirst({ where: { name: 'Senior Package', schoolId } });
  const primary = await prisma.feePackage.findFirst({ where: { schoolId, name: 'Primary Package' } });

  const pkgMap = {
    'N1': junior?.id,
    'N2': middle?.id,
    'N3': senior?.id,
    'CL1': primary?.id,
    'CL2': primary?.id,
    'CL3': primary?.id,
    'CL4': primary?.id,
  };

  const classList = await prisma.class.findMany({ where: { isActive: true } });
  const classMap = {}; classList.forEach(c => { classMap[c.name] = c.id; });

  for (const [className, pkgId] of Object.entries(pkgMap)) {
    if (pkgId && classMap[className]) {
      await prisma.feePackageClass.upsert({
        where: { feePackageId_classId: { feePackageId: pkgId, classId: classMap[className] } },
        update: {},
        create: { feePackageId: pkgId, classId: classMap[className] },
      });
      console.log('Linked', className, 'to package');
    }
  }

  const hostel = await prisma.feePackage.findFirst({ where: { schoolId, name: 'Hostel Package' } });
  if (hostel) {
    for (const cls of ['N1', 'N2', 'N3']) {
      if (classMap[cls]) {
        await prisma.feePackageClass.upsert({
          where: { feePackageId_classId: { feePackageId: hostel.id, classId: classMap[cls] } },
          update: {},
          create: { feePackageId: hostel.id, classId: classMap[cls] },
        });
      }
    }
  }

  console.log('Done!');
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
'''

with open('fix-packages.js', 'w') as f:
    f.write(script)
print('File written')
" 2>&1

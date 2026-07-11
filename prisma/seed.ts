import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Race-safe document numbers via the DB function (RCP-2026-00001 etc.)
async function nextNumber(schoolId: string, scope: string, prefix: string): Promise<string> {
  const rows = await prisma.$queryRaw<{ num: string }[]>(
    Prisma.sql`SELECT next_document_number(${schoolId}, ${scope}, ${prefix}) AS num`
  );
  return rows[0].num;
}

async function main() {
  console.log('Seeding Blessing Hope v2.0 ...');

  // --- Super Admin (no school) ---
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@blessinghope.co.tz' },
    update: {},
    create: {
      email: 'admin@blessinghope.co.tz',
      passwordHash: await bcrypt.hash('BhAdmin!2026$ecure', 12),
      fullName: 'System Super Admin',
      phone: '+255700000000',
      role: 'SUPER_ADMIN',
    },
  });

  // --- School (tenant) ---
  const school = await prisma.school.upsert({
    where: { subdomain: 'blessinghope' },
    update: {},
    create: {
      name: 'Blessing Hope Pre & Primary School',
      subdomain: 'blessinghope',
      phone: '+255712345678',
      email: 'info@blessinghope.co.tz',
      address: 'Dar es Salaam, Tanzania',
      bankName: 'CRDB',
      bankAccount: '0152961139900',
      bankAccountName: 'Blessing Hope School',
      academicYearStart: new Date('2026-01-01'),
      academicYearEnd: new Date('2026-12-31'),
    },
  });

  // --- School Admin (bursar) ---
  const bursar = await prisma.user.upsert({
    where: { email: 'bursar@blessinghope.co.tz' },
    update: {},
    create: {
      email: 'bursar@blessinghope.co.tz',
      passwordHash: await bcrypt.hash('Bursar!Bh2026$afe', 12),
      fullName: 'School Bursar',
      phone: '+255712000001',
      role: 'ADMIN',
      schoolId: school.id,
    },
  });

  // --- Academic Year ---
  const year = await prisma.academicYear.upsert({
    where: { schoolId_year: { schoolId: school.id, year: 2026 } },
    update: {},
    create: {
      schoolId: school.id,
      year: 2026,
      name: '2026 Academic Year',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      isActive: true,
      isCurrent: true,
    },
  });

  // --- Classes ---
  const classDefs = [
    { name: 'N1', level: 'PRE_PRIMARY' as const, sortOrder: 1 },
    { name: 'N2', level: 'PRE_PRIMARY' as const, sortOrder: 2 },
    { name: 'N3', level: 'PRE_PRIMARY' as const, sortOrder: 3 },
    { name: 'CL1', level: 'PRIMARY' as const, sortOrder: 4 },
    { name: 'CL2', level: 'PRIMARY' as const, sortOrder: 5 },
    { name: 'CL3', level: 'PRIMARY' as const, sortOrder: 6 },
    { name: 'CL4', level: 'PRIMARY' as const, sortOrder: 7 },
  ];
  const classes: Record<string, string> = {};
  for (const c of classDefs) {
    const cls = await prisma.class.upsert({
      where: { schoolId_name: { schoolId: school.id, name: c.name } },
      update: {},
      create: { schoolId: school.id, ...c },
    });
    classes[c.name] = cls.id;
  }

  // --- Fee Packages ---
  // Junior Package (N1) - Monthly 20,000 × 12 = 240,000
  const junior = await prisma.feePackage.upsert({
    where: { schoolId_name: { schoolId: school.id, name: 'Junior Package' } },
    update: {},
    create: {
      schoolId: school.id,
      name: 'Junior Package',
      description: 'Junior (N1) monthly plan',
      annualFee: 240000,
      installmentType: 'MONTHLY',
      installmentCount: 12,
      installmentAmount: 20000,
      siblingDiscountEnabled: true,
      siblingDiscountPercentage: 10,
    },
  });

  // Middle Package (N2) - Monthly 20,000 × 12 = 240,000
  const middle = await prisma.feePackage.upsert({
    where: { schoolId_name: { schoolId: school.id, name: 'Middle Package' } },
    update: {},
    create: {
      schoolId: school.id,
      name: 'Middle Package',
      description: 'Middle (N2) monthly plan',
      annualFee: 240000,
      installmentType: 'MONTHLY',
      installmentCount: 12,
      installmentAmount: 20000,
      siblingDiscountEnabled: true,
      siblingDiscountPercentage: 10,
    },
  });

  // Senior Package (N3) - Monthly 20,000 × 12 = 240,000
  const senior = await prisma.feePackage.upsert({
    where: { schoolId_name: { schoolId: school.id, name: 'Senior Package' } },
    update: {},
    create: {
      schoolId: school.id,
      name: 'Senior Package',
      description: 'Senior (N3) monthly plan',
      annualFee: 240000,
      installmentType: 'MONTHLY',
      installmentCount: 12,
      installmentAmount: 20000,
      siblingDiscountEnabled: true,
      siblingDiscountPercentage: 10,
    },
  });

  // Hostel Package (for N1, N2, N3 with hostel)
  const hostel = await prisma.feePackage.upsert({
    where: { schoolId_name: { schoolId: school.id, name: 'Hostel Package' } },
    update: {},
    create: {
      schoolId: school.id,
      name: 'Hostel Package',
      description: 'Hostel accommodation for pre-primary',
      annualFee: 390000,
      installmentType: 'MONTHLY',
      installmentCount: 12,
      installmentAmount: 32500,
      hostelAvailable: true,
    },
  });

  const primary = await prisma.feePackage.upsert({
    where: { schoolId_name: { schoolId: school.id, name: 'Primary Package' } },
    update: {},
    create: {
      schoolId: school.id,
      name: 'Primary Package',
      description: 'Primary termly plan',
      annualFee: 500000,
      installmentType: 'QUARTERLY',
      installmentCount: 4,
      installmentAmount: 125000,
      hostelAvailable: true,
      hostelAnnualFee: 390000,
      hostelInstallment: 97500,
    },
  });

  // link packages to classes
  // N1 -> Junior Package
  await prisma.feePackageClass.upsert({
    where: { feePackageId_classId: { feePackageId: junior.id, classId: classes['N1'] } },
    update: {},
    create: { feePackageId: junior.id, classId: classes['N1'] },
  });
  // N2 -> Middle Package
  await prisma.feePackageClass.upsert({
    where: { feePackageId_classId: { feePackageId: middle.id, classId: classes['N2'] } },
    update: {},
    create: { feePackageId: middle.id, classId: classes['N2'] },
  });
  // N3 -> Senior Package
  await prisma.feePackageClass.upsert({
    where: { feePackageId_classId: { feePackageId: senior.id, classId: classes['N3'] } },
    update: {},
    create: { feePackageId: senior.id, classId: classes['N3'] },
  });
  // N1, N2, N3 can also have hostel
  for (const name of ['N1', 'N2', 'N3']) {
    await prisma.feePackageClass.upsert({
      where: { feePackageId_classId: { feePackageId: hostel.id, classId: classes[name] } },
      update: {},
      create: { feePackageId: hostel.id, classId: classes[name] },
    });
  }
  // CL1-CL4 -> Primary Package
  for (const name of ['CL1', 'CL2', 'CL3', 'CL4']) {
    await prisma.feePackageClass.upsert({
      where: { feePackageId_classId: { feePackageId: primary.id, classId: classes[name] } },
      update: {},
      create: { feePackageId: primary.id, classId: classes[name] },
    });
  }

  // --- System config ---
  const configs = [
    { key: 'CURRENCY', value: 'TZS' },
    { key: 'PAYMENT_GATEWAY', value: 'SELCOM' },
    { key: 'SMS_ENABLED', value: true },
  ];
  for (const c of configs) {
    await prisma.systemConfig.upsert({
      where: { schoolId_key: { schoolId: school.id, key: c.key } },
      update: {},
      create: { schoolId: school.id, key: c.key, value: c.value as any },
    });
  }

  // --- Demo students / invoices / payments ---
  const studentCount = await prisma.student.count({ where: { schoolId: school.id } });
  if (studentCount === 0) {
    const names = ['John Mushi', 'Grace Mushi', 'Peter Mushi', 'Neema Mushi', 'David Mushi', 'Amina Mushi'];
    const classOrder = ['CL1', 'N1', 'CL2', 'N2', 'CL3', 'N3'];

    for (let i = 0; i < names.length; i++) {
      const clsName = classOrder[i];
      const isPrimary = clsName.startsWith('CL');
      // Select the correct package based on class
      let pkg = primary;
      if (clsName === 'N1') pkg = junior;
      else if (clsName === 'N2') pkg = middle;
      else if (clsName === 'N3') pkg = senior;
      // else if primary, use primary
      const admissionNo = `2026/${String(i + 1).padStart(3, '0')}/${clsName}`;

      const student = await prisma.student.create({
        data: {
          schoolId: school.id,
          admissionNo,
          fullName: names[i],
          gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
          classId: classes[clsName],
          academicYearId: year.id,
          createdBy: bursar.id,
        },
      });

      const guardian = await prisma.guardian.create({
        data: {
          schoolId: school.id,
          fullName: `Parent of ${names[i]}`,
          phone: `+2557120001${String(i).padStart(2, '0')}`,
          relationship: i % 2 === 0 ? 'FATHER' : 'MOTHER',
        },
      });
      await prisma.studentGuardian.create({
        data: { studentId: student.id, guardianId: guardian.id, isPrimaryContact: true },
      });

      await prisma.studentFeeEnrollment.create({
        data: {
          studentId: student.id,
          feePackageId: pkg.id,
          academicYearId: year.id,
        },
      });

      // three installments, in the past so dueDate >= invoiceDate holds
      for (let p = 0; p < 3; p++) {
        const invoiceDate = new Date(2026, p * 3, 1);
        const dueDate = new Date(2026, p * 3, 28);
        const invoiceNumber = await nextNumber(school.id, 'INVOICE', 'INV');

        const invoice = await prisma.invoice.create({
          data: {
            invoiceNumber,
            studentId: student.id,
            schoolId: school.id,
            academicYearId: year.id,
            amount: pkg.installmentAmount,
            invoiceDate,
            dueDate,
            createdBy: bursar.id,
          },
        });

        // scenario: pay first fully, second half, third unpaid
        const scenario = (i + p) % 3;
        if (scenario !== 2) {
          const allocated =
            scenario === 0
              ? Number(pkg.installmentAmount)
              : Math.round(Number(pkg.installmentAmount) / 2);

          const receiptNumber = await nextNumber(school.id, 'RECEIPT', 'RCP');
          const payment = await prisma.payment.create({
            data: {
              receiptNumber,
              studentId: student.id,
              invoiceId: invoice.id,
              schoolId: school.id,
              amount: allocated,
              amountAllocated: allocated,
              method: i % 2 === 0 ? 'BANK_TRANSFER' : 'M_PESA',
              status: 'COMPLETED',
              recordedBy: bursar.id,
              verifiedBy: bursar.id,
              verifiedAt: new Date(),
            },
          });

          await prisma.receipt.create({
            data: {
              receiptNumber,
              paymentId: payment.id,
              studentId: student.id,
              schoolId: school.id,
              amount: allocated,
              receiptData: { student: student.fullName, invoice: invoiceNumber, amount: allocated },
              createdBy: bursar.id,
            },
          });
        }
      }
    }
  }

  const [students, invoices, payments] = await Promise.all([
    prisma.student.count(),
    prisma.invoice.count(),
    prisma.payment.count(),
  ]);

  console.log('\n=== SEED COMPLETE ===');
  console.log(`Students: ${students} | Invoices: ${invoices} | Payments: ${payments}`);
  console.log('Super Admin: admin@blessinghope.co.tz / BhAdmin!2026$ecure');
  console.log('School Admin: bursar@blessinghope.co.tz / Bursar!Bh2026$afe');
  console.log('NOTE: change these passwords on first login.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

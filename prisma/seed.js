/* eslint-disable @typescript-eslint/no-require-imports */

const { randomBytes, scryptSync } = require("node:crypto");
const {
  PrismaClient,
  Role,
  EmployeeStatus,
  PaymentStatus,
  WorkPlanStatus,
} = require("@prisma/client");

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function atDay(date, hours) {
  const next = new Date(date);
  next.setHours(hours, 0, 0, 0);
  return next;
}

async function main() {
  const defaultPasswordHash = hashPassword("Milk@123");
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  await prisma.activityLog.deleteMany();
  await prisma.employeeFinance.deleteMany();
  await prisma.workPlanAssignment.deleteMany();
  await prisma.workPlan.deleteMany();
  await prisma.user.deleteMany();
  await prisma.employee.deleteMany();

  const employees = await Promise.all([
    prisma.employee.create({
      data: {
        fullName: "Niran Wongchai",
        nickname: "Niran",
        phone: "+66 81 555 0101",
        position: "Operations Director",
        dailyRate: 180,
        role: Role.ADMIN,
        status: EmployeeStatus.ACTIVE,
        note: "Oversees delivery, staffing, and financial approvals.",
      },
    }),
    prisma.employee.create({
      data: {
        fullName: "Kanda Srisawat",
        nickname: "Kanda",
        phone: "+66 81 555 0102",
        position: "Field Manager",
        dailyRate: 140,
        role: Role.MANAGER,
        status: EmployeeStatus.ACTIVE,
        note: "Coordinates daily work plans and crew schedules.",
      },
    }),
    prisma.employee.create({
      data: {
        fullName: "Preecha Saelim",
        nickname: "Pree",
        phone: "+66 81 555 0103",
        position: "Senior Technician",
        dailyRate: 95,
        role: Role.EMPLOYEE,
        status: EmployeeStatus.ACTIVE,
        note: "Assigned to installation and service jobs.",
      },
    }),
    prisma.employee.create({
      data: {
        fullName: "Mali Chantarang",
        nickname: "Mali",
        phone: "+66 81 555 0104",
        position: "Account Coordinator",
        dailyRate: 88,
        role: Role.EMPLOYEE,
        status: EmployeeStatus.ACTIVE,
        note: "Supports finance entry and document follow-up.",
      },
    }),
    prisma.employee.create({
      data: {
        fullName: "Somchai Klinrak",
        nickname: "Chai",
        phone: "+66 81 555 0105",
        position: "Warehouse Support",
        dailyRate: 72,
        role: Role.EMPLOYEE,
        status: EmployeeStatus.INACTIVE,
        note: "Inactive after March rotation.",
      },
    }),
  ]);

  const [adminEmployee, managerEmployee, technicianEmployee, coordinatorEmployee] =
    employees;

  const adminUser = await prisma.user.create({
    data: {
      name: "Niran Wongchai",
      email: "admin@milk-devyim.local",
      username: "admin",
      passwordHash: defaultPasswordHash,
      role: Role.ADMIN,
      employeeId: adminEmployee.id,
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      name: "Kanda Srisawat",
      email: "manager@milk-devyim.local",
      username: "manager",
      passwordHash: defaultPasswordHash,
      role: Role.MANAGER,
      employeeId: managerEmployee.id,
    },
  });

  const employeeUser = await prisma.user.create({
    data: {
      name: "Preecha Saelim",
      email: "employee@milk-devyim.local",
      username: "employee",
      passwordHash: defaultPasswordHash,
      role: Role.EMPLOYEE,
      employeeId: technicianEmployee.id,
    },
  });

  const workPlans = await Promise.all([
    prisma.workPlan.create({
      data: {
        title: "Warehouse restock coordination",
        description: "Reconcile received inventory and prepare delivery manifests.",
        date: addDays(today, -1),
        startTime: "09:00",
        endTime: "12:00",
        status: WorkPlanStatus.COMPLETED,
        location: "Main warehouse",
        note: "Close out vendor paperwork before noon.",
        createdById: managerUser.id,
        assignments: {
          create: [
            { employeeId: coordinatorEmployee.id },
            { employeeId: technicianEmployee.id },
          ],
        },
      },
    }),
    prisma.workPlan.create({
      data: {
        title: "Client site inspection",
        description: "Inspect piping changes, verify materials, and confirm labor scope.",
        date: today,
        startTime: "08:30",
        endTime: "11:00",
        status: WorkPlanStatus.IN_PROGRESS,
        location: "Sukhumvit Project",
        note: "Collect final site photos for the report pack.",
        createdById: managerUser.id,
        assignments: {
          create: [{ employeeId: technicianEmployee.id }],
        },
      },
    }),
    prisma.workPlan.create({
      data: {
        title: "Crew payroll review",
        description: "Verify wage entries, bonus adjustments, and pending advances.",
        date: today,
        startTime: "14:00",
        endTime: "16:00",
        status: WorkPlanStatus.PENDING,
        location: "HQ office",
        note: "Need final attendance count from the morning shift.",
        createdById: adminUser.id,
        assignments: {
          create: [{ employeeId: coordinatorEmployee.id }],
        },
      },
    }),
    prisma.workPlan.create({
      data: {
        title: "Preventive maintenance block",
        description: "Routine inspection for refrigeration units at Building B.",
        date: addDays(today, 1),
        startTime: "10:00",
        endTime: "15:00",
        status: WorkPlanStatus.PENDING,
        location: "Building B",
        note: "Reserve backup compressor kit.",
        createdById: managerUser.id,
        assignments: {
          create: [
            { employeeId: technicianEmployee.id },
            { employeeId: coordinatorEmployee.id },
          ],
        },
      },
    }),
    prisma.workPlan.create({
      data: {
        title: "Monthly management close",
        description: "Prepare operations summary, labor totals, and open-risk review.",
        date: addDays(today, 3),
        startTime: "13:00",
        endTime: "17:30",
        status: WorkPlanStatus.PENDING,
        location: "Executive room",
        note: "Board-ready deck needed by 18:00.",
        createdById: adminUser.id,
        assignments: {
          create: [
            { employeeId: adminEmployee.id },
            { employeeId: managerEmployee.id },
          ],
        },
      },
    }),
  ]);

  await prisma.employeeFinance.createMany({
    data: [
      {
        employeeId: technicianEmployee.id,
        workPlanId: workPlans[0].id,
        createdById: managerUser.id,
        date: addDays(today, -1),
        workReference: "Warehouse restock coordination",
        dailyWage: 95,
        bonus: 12,
        deduction: 0,
        advancePayment: 0,
        totalPayable: 107,
        paymentStatus: PaymentStatus.PAID,
        note: "Completed unloading and count verification.",
      },
      {
        employeeId: coordinatorEmployee.id,
        workPlanId: workPlans[0].id,
        createdById: managerUser.id,
        date: addDays(today, -1),
        workReference: "Warehouse restock coordination",
        dailyWage: 88,
        bonus: 0,
        deduction: 6,
        advancePayment: 10,
        totalPayable: 72,
        paymentStatus: PaymentStatus.PARTIAL,
        note: "Advance already paid for transport allowance.",
      },
      {
        employeeId: technicianEmployee.id,
        workPlanId: workPlans[1].id,
        createdById: managerUser.id,
        date: today,
        workReference: "Client site inspection",
        dailyWage: 95,
        bonus: 10,
        deduction: 0,
        advancePayment: 0,
        totalPayable: 105,
        paymentStatus: PaymentStatus.PENDING,
        note: "Will close after the site pack is approved.",
      },
      {
        employeeId: coordinatorEmployee.id,
        workPlanId: workPlans[2].id,
        createdById: adminUser.id,
        date: today,
        workReference: "Crew payroll review",
        dailyWage: 88,
        bonus: 4,
        deduction: 0,
        advancePayment: 0,
        totalPayable: 92,
        paymentStatus: PaymentStatus.PENDING,
        note: "Finance verification task.",
      },
    ],
  });

  await prisma.activityLog.createMany({
    data: [
      {
        actorId: adminUser.id,
        action: "LOGIN",
        entityType: "SESSION",
        entityId: adminUser.id,
        description: "Admin signed into the control center.",
        createdAt: atDay(today, 8),
      },
      {
        actorId: managerUser.id,
        action: "PLAN_CREATED",
        entityType: "WORK_PLAN",
        entityId: workPlans[1].id,
        description: "Created the client site inspection schedule.",
        createdAt: atDay(today, 8),
      },
      {
        actorId: managerUser.id,
        action: "PLAN_UPDATED",
        entityType: "WORK_PLAN",
        entityId: workPlans[1].id,
        description: "Moved the inspection status to in progress.",
        createdAt: atDay(today, 9),
      },
      {
        actorId: adminUser.id,
        action: "FINANCE_REVIEW",
        entityType: "EMPLOYEE_FINANCE",
        entityId: null,
        description: "Reviewed open wage entries for today.",
        createdAt: atDay(today, 10),
      },
      {
        actorId: employeeUser.id,
        action: "PLAN_VIEWED",
        entityType: "WORK_PLAN",
        entityId: workPlans[1].id,
        description: "Opened assigned plan details from the employee view.",
        createdAt: atDay(today, 11),
      },
    ],
  });

  console.log("Seed completed.");
  console.log("Demo credentials:");
  console.log("admin / Milk@123");
  console.log("manager / Milk@123");
  console.log("employee / Milk@123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

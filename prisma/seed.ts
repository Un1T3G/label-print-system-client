import { PrismaClient } from '@prisma/client';
import { DEFAULT_TEMPLATES } from '../src/lib/templates-data';
import { PRESET_USERS } from '../src/lib/session';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Инициализация базы данных PostgreSQL...');

  // 1. Seed default users
  for (const user of PRESET_USERS) {
    await prisma.user.upsert({
      where: { login: user.login },
      update: {},
      create: {
        id: user.id,
        login: user.login,
        password: user.passwordHash,
        name: user.name,
        role: user.role,
      },
    });
    console.log(`✓ Пользователь [${user.role}]: ${user.login} / ${user.passwordHash}`);
  }

  // 2. Seed default templates
  for (const tpl of DEFAULT_TEMPLATES) {
    await prisma.printTemplate.upsert({
      where: { id: tpl.id },
      update: {},
      create: {
        id: tpl.id,
        name: tpl.name,
        widthMm: tpl.widthMm,
        heightMm: tpl.heightMm,
        isDefault: tpl.isDefault,
        config: tpl.config as any,
      },
    });
    console.log(`✓ Шаблон: ${tpl.name} (${tpl.widthMm}x${tpl.heightMm} мм)`);
  }

  console.log('✅ Инициализация успешно завершена!');
}

main()
  .catch((e) => {
    console.error('Ошибка сидирования:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

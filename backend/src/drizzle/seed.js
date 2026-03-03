import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import * as schema from '../schema/index.js';

dotenv.config();

async function seed() {
  console.log('🌱 Starting database seed...');
  
  const client = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(client, { schema });
  
  try {
    // Check if superadmin exists
    const existingAdmin = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.role, 'superadmin'),
    });

    if (!existingAdmin) {
      // Create superadmin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await db.insert(schema.users).values({
        email: 'superadmin@school.id',
        password: hashedPassword,
        nama: 'Super Administrator',
        nip: 'ADMIN001',
        role: 'superadmin',
        status: 'aktif',
        telepon: '081234567890',
      });
      
      console.log('✅ Superadmin user created!');
      console.log('   Email: superadmin@school.id');
      console.log('   Password: admin123');
    } else {
      console.log('ℹ️  Superadmin user already exists.');
    }

    // Create sample admin user
    const existingSampleAdmin = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, 'admin@school.id'),
    });

    if (!existingSampleAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await db.insert(schema.users).values({
        email: 'admin@school.id',
        password: hashedPassword,
        nama: 'School Administrator',
        nip: 'ADMIN002',
        role: 'admin',
        status: 'aktif',
        telepon: '081234567891',
      });
      
      console.log('✅ Sample admin user created!');
      console.log('   Email: admin@school.id');
      console.log('   Password: admin123');
    }

    // Create sample wali kelas user
    const existingWaliKelas = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, 'walikelas@school.id'),
    });

    if (!existingWaliKelas) {
      const hashedPassword = await bcrypt.hash('guru123', 10);
      
      await db.insert(schema.users).values({
        email: 'walikelas@school.id',
        password: hashedPassword,
        nama: 'Wali Kelas 7A',
        nip: 'WK001',
        role: 'wali_kelas',
        status: 'aktif',
        telepon: '081234567892',
      });
      
      console.log('✅ Sample wali kelas user created!');
      console.log('   Email: walikelas@school.id');
      console.log('   Password: guru123');
    }

    // Create sample guru user
    const existingGuru = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, 'guru@school.id'),
    });

    if (!existingGuru) {
      const hashedPassword = await bcrypt.hash('guru123', 10);
      
      await db.insert(schema.users).values({
        email: 'guru@school.id',
        password: hashedPassword,
        nama: 'Guru Mata Pelajaran',
        nip: 'GR001',
        role: 'guru',
        status: 'aktif',
        telepon: '081234567893',
      });
      
      console.log('✅ Sample guru user created!');
      console.log('   Email: guru@school.id');
      console.log('   Password: guru123');
    }

    console.log('\n🎉 Database seeding completed!');
    console.log('\n📋 Default Users:');
    console.log('┌─────────────────────────┬──────────────────────────┬──────────────┬───────────┐');
    console.log('│ Email                   │ Password                 │ Role         │ Status    │');
    console.log('├─────────────────────────┼──────────────────────────┼──────────────┼───────────┤');
    console.log('│ superadmin@school.id    │ admin123                 │ superadmin   │ aktif     │');
    console.log('│ admin@school.id         │ admin123                 │ admin        │ aktif     │');
    console.log('│ walikelas@school.id     │ guru123                  │ wali_kelas   │ aktif     │');
    console.log('│ guru@school.id          │ guru123                  │ guru         │ aktif     │');
    console.log('└─────────────────────────┴──────────────────────────┴──────────────┴───────────┘');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();

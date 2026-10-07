const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Poblando base de datos con datos de prueba...');

    const provincias = [
        'Madrid',
        'Barcelona',
        'Valencia',
        'Sevilla',
        'Zaragoza',
        'Málaga',
        'Murcia',
        'Palma de Mallorca',
        'Las Palmas',
        'Bilbao'
    ];

    for (let i = 0; i < provincias.length; i++) {
        const nombre = provincias[i];
        await prisma.provincia.upsert({
            where: { id: i + 1 },
            update: { nombre },
            create: { id: i + 1, nombre }
        });
    }

    console.log('✅ Provincias insertadas correctamente.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

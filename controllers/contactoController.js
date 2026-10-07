const prisma = require('../config/database');

const getLista = async (req, res) => {
    try {
        const contactos = await prisma.contacto.findMany({
            orderBy: { id: 'asc' },
            include: { provincia: true }
        });
        res.render('lista_contactos.njk', {
            title: 'Listado de Contactos',
            contactos,
            user: req.user
        });
    } catch (err) {
        console.error(err);
        res.status(500).render('error.njk', { error: 'Error al recuperar la lista de contactos.' });
    }
};

const getNuevo = async (req, res) => {
    try {
        const provincias = await prisma.provincia.findMany({ orderBy: { nombre: 'asc' } });
        res.render('nuevo_contacto.njk', {
            title: 'Nuevo Contacto',
            provincias,
            user: req.user,
            errors: req.validationErrors || []
        });
    } catch (err) {
        console.error(err);
        res.status(500).render('error.njk', { error: 'Error al cargar las provincias.' });
    }
};

const postNuevo = async (req, res) => {
    try {
        if (req.validationErrors && req.validationErrors.length > 0) {
            const provincias = await prisma.provincia.findMany({ orderBy: { nombre: 'asc' } });
            return res.render('nuevo_contacto.njk', {
                title: 'Nuevo Contacto',
                provincias,
                user: req.user,
                errors: req.validationErrors,
                form: req.body
            });
        }

        const { nombre, telefono, email, provinciaId } = req.body;
        await prisma.contacto.create({
            data: {
                nombre,
                telefono,
                email,
                provinciaId: parseInt(provinciaId)
            }
        });

        res.redirect('/contacto/lista');
    } catch (err) {
        console.error(err);
        res.status(500).render('error.njk', { error: 'Error al crear el contacto.' });
    }
};

const getFicha = async (req, res) => {
    try {
        const codigo = parseInt(req.params.codigo);
        const contacto = await prisma.contacto.findUnique({
            where: { id: codigo },
            include: {
                provincia: {
                    include: {
                        pais: true
                    }
                }
            }
        });

        if (!contacto) {
            return res.status(404).render('error.njk', { error: 'Contacto no encontrado.' });
        }

        res.render('ficha_contacto.njk', {
            title: `Ficha de ${contacto.nombre}`,
            contacto,
            user: req.user
        });
    } catch (err) {
        console.error(err);
        res.status(500).render('error.njk', { error: 'Error al obtener la ficha del contacto.' });
    }
};

const getNuevoParametros = async (req, res) => {
    try {
        const { nombre, telefono, email } = req.params;

        let provincia = await prisma.provincia.findFirst();
        if (!provincia) {
            provincia = await prisma.provincia.create({
                data: { nombre: 'Sin Provincia' }
            });
        }

        const contacto = await prisma.contacto.create({
            data: {
                nombre,
                telefono,
                email,
                provinciaId: provincia.id
            }
        });

        res.redirect(`/contacto/${contacto.id}`);
    } catch (err) {
        console.error(err);
        res.status(500).render('error.njk', { error: 'Error al crear contacto por parámetros.' });
    }
};

const getEmpiezaPor = async (req, res) => {
    try {
        const letra = req.params.letra;
        const contactos = await prisma.contacto.findMany({
            where: {
                nombre: {
                    startsWith: letra,
                    mode: 'insensitive'
                }
            },
            include: { provincia: true },
            orderBy: { nombre: 'asc' }
        });

        res.render('lista_contactos.njk', {
            title: `Contactos que empiezan por "${letra}"`,
            contactos,
            letraFiltro: letra,
            user: req.user
        });
    } catch (err) {
        console.error(err);
        res.status(500).render('error.njk', { error: 'Error al filtrar contactos.' });
    }
};

const getModificar = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { nombre } = req.params;

        await prisma.contacto.update({
            where: { id },
            data: { nombre }
        });

        res.redirect(`/contacto/${id}`);
    } catch (err) {
        console.error(err);
        res.status(500).render('error.njk', { error: 'Error al modificar el contacto.' });
    }
};

const getBorrar = async (req, res) => {
    try {
        const codigo = parseInt(req.params.codigo);
        await prisma.contacto.delete({
            where: { id: codigo }
        });

        res.redirect('/contacto/lista');
    } catch (err) {
        console.error(err);
        res.status(500).render('error.njk', { error: 'Error al eliminar el contacto.' });
    }
};

module.exports = {
    getLista,
    getNuevo,
    postNuevo,
    getFicha,
    getNuevoParametros,
    getEmpiezaPor,
    getModificar,
    getBorrar
};

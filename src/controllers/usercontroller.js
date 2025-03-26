import User from '../models/user_model.js';
import { userCreatedEvent } from '../services/rabbitServicesEvent.js';

// Expresión regular para validar el username
const emailRegex = /^[^\s@]+@[^\s@]+\.com$/;

export const getUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error en la lista de usuarios', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

export const createUsers = async (req, res) => {
    try {
        const { password, username, phone } = req.body;

        if (!phone || !username) {
            return res.status(400).json({ message: 'Teléfono y correo son obligatorios' });
        }

        if (!emailRegex.test(username)) {
            return res.status(400).json({ message: 'El correo debe contener un @ y terminar en .com' });
        }

        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ message: 'El nombre de usuario ya existe' });
        }

        if (phone.length < 8 || phone.length > 10) {
            return res.status(400).json({ message: 'El teléfono debe tener entre 8 y 10 dígitos' });
        }

        if (!password || password.length < 8) { 
            return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres' });
        }

        const newUser = await User.create({
            phone,
            username,
            password,
            status: true,
            creationDate: new Date(),
        });

        console.log(newUser);
        await userCreatedEvent(newUser)
        return res.status(201).json({ message: 'Usuario creado', data: newUser });

    } catch (error) {
        console.error('Error al crear usuario', error);
        res.status(500).json({ message: 'Error al crear el usuario' });
    }
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { password, phone, username } = req.body;

    console.log("Cuerpo recibido:", req.body); // Depuración

    try {
        // Asegurarse de que se está parseando el JSON
        console.log("ID recibido:", id);
        if (!id) {
            return res.status(400).json({ message: 'ID de usuario requerido' });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (username && !emailRegex.test(username)) {
            return res.status(400).json({ message: 'El correo debe contener un @ y terminar en .com' });
        }

        if (phone && (!/^\d+$/.test(String(phone)) || String(phone).length < 8 || String(phone).length > 10)) {
            return res.status(400).json({ message: 'El teléfono debe contener solo números y tener entre 8 y 10 dígitos' });
        }

        if (password && password.length < 8) {
            return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres' });
        }
/*
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }*/

        user.phone = phone || user.phone;
        user.username = username || user.username;

        await user.save();

        return res.status(200).json({ message: 'Usuario actualizado', data: user });

    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        return res.status(500).json({ message: 'Error en el servidor' });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;

    console.log("ID recibido para eliminación:", id);

    try {
        if (!id) {
            return res.status(400).json({ message: 'ID de usuario requerido' });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        await user.destroy();

        return res.status(200).json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        return res.status(500).json({ message: 'Error en el servidor' });
    }
};
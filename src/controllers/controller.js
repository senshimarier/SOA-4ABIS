import { userCreatedEvent } from '../services/RabbitServicesEvent.js';
import User from '../models/user_model.js';
import jwt from 'jsonwebtoken';  
import bcrypt from 'bcryptjs';

// Expresión regular para validar el username
const emailRegex = /^[^\s@]+@[^\s@]+\.com$/;
const SECRET_KEY = "aJksd9QzPl+sVdK7vYc/L4dK8HgQmPpQ5K9yApUsj3w";  // Mejor usar variable de entorno

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
    const { password, username, phone } = req.body;

    if (!phone || !username || !password) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
        return res.status(400).json({ message: 'Formato de correo inválido' });
    }

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
        return res.status(400).json({ message: 'El usuario ya existe' });
    }

    if (phone.length < 8 || phone.length > 10) {
        return res.status(400).json({ message: 'El teléfono debe tener entre 8 y 10 dígitos' });
    }

    if (password.length < 8) {
        return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            phone,
            username,
            password: hashedPassword,  // Guardada directamente (sin hash)
            status: true,
            creationDate: new Date(),
        });

        await userCreatedEvent(newUser);

        return res.status(201).json({ message: 'Usuario creado correctamente', data: newUser });

    } catch (error) {
        console.error('Error al crear usuario:', error);
        return res.status(500).json({ message: 'Error al crear el usuario' });
    }
};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Correo y contraseña son obligatorios' });
        }

        if (!emailRegex.test(username)) {
            return res.status(400).json({ message: 'El correo debe contener un @ y terminar en .com' });
        }

        const existingUser = await User.findOne({ where: { username } });
        if (!existingUser) {
            return res.status(400).json({ message: 'Usuario no encontrado' });
        }

        // Verificar la contraseña con bcrypt
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // Generamos el token JWT
        const token = jwt.sign(
            { id: existingUser.id, username: existingUser.username },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        return res.status(200).json({
            message: 'Login exitoso',
            data: {
                user: { id: existingUser.id, username: existingUser.username },
                token
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error en el servidor' });
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

    console.log("ID recibido para cambio de estatus:", id);

    try {
        if (!id) {
            return res.status(400).json({ message: 'ID de usuario requerido' });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Cambiar el estatus en lugar de eliminar
        user.status = 'inactivo'; // Ajusta el valor según tu estructura de datos
        await user.save();

        return res.status(200).json({ message: 'Estatus de usuario actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar estatus del usuario:', error);
        return res.status(500).json({ message: 'Error en el servidor' });
    }
};

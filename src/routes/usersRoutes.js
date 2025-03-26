import express from "express";
import { getUsers } from "../controllers/controller.js";
import { createUsers } from "../controllers/controller.js";
import { updateUser } from "../controllers/controller.js";
import { deleteUser } from "../controllers/controller.js";
import { login } from "../controllers/controller.js";
//se busca tener buena practicas de programacion, una clase de mas de 100 lines de codio esta mal
//asi se evita la complejidad, no es lo mismo en una de 1000 lineas que una de 9
const routes = express.Router();

//router.post ('/', create)
//aqui se tiene la conexion de la principal, y se le agrega las secundarias
routes.get('/all',getUsers);
routes.post('/create',createUsers);
routes.post('/login',login);
routes.patch('/:id', updateUser);
/**
 * @swagger
 * /api/users/all:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of users from the database
 *     tags: 
 *       - Users
 *     responses:
 *       200:
 *         description: A list of users
 */
/**

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     description: Add a new user to the database
 *     tags: 
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input
 */

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Update a user
 *     description: Modify an existing user's details
 *     tags: 
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Remove a user from the database
 *     tags: 
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Send a new user to RabbitMQ
 *     description: Publishes a new user event to the RabbitMQ exchange
 *     tags: 
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 example: "12345"
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "johndoe@example.com"
 *     responses:
 *       200:
 *         description: User event published successfully
 *       500:
 *         description: Error publishing user event
 */

routes.delete('/:id', deleteUser);
//usamos una por que es una ruta principal
export default routes;
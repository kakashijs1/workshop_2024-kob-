const express = require('express');
const app = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { error } = require('console');

dotenv.config();

function checkSingIn(req, res, next) {
    try {
        const secret = process.env.TOKEN_SECRET;
        const token = req.headers['authorization'];
        const result = jwt.verify(token, secret);

        if (result != undefined) {
            next();
        }
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
}

function getUserId(req, res) {
    try {
        const secret = process.env.TOKEN_SECRET;
        const token = req.headers['authorization'];
        const result = jwt.verify(token, secret);

        if (result != undefined) {
            return result.id;
        }
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
}

app.post('/signIn', async (req, res) => {
    try {
        if (req.body.user == undefined || req.body.pass == undefined) {
            return res.status(401).send('unauthorized');
        }

        const user = await prisma.user.findFirst({
            select: {
                id: true,
                name: true
            },
            where: {
                user: req.body.user,
                pass: req.body.pass,
                status: 'use'
            }
        })

        if (user != null) {
            const secret = process.env.TOKEN_SECRET;
            const token = jwt.sign(user, secret, { expiresIn: '30d' });

            return res.send({ token: token });
        }

        res.status(401).send({ message: 'unauthorized' });
    } catch (e) {
        res.status(500).send({ error: e.messsag });
    }
})
app.get('/info', checkSingIn, async (req, res, next) => {
    try {
        const userId = getUserId(req, res);
        const user = await prisma.user.findFirst({
            select: {
                name: true
            },
            where: {
                id: userId
            }
        })

        res.send({ result: user });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
})
app.get('/list', async (req, res) => {
    try {
        const user = await prisma.user.findMany({
            orderBy: {
                id: 'asc'
            },
            where: {
                status: 'use'
            }
        });
        res.send({ results: user })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

app.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const body = req.body;
    try {
        const updateUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                name: body.name,
                user: body.user,
                role: body.role,
                email: body.email
            }
        })
        res.send({ message: 'success', user: updateUser });
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

app.delete('/remove/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                status: 'delete'
            }
        })
        res.send({ message: 'success', });
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

module.exports = app;
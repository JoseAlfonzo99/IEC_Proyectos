const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
// incluyo funciones en mongoDb.js
const { connectToMongoDB, disconnectToMongoDB} = require('./bd/mongoDB')

const bodyParser = require('body-parser');

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.header("Content-Type", "application/json; charset=utf-8");
    next();
});

app.get('/', (req, res) => {
    res.status(200).end("Bienvenido a mi API de usuarios!" );
});
app.get('/usuarios', async (req, res) => {
    const client = await connectToMongoDB();
    if(!client) {
        res.status(500).send('Error al conectarse a MongoDB')
        return;
    }
    const db = client.db('usuarios')
    const usuariosRegistrados = await db.collection('usuariosRegistrados').find().toArray()
    await disconnectToMongoDB()
    res.status(200).json(usuariosRegistrados);
});
app.get('/usuarios/:id', async (req, res) => {
    const usuariosRegistradosID = parseInt(req.params.id) || 0

    const client = await connectToMongoDB();
    if(!client) {
        res.status(500).send('Error al conectarse a MongoDB')
        return;
    }
    
    const db = client.db('usuarios')
    const usuariosRegistrados = await db.collection('usuariosRegistrados').findOne({id: usuariosRegistradosID})
    await disconnectToMongoDB()
    !usuariosRegistrados ? res.status(404).send('No encontre el usuario con el id '+ usuariosRegistradosID): res.status(200).json(usuariosRegistrados)
});
app.get('/usuarios/nombre/:nombre', async (req, res) => {
    const nombreUsuariosRegistrados = req.params.nombre
    const client = await connectToMongoDB();
    if (!client) {
        res.status(500).send('Error al conectarse a MongoDB')
        return;
    }
    const regex = new RegExp(nombreUsuariosRegistrados.toLowerCase(), 'i');
    console.log(regex)
    const db = client.db('usuarios')
    const usuariosRegistrados = await db.collection('usuariosRegistrados').find({ nombre: regex }).toArray()
    await disconnectToMongoDB()
    usuariosRegistrados.length == 0 ? res.status(404).send('No encontre el susuario con el nombre '+ nombreUsuariosRegistrados): res.json(usuariosRegistrados)
})

app.post('/usuarios', async (req, res) => {
    const nuevoUsuariosRegistrado = req.body
    console.log(nuevoUsuariosRegistrado)
    if (!nuevoUsuariosRegistrado) {
        res.status(400).send('Error en el formato de los datos del usuario')
    }
    const client = await connectToMongoDB();
    if (!client) {
        res.status(500).send('Error al conectarse a MongoDB')
        return;
    }
    const db = client.db('usuarios') 
    const collection = await db.collection('usuariosRegistrados')
    collection.insertOne(nuevoUsuariosRegistrado)
    .then(() => {
        console.log('Nuevo usuario creado')
        res.status(201).send(nuevoUsuariosRegistrado)
    }).catch(err => { 
        console.error(err)
        res.status(500).send('Error al crear el usuario')
    }).finally(async () => { await disconnectToMongoDB() })
})

app.put('/usuarios/:id',async (req, res) => {
    const id = req.params.id
    const nuevosDatos = req.body
       console.log(req.body)
    if (!nuevosDatos) {
        res.status(400).send('Error en el formato de los datos del usuario')
    }
    const client = await connectToMongoDB();
    if (!client) {
        res.status(500).send('Error al conectarse a MongoDB')
        return;
    }
    const db = client.db('usuarios') 
    const collection = await db.collection('usuariosRegistrados')
    collection.updateOne({id: parseInt(id)}, {$set: nuevosDatos})
    .then(() => {
        console.log('Nuevo usuario actualizado')
        res.status(200).send(nuevosDatos)
    }).catch(err => { 
        console.error(err)
        res.status(500).send('Error al actualizar')
    }).finally(async () => { await disconnectToMongoDB() })
})

app.delete('/usuarios/:id',async (req, res) => {
    const id = req.params.id

    const client = await connectToMongoDB();
    if (!client) {
        res.status(500).send('Error al conectarse a MongoDB')
        return;
    }
    const db = client.db('usuarios') 
    const collection = await db.collection('usuariosRegistrados')
    collection.deleteOne({id: parseInt(id)})
    .then(() => {
        console.log('Usuario eliminado')
        res.status(200).send('Usuario eliminado')
    }).catch(err => { 
        console.error(err)
        res.status(500).send('Error al eliminar')
    }).finally(async () => { await disconnectToMongoDB() })
})

app.get("*", (req, res) => {
    res.json({
      error: "404",
      message: "No se encuentra la ruta solicitada",
    });
  });
  
//Inicia el servidor
app.listen(PORT, () => console.log(`API de usuarios escuchando en http://localhost:${PORT}`) );
  
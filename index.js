const express = require('express')
const { MongoClient, ObjectId } = require('mongodb')
const mongodb = require('mongodb')
const cors = require('cors')
const app = express()
app.use(cors())
app.use(express.json())
const dbUrl = 'mongodb+srv://rohit10231:rohitkaranpujari@cluster0.kjynvxt.mongodb.net/?retryWrites=true&w=majority'
const client = new MongoClient(dbUrl)
const port = 9000

// get all rooms info
app.get('/', async (req, res) => {
    const client = await MongoClient.connect(dbUrl)
    try {
        const db = await client.db('Hall_Booking_API')
        let rooms = await db.collection('Rooms').aggregate([{ $project: { _id: 0 } }]).toArray()
        if (rooms.length) {
            res.status(200).send(rooms)
        }
        else {
            res.status(404).send({ message: 'No rooms available' })
        }
    }
    catch (error) {
        res.status(500).send({ message: 'Internal server error', error })
    }
    finally {
        client.close()
    }
})

// create new room
app.post('/createNewRoom', async (req, res) => {
    const client = await MongoClient.connect(dbUrl)
    try {
        const db = await client.db('Hall_Booking_API')
        if (!req.body.availableSeats || !req.body.roomAmenities || !req.body.oneHourPrice || !req.body.roomId || !req.body.roomName) {
            res.status(400).send({ message: 'Please enter roomId, roomName, availableSeats, roomAmenities, oneHourPrice' })
        }
        else {
            let room = await db.collection('Rooms').aggregate([{ $match: { availableSeats: req.body.availableSeats, roomAmenities: req.body.roomAmenities, oneHourPrice: req.body.oneHourPrice, roomName: req.body.roomName, roomId: req.body.roomId, } }]).toArray()
            if (room.length === 0) {
                await db.collection('Rooms').insertOne(req.body)
                res.status(201).send({ message: 'Room Successfully Created', data: req.body })
            }
            else {
                res.send({ message: 'Room with entered data already exist' })
            }
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Internal server error', error })
    }
    finally {
        client.close()
    }
})

// book new room
app.put('/bookNewRoom', async (req, res) => {
    const client = await MongoClient.connect(dbUrl)
    try {
        const db = await client.db('Hall_Booking_API')
        if (!req.body.customerName || !req.body.date || !req.body.startTime || !req.body.endTime || !req.body.roomId) {
            res.status(400).send({ message: 'Please enter customerName, date, startTime, endTime, roomId' })
        }
        else {
            let bookedRoom = await db.collection('Rooms').aggregate([{ $match: { roomId: parseInt(req.body.roomId), bookingStatus: true } }]).toArray()
            if (bookedRoom.length === 0) {
                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                function generateString(length) {
                    let result = '';
                    const charactersLength = characters.length;
                    for (let i = 0; i < length; i++) {
                        result += characters.charAt(Math.floor(Math.random() * charactersLength));
                    }

                    return result;
                }
                var bookingId = await generateString(5)
                await db.collection('Rooms').updateOne({ roomId: parseInt(req.body.roomId) }, { $set: { bookingStatus: true, customerName: req.body.customerName, date: req.body.date, startTime: req.body.startTime, endTime: req.body.endTime, roomId: req.body.roomId, bookingId: "booking_" + bookingId } })
                var bookedRoomInfo = await db.collection('Rooms').aggregate([{ $match: { roomId: parseInt(req.body.roomId) } }, { $project: { _id: 0, bookingStatus: 0 } }]).toArray()
                await console.log(bookedRoomInfo);
                bookedRoomInfo.bookingId = bookedRoomInfo;
                bookedRoomInfo.bookingDate = req.body.date;
                res.status(200).send({ message: 'room booked', data: bookedRoomInfo })
            }
            else {
                res.status(400).send({ message: 'room already booked' })
            }
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Internal server error', error })
    }
    finally {
        client.close()
    }
})

// list all rooms with booked data
app.get('/getAllBookedRooms', async (req, res) => {
    const client = await MongoClient.connect(dbUrl)
    try {
        const db = await client.db('Hall_Booking_API')
        let allBookedRooms = await db.collection('Rooms').aggregate([{ $match: { bookingStatus: true } }, { $project: { _id: 0, availableSeats: 0, roomAmenities: 0, oneHourPrice: 0, roomId: 0, } }]).toArray()
        if (allBookedRooms.length) {
            res.status(200).send(allBookedRooms)
        }
        else {
            res.status(404).send({ message: 'No rooms booked yet' })
        }
    }
    catch (error) {
        res.status(500).send({ message: 'Internal server error', error })
    }
    finally {
        client.close()
    }
})

// list all rooms with booked data
app.get('/getAllCustomersData', async (req, res) => {
    const client = await MongoClient.connect(dbUrl)
    try {
        const db = await client.db('Hall_Booking_API')
        let allCustomersData = await db.collection('Rooms').aggregate([{ $match: { bookingStatus: true } }, { $project: { _id: 0, availableSeats: 0, roomAmenities: 0, oneHourPrice: 0, roomId: 0, bookingStatus: 0 } }]).toArray()
        if (allCustomersData.length) {
            res.status(200).send(allCustomersData)
        }
        else {
            res.status(404).send({ message: 'No rooms booked yet by any customer' })
        }
    }
    catch (error) {
        res.status(500).send({ message: 'Internal server error', error })
    }
    finally {
        client.close()
    }
})

// list how many times a customer has booked the room
app.get('/getCustomerData/:customerName', async (req, res) => {
    const client = await MongoClient.connect(dbUrl)
    try {
        const db = await client.db('Hall_Booking_API')
        if (!req.params.customerName) {
            res.status(400).send({ message: "Please enter customer name" })
        }
        else {
            let allCustomersData = await db.collection('Rooms').aggregate([{ $match: { customerName: req.params.customerName } }, { $project: { _id: 0, availableSeats: 0, roomAmenities: 0, oneHourPrice: 0, roomId: 0 } }]).toArray()
            if (allCustomersData.length) {
                res.status(200).send(allCustomersData)
            }
            else {
                res.status(404).send({ message: 'No rooms booked yet' })
            }
        }
    }
    catch (error) {
        res.status(500).send({ message: 'Internal server error', error })
    }
    finally {
        client.close()
    }
})

app.listen(port, () => { console.log(`App listening on ${port}`) })
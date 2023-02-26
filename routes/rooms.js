const express = require('express')
const router = express.Router()

const datePattern = /(^0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-(\d{4}$)/
const timePattern = /^([0]?[1-9]|1[0-2]):([0-5]\d)\s?(AM|PM)$/i

let rooms = []
let bookRooms = []

router.get('/', (req, res) => {
    res.status(200).send({ message: 'Welcome to Hall Booking API' })
})

// creating new rooms
router.post('/createNewRoom', (req, res) => {
    if (req.body.seatNumbers && req.body.amenities && req.body.oneHourPrice && req.body.roomId && req.body.roomName) {
        if (isNaN(req.body.seatNumbers)) {
            res.status(400).send({ message: 'seatNumbers should be numeric' })
        }
        else if (!isNaN(req.body.amenities)) {
            res.status(400).send({ message: 'Use only characters for amenities' })
        }
        else if (isNaN(req.body.oneHourPrice)) {
            res.status(400).send({ message: 'oneHourPrice should be numeric' })
        }
        else if (isNaN(req.body.roomId)) {
            res.status(400).send({ message: 'roomId should be numeric' })
        }
        else {
            let roomData = rooms.filter((e) => e.roomId == req.body.roomId)
            if (roomData.length == 0) {
                rooms.push(req.body)
                // console.log(rooms)
                res.status(201).send({
                    message: 'New room created successfuly',
                    data: req.body
                })
            }
            else {
                res.status(400).send({ message: `Room with room id ${req.body.roomId} already exist` })
            }
        }
    }
    else {
        res.status(400).send({ message: 'seatNumbers, amenities, oneHourPrice, roomId, roomName are mandatory' })
    }
})

// getting created rooms data
router.get('/getCreatedRooms', (req, res) => {
    if (rooms.length) {
        res.status(200).send({ data: rooms })
    }
    else {
        res.status(404).send({ message: 'No rooms created' })
    }
})

// booking room
router.post('/bookRooms', (req, res) => {
    if (req.body.customerName && req.body.date && req.body.startTime && req.body.endTime && req.body.roomId && req.body.roomName) {
        if (!isNaN(req.body.customerName)) {
            res.status(400).send({ message: 'Use only characters for customerName' })
        }
        else if (!(req.body.date.match(datePattern))) {
            res.status(400).send({ message: 'Date should be in dd-mm-yyyy pattern' })
        }
        else if (!(req.body.startTime.match(timePattern))) {
            res.status(400).send({ message: 'Start time should be in HH:MM AM/PM pattern' })
        }
        else if (!(req.body.endTime.match(timePattern))) {
            res.status(400).send({ message: 'End time should be in HH:MM AM/PM pattern' })
        }
        else if (isNaN(req.body.roomId)) {
            res.status(400).send({ message: 'Use only numbers for roomId' })
        }
        else {
            let alreadyBookedRoomData = bookRooms.filter((e) => e.roomName == req.body.roomName && e.date == req.body.date)
            if (alreadyBookedRoomData.length === 0) {
                bookRooms.push(req.body)
                res.status(201).send({
                    message: 'Room Booked Successfully',
                    data: req.body
                })
            }
            else {
                res.status(400).send({ message: `${req.body.roomName} is already booked on ${req.body.date}` })
            }
        }
    }
    else {
        res.status(400).send({ message: 'customerName, date, startTime, endTime, roomId, roomName are mandatory' })
    }
})

// getting booked rooms data
router.get('/getBookedRoomsData', (req, res) => {
    if (bookRooms.length) {
        res.status(200).send(bookRooms)
    }
    else {
        res.status(404).send({ message: 'No rooms booked  yet !' })
    }
})

// getting all customer list who booked rooms
router.get('/getBookedRoomsCustomerData', (req, res) => {
    if (bookRooms.length) {
        const roomBookedCustomerList = bookRooms.map((e) => ({
            customerName: e.customerName,
            roomName: e.roomName,
            date: e.date,
            startTime: e.startTime,
            endTime: e.endTime
        }))
        console.log(roomBookedCustomerList)
        res.status(200).send(roomBookedCustomerList)
    }
    else {
        res.status(404).send({ message: 'No rooms booked yet !' })
    }
})

module.exports = router;
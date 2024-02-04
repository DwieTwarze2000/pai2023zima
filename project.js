const mongoose = require('mongoose')

const person = require('./person')

const schema = new mongoose.Schema({
    name: { type: String, required: true },
    shortcut: { type: String, required: true },
    color: { type: String, required: false },
    startDate: { type: Date, required: true, transform: v => v.toISOString().slice(0, 10) },
    coords: {
        lat: { type: Number, required: false },
        lng: { type: Number, required: false }    
    }
}, {
    versionKey: false,
    additionalProperties: false
})

let model = null

module.exports = {

    getSchema: () => schema,
    getModel: () => model,

    init: connection => {
        model = connection.model('Project', schema)
        return model
    },

    get: (req, res) => {
        const _id = req.query._id
        if(_id) {
            model.findOne({ _id })
            .then(data => {
                if(data) {
                    res.json(data)
                } else {
                    res.status(404).json({ error: 'No such object' })
                }
            })
            .catch(err => {
                res.status(408).json({ error: err.message })
            })
        } else {
            let aggregation = [
                { $sort: { name: 1 }},
                { $match: { $or: [ 
                    { name: { $regex: new RegExp(req.query.search, 'i') } },
                    { shortcut: { $regex: new RegExp(req.query.search) } }
                ]}},
                { $skip: parseInt(req.query.skip) || 0 },
                { $limit: parseInt(req.query.limit) || 1000 },
                { $lookup: {
                    from: 'people',
                    localField: '_id',
                    foreignField: 'projects',
                    as: 'members'
                }},
                { $set: { members: { $size: '$members' }}}
            ]
            model.aggregate(aggregation)
            .then(data => {
                res.json(data)
            })
            .catch(err => {
                res.status(408).json({ error: err.message })
            })
        }
    },

    post: (req, res) => {
        const instance = new model(req.body)
        instance.save()
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.status(406).json({ error: err.message })
        })    
    },

    put: (req, res) => {
        const _id = req.query._id
        model.findOneAndUpdate({ _id }, req.body, { new: true, runValidators: true })
        .then(updated => {
            if(updated) {
                res.json(updated)
            } else {
                res.status(404).json({ error: 'No such object' })
            }
        })
        .catch(err => {
            res.status(406).json({ error: err.message })
        })    
    },

    delete: (req, res) => {
        const _id = req.query._id
        let promises = [ 
            model.findOneAndDelete({ _id }),
            person.getModel().updateMany({}, { $pull: { projects: _id } })
        ]
        Promise.all(promises)
        .then(results => {
            if(results[0]) {
                res.json(results[0])
            } else {
                res.status(404).json({ error: 'No such object' })
            }
        }).catch(err => {
            res.status(400).json({ error: err.message })
        })
    }

}
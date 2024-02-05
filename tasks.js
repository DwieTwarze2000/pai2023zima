const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: false },
    startDate: { type: Date, required: true, transform: (v) => v.toISOString().slice(0, 10) },
    endDate: { type: Date, required: false, transform: (v) => (v ? v.toISOString().slice(0, 10) : null) },
    project: { type: mongoose.ObjectId, required: true },
    people: { type: [mongoose.ObjectId], required: false, default: [] },
  },
  {
    versionKey: false,
    additionalProperties: false,
  }
);

let model = null;

module.exports = {
  getSchema: () => schema,
  getModel: () => model,

  init: (connection) => {
    model = connection.model('Task', schema);
    return model;
  },

  get: (req, res) => {
    const _id = req.query._id;
    if (_id) {
      model
        .findOne({ _id })
        .then((data) => {
          if (data) {
            res.json(data);
          } else {
            res.status(404).json({ error: 'No such object' });
          }
        })
        .catch((err) => {
          res.status(408).json({ error: err.message });
        });
    } else {
      let aggregation = [
        { $sort: { name: 1 } },
        {
          $match: { $or: [{ name: { $regex: new RegExp(req.query.search, 'i') } }, { description: { $regex: new RegExp(req.query.search, 'i') } }] },
        },
      ];

      if (req.query.project) {
        try {
          const proj = JSON.parse(req.query.project);

          if (proj.length) {
            if (Array.isArray(proj)) {
              console.log('huh');
              aggregation.push({ $match: { project: { $in: proj.map((p) => new mongoose.Types.ObjectId(p)) } } });
            } else {
              throw new Error('project should be array');
            }
          }
        } catch (err) {
          res.status(408).json({ error: err.message });
          return;
        }
      }

      if (req.query.showNotFinished) {
        if (req.query.showNotFinished === 'true') {
          aggregation.push({ $match: { endDate: { $exists: false } } });
        }
      }

      aggregation.push(
        { $skip: parseInt(req.query.skip) || 0 },
        { $limit: parseInt(req.query.limit) || 1000 },
        {
          $lookup: {
            from: 'projects',
            localField: 'project',
            foreignField: '_id',
            as: 'project',
          },
        },
        { $unwind: '$project' },
        {
          $lookup: {
            from: 'people',
            localField: 'people',
            foreignField: '_id',
            as: 'people',
          },
        },
        {
          $addFields: { people: { $map: { input: '$people', as: 'person', in: { $mergeObjects: ['$$person'] } } } },
        }
      );

      model
        .aggregate(aggregation)
        .then((data) => {
          res.json(data);
        })
        .catch((err) => {
          res.status(408).json({ error: err.message });
        });
    }
  },

  post: (req, res) => {
    const instance = new model(req.body);
    instance
      .save()
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        res.status(406).json({ error: err.message });
      });
  },

  put: (req, res) => {
    const _id = req.query._id;
    model
      .findOneAndUpdate({ _id }, req.body, { new: true, runValidators: true })
      .then((updated) => {
        if (updated) {
          res.json(updated);
        } else {
          res.status(404).json({ error: 'No such object' });
        }
      })
      .catch((err) => {
        res.status(406).json({ error: err.message });
      });
  },

  delete: (req, res) => {
    const _id = req.query._id;
    model
      .findOneAndDelete({ _id })
      .then((deleted) => {
        if (deleted) {
          res.json(deleted);
        } else {
          res.status(404).json({ error: 'No such object' });
        }
      })
      .catch((err) => {
        res.status(400).json({ error: err.message });
      });
  },
};

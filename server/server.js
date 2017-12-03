const express = require('express');
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '../public'));
app.set('port', process.env.PORT || 4000);

app.locals.title = 'Ignite';

app.get('/api/v1/projects', (request, response) => {
  database('projects').select()
    .then((projects) => {
      response.status(200).json(sendBack);
    })
    .catch((error) => {
      response.status(500).json({ error });
    });
});
app.post('/api/v1/projects', (request, response) => {
  const project = request.body;

  if (!project.name){
    return response
        .status(422)
        .send({ error: 'Missing a name property.' });
  }

  database('projects').insert(project, 'id')
    .then(project => {
      response.status(201).json({ id: project[0] });
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});
app.delete('/api/v1/projects/:projectId', (request, response) => {
  const id = request.params.projectId;
  database('palettes').where('project_id', id).del()
    .then( () => {
      return database('projects').where('id', id).del();
    })
    .then( () => {
      response.status(204).json({ id });
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});
app.listen(app.get('port'), () => {
  // eslint-disable-next-line no-console
  console.log(`${app.locals.title} is running on ${app.get('port')}.`);
});

module.exports = app;

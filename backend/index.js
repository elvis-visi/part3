const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()

const Person = require('./models/person')

//custom token, contents of the request body
morgan.token('body', (req, res) => {
  return req.method === 'POST' ? JSON.stringify(req.body) : '';
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));


const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
    //if not castError or Validation, forward it ot the default Express error handler
  next(error)
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(cors())
app.use(express.json())
app.use(express.static('build'))


app.get('/api/persons', (request,response) => {
    Person.find({}).then(persons =>{
      response.json(persons)
    })
})

app.get('/api/persons/:id', (request,response, next) => {
    
   Person.findById(request.params.id)
   .then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
   })
   .catch(error => next(error))  //passed to error handler middleware

})

app.delete('/api/persons/:id', (request,response) => {
    Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

const generateId = () => {
    const maxId = persons.length > 0 
    ? Math.max(...persons.map(per => per.id))
    : 0
    return maxId + 1;
  }

app.post('/api/persons', (request,response) => {
   
  const body = request.body

   if(body.name === undefined || body.number === undefined)
   {
    return response.status(400).json({ error: 'content missing' })
   }

   const person = new Person({
    name: body.name,
    number: body.number
   })

   person.save().then(savedPerson => {
    response.json(savedPerson)
   })

})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
   }
   
   Person.findByIdAndUpdate(request.params.id, person, {new: true})
      .then(updatedPerson => {
        response.json(updatedPerson)
      })
      .catch(error => next(error))

})




app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT 
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
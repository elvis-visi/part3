const express = require('express')
const app = express()
const morgan = require('morgan')

app.use(express.json())

//custom token, contents of the request body
morgan.token('body', (req, res) => {
  return req.method === 'POST' ? JSON.stringify(req.body) : '';
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));


let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request,response) => {
    response.json(persons)

})

app.get('/info', ( request, response) => {
    response.send(
       `<div> 
       PhoneBook has info for ${persons.length} people
       </div>`
    )
})

app.get('/api/persons/:id', (request,response) => {
    
    const id = Number(request.params.id)
    //find the person
    const person = persons.find(per => per.id === id)

    if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }

})

app.delete('/api/persons/:id', (request,response) => {
    const id = Number(request.params.id)

    //filter the person with above id
    persons = persons.filter(per => per.id !== id)

    response.status(204).end()
})
const generateId = () => {
    const maxId = persons.length > 0 
    ? Math.max(...persons.map(per => per.id))
    : 0
    return maxId + 1;
  }

app.post('/api/persons', (request,response) => {
   
    const body = request.body;
    //check whether body is empty
    if(!body.name || !body.number)
    {
        return response.status(400).json({
            error: 'Namer or number is missing'  
        })
    }

    //name must be unique
    if(persons.find(per =>  per.name.toLowerCase() 
    === body.name.toLowerCase()))
    {
        return response.status(400).json({
            error: 'name must be unique'  
        })
    }

    //create the person using body's content
    const person = {
        "id": generateId() ,
        "name": body.name, 
        "number": body.number
    }

    persons = persons.concat(person)
    response.json(person)

})



const PORT = 3004
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
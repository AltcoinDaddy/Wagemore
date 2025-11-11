import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { db } from './db/client'
import { todos } from './db/schema'
import { eq } from 'drizzle-orm'

const app = new Hono()

// Enable CORS for frontend
app.use(
  '*',
  cors({
    origin: 'http://localhost:3000',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowHeaders: ['Content-Type'],
  }),
)

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

// Get all todos
app.get('/api/todos', async (c) => {
  try {
    const allTodos = await db.select().from(todos)
    return c.json(allTodos)
  } catch (error) {
    console.error('Error fetching todos:', error)
    return c.json({ error: 'Failed to fetch todos' }, 500)
  }
})

// Create a new todo
app.post('/api/todos', async (c) => {
  try {
    const body = await c.req.json()
    const { title } = body

    if (!title) {
      return c.json({ error: 'Title is required' }, 400)
    }

    const result = await db.insert(todos).values({ title }).returning()
    return c.json(result[0], 201)
  } catch (error) {
    console.error('Error creating todo:', error)
    return c.json({ error: 'Failed to create todo' }, 500)
  }
})

// Update a todo
app.put('/api/todos/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const body = await c.req.json()
    const { title } = body

    if (!title) {
      return c.json({ error: 'Title is required' }, 400)
    }

    const result = await db
      .update(todos)
      .set({ title })
      .where(eq(todos.id, id))
      .returning()

    if (result.length === 0) {
      return c.json({ error: 'Todo not found' }, 404)
    }

    return c.json(result[0])
  } catch (error) {
    console.error('Error updating todo:', error)
    return c.json({ error: 'Failed to update todo' }, 500)
  }
})

// Delete a todo
app.delete('/api/todos/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))

    const result = await db.delete(todos).where(eq(todos.id, id)).returning()

    if (result.length === 0) {
      return c.json({ error: 'Todo not found' }, 404)
    }

    return c.json({ success: true })
  } catch (error) {
    console.error('Error deleting todo:', error)
    return c.json({ error: 'Failed to delete todo' }, 500)
  }
})

export default app

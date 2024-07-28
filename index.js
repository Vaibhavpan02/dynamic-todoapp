const express = require('express');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const cors = require('cors');

const app = express();
const port = 3000;

require('dotenv').config();

AWS.config.update({
  region: 'us-east-1',  
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

app.use(cors());
app.use(bodyParser.json());


app.get('/todos', async (req, res) => {
  const params = {
    TableName: 'todos',
  };

  try {
    const data = await dynamoDB.scan(params).promise();
    res.json(data.Items);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Could not fetch todos' });
  }
});

app.post('/todos', async (req, res) => {
  const { id, text } = req.body;

  const params = {
    TableName: 'todos',
    Item: {
      id,
      text,
    },
  };

  try {
    await dynamoDB.put(params).promise();
    res.json({ message: 'Todo added successfully' });
  } catch (error) {
    console.error('Error adding todo:', error);
    res.status(500).json({ error: 'Could not add todo' });
  }
});

app.delete('/todos/:id', async (req, res) => {
  const { id } = req.params;

  const params = {
    TableName: 'todos',
    Key: {
      id,
    },
  };

  try {
    await dynamoDB.delete(params).promise();
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Could not delete todo' });
  }
});
app.put('/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  const params = {
    TableName: 'todos',
    Key: {
      id,
    },
    UpdateExpression: 'set #text = :text',
    ExpressionAttributeNames: {
      '#text': 'text',
    },
    ExpressionAttributeValues: {
      ':text': text,
    },
    ReturnValues: 'UPDATED_NEW',
  };

  try {
    const data = await dynamoDB.update(params).promise();
    res.json({ message: 'Todo updated successfully', updatedAttributes: data.Attributes });
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Could not update todo' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

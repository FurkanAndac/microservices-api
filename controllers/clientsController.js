const Client = require('../models/Clients');
const mongoose = require('mongoose');

// Controller function for handling the GET request to fetch all clients
async function getClients(req, res) {
    try {
        const clientId = req.headers['x-client-id'];
      
        if (!mongoose.Types.ObjectId.isValid(clientId)) {
          return res.status(400).json({ error: 'Invalid client ID' });
        }
      
        const clients = await Client.find({_id: req.headers['x-client-id']});
        console.log(clients)
        res.json(clients);
      } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
// Controller function for handling the DELETE request to delete a member by email
async function deleteMember(req, res) {
    const { clientId } = req.params;
    const { memberEmail } = req.query; // Extract member email from query parameters
console.log(clientId)
console.log(memberEmail)
  try {
    if (!clientId  || !memberEmail) {
      return res.status(400).json({ error: 'clientId and memberEmail parameters are required' });
    }

    const result = await Client.findOneAndUpdate(
      { _id: clientId },
      { $pull: { members: memberEmail } },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ message: 'Member deleted successfully', updatedClient: result });
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function addMember(req, res) {
    const { clientId } = req.params;
    const { memberEmail } = req.query;
    console.log(clientId)
    console.log(memberEmail)
  
    try {
      if (!clientId || !memberEmail) {
        return res.status(400).json({ error: 'clientId and memberEmail parameters are required' });
      }
  
      const result = await Client.findOneAndUpdate(
        { _id: clientId },
        { $addToSet: { members: memberEmail } },
        { new: true }
      );
      console.log(result)
  
      if (!result) {
        return res.status(404).json({ error: 'Client not found' });
      }
  
      res.json({ message: 'Member added successfully', updatedClient: result });
    } catch (error) {
      console.error('Error adding member:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
// Export the controller functions
module.exports = {
  getClients, deleteMember, addMember
  // Add more controller functions as needed
};

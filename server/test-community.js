const mongoose = require('mongoose');
const Community = require('./models/Community');
const Message = require('./models/Message');
const User = require('./models/User');

// Test script for community functionality
async function testCommunityFeatures() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/agriai', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Create a test user
    const testUser = new User({
      name: 'Test Farmer',
      email: 'test@example.com',
      password: 'password123'
    });
    await testUser.save();
    console.log('✅ Created test user');

    // Create a test community
    const testCommunity = new Community({
      name: 'Test Farming Community',
      description: 'A test community for farming discussions',
      category: 'General',
      creator: testUser._id,
      members: [testUser._id],
      isPrivate: false,
      maxMembers: 100
    });
    await testCommunity.save();
    console.log('✅ Created test community');

    // Test adding a join request
    const anotherUser = new User({
      name: 'Another Farmer',
      email: 'another@example.com',
      password: 'password123'
    });
    await anotherUser.save();

    testCommunity.joinRequests.push({
      user: anotherUser._id,
      status: 'pending'
    });
    await testCommunity.save();
    console.log('✅ Added join request');

    // Test creating a message
    const testMessage = new Message({
      community: testCommunity._id,
      sender: testUser._id,
      message: 'Hello everyone! This is a test message.'
    });
    await testMessage.save();
    console.log('✅ Created test message');

    // Test population
    const populatedCommunity = await Community.findById(testCommunity._id)
      .populate('creator', 'name email')
      .populate('members', 'name email')
      .populate('joinRequests.user', 'name email');
    
    console.log('✅ Community with populated data:', {
      name: populatedCommunity.name,
      creator: populatedCommunity.creator.name,
      memberCount: populatedCommunity.memberCount,
      joinRequests: populatedCommunity.joinRequests.length
    });

    // Clean up test data
    await Community.findByIdAndDelete(testCommunity._id);
    await Message.findByIdAndDelete(testMessage._id);
    await User.findByIdAndDelete(testUser._id);
    await User.findByIdAndDelete(anotherUser._id);
    console.log('✅ Cleaned up test data');

    console.log('🎉 All community features are working correctly!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the test
testCommunityFeatures();


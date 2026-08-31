import React, { useEffect, useState } from "react";
import { MessageCircle, Users, Plus, Search, Bell, Pin, Hash, Calendar, User, Send, X } from "lucide-react";

const FarmerCommunityPage = () => {
  const [groups, setGroups] = useState([
    { name: "Organic Farming", members: 124, description: "Sustainable farming practices", isActive: true, category: "Techniques" },
    { name: "Crop Disease Help", members: 89, description: "Get help with plant diseases", isActive: true, category: "Support" },
    { name: "Market Updates", members: 203, description: "Latest market prices and trends", isActive: true, category: "Business" }
  ]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [messages, setMessages] = useState([
    { id: 1, sender: "John Farmer", message: "Has anyone tried the new drought-resistant wheat variety?", timestamp: "2 mins ago", isPinned: false },
    { id: 2, sender: "Mary Green", message: "Yes! It's shown 30% better yield in my fields this season.", timestamp: "1 min ago", isPinned: false }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [groupDescription, setGroupDescription] = useState("");
  const [notifications, setNotifications] = useState(3);
  const [currentUser] = useState("You");

  const categories = ["All", "Techniques", "Support", "Business", "Weather", "Equipment"];

  useEffect(() => {
    // Simulate socket connection
    console.log("Connected to farmer community");
  }, []);

  const joinGroup = (group) => {
    setActiveGroup(group);
    // Simulate loading messages for the group
    if (group.name === "Organic Farming") {
      setMessages([
        { id: 1, sender: "John Farmer", message: "Has anyone tried the new drought-resistant wheat variety?", timestamp: "2 mins ago", isPinned: false },
        { id: 2, sender: "Mary Green", message: "Yes! It's shown 30% better yield in my fields this season.", timestamp: "1 min ago", isPinned: false },
        { id: 3, sender: "Sam Miller", message: "I'm interested in learning more about composting techniques.", timestamp: "5 mins ago", isPinned: true }
      ]);
    }
  };

  const sendMessage = () => {
    if (newMessage.trim() && activeGroup) {
      const newMsg = {
        id: messages.length + 1,
        sender: currentUser,
        message: newMessage,
        timestamp: "now",
        isPinned: false
      };
      setMessages(prev => [...prev, newMsg]);
      setNewMessage("");
    }
  };

  const createGroup = () => {
    const groupName = newGroup.trim();
    const description = groupDescription.trim();
    if (groupName && !groups.find(g => g.name === groupName)) {
      const newGroupObj = {
        name: groupName,
        members: 1,
        description: description || "A new farming community",
        isActive: true,
        category: selectedCategory === "All" ? "General" : selectedCategory
      };
      setGroups(prev => [...prev, newGroupObj]);
      setNewGroup("");
      setGroupDescription("");
      setShowCreateModal(false);
    }
  };

  const togglePin = (messageId) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isPinned: !msg.isPinned } : msg
    ));
  };

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || group.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const pinnedMessages = messages.filter(msg => msg.isPinned);
  const regularMessages = messages.filter(msg => !msg.isPinned);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Farmer Communities</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-600 cursor-pointer hover:text-green-600" />
                {notifications > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-full">
                <User className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">{currentUser}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Communities */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-green-100">
              <div className="p-6 border-b border-green-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Communities</h2>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search communities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedCategory === category
                          ? "bg-green-600 text-white"
                          : "bg-green-50 text-green-700 hover:bg-green-100"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Communities List */}
              <div className="max-h-96 overflow-y-auto">
                {filteredGroups.map((group) => (
                  <div
                    key={group.name}
                    onClick={() => joinGroup(group)}
                    className={`p-4 border-b border-green-50 cursor-pointer transition-colors hover:bg-green-50 ${
                      activeGroup?.name === group.name ? "bg-green-100 border-l-4 border-l-green-600" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-800">{group.name}</h3>
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{group.members}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{group.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {group.category}
                      </span>
                      <span className={`h-2 w-2 rounded-full ${group.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            {activeGroup ? (
              <div className="bg-white rounded-xl shadow-sm border border-green-100 h-[600px] flex flex-col">
                {/* Chat Header */}
                <div className="p-6 border-b border-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                        <Hash className="h-5 w-5 text-green-600" />
                        <span>{activeGroup.name}</span>
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">{activeGroup.description}</p>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Users className="h-4 w-4" />
                      <span>{activeGroup.members} members</span>
                    </div>
                  </div>
                </div>

                {/* Pinned Messages */}
                {pinnedMessages.length > 0 && (
                  <div className="p-4 bg-amber-50 border-b border-amber-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <Pin className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-800">Pinned Messages</span>
                    </div>
                    {pinnedMessages.map(msg => (
                      <div key={msg.id} className="bg-white p-2 rounded mb-1 text-sm">
                        <strong className="text-amber-800">{msg.sender}:</strong>
                        <span className="ml-2">{msg.message}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {regularMessages.map((msg) => (
                    <div key={msg.id} className="group">
                      <div className={`flex ${msg.sender === currentUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.sender === currentUser
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {msg.sender !== currentUser && (
                            <div className="text-xs font-medium mb-1 text-green-600">{msg.sender}</div>
                          )}
                          <div className="break-words">{msg.message}</div>
                          <div className="flex items-center justify-between mt-2">
                            <div className={`text-xs ${msg.sender === currentUser ? 'text-green-100' : 'text-gray-500'}`}>
                              {msg.timestamp}
                            </div>
                            {msg.sender !== currentUser && (
                              <button
                                onClick={() => togglePin(msg.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Pin className={`h-3 w-3 ${msg.isPinned ? 'text-amber-500' : 'text-gray-400 hover:text-amber-500'}`} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-green-100">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button
                      onClick={sendMessage}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-green-100 h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-green-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Welcome to Farmer Communities</h3>
                  <p className="text-gray-600 mb-4">Select a community to start chatting with fellow farmers</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Create New Community
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Community Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Create New Community</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Community Name</label>
                <input
                  type="text"
                  value={newGroup}
                  onChange={(e) => setNewGroup(e.target.value)}
                  placeholder="Enter community name"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="Describe what this community is about"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {categories.filter(cat => cat !== "All").map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createGroup}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create Community
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerCommunityPage;
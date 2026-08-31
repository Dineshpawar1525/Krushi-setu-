import React, { useEffect, useState, useRef, useCallback, memo } from "react";
import { socket } from '../socket';
import { 
  MessageCircle, 
  Users, 
  Plus, 
  Search, 
  Bell, 
  Pin, 
  Hash, 
  Calendar, 
  User, 
  Send, 
  X, 
  Settings, 
  Edit3, 
  Trash2, 
  UserPlus, 
  UserCheck, 
  UserX,
  Shield,
  Lock,
  Globe,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Grid,
  List,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useAuth } from "../Authorisation/AuthProvider";
import api from "../Authorisation/axiosConfig";
import DashboardNav from "../components/DashboardNav";
import "../styles/EnhancedCommunity.css";

const EnhancedFarmerCommunity = () => {
  const { user } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [myCommunities, setMyCommunities] = useState([]);
  const [activeCommunity, setActiveCommunity] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinRequestsModal, setShowJoinRequestsModal] = useState(false);
  const [joinRequests, setJoinRequests] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [buttonLoading, setButtonLoading] = useState({});
  const [chatOpening, setChatOpening] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const categories = ["All", "Techniques", "Support", "Business", "Weather", "Equipment", "General"];

  // Form states for creating/editing community
  const [communityForm, setCommunityForm] = useState({
    name: "",
    description: "",
    category: "General",
    isPrivate: false,
    maxMembers: 100
  });

  useEffect(() => {
    fetchCommunities();
    fetchMyCommunities();
    initializeSocket();
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []); // Remove dependencies to prevent re-initialization

  useEffect(() => {
    if (activeCommunity) {
      console.log('Active community changed, fetching messages for:', activeCommunity._id);
      fetchMessages(activeCommunity._id);
      
      // Only join community room if we're not already in it
      if (currentRoomId !== activeCommunity._id) {
        if (socket && socket.connected) {
          console.log('Joining community room:', activeCommunity._id);
          socket.emit('joinCommunityRoom', activeCommunity._id);
          setCurrentRoomId(activeCommunity._id);
        } else {
          console.log('Socket not connected when trying to join community room');
          // Try to connect socket
          if (socket) {
            socket.connect();
          }
        }
      } else {
        console.log('Already in this community room:', activeCommunity._id);
      }
    } else {
      console.log('No active community, leaving any community room');
      setCurrentRoomId(null);
      // Leave any community room when no active community
      if (socket && socket.connected) {
        // Note: We don't have a specific leaveCommunityRoom event, 
        // but the socket will automatically leave when disconnected
      }
    }
  }, [activeCommunity, currentRoomId, socket]); // Add currentRoomId to dependencies

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket.io event listeners for real-time messaging
  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    const handleNewMessage = (message) => {
      console.log('Received new message:', message);
      console.log('Active community:', activeCommunity?._id);
      console.log('Message community:', message.community);
      
      // Only add message if it's for the current active community
      if (activeCommunity && message.community === activeCommunity._id) {
        console.log('Adding message to state');
        setMessages(prev => [...prev, message]);
      } else {
        console.log('Message not for current community, ignoring');
      }
    };

    // Listen for connection events
    const handleConnect = () => {
      console.log('Connected to server');
      setSocketConnected(true);
      if (user?._id) {
        console.log('Joining user room:', user._id);
        socket.emit('joinUserRoom', user._id);
      }
      // Join community room if we have an active community
      if (activeCommunity) {
        console.log('Reconnecting to community room:', activeCommunity._id);
        socket.emit('joinCommunityRoom', activeCommunity._id);
      }
    };

    const handleDisconnect = () => {
      console.log('Disconnected from server');
      setSocketConnected(false);
    };

    // Listen for community room join confirmation
    const handleJoinedCommunityRoom = (data) => {
      console.log('Successfully joined community room:', data);
    };

    // Remove existing listeners first to prevent duplicates
    socket.off('connect', handleConnect);
    socket.off('disconnect', handleDisconnect);
    socket.off('newMessage', handleNewMessage);
    socket.off('joinedCommunityRoom', handleJoinedCommunityRoom);

    // Add event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('newMessage', handleNewMessage);
    socket.on('joinedCommunityRoom', handleJoinedCommunityRoom);

    // Cleanup on unmount
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('newMessage', handleNewMessage);
      socket.off('joinedCommunityRoom', handleJoinedCommunityRoom);
    };
  }, [user?._id, activeCommunity, socket]); // Keep socket in dependencies but handle duplicates

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeSocket = () => {
    // Socket auto-connects, just join user room for notifications
    if (user?._id && socket && socket.connected) {
      console.log("Joining user room on initialization:", user._id);
      socket.emit('joinUserRoom', user._id);
    } else if (user?._id && socket) {
      console.log("Socket not connected, will join user room when connected");
    }
    
    console.log("Socket connection initialized");
  };

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const response = await api.get("/communities");
      setCommunities(response.data);
    } catch (error) {
      setError("Failed to fetch communities");
      console.error("Error fetching communities:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyCommunities = async () => {
    try {
      const response = await api.get("/communities/my-communities");
      setMyCommunities(response.data);
    } catch (error) {
      console.error("Error fetching my communities:", error);
    }
  };

  const fetchMessages = async (communityId) => {
    try {
      console.log('Fetching messages for community:', communityId);
      const response = await api.get(`/communities/${communityId}/messages`);
      console.log('Messages fetched:', response.data);
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError("Failed to load messages");
    }
  };

  const fetchJoinRequests = async (communityId) => {
    try {
      const response = await api.get(`/communities/${communityId}/join-requests`);
      setJoinRequests(response.data);
    } catch (error) {
      console.error("Error fetching join requests:", error);
    }
  };

  const createCommunity = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/communities", communityForm);
      setCommunities(prev => [response.data, ...prev]);
      setMyCommunities(prev => [response.data, ...prev]);
      setShowCreateModal(false);
      setCommunityForm({
        name: "",
        description: "",
        category: "General",
        isPrivate: false,
        maxMembers: 100
      });
    } catch (error) {
      setError("Failed to create community");
      console.error("Error creating community:", error);
    }
  };

  const updateCommunity = async (communityId, updatedData) => {
    try {
      const response = await api.put(`/communities/${communityId}`, updatedData);
      setCommunities(prev => prev.map(c => c._id === communityId ? response.data : c));
      setMyCommunities(prev => prev.map(c => c._id === communityId ? response.data : c));
    } catch (error) {
      setError("Failed to update community");
      console.error("Error updating community:", error);
    }
  };

  const deleteCommunity = async (communityId) => {
    if (!window.confirm("Are you sure you want to delete this community?")) return;
    
    try {
      await api.delete(`/communities/${communityId}`);
      setCommunities(prev => prev.filter(c => c._id !== communityId));
      setMyCommunities(prev => prev.filter(c => c._id !== communityId));
      if (activeCommunity?._id === communityId) {
        setActiveCommunity(null);
        setMessages([]);
      }
    } catch (error) {
      setError("Failed to delete community");
      console.error("Error deleting community:", error);
    }
  };

  const requestToJoin = async (communityId) => {
    try {
      await api.post(`/communities/${communityId}/join-request`);
      alert("Join request sent successfully!");
    } catch (error) {
      setError("Failed to send join request");
      console.error("Error sending join request:", error);
    }
  };

  const handleJoinRequest = async (communityId, requestId, action) => {
    if (!communityId || !requestId) {
      console.error('Missing communityId or requestId');
      return;
    }
    
    try {
      await api.post(`/communities/${communityId}/join-requests/${requestId}`, { action });
      fetchJoinRequests(communityId);
      fetchCommunities(); // Refresh the communities list to show updated data
      alert(`Join request ${action}d successfully!`);
    } catch (error) {
      setError(`Failed to ${action} join request`);
      console.error(`Error ${action}ing join request:`, error);
    }
  };

  const leaveCommunity = async (communityId) => {
    if (!window.confirm("Are you sure you want to leave this community?")) return;
    
    try {
      await api.post(`/communities/${communityId}/leave`);
      fetchMyCommunities();
      if (activeCommunity?._id === communityId) {
        setActiveCommunity(null);
        setMessages([]);
      }
    } catch (error) {
      setError("Failed to leave community");
      console.error("Error leaving community:", error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeCommunity) return;

    const messageText = newMessage.trim();
    setNewMessage(""); // Clear input immediately for better UX

    console.log('Sending message:', messageText, 'to community:', activeCommunity._id);
    console.log('Socket connected:', socketConnected);

    try {
      const response = await api.post(`/communities/${activeCommunity._id}/messages`, {
        message: messageText
      });
      
      console.log('Message sent successfully:', response.data);
      
      // Message will be added to state via Socket.io 'newMessage' event
      // No need to manually add it here
      
    } catch (error) {
      setError("Failed to send message");
      console.error("Error sending message:", error);
      setNewMessage(messageText); // Restore message on error
    }
  };

  const joinCommunity = useCallback(async (community) => {
    console.log('Joining community:', community);
    setChatOpening(true);
    
    try {
      // Set active community first
      setActiveCommunity(community);
      
      // Small delay to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // The socket room joining will be handled by the useEffect when activeCommunity changes
      // No need to manually emit here to prevent duplicates
      console.log('Chat should now be open for community:', community._id);
    } finally {
      setChatOpening(false);
    }
  }, []);

  const handleButtonClick = useCallback(async (buttonId, action) => {
    if (buttonLoading[buttonId]) {
      console.log('Button already loading, ignoring click');
      return; // Prevent multiple clicks
    }
    
    console.log('Button click started:', buttonId);
    setButtonLoading(prev => ({ ...prev, [buttonId]: true }));
    
    try {
      await action();
      console.log('Button action completed:', buttonId);
    } catch (error) {
      console.error('Button action failed:', buttonId, error);
    } finally {
      // Add a small delay before resetting loading state
      setTimeout(() => {
        setButtonLoading(prev => ({ ...prev, [buttonId]: false }));
      }, 500);
    }
  }, [buttonLoading]);

  const isCreator = (community) => {
    const creatorId = community.creator?._id || community.creator;
    const userId = user?._id || user?.id;
    return creatorId === userId;
  };

  const isMember = (community) => {
    const userId = user?._id || user?.id;
    const memberIds = community.members?.map(member => 
      typeof member === 'string' ? member : member._id
    ) || [];
    return memberIds.includes(userId);
  };

  const hasJoinRequest = (community) => {
    const userId = user?._id || user?.id;
    return community.joinRequests?.some(request => 
      (typeof request.user === 'string' ? request.user : request.user._id) === userId && 
      request.status === 'pending'
    );
  };

  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         community.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || community.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });


  const CommunityCard = memo(({ community }) => (
    <div className="community-card bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md group mb-4 transition-all duration-200">
      <div className="p-6">
        {/* Header Section */}
        <div className="card-header flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Hash className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 truncate">
                {community.name}
              </h3>
              <div className="community-meta flex items-center space-x-2 mt-1">
                <span className="flex items-center">
                  {community.isPrivate ? <Lock className="h-4 w-4 mr-1" /> : <Globe className="h-4 w-4 mr-1" />}
                  {community.isPrivate ? 'Private' : 'Public'}
                </span>
                <span>•</span>
                <span>{community.category}</span>
              </div>
            </div>
          </div>
          
          {/* Creator Actions - Top Right */}
          {isCreator(community) && (
            <div className="flex items-center space-x-1 ml-3">
              <button
                onClick={() => {
                  setActiveCommunity(community);
                  setShowJoinRequestsModal(true);
                  fetchJoinRequests(community._id);
                }}
                className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg relative transition-all duration-200"
                title="Manage Join Requests"
              >
                <UserPlus className="h-4 w-4" />
                {community.joinRequests?.filter(req => req.status === 'pending').length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold shadow-lg">
                    {community.joinRequests.filter(req => req.status === 'pending').length}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="community-description text-sm line-clamp-2">
          {community.description}
        </p>

        {/* Footer Section */}
        <div className="card-footer flex flex-col gap-4">
          {/* Community Stats */}
          <div className="community-stats flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {community.memberCount || community.members.length} members
            </span>
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(community.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Action Buttons - Full Width Container */}
          <div className="w-full">
            {isCreator(community) ? (
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Primary Action - Open Chat */}
                <button
                  onClick={() => handleButtonClick(`join-${community._id}`, () => joinCommunity(community))}
                  disabled={buttonLoading[`join-${community._id}`]}
                  className="primary-action flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>
                    {buttonLoading[`join-${community._id}`] ? 
                      (chatOpening ? 'Opening Chat...' : 'Opening...') : 
                      'Open Chat'
                    }
                  </span>
                </button>
                
                {/* Secondary Actions - Management */}
                <div className="secondary-actions flex items-center justify-center sm:justify-end gap-2">
                  <button
                    onClick={() => handleButtonClick(`requests-${community._id}`, async () => {
                      setActiveCommunity(community);
                      setShowJoinRequestsModal(true);
                      fetchJoinRequests(community._id);
                    })}
                    disabled={buttonLoading[`requests-${community._id}`]}
                    className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 relative shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    title="Manage Join Requests"
                  >
                    <UserPlus className="h-4 w-4" />
                    {community.joinRequests?.filter(req => req.status === 'pending').length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold shadow-lg">
                        {community.joinRequests.filter(req => req.status === 'pending').length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => handleButtonClick(`edit-${community._id}`, () => updateCommunity(community._id, { ...community }))}
                    disabled={buttonLoading[`edit-${community._id}`]}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    title="Edit Community"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleButtonClick(`delete-${community._id}`, () => deleteCommunity(community._id))}
                    disabled={buttonLoading[`delete-${community._id}`]}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    title="Delete Community"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : isMember(community) ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleButtonClick(`join-${community._id}`, () => joinCommunity(community))}
                  disabled={buttonLoading[`join-${community._id}`]}
                  className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>
                    {buttonLoading[`join-${community._id}`] ? 
                      (chatOpening ? 'Opening Chat...' : 'Opening...') : 
                      'Open Chat'
                    }
                  </span>
                </button>
                <button
                  onClick={() => handleButtonClick(`leave-${community._id}`, () => leaveCommunity(community._id))}
                  disabled={buttonLoading[`leave-${community._id}`]}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <UserX className="h-4 w-4" />
                  <span>Leave Community</span>
                </button>
              </div>
            ) : hasJoinRequest(community) ? (
              <div className="flex justify-center">
                <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Request Pending</span>
                </span>
              </div>
            ) : (
              <div className="flex justify-center">
                <button
                  onClick={() => handleButtonClick(`request-${community._id}`, () => requestToJoin(community._id))}
                  disabled={buttonLoading[`request-${community._id}`]}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center space-x-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>{buttonLoading[`request-${community._id}`] ? 'Requesting...' : 'Request to Join'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  ));

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Dashboard Navigation */}
      <DashboardNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-20 sm:pt-24">
        {/* Page Title */}
        <div className="mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Farmer Communities</h1>
              <p className="text-sm text-gray-600">Connect, learn, and grow together</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Communities */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-green-100 sticky top-20">
              <div className="p-6 border-b border-green-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">All Communities</h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                      title="Toggle View"
                    >
                      {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                      title="Filter"
                    >
                      <Filter className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                      title="Create Community"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
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

                {/* Filters */}
                {showFilters && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by Category</h3>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            selectedCategory === category
                              ? "bg-green-600 text-white"
                              : "bg-white text-gray-600 hover:bg-green-50"
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {categories.slice(0, 4).map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedCategory === category
                          ? "bg-green-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-green-50"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                  {categories.length > 4 && (
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-green-50 flex items-center"
                    >
                      More {showFilters ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                ) : (
                  <div className={`space-y-4 ${viewMode === "list" ? "space-y-2" : ""}`}>
                    {filteredCommunities.map((community) => (
                      <CommunityCard key={community._id} community={community} />
                    ))}
                    {filteredCommunities.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No communities found</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Chat or Community Details */}
          <div className="lg:col-span-2">
            {activeCommunity ? (
              <div className="bg-white rounded-xl shadow-sm border border-green-100 h-[600px] flex flex-col">
                {/* Chat Header */}
                <div className="p-6 border-b border-green-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        <Hash className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{activeCommunity.name}</h3>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-gray-500">
                            {activeCommunity.memberCount || activeCommunity.members.length} members
                          </p>
                          <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`} title={socketConnected ? 'Connected' : 'Disconnected'}></div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveCommunity(null)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((message) => (
                    <div key={message._id} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">{message.sender?.name || "Unknown"}</span>
                          <span className="text-xs text-gray-500">{new Date(message.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-gray-700">{message.message}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-6 border-t border-green-100">
                  <form onSubmit={sendMessage} className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-green-100 h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Community</h3>
                  <p className="text-gray-500">Choose a community from the sidebar to start chatting</p>
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Create Community</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={createCommunity} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Community Name</label>
                <input
                  type="text"
                  value={communityForm.name}
                  onChange={(e) => setCommunityForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={communityForm.description}
                  onChange={(e) => setCommunityForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={communityForm.category}
                  onChange={(e) => setCommunityForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {categories.slice(1).map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={communityForm.isPrivate}
                    onChange={(e) => setCommunityForm(prev => ({ ...prev, isPrivate: e.target.checked }))}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Private Community</span>
                </label>
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create Community
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Requests Modal */}
      {showJoinRequestsModal && activeCommunity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Join Requests - {activeCommunity?.name}
              </h2>
              <button
                onClick={() => setShowJoinRequestsModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {joinRequests.map((request) => (
                <div key={request._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{request.user.name}</h3>
                      <p className="text-sm text-gray-500">{request.user.email}</p>
                      <p className="text-xs text-gray-400">
                        Requested {new Date(request.requestedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => activeCommunity && handleJoinRequest(activeCommunity._id, request._id, 'approve')}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Approve"
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => activeCommunity && handleJoinRequest(activeCommunity._id, request._id, 'reject')}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Reject"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
              {joinRequests.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No pending join requests</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-white hover:text-gray-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default EnhancedFarmerCommunity;

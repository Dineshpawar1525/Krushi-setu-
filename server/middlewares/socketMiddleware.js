// Socket.io middleware to pass io instance to controllers
const socketMiddleware = (io) => {
  return (req, res, next) => {
    req.io = io;
    next();
  };
};

module.exports = socketMiddleware;

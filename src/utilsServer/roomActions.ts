const users = []

export const removeUser = (socketId) => {
  const indexOf = users.map((user) => user.socketId).indexOf(socketId)
  users.splice(indexOf, 1)
}

export const addUser = (userId, socketId) => {
  const user = users.find((item) => item.userId === userId)

  if (user && user.socketId === socketId) {
    return users
  }

  if (user && user.socketId !== socketId) {
    removeUser(user.socketId)
  }

  const newUser = { userId, socketId }

  users.push(newUser)

  return users
}

export const findConnectedUser = (userId) => users.find((user) => user.userId === userId)

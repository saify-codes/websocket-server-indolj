export default class {
  admins = [];
  users = [];
  mapping = {};

  addClient(socket, branchId) {
    if (branchId && !isNaN(branchId)) this.addUser(socket, branchId);
    else this.addAdmin(socket);
  }

  removeClient(socket, branchId) {
    if (branchId) this.removeUser(socket, branchId);
    else this.removeAdmin(socket);
  }

  addUser(socket, branchId) {
    this.users.push(socket);

    if (this.mapping[branchId]) {
      this.mapping[branchId] = [socket];
    } else {
      this.mapping[branchId].push(socket);
    }
  }

  addAdmin(socket) {
    this.admins.push(socket);
  }

  getAdmins() {}

  getUsers() {}

  getBranchUsers(branchId) {}

  removeUser(socket, branchId) {
    this.users = this.users.filter((_socket) => _socket !== socket);
    this.mapping[branchId] = this.mapping[branchId].filter(
      (_socket) => _socket !== socket
    );
  }

  removeAdmin(socket) {
    this.admins = this.admins.filter((_socket) => _socket !== socket);
  }

  empty() {
    return this.admins.length == 0 && this.users.length == 0;
  }
}

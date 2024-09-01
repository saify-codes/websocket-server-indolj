export default class{
    
    users    = []
    admins   = []
    branches = []
    mapping  = {}
    index    = {} // for searching user branch O(1)


    addUser(socket, branchId){

        this.branches.push(branchId)
        this.users.push(socket)

        if (this.mapping[branchId]) {
            this.mapping[branchId] = [socket]
            
        }else{
            this.mapping[branchId].push(socket)
        }
        
        this.index[socket.id] = branchId // key indexed
    }
    
    addAdmin(socket){
        this.admins.push(socket)
    }
    
    getAdmins(){

    }

    getUsers(){

    }
    
    getBranchIds(){

    }

    getBranchUsers(branchId){
        
    }

    removeUser(socket){
        const key = socket.id

    }

    removeAdmin(socket){
        this.admins = this.admins.filter((_socket) => _socket !== socket)
    }

    empty(){
        return this.admins.length == 0 && this.users.length == 0
    }
}
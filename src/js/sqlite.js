export class SQlite {
    constructor () {
        this.sqlite = window.sqlitePlugin
    }

    createDatabase(name) {
        console.log(window.sqlitePlugin)
        this.sqlite.openDatabase({ name: `${name}.db`, location: 'default' }, function(db) {
            console.log(db)
            alert(true)
        }, function(error) {
            alert("error")
            console.log(error)
        })
    }
}
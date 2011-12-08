
var dbconnval = {
      dbName: "study",
      dbDescription: "GRE DB"
};

Ext.DbConnection = new Ext.Sqlite.Connection(dbconnval);
	

Ext.define('StudyLanguage.model.Word', {
    extend: 'Ext.data.Model',
    fields: [{
            name: 'english',
             type: 'string'
            },
            {
             name: 'chinese',
             type: 'string'
             },
             {
              name: 'english_pronunciation',
              type: 'string'
             },
             {
            name: 'ID',
            type: 'int',
            fieldOption: 'PRIMARY KEY ASC'
             }], 
           
            proxy: {
		type: 'sqlitestorage',
		 dbConfig: {
		    tablename: 'words',
		    dbConn: Ext.DbConnection.dbConn,
                    dbQuery: 'select * from words order by ID limit 10 '
		    },
		    reader: {
		      type: 'array',
		      idProperty: 'ID'
		    }
	    },
	    writer: {
	      type: 'array'
	    }
});
/**
 * @author Thomas Alexander
 *
 * SqliteStorage is simply a superclass for the {@link Ext.data.proxy.LocalStorage localStorage} and {@link
 * Ext.data.proxy.SqliteStorage sqlitestorage} proxies. It uses the  HTML5 Sqlite Database storage
 * save {@link Ext.data.Model model instances} for offline use.
 */
Ext.define('Ext.data.proxy.SqliteStorage', {
    extend: 'Ext.data.proxy.Client',
    alias: 'proxy.sqlitestorage',
    alternateClassName: 'Ext.data.SqliteStorageProxy',

    
    constructor: function(config) {
	this.callParent([config]);

        //ensures that the reader has been instantiated properly
       this.setReader(this.reader);
	var me = this;
	me.createTable();
    },

    //inherit docs
    create: function(operation, callback, scope) {
        console.log("create");
        var me = this;
        
        var records = me.getTableFields(operation.records),
            length = records.length,
            id, record, i,tbl_Id = me.getReader().idProperty || 'ID';
        operation.setStarted();
        
        for (i = 0; i < length; i++) {
            record = records[i];
            this.setRecord(record, me.dbConfig.tablename, tbl_Id);
        }

        operation.setCompleted();
        operation.setSuccessful();

        if (typeof callback == 'function') {
            callback.call(scope || this, operation);
        }
    },
    //inherit docs
    update: function(operation, callback, scope) {
        console.log("update");
        var me = this;
        var records = this.getTableFields(operation.records),
            length = records.length,
            record, id, i, tbl_Id = me.getReader().idProperty || 'ID';
        
        operation.setStarted();

        for (i = 0; i < length; i++) {
            record = records[i];
            this.updateRecord(record, me.dbConfig.tablename,tbl_Id);
        }
        operation.setCompleted();
        operation.setSuccessful();

        if (typeof callback == 'function') {
            callback.call(scope || this, operation);
        }
    },
    //inherit docs
    read: function(operation, callback, scope) {
        var me = this;
       console.log(44)
       console.log(me.dbConfig)
       console.log(me.dbConfig.dbQuery)
        var sql = me.dbConfig.dbQuery || 'SELECT * FROM '+me.dbConfig.tablename+'';
	console.log(111)
	console.log(sql)
        
        var params, onSucess, onError;
        
        onSucess = function(tx, results) {
	    me.applyDataToModel(tx, results, operation, callback, scope);
        };

        onError = function(tx, err) {
            me.throwDbError(tx, err);
        };

        
        me.queryDB(me.dbConfig.dbConn, sql, onSucess, onError);
    },
    //inherit docs
    destroy: function(operation, callback, scope) {
        console.log("destroy");
        var me = this;
        var records = operation.records,
            length = records.length,
            i, tbl_Id = me.getReader().idProperty || 'ID';
        
        for (i = 0; i < length; i++) {
            this.removeRecord(records[i].data[tbl_Id], me.dbConfig.tablename, tbl_Id, false);
        }

        operation.setCompleted();
        operation.setSuccessful();

        if (typeof callback == 'function') {
            callback.call(scope || this, operation);
        }
    },
    /**
     *@private
     *Creates table if not exists
     */
    createTable : function(){
        var me = this;
        me.dbConfig.dbConn.transaction(function(tx) {
            
            var onError = function(tx, err) {
                me.throwDbError(tx, err);
            };
            
            var onSucess = function(tx, results) {
               console.log("success");
            }
        
            var createTable = function() {
                var createsql = 'CREATE TABLE IF NOT EXISTS ' + me.dbConfig.tablename + '('+me.constructFields()+')';
                tx.executeSql(createsql,[],onSucess,onError);
            }
            var tablesql = 'SELECT * FROM '+ me.dbConfig.tablename+' LIMIT 1';
            tx.executeSql(tablesql,[], Ext.emptyFn, createTable);
        });
        
    },
     /**
     * @private
     * Get reader data and set up fields accordingly
     * Used for table creation only
     * @return {String} fields separated by a comma
     */
    constructFields: function() {
        var me = this,
            m = me.getModel(),
            fields = m.prototype.fields.items,
            flatFields = [];
	    Ext.each(fields, function(f) {
		
		if(f.isTableField || !Ext.isDefined(f.isTableField)){
		    var name = f.name;
		    var type = f.type.type;
		    var fieldoption = (f.fieldOption)  ? f.fieldOption : '';
		  
		    type = type.replace(/int/i, 'INTEGER')
			.replace(/string/i,'TEXT')
			.replace(/date/i, 'DATETIME');
		    flatFields.push(name + ' ' + type+' '+fieldoption);
		}
	    });
        return flatFields.join(',');
    },
    /**
     * function to return records w.r.t to table fields. If model has fields
     * which is not table field name, it will break create and update functionalitites.This looks for field property "isTableField"
     */
    getTableFields : function(records){
       
        var  newrecords = [],removedField = [], length = records.length,
            m = this.getModel(), modelFields = m.prototype.fields.items;
            Ext.each(modelFields,function(item,index){
                if(item.isTableField == false){
                    removedField.push(item.name);
                }
            });
        
      
        for (i = 0; i < length; i++) {
            record = records[i];
            Ext.each(removedField,function(item,index){
                delete record.data[item];
            });
            newrecords.push(record);
        }
        return newrecords;
    },
     /**
     * execute sql statements
     * @param {Object} dbConn Database connection Value
     * @param {String} sql Sql Statement
     * @param {Function} successcallback  success callback for sql execution
     * @param {Function} errorcallback  error callback for sql execution
     * @param {Array}  params  sql statement parameters
     * @param {Function} callback  additional callback
     */
    queryDB: function(dbConn, sql, successcallback, errorcallback, params, callback) {
        var me = this;
        dbConn.transaction(function(tx) {
            if (typeof callback == 'function') {
                callback.call(scope || me, results, me);
            }

            tx.executeSql(
            sql, (params ? params : []), successcallback, errorcallback);
        });
    },
     /**
     * @private
     * Created array of objects, each representing field=>value pair.
     * @param {Object} tx Transaction
     * @param {Object} rs Response
     * @return {Array} Returns parsed data
     */
    parseData: function(tx, rs) {
        var rows = rs.rows,
            data = [],
            i = 0;
        for (; i < rows.length; i++) {
            data.push(rows.item(i));
        }
        return data;
    },
    applyData: function(data, operation, callback, scope) {
        var me = this;
        operation.resultSet = new Ext.data.ResultSet({
            records: data,
            total: data.length,
            loaded: true
        });
        operation.setSuccessful();
        operation.setCompleted();
        //finish with callback
        if (typeof callback == "function") {
            callback.call(scope || me, operation);
        }
    },
    applyDataToModel: function(tx, results, operation, callback, scope) {
        var me = this;
        var records = me.parseData(tx, results);
        var storedatas = [];
        if (results.rows && records.length) {
            for (i = 0; i < results.rows.length; i++) {
                var storedata = new me.model(records[i]);
                storedatas.push(storedata);
            } 
        }
        me.applyData(storedatas, operation, callback, scope);
    },
    
    /**
     * Output Query Error
     * @param {Object} tx Transaction
     * @param {Object} rs Response
     */
    throwDbError: function(tx, err) {
        console.log(this.type + "----" + err.message);
    },
    /**
     * Saves the given record in the Proxy.
     * @param {Ext.data.Model} record The model instance
     */
    setRecord: function(record, tablename, primarykey) {

        var me = this,
            rawData = record.data,
            fields = [],
            values = [],
            placeholders = [],

            onSuccess = function(tx, rs) {
                var returnrecord = record,
		insertId = rs.insertId;
		returnrecord.data[primarykey] = insertId;
                returnrecord.internalId = insertId;
            },

            onError = function(tx, err) {
                me.throwDbError(tx, err);
            };

        //extract data to be inserted
        for (var i in rawData) {
            if (rawData[i]) {
                fields.push(i);
                values.push(rawData[i]);
                placeholders.push('?');
            }
        }

        var sql = 'INSERT INTO ' + tablename + '(' + fields.join(',') + ') VALUES (' + placeholders.join(',') + ')';
        me.queryDB(me.dbConfig.dbConn, sql, onSuccess, onError, values);

        return true;
    },
    
    /**
     * Updates the given record.
     * @param {Ext.data.Model} record The model instance
     */
    updateRecord: function(record, tablename, primarykey) {
        var me = this,
            id = record.get(primarykey),
            key = primarykey,
            modifiedData = record.modified,
            newData = record.data,
            pairs = [],
            values = [],
            onSuccess = function(tx, rs) {
                //add new record if id doesn't exist
                if (rs.rowsAffected == 0) {
                    me.setRecord(record, tablename, primarykey);
                }
            },
            onError = function(tx, err) {
                me.throwDbError(tx, err);
            };

        for (var i in newData) {
            if (i != primarykey) {
                pairs.push(i + ' = ?');
                values.push(newData[i]);
            }
        }

        values.push(id);
        var sql = 'UPDATE ' + tablename + ' SET ' + pairs.join(',') + ' WHERE ' + key + ' = ?';
        me.queryDB(me.dbConfig.dbConn, sql, onSuccess, onError, values);
        return true;
    },
    /**
     * @private
     * Physically removes a given record from the object store. 
     * @param {Mixed} id The id of the record to remove
     */
    removeRecord: function(id, tablename, primarykey) {
        var me = this,
            values = [],
            onSuccess = function(tx, rs) {
              
            },
            onError = function(tx, err) {
                me.throwDbError(tx, err);
            };
        var sql = 'DELETE FROM ' + tablename + ' WHERE ' + primarykey + ' = ?';
        values.push(id);
        me.queryDB(me.dbConfig.dbConn, sql, onSuccess, onError, values);
        return true;
    },
    
    /**
     * Destroys all records stored in the proxy 
     */
    truncate: function(tablename) {
        var me = this;
        var sql = 'DELETE FROM ' + me.dbConfig.tablename;  
        me.queryDB(me.dbConfig.dbConn, sql, function(){}, function(){});
        return true;
    }
});


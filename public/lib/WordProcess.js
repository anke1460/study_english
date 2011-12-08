Ext.data.Batch.override({
    constructor: function(config) {
        var me = this;
        if (config.hasOwnProperty) {
             this.proxy = config.proxy;
          }
          me.mixins.observable.constructor.call(me, config);
          me.operations = [];
    }
});



Ext.Base.override('Ext.ModelManager',{
    create: function(config, name, id) {
        var con = typeof name == 'function' ? name : this.types[name || config.name];
         console.log(con)
        return new con(config, id);
    }
    })



Ext.define('StudyLanguage.WordProcess',{
    constructor: function(config) {
        this.callParent(arguments);
    },
    
    loadData: function(params, store) {
      var proxy = store.getProxy();
      proxy.dbConfig.dbQuery = "select * from words where english like '%" +
                       params.query + "%' or chinese like '%" +
                        params.query + "%'  limit " + store.pageSize +
                        " offset " + params.offset;
      this.setStorePageCount(params, store);
      store.load();
    },
    
    setStorePageCount: function(params, store) {
        this.executeSql("select count(*) as l from words where english like '%" +
                         params.query + "%' or chinese like '%"+ params.query +"%' ",
                         function(t, result){
                          store.total_page = parseInt(result.rows.item(0).l / store.pageSize);
                         });
     },
     
     executeSql: function(sql, callback) {
         Ext.DbConnection.dbConn.transaction(
           function(t){
             t.executeSql(sql, [], callback,
             function(t, error){
               console.log(error)
               return false;
             }
        )
     });
     },
     
     
     searchWord: function(params, store) {
        var proxy = store.getProxy();
       if (params.query == "") {
          proxy.dbConfig.dbQuery = "select * from words limit 10";
        } else {
          this.setStorePageCount(params, store); 
          proxy.dbConfig.dbQuery = "select * from words where english like '%" + params.query +"%' or chinese like '%"+ params.query +"%' limit 10";
         }
         console.log(334)
         console.log(proxy.dbConfig.dbQuery)
         store.load();
     }
    });



StudyLanguage.play = function(id) {
    document.getElementById("audio"+id).src='images/sound.png';
    setTimeout(function(){

    // while(document.getElementById("pr"+id).paused){
      document.getElementById("audio"+id).src='images/sound_none.png';
     // }
    },100)
    document.getElementById("pr"+id).play();
    //document.getElementById("audio"+id).src='images/sound_none.png'
    //document.getElementById("pr"+id).pause();
  //}
  
}

StudyLanguage.checkDataBaseSupport = function () {
      try {
          if (!window.openDatabase) {
              alert('not supported');
          } else {
              var shortName = 'study';
              var version = '1.19';
              var displayName = 'My Important Database';
              var maxSize = 15*1024*1024; // in bytes
              var db = openDatabase("study",version, displayName, maxSize);
              // You should have a database instance in db.
          }
      } catch(e) {
          // Error handling code goes here.
          if (e == 2) {
              // Version number mismatch.
              alert("Invalid database version.");
          } else {
              alert("Unknown error "+e+".");
          }
      }
}

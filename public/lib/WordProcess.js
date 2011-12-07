Ext.define('StudyLanguage.WordProcess',{
    constructor: function(config) {
        this.callParent(arguments);
    },
    
    loadData: function(params, store) {
      var call_back = this.callBack(store);
      this.setStorePageCount(params, store);
      this.executeSql("select * from words where english like '%" +
                       params.query + "%' or chinese like '%" +
                        params.query + "%'  limit " + store.pageSize +
                        " offset " + params.offset,
                        call_back);
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
     
     callBack: function(store) {
        
       return function(t, result) {
         var data = [];
         store.removeAll();
         if (result.rows.length > 0) {
           for(var i= 0;i< result.rows.length ;i++){
            data.push(result.rows.item(i))
           }
         store.add(data);
         }
      }  
     },
     
     searchWord: function(params, store) {
       if (params.query == "") {
         this.loadData({query:"", offset:0}, store);
        } else {
          var result = this.callBack(store);
          this.setStorePageCount(params, store);
          this.executeSql("select * from words where english like '%" + params.query +"%' or chinese like '%"+ params.query +"%' limit 10", result);
         }
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

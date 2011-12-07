Ext.define('StudyLanguage.controller.Main', {
    extend: 'Ext.app.Controller',
    
    views: [
        'Viewport'
    ],
    
    models: [
        'Word'
    ],
    
    stores: ['GRE'],
    
    refs: [
    {
      ref: 'SearchWord',
      selector: '#textquery'
    }
    ],
    
    init: function() {
        Ext.create('StudyLanguage.view.Viewport');
        this.word_process = Ext.create('StudyLanguage.WordProcess');
        this.word_process.loadData({query:"", offset:0}, this.getGREStore());
        this.getViewportView().create();
        this.control({
            '#last_page': {
             tap: this.onLoadLastPage
            },
            '#next_page' : {
              tap: this.onloadNextPage
            },
            '#textquery': {
              keyup: this.onSearchKeyUp,
              blur: this.onSearchBlur
            }
        })
    } ,
    onLaunch: function() {
        console.log(this)
    },
    
    onLoadLastPage: function () {
       var store = this.getGREStore();
           if(store.currentPage != 1) {
              store.currentPage -= 1;
              var i = store.pageSize * (store.currentPage - 1);
              console.log(this.getSearchWord().getValue())
              //Ext.getCmp('textquery').getValue() why not get value?
              this.word_process.loadData({query: Ext.getCmp('textquery').getValue(), offset: i}, store);
            }

    },
    
    onloadNextPage: function() {
         var store = this.getGREStore();
         console.log(this.getSearchWord().getValue())
         if(store.currentPage <= store.total_page){
           var i = store.pageSize * store.currentPage;
           this.word_process.loadData({query: Ext.getCmp('textquery').getValue(), offset: i}, store);
            store.currentPage += 1;
         }
    },
    
    onSearchKeyUp: function(t) {
       //need to set value for search input
        
        console.log(this.getSearchWord().getValue())
       this.word_process.searchWord({query: t.getValue()}, this.getGREStore());
       Ext.getCmp('textquery').setValue(t.getValue())
       this.getGREStore().currentPage = 1;
    },
    
    onSearchBlur: function() {
       this.getSearchWord().setValue("");
       var store = this.getGREStore();
       this.word_process.loadData({query: '', offset: 0}, store);
       this.getGREStore().currentPage = 1;
        
    }
});
Ext.override('Ext.field.Input',{
    updateValue: function(newValue) {
        var input = this.input;
          console.log(input)
        if (input) {
            input.dom.value = newValue;
        }
    }})

Ext.define('StudyLanguage.view.Viewport', {
    extend: 'Ext.tab.Panel',
    id: 'd',
    config: {
        fullscreen: true,

        tabBar: {
            docked: 'bottom',
            layout: {
                pack: 'center'
            }
        },

        defaults: {
            scrollable: true
        },

        items: [
            {
                    title: 'Home',
                    iconCls: 'home',
                    cls: 'home',
                    style: 'text-align:center;margin-top: 48%;',
                    html: [
                        '',
                        '<h1>Welcome to study laguage</h1>',
                        "<p>Are you happy?",
                        "</p>",
                        '<h2>Version 1.0</h2>'
                    ].join("")
                },
                {
                    xtype: 'list',
                    title: 'My deck',
                    iconCls: 'star',
                    preventSelectionOnDisclose: false,
                    onItemDisclosure  : function(record){
                        StudyLanguage.play(record.get('ID'));
                        },
                    itemTpl:
                         '</div><div>English:<span style="font-weight:bold; margin-left:15px;">{english}</span><div>'+
                         'Chinese:<span style="font-weight:bold; margin-left:15px;">{chinese}</span></div>'+
                         '<div>Pronunciation:<img id="audio{ID}" style="cursor:pointer;" src="images/sound_none.png"></div>'+
                         '<audio id="pr{ID}" type="audio/mpeg" src="audio/GRE/'+Math.ceil(Math.random()*6)+'.mp3"></audio>',
                    store: 'GRE',
                    items: {
                        xtype : 'toolbar',
                        docked: 'top',
                        items: [
                             {
                             ui: 'back',
                             text: 'Previous',
                             id: 'last_page'
                             },
                            {
                                flex: 4,
                                xtype: 'searchfield',
                                id: 'textquery',
                                input: {dom:{value:0}}
                             },
                             { xtype: 'spacer' },
                             {
                                ui: 'forward',
                                text: 'Next page',
                                id: 'next_page'
                            }
                        ]
                    },
                },
                //this is the new item
                {
                    title: 'Add deck',
                    iconCls: 'user',
                    xtype: 'formpanel',
                    layout: 'vbox',

                    items: [
                        {
                            xtype: 'fieldset',
                            title: 'Custom deck',
                            items: [
                                {
                                    xtype: 'textfield',
                                    label: 'English',
                                    name: 'english'
                                },
                                {
                                    xtype: 'textfield',
                                    label: 'Chinese',
                                    name: 'chinese'
                                },
                                {
                                    xtype: 'textfield',
                                    label: 'English Pronunciation',
                                    name: 'english_pronunciation'
                                }
                            ]
                        },
                        {
                            xtype: 'button',
                            text: 'Save',
                            ui: 'confirm',
                            handler: function() {
                                var data = this.up('formpanel').getValues();
                                
                                store.add({english: data.english, chinese: data.chinese, other: data.other})
                                store.sync();
                                store.load();
                                this.up('formpanel').reset();
                                this.up().up().setActiveItem(1);
                            }
                        }
                    ]
                }
        ]
    }
});

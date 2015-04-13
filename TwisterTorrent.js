'use strict';

function TwisterTorrent(name,scope) {
    
    this._name = name;
    this._active = false;
    
    this._scope = scope;
    
}

module.exports = TwisterTorrent;

TwisterTorrent.prototype.activate =  function (cbfunc) {

    var Twister = this._scope;
    
    var thisTorrent = this;
    
    Twister.RPC("follow", [ "guest", [this._name] ], function(res) {
        
        //console.log(res);
        
        thisTorrent._active = true ;
        
        if (cbfunc) {
            cbfunc(res);        
        }
        
    },function(ret) {
        
        console.log(ret);
        
    });

}

TwisterTorrent.prototype.deactivate =  function (cbfunc) {

    var Twister = this._scope;
    
    var thisTorrent = this;
    
    Twister.RPC("unfollow", [ "guest",[this._name] ], function(res) {
        
        thisTorrent._active = false ;
        
        if (cbfunc) {
            cbfunc(res);        
        }
        
    }, function(ret) {
        
        console.log(ret);
        
    });

}

TwisterTorrent.prototype._fillCacheUsingGetposts = function (count,maxId,sinceId,cbfunc) {

    var Twister = this._scope;
    
    var thisTorrent = this;
    var thisUser = Twister.getUser(this._name);
    
    if (thisTorrent._active) {
    
        var request = {username: this._name};
        if (maxId>-1) { request["maxId"]=maxId; }
        if (sinceId>-1) { request["sinceId"]=sinceId; }
        
        Twister.RPC("getposts", [ count ,[request] ], function(res) {

            //console.log(res);
            
            if (res.length>0) {

                for (var i = 0; i<res.length; i++) {

                    var TwisterPost = require('./TwisterPost.js');
                    
                    var id = res[i].userpost.k;
                    var newpost = new TwisterPost(res[i].userpost);
                    thisUser._posts[id]=newpost;
                    
                    if (id>thisUser._latestId ) {
                        
                        thisUser._latestId = newpost.getId();
                        thisUser._latestTimestamp = newpost.getTimestamp();
                        thisUser._lastStatusUpdate = Date.now()/1000;
                        
                    }
                        
                }

                cbfunc(true);

            } else {

                thisTorrent._active = false ;

                cbfunc(false);

            }

        }, function(ret) {
        
            console.log(ret);

        });
    
    } else {

        thisTorrent._active = false ;

        cbfunc(false);

    }
    
}

TwisterTorrent.prototype.updateCache = function (cbfunc) {

    var Twister = this._scope;
    
    var thisTorrent = this;
    var thisUser = Twister.getUser(this._name);
    
    thisTorrent._fillCacheUsingGetposts(30,-1,-1,cbfunc);

}

TwisterTorrent.prototype.fillCache = function (id,cbfunc) {

    var Twister = this._scope;
    
    var thisTorrent = this;
    var thisUser = Twister.getUser(this._name);
    
    thisTorrent._fillCacheUsingGetposts(30,id,-1,cbfunc);

}
// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Initialization
var undoStack = [];

// Finds folder at the specified level of the tree.
function findFolder(folderName, level, fn){
	chrome.bookmarks.getTree(function(tree){
		var children = tree[level].children;
		for (i =0; i < children.length; i++) {
			if(children[i].title==folderName){
				fn(children[i]);
			}
		}
	});
}

function replicateTree(treefromId, bMark){
    chrome.bookmarks.create(bMark, function(currentNode){
        chrome.bookmarks.getSubTree(treefromId, function(tree){
            var children = tree[0].children;
            for (i =0; i < children.length; i++) {
                //var bMark ={};
                if (children[i].url!=undefined && children[i].url!=''){
                    var bMark ={};
                    bMark={'parentId':currentNode.id, 'title':children[i].title, 'url':children[i].url};
                    chrome.bookmarks.create(bMark);
                }
                else{
                    var bMark ={};
                    console.log("ttid -- ",currentNode.id);
                    bMark={'parentId':currentNode.id, 'title':children[i].title};
                        replicateTree(children[i].id, bMark);
                }
            }
        });
    });

}

//Loads the folders present in other bookmarks.
init = function() {
	//findFolder('Other bookmarks',0,function(btNode){
        chrome.bookmarks.getTree(function(tree){
        var btNode = tree[0].children[1];
		var folderList=[];
		var children=btNode.children;
    //Other bookmarks folder
		for (i =0; i < children.length; i++) {
			if(!children[i].url){
				folderList.push(children[i]);
			}
		}
        var selectS = document.getElementById("selectSFolder");
        var selectR = document.getElementById("selectRFolder");
		var newFolder = document.createElement("option");

        selectS.innerHTML ='';
        selectR.innerHTML ='';
		newFolder.textContent = "New Folder...";
		newFolder.value= -1;
		selectS.appendChild(newFolder);
		for(var i = 0; i < folderList.length; i++) {
		    var opt = folderList[i];

            var el1 = document.createElement("option");
            el1.textContent = opt.title;
            el1.value = opt.id;

            selectS.appendChild(el1);

            var el2 = document.createElement("option");
		    el2.textContent = opt.title;
            el2.value = opt.id;
		    selectR.appendChild(el2);
		}
	});
}
document.addEventListener('DOMContentLoaded', init());

// Delete Folder
document.getElementById("selectSFolder").addEventListener("click", function(){
    var a = document.getElementById("selectSFolder");
    var title = a.options[a.selectedIndex].innerHTML;
    var selId=a.options[a.selectedIndex].value;
    if (selId!=-1){
        document.getElementById("save-footer").innerHTML = "<a style=\"cursor:pointer\" title=\"Delete Folder\" id=\"delYes\"><i class=\"fa fa-trash fa-lg\"></i></a>";
    }
    else{
        document.getElementById("save-footer").innerHTML = "Double Click to save to Folder";
    }
    document.getElementById('delYes').addEventListener('click', function(){
    var a = document.getElementById("selectSFolder");
    var title = a.options[a.selectedIndex].innerHTML;
    var selId=a.options[a.selectedIndex].value;
    if(selId!=-1){
        document.getElementById("save-footer").innerHTML = "Are you sure you want to delete \""+title+"\"? <br/><span class=\"pointer\"                     id=\"del\"><a>Yes</a></span> <span class=\"pointer\"  id=\"nodel\"><a>No</a></span>";
    }

    document.getElementById('del').addEventListener('click', function(){
        document.getElementById("save-footer").innerHTML = " <div class=\"alert alert-danger\" role=\"alert\"><i class=\"fa fa-exclamation-circle\"></i> <b>Deleted</b></span>";
        chrome.bookmarks.removeTree(selId);
        init();
    });
        document.getElementById("nodel").addEventListener("click", function(){
            document.getElementById("save-footer").innerHTML = " <div class=\"alert alert-warning\"  role=\"alert\"><i class=\"fa fa-exclamation-circle\"></i> <b>Cancelled</b></span>";
            init();
        });

    });


});


// Functionality of Save
document.getElementById("selectSFolder").addEventListener("dblclick", function(){
    var a = document.getElementById("selectSFolder");
    var title = a.options[a.selectedIndex].innerHTML;
    var selId=a.options[a.selectedIndex].value;
    if(selId!=-1){// Not trying to create a folder
        document.getElementById("save-footer").innerHTML = "Are you sure you wanna overwrite \""+title+"\"? <br/><span class=\"pointer\" id=\"yes\"><a>Yes</a></span> <span class=\"pointer\"  id=\"no\"><a>No</a></span>";
        document.getElementById("yes").addEventListener("click", function(){
           //findFolder('Bookmarks bar',0,function(bBar){
            chrome.bookmarks.getTree(function(tree){
            var bBar = tree[0].children[0];
            bchildren=bBar.children;
            bBarId = bBar.id;
            //console.log(a.options[a.selectedIndex].value);

            var id;
            id=selId;
            chrome.bookmarks.getSubTree(id, function(treeNode){
                undoStack.push(treeNode);
            });//Future for undo functionality..!

            chrome.bookmarks.getChildren(id, function(children){
                for (var i = 0; i < bchildren.length; i++){
                    var bMark ={};
                    if (bchildren[i].url!=undefined && bchildren[i].url!=''){
                        bMark={'parentId':id, 'title':bchildren[i].title, 'url':bchildren[i].url};
                        chrome.bookmarks.create(bMark);
                    }
                    else {// Make the folder with all the shit inside
                        bMark={'parentId':id, 'title':bchildren[i].title};
                        replicateTree(bchildren[i].id, bMark)
                    }

                        if(children[i]!=undefined && children[i]!=''){
                            if(children[i].url!=undefined && children[i].url!='')
                                chrome.bookmarks.remove(children[i].id);
                            else
                                chrome.bookmarks.removeTree(children[i].id);
                        }
                }
                document.getElementById("save-footer").innerHTML = " <div class=\"alert alert-success\" role=\"alert\"><i class=\"fa fa-check-circle\"></i> <b>Saved</b></div>";
            });
           });
        });

        document.getElementById("no").addEventListener("click", function(){
            document.getElementById("save-footer").innerHTML = " <div class=\"alert alert-warning\"  role=\"alert\"><i class=\"fa fa-exclamation-circle\"></i> <b>Cancelled</b></div>";
        });
    }
    else{
        document.getElementById("save-footer").innerHTML = "<input id=\"newFolder\" type=\"text\"> <div id=\"newFButton\" class=\"btn btn-primary btn-xs\"> Create</div>";
        document.getElementById("newFButton").addEventListener("click",function(){
            var folderName = document.getElementById("newFolder").value;
            var otherBId;
            var id;
            //findFolder('Other bookmarks',0,function(otherBookmarks){
            chrome.bookmarks.getTree(function(tree){
            var otherBookmarks = tree[0].children[1];
                otherBId = otherBookmarks.id;
                console.log(otherBId);
                //findFolder('Bookmarks bar',0,function(bBar){
                chrome.bookmarks.getTree(function(tree){
                var bBar = tree[0].children[0];
                    bchildren=bBar.children;
                    bBarId = bBar.id;
                    bMark={'parentId':otherBId, 'title':folderName};
                    replicateTree(bBarId,bMark);
                    document.getElementById("save-footer").innerHTML = " <div class=\"alert alert-success\" role=\"alert\"><i class=\"fa fa-check-circle\"></i> <b>Saved</b></div>";
                    init();
                });
           });
        });
    }


});

// Functionality of Replace
document.getElementById("selectRFolder").addEventListener("dblclick", function(){
		var a = document.getElementById("selectRFolder");
		//findFolder('Bookmarks bar',0,function(bBar){
        chrome.bookmarks.getTree(function(tree){
            var bBar = tree[0].children[0];
			bchildren=bBar.children;
			bBarId = bBar.id;
			for (var i = 0; i < bchildren.length; i++){
                if(bchildren[i].url!=undefined)
				    chrome.bookmarks.remove(bchildren[i].id);
                else
                    chrome.bookmarks.removeTree(bchildren[i].id);
			}
			//console.log(a.options[a.selectedIndex].value);
			var id=a.options[a.selectedIndex].value;
			chrome.bookmarks.getChildren(id, function(children){
				//children=node.children;
				for (var i = 0; i < children.length; i++){
					var bMark ={};
					if (children[i].url!=undefined){
						bMark={'parentId':bBarId, 'title':children[i].title, 'url':children[i].url};
                        chrome.bookmarks.create(bMark);
                    }
                    else{
                        bMark={'parentId':bBarId, 'title':children[i].title};
                        replicateTree(children[i].id, bMark)
                    }

				}
			});
		});

});

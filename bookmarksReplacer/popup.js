// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.


//***********************************INCOMPLETE OR TEST CODE***********************************
function getBookmarksBar() {
	/*chrome.bookmarks.get(bookmarkBar.id,function(result)){
    var bookmarks = document.getElementById('bookmarksBar');
    bookmarks.innerHTML = 'Hey there';
    });*/
	console.log('Console messages');
}

function replaceBar(folder){
	chrome.bookmarks.getChildren('1',function (result){
		var toRemove = result[11].id;
		console.log(result[11]);
		chrome.bookmarks.remove(toRemove);
	});
}

//***********************************INCOMPLETE OR TEST CODE***********************************

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
        treeToId = currentNode.id;
        chrome.bookmarks.getSubTree(treefromId, function(tree){
            var children = tree[0].children;
            for (i =0; i < children.length; i++) {
                var bMark ={};
                if (children[i].url!=undefined){
                    bMark={'parentId':treeToId, 'title':children[i].title, 'url':children[i].url};
                    chrome.bookmarks.create(bMark);
                }
                else{
                    bMark={'parentId':treeToId, 'title':children[i].title};
                    chrome.bookmarks.create(bMark, function(currentNode){
                        replicateTree(children[i].id, currentNode.id);
                        console.log(currentNode.id);
                    });
                }
            }
        });
    });

}

//Loads the folders present in other bookmarks.
document.addEventListener('DOMContentLoaded', function() {
	findFolder('Other bookmarks',0,function(btNode){
		var folderList=[];
		var children=btNode.children;
		for (i =0; i < children.length; i++) {
			if(!children[i].url){
				folderList.push(children[i]);
			}
		}

        var selectS = document.getElementById("selectSFolder");
        var selectR = document.getElementById("selectRFolder");
		var newFolder = document.createElement("option");

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
});

// Functionality of Save
document.getElementById("selectSFolder").addEventListener("dblclick", function(){
		var a = document.getElementById("selectSFolder");
		findFolder('Bookmarks bar',0,function(bBar){
			bchildren=bBar.children;
			bBarId = bBar.id;
			//console.log(a.options[a.selectedIndex].value);
			var selId=a.options[a.selectedIndex].value;
			var id;
			if(selId!=-1){
				id=selId;
			}
            //Make Stack, and put chrome.bookmarks.getTree(id) into it.
			chrome.bookmarks.getChildren(id, function(children){
				//children=node.children;
				for (var i = 0; i < bchildren.length; i++){
					var bMark ={};
					if (bchildren[i].url!=undefined)
						bMark={'parentId':id, 'title':bchildren[i].title, 'url':bchildren[i].url};
                        if(children[i]!=undefined){
                            if(children[i].url!=undefined)
                                chrome.bookmarks.remove(children[i].id);
                            else
                                chrome.bookmarks.removeTree(children[i].id);
                        }
                        chrome.bookmarks.create(bMark);
				}
			});
		});

});

// Functionality of Replace
document.getElementById("selectRFolder").addEventListener("dblclick", function(){
		var a = document.getElementById("selectRFolder");
		findFolder('Bookmarks bar',0,function(bBar){
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
/**
 * @param {string} searchTerm - Search term for Google Image search.
 * @param {function(string,number,number)} callback - Called when an image has
 *   been found. The callback gets the URL, width and height of the image.
 * @param {function(string)} errorCallback - Called when the image is not found.
 *   The callback gets a string that describes the failure reason.
 */



getBookmarksBar();

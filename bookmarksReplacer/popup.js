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
		var select = document.getElementById("selectFolder"); 
		var newFolder = document.createElement("option");
		newFolder.textContent = "New Folder...";
		newFolder.value= -1;
		select.appendChild(newFolder);

		for(var i = 0; i < folderList.length; i++) {
		    var opt = folderList[i];
		    var el = document.createElement("option");
		    el.textContent = opt.title;
		    el.value = opt.id;
		    select.appendChild(el);
		}
	});
});


// Functionality of Replace
document.getElementById("click").addEventListener("click", function(){
		var a = document.getElementById("selectFolder");
		findFolder('Bookmarks bar',0,function(bBar){
			bchildren=bBar.children;
			bBarId = bBar.id;
			for (var i = 0; i < bchildren.length; i++){
				chrome.bookmarks.remove(bchildren[i].id);
			}
			//console.log(a.options[a.selectedIndex].value);
			var selId=a.options[a.selectedIndex].value;
			var id;
			if(selId!=-1){
				id=selId;
			}
			chrome.bookmarks.getChildren(id, function(children){
				//children=node.children;
				for (var i = 0; i < children.length; i++){
					var bMark ={};
					if (children[i].url)
						bMark={'parentId':bBarId, 'title':children[i].title, 'url':children[i].url};
					chrome.bookmarks.create(bMark);
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

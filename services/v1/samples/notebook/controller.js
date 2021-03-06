function Controller()
{
    var self = this; //<- I hate javascript.
	
    this.setLayout = function(sender)
    {
        switch(sender)
        {
            case model.views.mapLayoutButton:
                model.views.listLayoutButton.deselect();
                model.views.listLayout.style.display = 'none';
                model.views.sortSelector.style.display = 'none';
                model.views.mapLayout.style.display = 'block';
                model.views.mapNoteViewContainer.appendChild(model.views.noteView.html);
                break;
            case model.views.listLayoutButton:
                model.views.mapLayoutButton.deselect();
                model.views.mapLayout.style.display = 'none';
                model.views.sortSelector.style.display = 'block';
                model.views.listLayout.style.display = 'block';
                model.views.listNoteViewContainer.appendChild(model.views.noteView.html);
                break;
        }
    };
    this.setSort = function(sender)
    {
        switch(sender)
        {
            case model.views.contributorSortButton:
                model.views.tagSortButton.deselect();
                model.views.popularitySortButton.deselect();
                model.views.noteListSelectorContainer.style.height = '245px';
                model.views.noteListSelectorContainer.style.margin = '10px 0px 0px 0px';
                model.views.noteListSelector.style.height = '223px';
                model.views.tagListFilterSelectorContainer.style.display = 'none';
                model.views.contributorListFilterSelectorContainer.style.display = 'block';
                self.populateNotesByContributor();
                break;
            case model.views.tagSortButton:
                model.views.contributorSortButton.deselect();
                model.views.popularitySortButton.deselect();
                model.views.noteListSelectorContainer.style.height = '245px';
                model.views.noteListSelectorContainer.style.margin = '10px 0px 0px 0px';
                model.views.noteListSelector.style.height = '223px';
                model.views.contributorListFilterSelectorContainer.style.display = 'none';
                model.views.tagListFilterSelectorContainer.style.display = 'block';
                self.populateNotesByTag();
                break;
            case model.views.popularitySortButton:
                model.views.contributorSortButton.deselect();
                model.views.tagSortButton.deselect();
                model.views.noteListSelectorContainer.style.height = '500px';
                model.views.noteListSelectorContainer.style.margin = '0px 0px 0px 0px';
                model.views.noteListSelector.style.height = '478px';
                model.views.contributorListFilterSelectorContainer.style.display = 'none';
                model.views.tagListFilterSelectorContainer.style.display = 'none';
                self.populateNotesByPopularity();
                break;
        }
    };

    this.mapContributorClicked = function(sender, selected) 
    {
        self.populateMapNotes(false);
    };
    this.selectAllMapContributors = function() 
    {
        for(var i = 0; i < model.contributorMapCells.length; i++)
            model.contributorMapCells[i].select();
        self.populateMapNotes(false);
    };
    this.deselectAllMapContributors = function()
    {
        for(var i = 0; i < model.contributorMapCells.length; i++)
            model.contributorMapCells[i].deselect();
        self.populateMapNotes(false);
    };
    this.mapTagClicked = function(sender,selected) 
    {
        self.populateMapNotes(false);
    };
    this.selectAllMapTags = function()
    {
        for(var i = 0; i < model.tagMapCells.length; i++)
            model.tagMapCells[i].select();
        self.populateMapNotes(false);
    };
    this.deselectAllMapTags = function()
    {
        for(var i = 0; i < model.tagMapCells.length; i++)
            model.tagMapCells[i].deselect();
        self.populateMapNotes(false);
    };
    this.listContributorClicked = function(sender,selected) 
    {
        self.populateNotesByContributor();
    };
    this.selectAllListContributors = function()
    {
        for(var i = 0; i < model.contributorListCells.length; i++)
            model.contributorListCells[i].select();
        self.populateNotesByContributor();
    };
    this.deselectAllListContributors = function()
    {
        for(var i = 0; i < model.contributorListCells.length; i++)
            model.contributorListCells[i].deselect();
        self.populateNotesByContributor();
    };
    this.listTagClicked = function(sender,selected)
    {
        self.populateNotesByTag();
    };
    this.selectAllListTags = function()
    {
        for(var i = 0; i < model.tagListCells.length; i++)
            model.tagListCells[i].select();
        self.populateNotesByTag();
    };
    this.deselectAllListTags = function()
    {
        for(var i = 0; i < model.tagListCells.length; i++)
            model.tagListCells[i].deselect();
        self.populateNotesByTag();
    };
    this.noteSelected = function(sender) 
    {
        var note = sender.object;
        var html = model.views.constructNoteView.cloneNode(true);
        model.views.noteView = new NoteView(html, note);
        model.views.mapNoteViewContainer.innerHTML = '';
        model.views.listNoteViewContainer.innerHTML = '';
        if(model.views.mapLayoutButton.selected)
        {
            model.views.mapNoteViewContainer.appendChild(model.views.mapNoteViewCloseButton.html);
            model.views.mapNoteViewContainer.appendChild(model.views.noteView.html);
            model.views.mapNoteViewContainer.style.display = 'block';
            setTimeout(function() { model.views.mapLayout.addEventListener('click', controller.hideMapNoteView, false); }, 100); //timeout to disallow imediate hiding
        }
        if(model.views.listLayoutButton.selected) 
        {
            model.views.listNoteViewContainer.appendChild(model.views.noteView.html);
            if(model.views.contributorSortButton.selected) for(var i = 0; i < model.views.contributorNoteCells.length; i++) model.views.contributorNoteCells[i].deselect();
            if(model.views.tagSortButton.selected) for(var i = 0; i < model.views.tagNoteCells.length; i++) model.views.tagNoteCells[i].deselect();
            if(model.views.popularitySortButton.selected) for(var i = 0; i < model.views.popularNoteCells.length; i++) model.views.popularNoteCells[i].deselect();
        }
    };

	
    this.populateModel = function(gameData)
    {
        model.gameData = gameData;

        model.backpacks = model.gameData.backpacks;
        for(var i = 0; i < model.backpacks.length; i++)
        {
            if(model.backpacks[i] == "Invalid Player ID") continue;
            for(var j = 0; j < model.backpacks[i].notes.length; j++)
            {
                //Fix up note tags
                model.backpacks[i].notes[j].tags.sort(
                    function(a, b) {
                        if (a.tag.toLowerCase() < b.tag.toLowerCase()) return -1;
                        if (a.tag.toLowerCase() > b.tag.toLowerCase()) return 1;
                        return 0;
                    });
                if(model.backpacks[i].notes[j].tags.length == 0) 
                    model.backpacks[i].notes[j].tags[0] = {"tag":'(untagged)'}; //conform to tag object structure
                model.backpacks[i].notes[j].tagString = '';
                for(var k = 0; k < model.backpacks[i].notes[j].tags.length; k++)
                    model.backpacks[i].notes[j].tagString += model.backpacks[i].notes[j].tags[k].tag+', ';
                model.backpacks[i].notes[j].tagString = model.backpacks[i].notes[j].tagString.slice(0,-2); 
                    
                //Calculate popularity
                model.backpacks[i].notes[j].popularity = parseInt(model.backpacks[i].notes[j].likes,10)+parseInt(model.backpacks[i].notes[j].comments.length,10);

                //Add to various note lists
                model.addNote(model.backpacks[i].notes[j]);
                model.addMapNote(model.backpacks[i].notes[j]);
                model.addContributorNote(model.backpacks[i].notes[j]);
                model.addTagNote(model.backpacks[i].notes[j]);
                model.addPopularNote(model.backpacks[i].notes[j]);
                
                //Add contents to filter lists
                model.addContributor(model.backpacks[i].notes[j].username);
                for(var k = 0; k < model.backpacks[i].notes[j].tags.length; k++)
                    model.addTag(model.backpacks[i].notes[j].tags[k].tag);
            }
        }

        this.populateMapContributors();
        this.selectAllMapContributors();

        this.populateListContributors();
        this.selectAllListContributors();

        this.populateMapTags();
        this.selectAllMapTags();

        this.populateListTags();
        this.selectAllListTags();

        this.populateMapNotes(true);
        this.populateNotesByContributor();
        //this.populateNotesByTag();
        //this.populateNotesByPopularity();
		
    };

    this.populateMapContributors = function()
    {
		model.contributorMapCells = [];
        model.views.contributorMapFilterSelector.innerHTML = ''; //Clear the children
        model.views.contributorMapFilterSelector.appendChild(model.views.helperContributorMapFilterSelectorCell);
        if(model.contributors.length == 0)
            model.views.contributorMapFilterSelector.appendChild(model.views.defaultContributorMapFilterSelectorCell);
        var tmpcell;
        for(var i = 0; i < model.contributors.length; i++)
        {
			if(!this.filterContributor(model.contributors[i], document.getElementById("filterbox").value)) continue;
			tmpcell = new SelectionCell(model.views.constructContributorMapFilterSelectorCell.cloneNode(true), 123-123, this.mapContributorClicked, model.contributors[i]);
			tmpcell.html.firstChild.innerHTML = this.playerPicForContributorList(model.contributors[i]) + model.contributors[i] +  this.rightSideOfCell("   " + model.numberOfNotesForContributor(model.contributors[i]) + this.getNoteIcon());
			model.views.contributorMapFilterSelector.appendChild(tmpcell.html);
			model.contributorMapCells[model.contributorMapCells.length] = tmpcell;
        }
    };
    this.populateListContributors = function()
    {
		model.contributorListCells = [];
        model.views.contributorListFilterSelector.innerHTML = ''; //Clear the children
        model.views.contributorListFilterSelector.appendChild(model.views.helperContributorListFilterSelectorCell);
        if(model.contributors.length == 0)
            model.views.contributorListFilterSelector.appendChild(model.views.defaultContributorListFilterSelectorCell);
        var tmpcell;
        for(var i = 0; i < model.contributors.length; i++)
        {
			if(!this.filterContributor(model.contributors[i], document.getElementById("filterbox").value)) continue;
            tmpcell = new SelectionCell(model.views.constructContributorListFilterSelectorCell.cloneNode(true), 123-123, this.listContributorClicked, model.contributors[i]);
            tmpcell.html.firstChild.innerHTML = this.playerPicForContributorList(model.contributors[i]) + model.contributors[i] + this.rightSideOfCell("  " + model.numberOfNotesForContributor(model.contributors[i]) + this.getNoteIcon());
            model.views.contributorListFilterSelector.appendChild(tmpcell.html);
            model.contributorListCells[model.contributorListCells.length] = tmpcell;
        }
    };
	
    this.populateMapTags = function()
    {
		model.tagMapCells = [];
        model.views.tagMapFilterSelector.innerHTML = ''; //Clear the children
        model.views.tagMapFilterSelector.appendChild(model.views.helperTagMapFilterSelectorCell);
        if(model.tags.length == 0)
            model.views.tagMapFilterSelector.appendChild(model.views.defaultTagMapFilterSelectorCell);
        var tmpcell;
        for(var i = 0; i < model.tags.length; i++)
        {
			console.log(model.tags[i]);
			if(!this.filterTag(model.tags[i], document.getElementById("filterbox").value)) continue;
			
            tmpcell = new SelectionCell(model.views.constructTagMapFilterSelectorCell.cloneNode(true), 123-123, this.mapTagClicked, model.tags[i]);
            tmpcell.html.firstChild.innerHTML = model.tags[i] + this.rightSideOfCell( model.numberOfNotesForTag(model.tags[i])  + this.getNoteIcon() + " </div>");
            model.views.tagMapFilterSelector.appendChild(tmpcell.html);
            model.tagMapCells[model.tagMapCells.length] = tmpcell;
        }
    };
	
    this.populateListTags = function()
    {
		model.tagListCells = [];
        model.views.tagListFilterSelector.innerHTML = ''; //Clear the children
        model.views.tagListFilterSelector.appendChild(model.views.helperTagListFilterSelectorCell);
        if(model.tags.length == 0)
            model.views.tagListFilterSelector.appendChild(model.views.defaultTagListFilterSelectorCell);
        var tmpcell;
        for(var i = 0; i < model.tags.length; i++)
        {
			if(!this.filterTag(model.tags[i], document.getElementById("filterbox").value)) continue;
            tmpcell = new SelectionCell(model.views.constructTagListFilterSelectorCell.cloneNode(true), 123-123, this.listTagClicked, model.tags[i]);
			
            //tmpcell.html.firstChild.innerHTML =  this.checkBox(this.listTagClicked) + model.tags[i] + this.rightSideOfCell("   " + model.numberOfNotesForTag(model.tags[i]) + this.getNoteIcon());
			 tmpcell.html.firstChild.innerHTML = model.tags[i] + this.rightSideOfCell( model.numberOfNotesForTag(model.tags[i])  + this.getNoteIcon() + " </div>");			
            model.views.tagListFilterSelector.appendChild(tmpcell.html);
            model.tagListCells[model.tagListCells.length] = tmpcell;
        }
    };
    this.populateMapNotes = function(center)
    {	
	
        for(var i = 0; i < model.mapMarkers.length; i++)
        {
            if (model.mapMarkers[i].marker != null)
				model.mapMarkers[i].marker.setMap(null);
        }
        model.mapMarkers = [];
		model.views.markerclusterer.clearMarkers();
        var tmpmarker;
        for(var i = 0; i < model.mapNotes.length; i++)
        {
            if(!model.mapContributorSelected(model.mapNotes[i].username)) continue;
            if(!model.mapTagsSelected(model.mapNotes[i].tags)) continue;
			if(!this.filter(model.mapNotes[i], document.getElementById("filterbox").value)) continue;
			
            tmpmarker = new MapMarker(this.noteSelected, model.mapNotes[i]);
            model.mapMarkers[model.mapMarkers.length] = tmpmarker;
        }
        
        if(center)
        {
            var bounds = new google.maps.LatLngBounds();
            for(var i = 0; i < model.mapMarkers.length; i++)
                if(model.mapMarkers[i].object.geoloc.Xa != 0 && model.mapMarkers[i].object.geoloc.Ya != 0)
                    bounds.extend(model.mapMarkers[i].object.geoloc);
            setTimeout(function(){ model.views.gmap.fitBounds(bounds); }, 100);
        }
	
    };
	
	this.filter = function(note, filter) {
		
		if (filter == "") 
			return true; 
		
		// check title
		if (note.title.toLowerCase().indexOf(filter.toLowerCase()) != -1)
			return true;
		
		// check contributor
		if (note.username.toLowerCase().indexOf(filter.toLowerCase()) != -1)
			return true;
		
		// check type
		for (i = 0; i < note.contents.length; i++) {
			if (note.contents[i].type.toLowerCase().indexOf(filter.toLowerCase()) != -1) 
					return true;
		}
		
		// check tags
		for (var i = 0; i < note.tags.length; i++) 
		{		
			if (note.tags[i].tag.toLowerCase().indexOf(filter.toLowerCase()) != -1) 
				return true;
		}
		
		return false;
	};
	
	
	this.filterTag = function(tagToSearch, filter) {
		
		if (filter == "") 
			return true; 
		
		// check tag
		
		if (tagToSearch != null)
		{
			if (tagToSearch.toLowerCase().indexOf(filter.toLowerCase()) != -1)
				return true;
		}
		
		if (tagToSearch != null && tagToSearch != "")
		{
			
			if (model.numberOfNotesForTag(tagToSearch) > 0) 
				return true;
			
		}
			
		
		return false;
	};
	
	this.filterContributor = function(contributor, filter) {
		
		if (filter == "") 
			return true; 
		
		// check contributor

		if (contributor.toLowerCase().indexOf(filter.toLowerCase()) != -1){
			console.log(contributor.toLowerCase());
			console.log(contributor.toLowerCase().indexOf(filter.toLowerCase()));
			return true;
		}
		
		// check for note title & tags & type
		for(var i = 0; i < model.contributorNotes.length; i++)
        {
			if (model.contributorNotes[i].username.toLowerCase() == contributor.toLowerCase())  {
				// check title
				if (model.contributorNotes[i].title.toLowerCase().indexOf(filter.toLowerCase()) != -1)
					return true;
					
				// check tags
				for (var j = 0; j < model.contributorNotes[i].tags.length; j++) 
				{		
					if (model.contributorNotes[i].tags[j].tag.toLowerCase().indexOf(filter.toLowerCase()) != -1) 
						return true;
				}
				//check type
				for (var k = 0; k < model.contributorNotes[i].contents.length; k++) {
					if (model.contributorNotes[i].contents[k].type.toLowerCase().indexOf(filter.toLowerCase()) != -1) 
						return true;
				}
					
			}
			
		}

		return 0;
	};
	
    this.populateNotesByContributor = function()
    {
        model.views.noteListSelector.innerHTML = ''; //Clear the children
        if(model.contributorNotes.length == 0)
            model.views.noteListSelector.appendChild(model.views.defaultNoteListSelectorCell);
        var tmpcell;
        model.views.contributorNoteCells = [];
        for(var i = 0; i < model.contributorNotes.length; i++)
        {
            if(!model.listContributorSelected(model.contributorNotes[i].username)) continue;
			if(!this.filter(model.contributorNotes[i], document.getElementById("filterbox").value)) continue;
            tmpcell = new SingleSelectionCell(model.views.constructNoteListSelectorCell.cloneNode(true), 123-123, this.noteSelected, model.contributorNotes[i]);
            tmpcell.html.firstChild.innerHTML = '<span class="note_cell_title">'+model.contributorNotes[i].title+' - </span><span class="note_cell_author">'+model.contributorNotes[i].username + this.rightSideOfCell(this.getIconsForNoteContents(model.contributorNotes[i]) + '  </span>');
            model.views.noteListSelector.appendChild(tmpcell.html);
            model.views.contributorNoteCells[model.views.contributorNoteCells.length] = tmpcell;
        }
    };
	
    this.populateNotesByTag = function()
    {
        model.views.noteListSelector.innerHTML = ''; //Clear the children
        if(model.tagNotes.length == 0)
            model.views.noteListSelector.appendChild(model.views.defaultNoteListSelectorCell);
        var tmpcell;
        model.views.tagNoteCells = [];
        for(var i = 0; i < model.tagNotes.length; i++)
        {
            if(!model.listTagsSelected(model.tagNotes[i].tags)) continue;
			if(!this.filter(model.tagNotes[i], document.getElementById("filterbox").value)) continue;
            tmpcell = new SingleSelectionCell(model.views.constructNoteListSelectorCell.cloneNode(true), 123-123, this.noteSelected, model.tagNotes[i]);
            tmpcell.html.firstChild.innerHTML ='<span class="note_cell_title">'+model.tagNotes[i].title+' - </span><span class="note_cell_author">'+model.tagNotes[i].username + this.rightSideOfCell(this.getIconsForNoteContents(model.contributorNotes[i]) + '</span>');
            model.views.noteListSelector.appendChild(tmpcell.html);
            model.views.tagNoteCells[model.views.tagNoteCells.length] = tmpcell;
        }
		document.getElementById("note_list_selector_container_header").innerHTML = "Notes (" + model.numberOfTotalNotes() +")";
    };
	
    this.populateNotesByPopularity = function()
    {
        model.views.noteListSelector.innerHTML = ''; //Clear the children
        if(model.popularNotes.length == 0)
            model.views.noteListSelector.appendChild(model.views.defaultNoteListSelectorCell);
        var tmpcell;
        model.views.popularNoteCells = [];
        for(var i = 0; i < model.popularNotes.length; i++)
        {
			if(!this.filter(model.popularNotes[i], document.getElementById("filterbox").value)) continue;
            tmpcell = new SingleSelectionCell(model.views.constructNoteListSelectorCell.cloneNode(true), 123-123, this.noteSelected, model.popularNotes[i]);
            tmpcell.html.firstChild.innerHTML = '<span class="note_cell_title">'+model.popularNotes[i].title+' - </span><span class="note_cell_author">'+model.popularNotes[i].username+ this.rightSideOfCell(model.popularNotes[i].likes + this.getLikeIcon() + "&nbsp;&nbsp; " + model.popularNotes[i].comments.length + this.getCommentIcon() + '</span>');
            model.views.noteListSelector.appendChild(tmpcell.html);
            model.views.popularNoteCells[model.views.popularNoteCells.length] = tmpcell;
        }
    }

	this.getIconsForNoteContents = function(note)
	{
		if (note.contents[0] == null)
			return "";
			
		var textCount = 0;
		var audioCount = 0;
		var videoCount = 0;
		var photoCount = 0;
		
		for (i = 0; i < note.contents.length; i++) {
	
			if (note.contents[i].type == "AUDIO")
				audioCount++;
			else if (note.contents[i].type == "VIDEO")
				videoCount++;
			else if (note.contents[i].type == "PHOTO")
				photoCount++;
			else  if (note.contents[i].type == "TEXT")
				textCount++;
		}
		
		var iconHTML = "";
		if (textCount > 0)
			iconHTML += '<img src="./images/defaultTextIcon.png" height=14px;>';
		if (audioCount > 0)
			iconHTML += '<img src="./images/defaultAudioIcon.png" height=15px;>';
		if (photoCount > 0)
			iconHTML += '<img src="./images/defaultImageIcon.png" height=15px;> ';
		if (videoCount > 0)
			iconHTML += '<img src="./images/defaultVideoIcon.png" height=14px;>';
	
		return iconHTML;
	};
	
	this.getLikeIcon = function()
	{
		var iconHTML =  '  <img src="./images/LikeIcon.png" height=10px;>';
			
		return iconHTML;
	};
	
	
	this.getCommentIcon = function()
	{
		var iconHTML =  '  <img src="./images/CommentIcon.png" height=8px;>';
			
		return iconHTML;
	};
	
	this.getNoteIcon = function()
	{
		//iconHTML = '  <img src="./images/defaultTextIcon.png" height=14px;>  ';
		var iconHTML = "";	
		return iconHTML;
	};
	
	this.playerPicForContributorList = function(username) 
	{
		var picHTML = '  <img src="' + model.getProfilePicForContributor(username) + '" height=14px;>  ';
		return picHTML;
	};
	
	this.checkBox = function(checked)
	{
		checkboxHTML = '  <img src="./images/checkboxUnchecked.gif" height=16px;>';
		if (checked) 	
			checkboxHTML = '  <img src="./images/checkbox.png" height=16px;>';
			
		return checkboxHTML;
	}
	
	this.rightSideOfCell = function(text)
	{
		return "<div id='selector_cell_right_id' class='selector_cell_right' style='float:right; vertical-align:middle; padding-top:5px; padding-right:20px';>" + text + "</div>";
	}
	
    this.displayNextNote = function(key)
    {
        if(model.views.mapLayoutButton.selected) ;
        if(model.views.listLayoutButton.selected)
        {
            if(model.views.contributorSortButton.selected) this.displayNextNoteInList(key, model.views.contributorNoteCells);
            if(model.views.tagSortButton.selected)  this.displayNextNoteInList(key, model.views.tagNoteCells);
            if(model.views.popularitySortButton.selected) this.displayNextNoteInList(key, model.views.popularNoteCells);
        }
    }
    this.displayNextNoteInList = function(key, list)
    {
        var index = -1;
        for(var i = 0; i < list.length; i++) 
            if(list[i].selected) { index = i; break; }
        if(key == 'Up') index--;
        else if(key == 'Down') index++;
        if(index >= list.length) index = 0;
        if(index < 0) index = list.length-1;
        list[index].select();
    }

    this.hideMapNoteView = function()
    {
        model.views.mapNoteViewContainer.style.display = 'none';
        model.views.mapNoteViewContainer.innerHTML = '';
        model.views.mapLayout.removeEventListener('click', controller.hideMapNoteView, false);
    }
    
	
	this.repopulateAll = function()
	{
		
		console.log("repopulating");
		this.populateMapContributors();
        this.selectAllMapContributors();

        this.populateListContributors();
        this.selectAllListContributors();

        this.populateMapTags();
        this.selectAllMapTags();

        this.populateListTags();
        this.selectAllListTags();

        this.populateMapNotes(false);
        this.populateNotesByContributor();
        this.populateNotesByTag();
        this.populateNotesByPopularity();
	}
	
	
}
